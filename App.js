import React, { useState } from 'react';

const App = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const predict = async () => {
    if (!input.trim()) {
      setError('Please enter symptoms');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input.trim() })
      });
      
      if (!response.ok) throw new Error('Network error');
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setInput('');
    setResult(null);
    setError('');
  };

  return (
    <div className="app">
      <div className="stars"></div>
      <div className="stars2"></div>
      <div className="stars3"></div>
      
      <div className="container">
        <div className="header">
          <div className="pulse-icon">🏥</div>
          <h1>AI Disease Predictor</h1>
          <p>Enter symptoms in English or Hindi</p>
        </div>

        <div className="card">
          <div className="input-section">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="fever, headache, cough... / बुखार, सिरदर्द, खांसी..."
              className="input"
              disabled={loading}
            />
            
            <div className="buttons">
              <button 
                onClick={predict}
                disabled={loading || !input.trim()}
                className="predict-btn"
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Analyzing...
                  </>
                ) : (
                  '🔍 Predict Disease'
                )}
              </button>
              
              {(result || error) && (
                <button onClick={reset} className="reset-btn">
                  ✨ Try Again
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="error">
              ⚠️ {error}
            </div>
          )}

          {result && (
            <div className="result">
              <div className="result-header">
                <div className="success-icon">✅</div>
                <h3>Prediction Results</h3>
              </div>
              
              <div className="result-body">
                <div className="item">
                  <strong>Disease:</strong>
                  <div className="disease">{result.predicted_disease}</div>
                </div>
                
                <div className="item">
                  <strong>Confidence:</strong>
                  <div className="confidence">
                    <div className="bar">
                      <div 
                        className="fill" 
                        style={{ width: `${result.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span>{(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="disclaimer">
                ⚠️ This is AI prediction. Consult a doctor for proper diagnosis.
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .app {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Animated Stars Background */
        .stars, .stars2, .stars3 {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .stars {
          background: transparent url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="1" fill="white" opacity="0.8"/><circle cx="80" cy="40" r="1" fill="white" opacity="0.6"/><circle cx="40" cy="60" r="1" fill="white" opacity="0.4"/><circle cx="90" cy="80" r="1" fill="white" opacity="0.8"/><circle cx="10" cy="90" r="1" fill="white" opacity="0.6"/></svg>') repeat;
          animation: move-stars 50s linear infinite;
        }

        .stars2 {
          background: transparent url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="30" cy="30" r="0.5" fill="white" opacity="0.5"/><circle cx="70" cy="50" r="0.5" fill="white" opacity="0.7"/><circle cx="50" cy="70" r="0.5" fill="white" opacity="0.3"/></svg>') repeat;
          animation: move-stars 100s linear infinite;
        }

        .stars3 {
          background: transparent url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="60" cy="10" r="0.3" fill="white" opacity="0.4"/><circle cx="15" cy="45" r="0.3" fill="white" opacity="0.6"/><circle cx="85" cy="65" r="0.3" fill="white" opacity="0.8"/></svg>') repeat;
          animation: move-stars 150s linear infinite;
        }

        @keyframes move-stars {
          from { transform: translateY(0px); }
          to { transform: translateY(-100vh); }
        }

        .container {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
          color: white;
        }

        .pulse-icon {
          font-size: 4rem;
          margin-bottom: 20px;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        .header h1 {
          font-size: 3rem;
          margin-bottom: 10px;
          font-weight: 700;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          background: linear-gradient(45deg, #fff, #f0f0f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header p {
          font-size: 1.2rem;
          opacity: 0.9;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }

        .card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 30px;
          padding: 40px;
          max-width: 600px;
          width: 100%;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .input-section {
          margin-bottom: 30px;
        }

        .input {
          width: 100%;
          padding: 20px;
          border: 3px solid transparent;
          border-radius: 20px;
          font-size: 18px;
          background: linear-gradient(white, white) padding-box,
                      linear-gradient(45deg, #667eea, #764ba2) border-box;
          transition: all 0.3s ease;
          resize: vertical;
          min-height: 120px;
          font-family: inherit;
        }

        .input:focus {
          outline: none;
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(102, 126, 234, 0.3);
        }

        .input:disabled {
          opacity: 0.7;
        }

        .buttons {
          display: flex;
          gap: 20px;
          margin-top: 20px;
          flex-wrap: wrap;
        }

        .predict-btn {
          flex: 1;
          min-width: 200px;
          padding: 18px 30px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 25px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }

        .predict-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
        }

        .predict-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .reset-btn {
          padding: 18px 30px;
          background: linear-gradient(45deg, #f093fb, #f5576c);
          color: white;
          border: none;
          border-radius: 25px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 20px rgba(245, 87, 108, 0.3);
        }

        .reset-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(245, 87, 108, 0.4);
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error {
          background: linear-gradient(45deg, #ff6b6b, #ee5a52);
          color: white;
          padding: 20px;
          border-radius: 20px;
          margin-bottom: 20px;
          text-align: center;
          font-size: 18px;
          font-weight: 600;
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .result {
          background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
          border-radius: 25px;
          padding: 30px;
          margin-top: 20px;
          animation: slideIn 0.5s ease-out;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .result-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
        }

        .success-icon {
          font-size: 2rem;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .result-header h3 {
          font-size: 1.8rem;
          color: #333;
          margin: 0;
        }

        .result-body {
          margin-bottom: 20px;
        }

        .item {
          margin-bottom: 20px;
        }

        .item strong {
          display: block;
          font-size: 16px;
          color: #666;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .disease {
          font-size: 1.5rem;
          font-weight: 700;
          color: #667eea;
          margin-bottom: 10px;
        }

        .confidence {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .bar {
          flex: 1;
          height: 12px;
          background: rgba(255,255,255,0.5);
          border-radius: 6px;
          overflow: hidden;
        }

        .fill {
          height: 100%;
          background: linear-gradient(90deg, #4ecdc4, #44a08d);
          border-radius: 6px;
          transition: width 1s ease;
          animation: fillBar 1s ease-out;
        }

        @keyframes fillBar {
          from { width: 0%; }
        }

        .confidence span {
          font-weight: 700;
          color: #44a08d;
          font-size: 18px;
        }

        .disclaimer {
          background: rgba(255,255,255,0.7);
          padding: 15px;
          border-radius: 15px;
          font-size: 14px;
          color: #666;
          text-align: center;
          font-weight: 500;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .header h1 {
            font-size: 2.5rem;
          }
          
          .card {
            padding: 30px 20px;
            margin: 0 10px;
          }
          
          .buttons {
            flex-direction: column;
          }
          
          .predict-btn {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default App;