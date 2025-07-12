#!/usr/bin/env python3
"""
Flask Backend for Prescription Medicine Extraction
=================================================

A RESTful API backend that accepts prescription image uploads and returns
extracted medicine information in JSON format.

Endpoints:
- GET /: Health check
- POST /extract: Upload prescription image and extract medicine info

Requirements:
pip install flask flask-cors werkzeug pillow
"""

import os
import uuid
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge
import tempfile
import shutil
from dataclasses import asdict
from typing import List, Dict, Any
import logging



# Import your existing prescription extraction classes
# Make sure to include all the classes from your previous code here
import sqlite3
import cv2
import numpy as np
import re
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from difflib import SequenceMatcher
import warnings
warnings.filterwarnings('ignore')

try:
    import easyocr
    import pytesseract
    from PIL import Image, ImageDraw, ImageFont
    from fuzzywuzzy import fuzz, process
    print("✓ All required libraries imported successfully")
except ImportError as e:
    print(f"⚠ Missing library: {e}")
    print("Please install missing libraries")

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Copy all your existing classes here
@dataclass
class MedicineInfo:
    """Data class for medicine information"""
    name: str
    description: str
    uses: str
    dosage: str
    confidence: float = 0.0

class PrescriptionDatabase:
    """SQLite database handler for medicine information"""
    
    def __init__(self, db_path: str = "medicines.db"):
        self.db_path = db_path
        self.conn = None
        self.create_database()
    
    def create_database(self):
        """Create and populate the medicine database"""
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)

        cursor = self.conn.cursor()
        
        # Create table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS medicines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            medicine_name TEXT NOT NULL UNIQUE,
            description TEXT NOT NULL,
            uses TEXT NOT NULL,
            recommended_dosage TEXT NOT NULL
        )
        ''')
        
        # Sample medicines data (30+ entries)
        medicines_data = [
            ("Paracetamol", "Analgesic and antipyretic", "Fever, headache, mild pain", "500mg every 6 hours"),
            ("Ibuprofen", "Non-steroidal anti-inflammatory drug", "Pain, inflammation, fever", "400mg every 8 hours"),
            ("Aspirin", "Antiplatelet and analgesic", "Heart protection, pain relief", "75mg once daily"),
            ("Amoxicillin", "Penicillin antibiotic", "Bacterial infections", "500mg every 8 hours"),
            ("Omeprazole", "Proton pump inhibitor", "Acid reflux, stomach ulcers", "20mg once daily"),
            ("Metformin", "Antidiabetic medication", "Type 2 diabetes", "500mg twice daily"),
            ("Lisinopril", "ACE inhibitor", "High blood pressure, heart failure", "10mg once daily"),
            ("Atorvastatin", "Statin medication", "High cholesterol", "20mg once daily"),
            ("Amlodipine", "Calcium channel blocker", "High blood pressure", "5mg once daily"),
            ("Simvastatin", "Statin medication", "High cholesterol", "40mg once daily"),
            ("Losartan", "Angiotensin receptor blocker", "High blood pressure", "50mg once daily"),
            ("Gabapentin", "Anticonvulsant", "Nerve pain, seizures", "300mg three times daily"),
            ("Prednisone", "Corticosteroid", "Inflammation, autoimmune conditions", "5-10mg daily"),
            ("Sertraline", "SSRI antidepressant", "Depression, anxiety", "50mg once daily"),
            ("Fluoxetine", "SSRI antidepressant", "Depression, anxiety", "20mg once daily"),
            ("Lorazepam", "Benzodiazepine", "Anxiety, insomnia", "1mg as needed"),
            ("Tramadol", "Opioid analgesic", "Moderate to severe pain", "50mg every 6 hours"),
            ("Hydrochlorothiazide", "Thiazide diuretic", "High blood pressure, fluid retention", "25mg once daily"),
            ("Warfarin", "Anticoagulant", "Blood clot prevention", "5mg daily (adjusted)"),
            ("Digoxin", "Cardiac glycoside", "Heart failure, atrial fibrillation", "0.25mg once daily"),
            ("Furosemide", "Loop diuretic", "Fluid retention, heart failure", "40mg once daily"),
            ("Pantoprazole", "Proton pump inhibitor", "Acid reflux, stomach protection", "40mg once daily"),
            ("Ciprofloxacin", "Fluoroquinolone antibiotic", "Bacterial infections", "500mg twice daily"),
            ("Azithromycin", "Macrolide antibiotic", "Bacterial infections", "500mg once daily"),
            ("Cephalexin", "Cephalosporin antibiotic", "Bacterial infections", "500mg four times daily"),
            ("Levothyroxine", "Thyroid hormone", "Hypothyroidism", "75mcg once daily"),
            ("Albuterol", "Bronchodilator", "Asthma, COPD", "2 puffs every 4 hours"),
            ("Montelukast", "Leukotriene receptor antagonist", "Asthma, allergies", "10mg once daily"),
            ("Cetirizine", "Antihistamine", "Allergies, hay fever", "10mg once daily"),
            ("Loratadine", "Antihistamine", "Allergies, hay fever", "10mg once daily"),
            ("Ranitidine", "H2 receptor antagonist", "Acid reflux, stomach ulcers", "150mg twice daily"),
            ("Clonazepam", "Benzodiazepine", "Anxiety, seizures", "0.5mg twice daily"),
            ("Hydrocodone", "Opioid analgesic", "Moderate to severe pain", "5mg every 6 hours"),
            ("Metoprolol", "Beta-blocker", "High blood pressure, heart conditions", "50mg twice daily"),
            ("Carvedilol", "Beta-blocker", "Heart failure, high blood pressure", "6.25mg twice daily"),
        ]
        
        # Insert data
        cursor.executemany('''
        INSERT OR REPLACE INTO medicines 
        (medicine_name, description, uses, recommended_dosage) 
        VALUES (?, ?, ?, ?)
        ''', medicines_data)
        
        self.conn.commit()
    
    def search_medicine(self, medicine_name: str) -> Optional[MedicineInfo]:
        """Search for medicine in database"""
        cursor = self.conn.cursor()
        cursor.execute('''
        SELECT medicine_name, description, uses, recommended_dosage 
        FROM medicines 
        WHERE LOWER(medicine_name) LIKE LOWER(?)
        ''', (f'%{medicine_name}%',))
        
        result = cursor.fetchone()
        if result:
            return MedicineInfo(
                name=result[0],
                description=result[1],
                uses=result[2],
                dosage=result[3]
            )
        return None
    
    def get_all_medicine_names(self) -> List[str]:
        """Get all medicine names for fuzzy matching"""
        cursor = self.conn.cursor()
        cursor.execute('SELECT medicine_name FROM medicines')
        return [row[0] for row in cursor.fetchall()]
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()

class OCRProcessor:
    """OCR processing using EasyOCR and Tesseract"""
    
    def __init__(self):
        try:
            self.easy_reader = easyocr.Reader(['en'])
            self.tesseract_available = True
        except Exception as e:
            print(f"⚠ OCR initialization warning: {e}")
            self.easy_reader = None
            self.tesseract_available = False
    
    def extract_text_easyocr(self, image_path: str) -> List[Tuple[str, float]]:
        """Extract text using EasyOCR"""
        if not self.easy_reader:
            return []
        
        try:
            results = self.easy_reader.readtext(image_path)
            return [(text, confidence) for (bbox, text, confidence) in results]
        except Exception as e:
            print(f"EasyOCR error: {e}")
            return []
    
    def extract_text_tesseract(self, image_path: str) -> List[Tuple[str, float]]:
        """Extract text using Tesseract OCR"""
        if not self.tesseract_available:
            return []
        
        try:
            # Read image
            img = cv2.imread(image_path)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Preprocess image
            processed = self.preprocess_image(gray)
            
            # Extract text with confidence
            data = pytesseract.image_to_data(processed, output_type=pytesseract.Output.DICT)
            results = []
            
            for i in range(len(data['text'])):
                text = data['text'][i].strip()
                confidence = int(data['conf'][i]) / 100.0
                if text and confidence > 0.1:  # Filter low confidence
                    results.append((text, confidence))
            
            return results
        except Exception as e:
            print(f"Tesseract error: {e}")
            return []
    
    def preprocess_image(self, image):
        """Preprocess image for better OCR"""
        # Denoise
        denoised = cv2.fastNlMeansDenoising(image)
        
        # Increase contrast
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        contrast = clahe.apply(denoised)
        
        # Threshold
        _, thresh = cv2.threshold(contrast, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        return thresh

class MedicineExtractor:
    """Main class for medicine extraction from prescriptions"""
    
    def __init__(self):
        self.db = PrescriptionDatabase()
        self.ocr = OCRProcessor()
        self.medicine_names = self.db.get_all_medicine_names()
        
        # Common medicine patterns
        self.medicine_patterns = [
            r'\b[A-Z][a-z]+(?:olol|pril|sartan|statin|cillin|mycin|oxacin)\b',
            r'\b[A-Z][a-z]{3,}\b',
            r'\b\d+\s*mg\b',
        ]
    
    def extract_medicines_from_image(self, image_path: str) -> List[MedicineInfo]:
        """Main method to extract medicines from prescription image"""
        # Extract text using both OCR engines
        easyocr_results = self.ocr.extract_text_easyocr(image_path)
        tesseract_results = self.ocr.extract_text_tesseract(image_path)
        
        # Combine results
        all_texts = easyocr_results + tesseract_results
        
        # Extract potential medicine names
        potential_medicines = self.extract_potential_medicines(all_texts)
        
        # Match with database using fuzzy matching
        matched_medicines = self.match_medicines_fuzzy(potential_medicines)
        
        return matched_medicines
    
    def extract_potential_medicines(self, text_results: List[Tuple[str, float]]) -> List[Tuple[str, float]]:
        """Extract potential medicine names from OCR results"""
        potential_medicines = []
        
        for text, confidence in text_results:
            # Clean text
            cleaned_text = re.sub(r'[^\w\s]', '', text)
            words = cleaned_text.split()
            
            for word in words:
                if len(word) > 3:  # Filter short words
                    # Check if word matches medicine patterns
                    for pattern in self.medicine_patterns:
                        if re.search(pattern, word, re.IGNORECASE):
                            potential_medicines.append((word, confidence))
                            break
                    else:
                        # Add longer words that might be medicine names
                        if len(word) > 5:
                            potential_medicines.append((word, confidence))
        
        return potential_medicines
    
    def match_medicines_fuzzy(self, potential_medicines: List[Tuple[str, float]]) -> List[MedicineInfo]:
        """Match potential medicines with database using fuzzy matching"""
        matched_medicines = []
        
        for medicine_text, ocr_confidence in potential_medicines:
            # Try exact match first
            medicine_info = self.db.search_medicine(medicine_text)
            
            if medicine_info:
                medicine_info.confidence = ocr_confidence
                matched_medicines.append(medicine_info)
            else:
                # Try fuzzy matching
                best_match = process.extractOne(
                    medicine_text, 
                    self.medicine_names,
                    scorer=fuzz.token_sort_ratio,
                    score_cutoff=70
                )
                
                if best_match:
                    matched_name, similarity_score = best_match
                    medicine_info = self.db.search_medicine(matched_name)
                    if medicine_info:
                        # Combine OCR confidence with fuzzy match confidence
                        combined_confidence = (ocr_confidence + similarity_score/100) / 2
                        medicine_info.confidence = combined_confidence
                        matched_medicines.append(medicine_info)
        
        # Remove duplicates
        unique_medicines = {}
        for medicine in matched_medicines:
            if medicine.name not in unique_medicines:
                unique_medicines[medicine.name] = medicine
            else:
                # Keep the one with higher confidence
                if medicine.confidence > unique_medicines[medicine.name].confidence:
                    unique_medicines[medicine.name] = medicine
        
        return list(unique_medicines.values())

# Flask App Configuration
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = tempfile.mkdtemp()  # Temporary upload folder

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'}

# Initialize the medicine extractor
extractor = MedicineExtractor()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def medicine_info_to_dict(medicine: MedicineInfo) -> Dict[str, Any]:
    """Convert MedicineInfo dataclass to dictionary"""
    return {
        'name': medicine.name,
        'description': medicine.description,
        'uses': medicine.uses,
        'dosage': medicine.dosage,
        'confidence': round(medicine.confidence, 3)
    }

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'message': 'API is running',
        'status': 'healthy',
        'version': '1.0.0'
    })

# @app.route('/extract', methods=['POST'])
# def extract_medicines():
#     """Extract medicines from uploaded prescription image"""
#     try:
#         # Check if file is present in request
#         if 'file' not in request.files:
#             return jsonify({
#                 'error': 'No file provided',
#                 'message': 'Please upload an image file'
#             }), 400
        
#         file = request.files['file']
        
#         # Check if file is selected
#         if file.filename == '':
#             return jsonify({
#                 'error': 'No file selected',
#                 'message': 'Please select a file to upload'
#             }), 400
        
#         # Check file extension
#         if not allowed_file(file.filename):
#             return jsonify({
#                 'error': 'Invalid file type',
#                 'message': f'Allowed file types: {", ".join(ALLOWED_EXTENSIONS)}'
#             }), 400
        
#         # Generate unique filename
#         unique_filename = str(uuid.uuid4()) + '_' + secure_filename(file.filename)
#         file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        
#         # Save uploaded file
#         file.save(file_path)
#         logger.info(f"File uploaded: {unique_filename}")
        
#         try:
#             # Extract medicines from image
#             medicines = extractor.extract_medicines_from_image(file_path)
            
#             # Convert to JSON-serializable format
#             medicines_data = [medicine_info_to_dict(medicine) for medicine in medicines]
            
#             response_data = {
#                 'success': True,
#                 'message': f'Successfully extracted {len(medicines_data)} medicines',
#                 'medicines': medicines_data,
#                 'total_medicines': len(medicines_data)
#             }
            
#             logger.info(f"Successfully processed {unique_filename}: {len(medicines_data)} medicines found")
            
#             return jsonify(response_data), 200
            
#         except Exception as e:
#             logger.error(f"Error processing image {unique_filename}: {str(e)}")
#             return jsonify({
#                 'error': 'Processing failed',
#                 'message': f'Error processing image: {str(e)}'
#             }), 500
            
#         finally:
#             # Clean up: delete temporary file
#             try:
#                 if os.path.exists(file_path):
#                     os.remove(file_path)
#                     logger.info(f"Temporary file deleted: {unique_filename}")
#             except Exception as e:
#                 logger.warning(f"Could not delete temporary file {unique_filename}: {str(e)}")
    
#     except RequestEntityTooLarge:
#         return jsonify({
#             'error': 'File too large',
#             'message': 'File size exceeds 16MB limit'
#         }), 413
    
#     except Exception as e:
#         logger.error(f"Unexpected error: {str(e)}")
#         return jsonify({
#             'error': 'Internal server error',
#             'message': 'An unexpected error occurred'
#         }), 500

@app.route('/extract', methods=['POST'])
def extract_medicines():
    try:
        if 'file' not in request.files:
            return jsonify({
                'error': 'No file provided',
                'message': 'Please upload an image file'
            }), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'error': 'No file selected',
                'message': 'Please select a file to upload'
            }), 400

        if not allowed_file(file.filename):
            return jsonify({
                'error': 'Invalid file type',
                'message': f'Allowed file types: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400

        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            file.save(temp_file.name)
            file_path = temp_file.name

        # Extract medicines
        medicines = extractor.extract_medicines_from_image(file_path)
        medicines_data = [medicine_info_to_dict(med) for med in medicines]

        # Delete file after processing
        try:
            os.remove(file_path)
        except Exception as e:
            logger.warning(f"Could not delete temporary file {file_path}: {e}")

        return jsonify({
            'success': True,
            'message': f'Successfully extracted {len(medicines_data)} medicines',
            'medicines': medicines_data,
            'total_medicines': len(medicines_data)
        }), 200

    except RequestEntityTooLarge:
        return jsonify({
            'error': 'File too large',
            'message': 'File size exceeds 16MB limit'
        }), 413

    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': f'An unexpected error occurred: {e}'
        }), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Not found',
        'message': 'The requested endpoint does not exist'
    }), 404

@app.errorhandler(405)
def method_not_allowed(error):
    """Handle 405 errors"""
    return jsonify({
        'error': 'Method not allowed',
        'message': 'The HTTP method is not allowed for this endpoint'
    }), 405

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'error': 'Internal server error',
        'message': 'An unexpected error occurred'
    }), 500

def cleanup_temp_folder():
    """Clean up temporary upload folder on shutdown"""
    try:
        if os.path.exists(app.config['UPLOAD_FOLDER']):
            shutil.rmtree(app.config['UPLOAD_FOLDER'])
            logger.info("Temporary upload folder cleaned up")
    except Exception as e:
        logger.warning(f"Could not clean up temporary folder: {str(e)}")

if __name__ == '__main__':
    try:
        print("🚀 Starting Flask API Server...")
        print("📋 Prescription Medicine Extraction API")
        print("=" * 50)
        print("Available endpoints:")
        print("• GET  /          - Health check")
        print("• POST /extract   - Extract medicines from image")
        print("=" * 50)
        print("📝 Usage example:")
        print("curl -X POST -F 'file=@prescription.jpg' http://localhost:5000/extract")
        print("=" * 50)
        
        # Run the Flask app
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True,
            threaded=True
        )
    
    except KeyboardInterrupt:
        print("\n🛑 Server shutting down...")
        cleanup_temp_folder()
        extractor.db.close()
        print("✅ Cleanup completed")
    
    except Exception as e:
        print(f"❌ Error starting server: {str(e)}")
        cleanup_temp_folder()
        extractor.db.close()

# Example usage and testing
"""
# Test the API using curl:
curl -X GET http://localhost:5000/

curl -X POST \
  -F 'file=@prescription.jpg' \
  http://localhost:5000/extract

# Test using Python requests:
import requests

# Health check
response = requests.get('http://localhost:5000/')
print(response.json())

# Extract medicines
with open('prescription.jpg', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:5000/extract', files=files)
    print(response.json())
"""