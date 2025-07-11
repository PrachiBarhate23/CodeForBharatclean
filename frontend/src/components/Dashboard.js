// components/Dashboard.js
import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, MessageSquare, Shield, Calendar, History, Activity, Lock, Crown, Zap, Star } from 'lucide-react';
import { LanguageContext } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { lang } = useContext(LanguageContext);
  const { isPremium } = useAuth();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const t = {
    en: {
      title: "AI-Powered Health Dashboard",
      subtitle: "Your intelligent health companion",
      freeFeatures: "Free Features",
      premiumFeatures: "Premium Features",
      aiDetection: "AI Disease Detection",
      aiDetectionDesc: "Advanced AI analysis of symptoms",
      symptomChecker: "Symptom Checker",
      symptomCheckerDesc: "Interactive symptom assessment",
      voiceBot: "Voice Health Bot",
      voiceBotDesc: "Voice-powered health assistant",
      firstAid: "First Aid Guide",
      firstAidDesc: "Emergency medical guidance",
      appointment: "Doctor Appointments",
      appointmentDesc: "Book with verified doctors",
      history: "Medical History",
      historyDesc: "Track your health journey",
      upgrade: "Upgrade to Premium",
      loginRequired: "Login Required",
      access: "Access",
      getPremium: "Get Premium",
      premiumDesc: "Access premium features for comprehensive health management"
    },
    hi: {
      title: "AI संचालित स्वास्थ्य डैशबोर्ड",
      subtitle: "आपका बुद्धिमान स्वास्थ्य साथी",
      freeFeatures: "मुफ्त सुविधाएं",
      premiumFeatures: "प्रीमियम सुविधाएं",
      aiDetection: "AI बीमारी निदान",
      aiDetectionDesc: "लक्षणों का उन्नत AI विश्लेषण",
      symptomChecker: "लक्षण जांच",
      symptomCheckerDesc: "इंटरैक्टिव लक्षण मूल्यांकन",
      voiceBot: "आवाज़ स्वास्थ्य बॉट",
      voiceBotDesc: "आवाज़-संचालित स्वास्थ्य सहायक",
      firstAid: "प्राथमिक चिकित्सा गाइड",
      firstAidDesc: "आपातकालीन चिकित्सा मार्गदर्शन",
      appointment: "डॉक्टर अपॉइंटमेंट",
      appointmentDesc: "सत्यापित डॉक्टरों के साथ बुकिंग",
      history: "चिकित्सा इतिहास",
      historyDesc: "अपनी स्वास्थ्य यात्रा को ट्रैक करें",
      upgrade: "प्रीमियम में अपग्रेड करें",
      loginRequired: "लॉगिन आवश्यक",
      access: "पहुंच",
      getPremium: "प्रीमियम प्राप्त करें",
      premiumDesc: "व्यापक स्वास्थ्य प्रबंधन के लिए प्रीमियम सुविधाओं तक पहुंच"
    }
  };

  const freeFeatures = [
    { icon: Brain, title: t[lang].aiDetection, desc: t[lang].aiDetectionDesc, path: '/detect', color: '#667eea' },
    { icon: Activity, title: t[lang].symptomChecker, desc: t[lang].symptomCheckerDesc, path: '/symptom-checker', color: '#f093fb' },
    { icon: MessageSquare, title: t[lang].voiceBot, desc: t[lang].voiceBotDesc, path: '/voice-bot', color: '#4facfe' },
    { icon: Shield, title: t[lang].firstAid, desc: t[lang].firstAidDesc, path: '/first-aid', color: '#43e97b' }
  ];

  const premiumFeatures = [
    { icon: Calendar, title: t[lang].appointment, desc: t[lang].appointmentDesc, path: '/appointment', color: '#ffd700' },
    { icon: History, title: t[lang].history, desc: t[lang].historyDesc, path: '/detailed', color: '#ff6b6b' }
  ];

  const FeatureCard = ({ icon: Icon, title, desc, path, isPremiumFeature = false, color, index }) => {
    const isLocked = isPremiumFeature && !isPremium;
    const animationDelay = index * 0.1;
    
    return (
      <div 
        className={`feature-card ${isLocked ? 'opacity-60' : ''} ${hoveredCard === index ? 'glow-effect' : ''}`}
        onMouseEnter={() => setHoveredCard(index)}
        onMouseLeave={() => setHoveredCard(null)}
        style={{ 
          animationDelay: `${animationDelay}s`,
          ...(isLoaded && { animation: `slideInUp 0.8s ease-out ${animationDelay}s both` })
        }}
      >
        <div className="icon float-animation" style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}aa 100%)` }}>
          <Icon />
          {isLocked && <Lock className="absolute top-0 right-0 w-4 h-4" />}
          {isPremiumFeature && isPremium && <Crown className="absolute top-0 right-0 w-4 h-4 text-yellow-400" />}
        </div>
        
        <h3>{title}</h3>
        <p>{desc}</p>
        
        {isLocked ? (
          <Link to="/login" className="btn-interactive bg-gray-400">
            {t[lang].loginRequired}
          </Link>
        ) : (
          <Link to={path} className="btn-interactive">
            <Zap className="w-4 h-4 mr-2" />
            {t[lang].access}
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="dashboard-container">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="dashboard-header">
            <h1 className="dashboard-title">
              {t[lang].title}
            </h1>
            <p className="dashboard-subtitle">
              {t[lang].subtitle}
            </p>
          </div>

          {/* Free Features */}
          <div className="mb-12">
            <div className="section-header slide-in-left">
              <Activity className="text-green-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                {t[lang].freeFeatures}
              </h2>
              <Star className="text-yellow-500 ml-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {freeFeatures.map((feature, index) => (
                <FeatureCard key={index} {...feature} index={index} />
              ))}
            </div>
          </div>

          {/* Premium Features */}
          <div className="mb-8">
            <div className="section-header slide-in-right">
              <Crown className="text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-800">
                {t[lang].premiumFeatures}
              </h2>
              <Zap className="text-purple-500 ml-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {premiumFeatures.map((feature, index) => (
                <FeatureCard key={index} {...feature} isPremiumFeature={true} index={index + 4} />
              ))}
            </div>
          </div>

          {/* Premium CTA */}
          {!isPremium && (
            <div className="premium-card p-8 text-center rounded-xl">
              <Crown className="mx-auto mb-4 w-16 h-16 text-purple-800 float-animation" />
              <h3 className="text-3xl font-bold mb-2 text-purple-800">{t[lang].upgrade}</h3>
              <p className="mb-6 text-purple-700 text-lg">{t[lang].premiumDesc}</p>
              <Link to="/login" className="btn-interactive bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg">
                <Crown className="w-5 h-5 mr-2" />
                {t[lang].getPremium}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;