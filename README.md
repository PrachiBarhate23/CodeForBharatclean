🧠 HealthAI
HealthAI is an intelligent health companion that empowers users with instant and accessible health insights. This all-in-one platform offers:

🩺 Symptom Checker – Interactive tool to assess symptoms and get possible illness insights

🧾 Prescription Extractor – Upload prescriptions to extract and understand listed medicines

🎙️ Voice Health Bot – Speak your symptoms and receive AI-based illness suggestions

Includes user authentication, a sleek dashboard, and multilingual support (English & Hindi).

DEMO VIDEOS OF OUR FEATURES:
https://drive.google.com/drive/folders/1P0x0tUbnzISxIdfTrDMUtvJWJNmsc2Iw?usp=sharing

FEATURE 1 : Symptom Checker

A web-based AI-driven symptom checker that helps users identify potential health issues based on their input symptoms. Built with the goal of accessibility, accuracy, and user-friendliness.

Getting Started

To run the application locally:
cd symptomChecker
npm start

 Planned Improvements

1. Multilingual Support
- Add support for Hindi output to make the tool accessible to a broader audience.

2. Consulting Doctor Option
- Allow users to consult with a verified doctor directly through the platform.

3. Improved AI Accuracy
- Enhance the underlying AI model for more precise and reliable diagnosis.

4. Detailed Disease Information
After the diagnosis, display comprehensive disease-related info including:
- Causes  
- Symptoms  
- Preventive Measures  
- Treatment Options  

5. Personalized Health Inputs
To provide better predictions, the tool will ask for:
- Gender
- Age
- Relevant Medical History



FEATURE 2:
🧾 Prescription Reader (AI-Powered)
The Prescription Reader is an AI-powered feature that extracts medicine names from prescription images. It leverages OCR (Optical Character Recognition) and fuzzy string matching to accurately identify and display medicines along with their usage, dosage, and description.

🔍 Key Highlights
🧠 OCR Engines: Uses EasyOCR and Tesseract to extract text from prescription images.

🎯 Fuzzy Matching: Matches extracted words with a local medicine database using fuzzy string matching for improved accuracy.

💊 Rich Output: Displays confidence level, medicine description, recommended dosage, and common uses.

📁 Supported Formats: Accepts .png, .jpg, .jpeg files up to 16MB.

🔒 Local Processing: No third-party APIs—everything runs on your local Flask server for better privacy.


🧱 Tech Stack
Frontend: React + Tailwind + Lucide Icons

Backend: Flask + SQLite

AI/ML: EasyOCR, Tesseract, FuzzyWuzzy

Image Processing: OpenCV, PIL


🛠️ Planned Improvements (Prescription Reader)
Better Handwriting Support – Improve recognition of handwritten prescriptions.

Dosage Detection – Auto-extract dosage frequency from text.

Drug Interaction Alerts – Warn users about possible medicine conflicts.

Multilingual OCR – Support prescriptions in Hindi and regional languages.

PDF & Multi-Image Uploads – Allow PDFs and batch image uploads.

E-Pharmacy Integration – Enable users to order detected medicines online.



FEATURE 3: VOICE 






