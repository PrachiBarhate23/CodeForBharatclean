// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import DiseaseDetection from './pages/DiseaseDetection';
import SymptomChecker from './pages/DiseaseDetection';
import VoiceBot from './pages/DiseaseDetection';
import FirstAidInfo from './pages/DiseaseDetection';
import Appointment from './pages/Appointment';
import DetailedPrediction from './pages/DetailedPrediction';
import Login from './components/Login';
import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/detect" element={<DiseaseDetection />} />
            <Route path="/symptom-checker" element={<SymptomChecker />} />
            <Route path="/voice-bot" element={<VoiceBot />} />
            <Route path="/first-aid" element={<FirstAidInfo />} />
            <Route path="/appointment" element={<Appointment />} />
            <Route path="/detailed" element={<DetailedPrediction />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;