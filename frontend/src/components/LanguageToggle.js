// components/LanguageToggle.js
import React, { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

const LanguageToggle = () => {
  const { lang, toggleLanguage } = useContext(LanguageContext);

  return (
    <button onClick={toggleLanguage} className="px-3 py-1 bg-white text-indigo-700 rounded hover:bg-gray-100">
      {lang === 'en' ? 'हिन्दी' : 'English'}
    </button>
  );
};

export default LanguageToggle;
