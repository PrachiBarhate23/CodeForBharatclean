// Updated Navbar.js
import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, User, LogOut, Crown } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { lang, toggleLanguage } = useContext(LanguageContext);
  const { user, logout, isPremium } = useAuth();
  const location = useLocation();

  const t = {
    en: {
      dashboard: 'Dashboard',
      detect: 'AI Detection',
      symptomChecker: 'Symptom Checker',
      voiceBot: 'Voice Bot',
      firstAid: 'First Aid',
      appointment: 'Appointment',
      detailed: 'History',
      login: 'Login',
      logout: 'Logout',
      lang: 'हिन्दी'
    },
    hi: {
      dashboard: 'डैशबोर्ड',
      detect: 'AI निदान',
      symptomChecker: 'लक्षण जांच',
      voiceBot: 'आवाज़ बॉट',
      firstAid: 'प्राथमिक चिकित्सा',
      appointment: 'अपॉइंटमेंट',
      detailed: 'इतिहास',
      login: 'लॉगिन',
      logout: 'लॉगआउट',
      lang: 'English'
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-nav">
          <Link to="/" className="navbar-brand">
            <Heart size={24} />
            <span>HealthAI</span>
          </Link>
          
          <div className="navbar-nav desktop">
            <Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`}>
              {t[lang].dashboard}
            </Link>
            <Link to="/detect" className={`navbar-link ${isActive('/detect') ? 'active' : ''}`}>
              {t[lang].detect}
            </Link>
            <Link to="/symptom-checker" className={`navbar-link ${isActive('/symptom-checker') ? 'active' : ''}`}>
              {t[lang].symptomChecker}
            </Link>
            <Link to="/voice-bot" className={`navbar-link ${isActive('/voice-bot') ? 'active' : ''}`}>
              {t[lang].voiceBot}
            </Link>
            <Link to="/first-aid" className={`navbar-link ${isActive('/first-aid') ? 'active' : ''}`}>
              {t[lang].firstAid}
            </Link>
          </div>
        </div>

        <div className="navbar-actions">
          <button onClick={toggleLanguage} className="language-toggle">
            {t[lang].lang}
          </button>
          
          {user ? (
            <div className="user-section">
              {isPremium && <Crown className="premium-crown" size={16} />}
              <span className="user-name">{user.name}</span>
              <button onClick={logout} className="logout-btn">
                <LogOut size={16} />
                <span>{t[lang].logout}</span>
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-btn">
              <User size={16} />
              <span>{t[lang].login}</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;