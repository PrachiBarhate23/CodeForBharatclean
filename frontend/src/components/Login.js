import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Crown } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { lang } = useContext(LanguageContext);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const t = {
    en: {
      title: 'Welcome Back',
      subtitle: 'Sign in to access premium features',
      email: 'Email Address',
      password: 'Password',
      login: 'Sign In',
      demo: 'Demo Credentials',
      demoEmail: 'admin@health.com',
      demoPassword: 'admin123',
      benefits: 'Premium Benefits',
      benefit1: 'Book appointments with verified doctors',
      benefit2: 'Access detailed medical history',
      benefit3: 'Priority customer support',
      benefit4: 'Advanced AI health insights'
    },
    hi: {
      title: 'वापस आपका स्वागत है',
      subtitle: 'प्रीमियम सुविधाओं तक पहुंच के लिए साइन इन करें',
      email: 'ईमेल पता',
      password: 'पासवर्ड',
      login: 'साइन इन करें',
      demo: 'डेमो क्रेडेंशियल्स',
      demoEmail: 'admin@health.com',
      demoPassword: 'admin123',
      benefits: 'प्रीमियम लाभ',
      benefit1: 'सत्यापित डॉक्टरों के साथ अपॉइंटमेंट बुक करें',
      benefit2: 'विस्तृत चिकित्सा इतिहास तक पहुंच',
      benefit3: 'प्राथमिकता ग्राहक सहायता',
      benefit4: 'उन्नत AI स्वास्थ्य अंतर्दृष्टि'
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  const fillDemo = () => {
    setFormData({ email: 'admin@health.com', password: 'admin123' });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-layout">
          {/* Left Panel - Benefits */}
          <div className="login-benefits">
            <div className="benefits-header">
              <Crown size={32} />
              <h2 className="benefits-title">{t[lang].benefits}</h2>
            </div>
            <ul className="benefits-list">
              <li>
                <div className="benefit-dot"></div>
                <span>{t[lang].benefit1}</span>
              </li>
              <li>
                <div className="benefit-dot"></div>
                <span>{t[lang].benefit2}</span>
              </li>
              <li>
                <div className="benefit-dot"></div>
                <span>{t[lang].benefit3}</span>
              </li>
              <li>
                <div className="benefit-dot"></div>
                <span>{t[lang].benefit4}</span>
              </li>
            </ul>
          </div>

          {/* Right Panel - Login Form */}
          <div className="login-form-section">
            <div className="login-header">
              <User size={48} />
              <h1 className="login-title">{t[lang].title}</h1>
              <p className="login-subtitle">{t[lang].subtitle}</p>
            </div>

            {/* Demo Credentials */}
            <div className="demo-credentials">
              <h3 className="demo-title">{t[lang].demo}</h3>
              <p className="demo-info">
                {t[lang].demoEmail}: admin@health.com<br />
                {t[lang].demoPassword}: admin123
              </p>
              <button onClick={fillDemo} className="demo-fill-btn">
                {lang === 'en' ? 'Fill Demo Data' : 'डेमो डेटा भरें'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  {t[lang].email}
                </label>
                <div className="form-input-wrapper">
                  <Mail className="form-icon" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {t[lang].password}
                </label>
                <div className="form-input-wrapper">
                  <Lock className="form-icon" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="login-submit"
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    <span>{lang === 'en' ? 'Signing In...' : 'साइन इन हो रहा है...'}</span>
                  </>
                ) : (
                  t[lang].login
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;