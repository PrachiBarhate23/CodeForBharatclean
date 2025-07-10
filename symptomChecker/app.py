from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from datetime import datetime
import os
import pickle
import numpy as np
import warnings

# Suppress sklearn version warning
from sklearn.exceptions import InconsistentVersionWarning
warnings.simplefilter("ignore", InconsistentVersionWarning)

# Setup Flask and CORS
app = Flask(__name__)
CORS(app)

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Model path
MODEL_PATH = 'disease_prediction_model.pkl'
model_loaded = False
disease_detector = None

# Load DiseaseDetectionModel class (required to unpickle)
from disease_model import DiseaseDetectionModel  # make sure this file exists

def load_model():
    global disease_detector, model_loaded
    try:
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, 'rb') as f:
                model_instance = pickle.load(f)
            if isinstance(model_instance, DiseaseDetectionModel):
                disease_detector = model_instance
                model_loaded = True
                logger.info("✅ Model loaded as DiseaseDetectionModel instance")
            else:
                logger.error("❌ Loaded object is not a DiseaseDetectionModel")
        else:
            logger.error(f"❌ Model file not found at {MODEL_PATH}")
    except Exception as e:
        logger.error(f"❌ Error loading model: {str(e)}")

load_model()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model_loaded,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict_disease():
    if not model_loaded:
        return jsonify({'error': 'Model not loaded'}), 500

    data = request.get_json()
    if not data or 'symptoms' not in data:
        return jsonify({'error': 'Please provide symptoms in request body'}), 400

    symptoms = data['symptoms']
    if not isinstance(symptoms, str) or not symptoms.strip():
        return jsonify({'error': 'Symptoms must be a non-empty string'}), 400

    try:
        result = disease_detector.predict_disease(symptoms)
        response = {
            'success': True,
            'input_symptoms': symptoms,
            'timestamp': datetime.now().isoformat(),
            'prediction': result,
            'first_aid_tips': get_first_aid_tips(result['primary_disease']),
            'recommendations': get_recommendations(result['primary_disease'])
        }
        return jsonify(response)
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': 'Prediction failed', 'message': str(e)}), 500

@app.route('/batch_predict', methods=['POST'])
def batch_predict():
    if not model_loaded:
        return jsonify({'error': 'Model not loaded'}), 500

    data = request.get_json()
    if not data or 'symptoms_list' not in data:
        return jsonify({'error': 'symptoms_list required in body'}), 400

    symptoms_list = data['symptoms_list']
    if not isinstance(symptoms_list, list):
        return jsonify({'error': 'symptoms_list must be a list of strings'}), 400

    results = []
    for i, symptom in enumerate(symptoms_list):
        try:
            prediction = disease_detector.predict_disease(symptom)
            results.append({
                'index': i,
                'symptoms': symptom,
                'prediction': prediction,
                'success': True
            })
        except Exception as e:
            results.append({
                'index': i,
                'symptoms': symptom,
                'error': str(e),
                'success': False
            })

    return jsonify({
        'success': True,
        'results': results,
        'total_predictions': len(results),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/diseases', methods=['GET'])
def get_diseases():
    if not model_loaded:
        return jsonify({'error': 'Model not loaded'}), 500
    try:
        return jsonify({
            'diseases': disease_detector.label_encoder.classes_.tolist(),
            'count': len(disease_detector.label_encoder.classes_)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/model_info', methods=['GET'])
def model_info():
    if not model_loaded:
        return jsonify({'error': 'Model not loaded'}), 500
    try:
        return jsonify({
            'model_type': str(type(disease_detector.model).__name__),
            'feature_count': len(disease_detector.vectorizer.get_feature_names_out()),
            'disease_count': len(disease_detector.label_encoder.classes_),
            'diseases': disease_detector.label_encoder.classes_.tolist(),
            'model_loaded': True
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error'}), 500

def get_first_aid_tips(disease):
    tips = {
        'Flu': ['Rest and drink fluids', 'Paracetamol for fever'],
        'COVID-19': ['Isolate', 'Monitor oxygen', 'Contact doctor if severe'],
        'Gastroenteritis': ['Use ORS', 'Eat bananas/rice', 'Avoid dairy'],
        'Migraine': ['Stay in dark room', 'Hydrate', 'Cold compress'],
    }
    return tips.get(disease, ['Consult a doctor'])

def get_recommendations(disease):
    recs = {
        'Flu': ['Annual flu vaccine', 'Boost immunity'],
        'COVID-19': ['Masking', 'Vaccination', 'Distancing'],
        'Gastroenteritis': ['Clean water', 'Hand hygiene'],
        'Migraine': ['Avoid triggers', 'Regular sleep', 'Stay hydrated'],
    }
    return recs.get(disease, ['Consult a specialist'])

if __name__ == '__main__':
    print("✅ Disease Detection API is running")
    print("POST /predict - {'symptoms': 'fever, headache, cough'}")
    app.run(debug=True, host='0.0.0.0', port=5000)
