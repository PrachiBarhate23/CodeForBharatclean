import os
from dotenv import load_dotenv
load_dotenv()

# Ensure FFmpeg is in PATH
os.environ["PATH"] += os.pathsep + r"C:\ProgramData\chocolatey\bin"

import uuid
import time
import threading
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import whisper
import requests
from gtts import gTTS
import logging
from werkzeug.utils import secure_filename

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flask app setup
app = Flask(__name__)
CORS(app)

# Config
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
app.config['UPLOAD_FOLDER'] = 'temp_uploads'
app.config['AUDIO_FOLDER'] = 'generated_audio'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['AUDIO_FOLDER'], exist_ok=True)

# Load Whisper model
logger.info("Loading Whisper model...")
whisper_model = whisper.load_model("base")
logger.info("Whisper model loaded successfully")

# Ollama prompt
HEALTH_SYSTEM_PROMPT = """
You are an AI Health Assistant that provides helpful, accurate, and compassionate health information. 
Respond in a clear, empathetic tone. Do not diagnose. Recommend seeing doctors for serious issues.
"""

# --- Core Functions ---

def cleanup_old_files():
    try:
        now = time.time()
        for folder in [app.config['UPLOAD_FOLDER'], app.config['AUDIO_FOLDER']]:
            for file in os.listdir(folder):
                path = os.path.join(folder, file)
                if os.path.isfile(path) and (now - os.path.getmtime(path)) > 3600:
                    os.remove(path)
                    logger.info(f"Deleted old file: {file}")
    except Exception as e:
        logger.error(f"Cleanup error: {e}")

def generate_health_response(question):
    try:
        response = requests.post(
            "http://localhost:11434/api/chat",
            json={
                "model": "llama3",
                "messages": [
                    {"role": "system", "content": HEALTH_SYSTEM_PROMPT},
                    {"role": "user", "content": question}
                ],
                "stream": False
            }
        )
        if response.status_code == 200:
            return response.json()["message"]["content"].strip()
        else:
            logger.error(f"Ollama error: {response.status_code}, {response.text}")
            return "Sorry, I'm having trouble answering right now."
    except Exception as e:
        logger.error(f"Ollama exception: {str(e)}")
        return "Sorry, I'm having trouble answering right now."

def detect_language(text):
    hindi_chars = set('अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह')
    return 'hi' if any(c in hindi_chars for c in text) else 'en'

def text_to_speech(text, lang='en'):
    try:
        filename = f"response_{uuid.uuid4().hex}.mp3"
        path = os.path.join(app.config['AUDIO_FOLDER'], filename)
        gTTS(text=text, lang=lang).save(path)
        return filename
    except Exception as e:
        logger.error(f"TTS error: {e}")
        return None

# --- Routes ---

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "llm": "llama3",
        "stt": "whisper-base"
    })

@app.route('/api/stt', methods=['POST'])
def speech_to_text():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file'}), 400

        audio = request.files['audio']
        if audio.filename == '':
            return jsonify({'error': 'Empty file'}), 400

        filename = secure_filename(f"upload_{uuid.uuid4().hex}.wav")
        path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        audio.save(path)

        logger.info(f"Saved audio: {filename}")
        transcription = whisper_model.transcribe(path)["text"].strip()
        logger.info(f"Transcription: {transcription}")

        if not transcription:
            return jsonify({'error': 'Could not understand audio'}), 400

        response_text = generate_health_response(transcription)
        lang = detect_language(transcription)
        audio_filename = text_to_speech(response_text, lang)

        try:
            os.remove(path)
        except:
            pass

        return jsonify({
            "transcription": transcription,
            "answer": response_text,
            "audioUrl": f"http://localhost:5000/api/audio/{audio_filename}" if audio_filename else None,
            "language": lang,
            "timestamp": datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"STT endpoint error: {e}")
        return jsonify({'error': 'Something went wrong'}), 500

@app.route('/api/audio/<filename>', methods=['GET'])
def serve_audio(filename):
    try:
        path = os.path.join(app.config['AUDIO_FOLDER'], filename)
        if os.path.exists(path):
            return send_file(path, mimetype='audio/mpeg')
        return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        logger.error(f"Audio serve error: {e}")
        return jsonify({'error': 'Audio error'}), 500

@app.route('/api/quick-question', methods=['POST'])
def quick_question():
    try:
        data = request.get_json()
        question = data.get("question", "").strip()
        if not question:
            return jsonify({'error': 'No question'}), 400

        response_text = generate_health_response(question)
        lang = detect_language(question)
        audio_filename = text_to_speech(response_text, lang)

        return jsonify({
            "transcription": question,
            "answer": response_text,
            "audioUrl": f"http://localhost:5000/api/audio/{audio_filename}" if audio_filename else None,
            "language": lang,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Quick question error: {e}")
        return jsonify({'error': 'Something went wrong'}), 500

@app.route('/api/cleanup', methods=['POST'])
def manual_cleanup():
    try:
        cleanup_old_files()
        return jsonify({'message': 'Cleanup done'})
    except Exception as e:
        return jsonify({'error': f'Failed cleanup: {e}'}), 500

# Error handlers
@app.errorhandler(413)
def too_large(e): return jsonify({'error': 'File too large'}), 413
@app.errorhandler(404)
def not_found(e): return jsonify({'error': 'Endpoint not found'}), 404
@app.errorhandler(500)
def internal_error(e): return jsonify({'error': 'Server error'}), 500

# Background thread for cleanup
def background_cleanup():
    while True:
        time.sleep(1800)
        cleanup_old_files()

threading.Thread(target=background_cleanup, daemon=True).start()

if __name__ == '__main__':
    logger.info("Starting Flask server with Ollama (llama3)...")
    app.run(host="0.0.0.0", port=5000, debug=True)
