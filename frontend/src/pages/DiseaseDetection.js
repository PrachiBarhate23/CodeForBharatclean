import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, CheckCircle, Loader, Heart, Shield, Thermometer } from 'lucide-react';

const DiseaseDetectionApp = () => {
  const [symptoms, setSymptoms] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [diseases, setDiseases] = useState([]);
  const [modelInfo, setModelInfo] = useState(null);

  // API base URL - change this to your deployed API
  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    fetchDiseases();
    fetchModelInfo();
  }, []);

  const fetchDiseases = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/diseases`);
      const data = await response.json();
      if (data.diseases) {
        setDiseases(data.diseases);
      }
    } catch (err) {
      console.error('Error fetching diseases:', err);
    }
  };

  const fetchModelInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/model_info`);
      const data = await response.json();
      setModelInfo(data);
    } catch (err) {
      console.error('Error fetching model info:', err);
    }
  };

  const handlePredict = async () => {
    if (!symptoms.trim()) {
      setError('Please enter your symptoms');
      return;
    }

    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms: symptoms.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setPrediction(data);
      } else {
        setError(data.message || 'Prediction failed');
      }
    } catch (err) {
      setError('Unable to connect to the server. Please try again.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSymptomClick = (symptom) => {
    const currentSymptoms = symptoms.trim();
    const newSymptoms = currentSymptoms 
      ? `${currentSymptoms}, ${symptom}`
      : symptom;
    setSymptoms(newSymptoms);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  const commonSymptoms = [
    'fever', 'headache', 'cough', 'sore throat', 'fatigue', 'nausea',
    'vomiting', 'diarrhea', 'stomach pain', 'chest pain', 'shortness of breath',
    'dizziness', 'joint pain', 'muscle pain', 'runny nose', 'sneezing',
    'bukhar', 'sir dard', 'khansi', 'gala dard', 'thakan', 'pet dard'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="text-red-500 mr-2" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">
              AI Disease Detection System
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enter your symptoms in Hindi or English to get an AI-powered health assessment.
            This tool provides preliminary insights and should not replace professional medical advice.
          </p>
        </div>

        {/* Model Info */}
        {modelInfo && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Shield className="text-blue-500 mr-2" size={20} />
                <span className="font-semibold">Model Status: Active</span>
              </div>
              <div className="text-sm text-gray-600">
                {modelInfo.disease_count} diseases • {modelInfo.feature_count} features
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Thermometer className="text-orange-500 mr-2" size={20} />
                Enter Your Symptoms
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe your symptoms (in Hindi or English)
                  </label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g., fever, headache, cough OR bukhar, sir dard, khansi"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Common Symptoms (click to add)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {commonSymptoms.map((symptom) => (
                      <button
                        key={symptom}
                        onClick={() => handleSymptomClick(symptom)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
                    <AlertCircle className="text-red-500 mr-2" size={20} />
                    <span className="text-red-700">{error}</span>
                  </div>
                )}

                <button
                  onClick={handlePredict}
                  disabled={loading || !symptoms.trim()}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin mr-2" size={20} />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2" size={20} />
                      Predict Disease
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Prediction Results */}
            {prediction && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <CheckCircle className="text-green-500 mr-2" size={20} />
                  Prediction Results
                </h3>

                <div className="space-y-4">
                  {/* Primary Prediction */}
                  <div className="bg-blue-50 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-lg">
                        {prediction.prediction.primary_disease}
                      </h4>
                      <span className={`font-semibold ${getConfidenceColor(prediction.prediction.confidence)}`}>
                        {getConfidenceText(prediction.prediction.confidence)} Confidence
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${prediction.prediction.confidence * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {(prediction.prediction.confidence * 100).toFixed(1)}% confidence
                    </p>
                  </div>

                  {/* Top 3 Predictions */}
                  <div>
                    <h4 className="font-semibold mb-2">Alternative Possibilities:</h4>
                    <div className="space-y-2">
                      {prediction.prediction.top_3_predictions.map((pred, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span>{pred.disease}</span>
                          <span className="text-sm text-gray-600">
                            {(pred.probability * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* First Aid Tips */}
                  {prediction.first_aid_tips && (
                    <div className="bg-yellow-50 p-4 rounded-md">
                      <h4 className="font-semibold mb-2 text-yellow-800">First Aid Tips:</h4>
                      <ul className="list-disc list-inside space-y-1 text-yellow-700">
                        {prediction.first_aid_tips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {prediction.recommendations && (
                    <div className="bg-green-50 p-4 rounded-md">
                      <h4 className="font-semibold mb-2 text-green-800">Recommendations:</h4>
                      <ul className="list-disc list-inside space-y-1 text-green-700">
                        {prediction.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">
                ⚠️ Important Disclaimer
              </h3>
              <p className="text-sm text-yellow-700">
                This AI tool provides preliminary health insights for educational purposes only.
                Always consult qualified healthcare professionals for proper diagnosis and treatment.
              </p>
            </div>

            {/* Detected Diseases */}
            {diseases.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-semibold mb-3">Detectable Diseases</h3>
                <div className="max-h-60 overflow-y-auto">
                  <div className="space-y-1">
                    {diseases.map((disease, index) => (
                      <div
                        key={index}
                        className="text-sm p-2 bg-gray-50 rounded text-gray-700"
                      >
                        {disease}
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Total: {diseases.length} diseases
                </p>
              </div>
            )}

            {/* How it Works */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold mb-3">How It Works</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-2">1.</span>
                  <span>Enter symptoms in Hindi or English</span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-2">2.</span>
                  <span>AI analyzes symptom patterns</span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-2">3.</span>
                  <span>Get disease predictions with confidence scores</span>
                </div>
                <div className="flex items-start">
                  <span className="font-semibold text-blue-600 mr-2">4.</span>
                  <span>Receive first aid tips and recommendations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetectionApp;