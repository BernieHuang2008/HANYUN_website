import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from '../LanguageContext';

const Footer = () => {
  const { t } = useTranslation();
  const [suggestion, setSuggestion] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!suggestion.trim()) return;

    try {
      await axios.post('/api/suggestion', { suggestion });
      alert(t('suggestionSuccess'));
      setSuggestion("");
    } catch (error) {
      alert(t('suggestionFail'));
    }
  };

  return (
    <footer className="footer">
      <div className="suggestion-box">
        <h3>{t('suggestionBox')}</h3>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            className="suggestion-input"
            placeholder={t('suggestionPlaceholder')}
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
          />
          <button type="submit" className="suggestion-btn">{t('submit')}</button>
        </form>
      </div>
      <div className="copyright">
        {t('copyright', { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
};

export default Footer;
