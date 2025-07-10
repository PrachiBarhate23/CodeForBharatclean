import re
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, classification_report
import pickle
import warnings

warnings.filterwarnings('ignore')


class DiseaseDetectionModel:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.model = None

    def preprocess_text(self, text):
        text = text.lower()
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        stop_words = set([
            'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they', 'them', 'is',
            'was', 'are', 'were', 'be', 'been', 'have', 'has', 'do', 'does', 'did', 'a', 'an', 'the',
            'in', 'on', 'with', 'and', 'or', 'of', 'to', 'for', 'from', 'by', 'at', 'as', 'but'
        ])
        tokens = [word for word in text.split() if word not in stop_words]
        return ' '.join(tokens)

    def create_multilingual_features(self, X):
        hindi_english = {
            'bukhar': 'fever',
            'gala dard': 'throat pain',
            'thakan': 'fatigue',
            'sir dard': 'headache',
            'pet dard': 'stomach pain',
            'khansi': 'cough',
            'jukam': 'cold',
            'ulti': 'vomiting',
            'chakkar': 'dizziness',
            'saans lene me takleef': 'breathing difficulty',
            'jodon me dard': 'joint pain',
            'kamjori': 'weakness',
            'bhookh na lagna': 'loss of appetite',
            'neend na ana': 'insomnia',
            'peshab me jalan': 'burning urination',
            'dast': 'diarrhea',
            'constipation': 'constipation',
            'gas': 'gas',
            'skin rash': 'rash',
            'aankh me dard': 'eye pain',
            'kan me dard': 'ear pain'
        }

        translated = []
        for symptoms in X:
            s = symptoms.lower()
            for hin, eng in hindi_english.items():
                s = s.replace(hin, eng)
            translated.append(s)
        return translated

    def train_model(self, X, y):
        X_clean = [self.preprocess_text(s) for s in X]
        X_translated = self.create_multilingual_features(X_clean)
        X_vectorized = self.vectorizer.fit_transform(X_translated)
        y_encoded = self.label_encoder.fit_transform(y)

        X_train, X_test, y_train, y_test = train_test_split(
            X_vectorized, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded)

        models = {
            'Random Forest': RandomForestClassifier(n_estimators=200, random_state=42),
            'Gradient Boosting': GradientBoostingClassifier(n_estimators=100, random_state=42),
            'SVM': SVC(kernel='rbf', probability=True, random_state=42),
            'Naive Bayes': MultinomialNB(alpha=0.1)
        }

        best_model = None
        best_score = 0

        for name, model in models.items():
            score = cross_val_score(model, X_train, y_train, cv=5).mean()
            if score > best_score:
                best_model = model
                best_score = score

        self.model = best_model
        self.model.fit(X_train, y_train)

        y_pred = self.model.predict(X_test)
        print("Accuracy:", accuracy_score(y_test, y_pred))
        print("\nClassification Report:\n")
        print(classification_report(y_test, y_pred, target_names=self.label_encoder.classes_))

    def predict_disease(self, symptoms):
        clean = self.preprocess_text(symptoms)
        translated = self.create_multilingual_features([clean])
        vector = self.vectorizer.transform(translated)
        prediction = self.model.predict(vector)[0]
        probs = self.model.predict_proba(vector)[0]
        disease_name = self.label_encoder.inverse_transform([prediction])[0]

        top_3 = np.argsort(probs)[-3:][::-1]
        return {
            'primary_disease': disease_name,
            'confidence': float(probs[prediction]),
            'top_3_predictions': [
                (self.label_encoder.inverse_transform([i])[0], float(probs[i])) for i in top_3
            ]
        }

    def save_model(self, path):
        with open(path, 'wb') as f:
            pickle.dump(self, f)
        print(f"✅ Model saved to {path}")

    def load_model(self, path):
        with open(path, 'rb') as f:
            loaded = pickle.load(f)
            self.model = loaded.model
            self.vectorizer = loaded.vectorizer
            self.label_encoder = loaded.label_encoder
            self.scaler = loaded.scaler
