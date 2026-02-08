import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from '../LanguageContext';

const Footer = ({ isAdminMode }) => {
  const { t } = useTranslation();
  const [suggestion, setSuggestion] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (isAdminMode) {
      fetchFeedbacks();
    }
  }, [isAdminMode]);

  const fetchFeedbacks = () => {
    axios.get('/api/feedback')
      .then(res => setFeedbacks(res.data))
      .catch(err => console.error("Failed to fetch feedbacks", err));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!suggestion.trim()) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      await axios.post('/api/suggestion', { suggestion });
      // alert(t('suggestionSuccess'));
      setSuggestion("");
      setSubmitSuccess(true);
      setTimeout(() => {
          setSubmitSuccess(false);
      }, 3000);
    } catch (error) {
      alert(t('suggestionFail'));
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
        await axios.delete(`/api/feedback/${id}`);
        fetchFeedbacks();
    } catch (e) {
        alert("Failed to delete");
    }
  };

  return (
    <footer className="footer">
      <div className="suggestion-box">
        <h3>{t('suggestionBox')}</h3>
        {!isAdminMode ? (
            <form onSubmit={handleSubmit}>
              <input 
                type="text" 
                className="suggestion-input"
                placeholder={t('suggestionPlaceholder')}
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                disabled={isSubmitting || submitSuccess}
              />
              <button 
                type="submit" 
                className="suggestion-btn"
                disabled={isSubmitting || submitSuccess}
                style={{
                  backgroundColor: submitSuccess ? '#6B8E23' : '', // OliveDrab (Ancient Green)
                  cursor: (isSubmitting || submitSuccess) ? 'default' : 'pointer',
                  opacity: isSubmitting ? 0.8 : 1
                }}
              >
                 {isSubmitting ? t('submitting') : (submitSuccess ? t('suggestionSuccess') : t('submit'))}
              </button>
            </form>
        ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto', background: 'white', color: 'black', borderRadius: '4px', padding: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ background: '#eee' }}>
                            <th style={{ padding: '5px', border: '1px solid #ddd' }}>{t('id')}</th>
                            <th style={{ padding: '5px', border: '1px solid #ddd' }}>{t('time')}</th>
                            <th style={{ padding: '5px', border: '1px solid #ddd' }}>{t('content')}</th>
                            <th style={{ padding: '5px', border: '1px solid #ddd' }}>{t('controls')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {feedbacks.map(f => (
                            <tr key={f.id}>
                                <td style={{ padding: '5px', border: '1px solid #ddd', textAlign: 'center' }}>{f.id}</td>
                                <td style={{ padding: '5px', border: '1px solid #ddd', textAlign: 'center', fontSize: '0.8rem' }}>{f.time}</td>
                                <td style={{ padding: '5px', border: '1px solid #ddd' }}>{f.suggestion}</td>
                                <td style={{ padding: '5px', border: '1px solid #ddd', textAlign: 'center' }}>
                                    <button 
                                        onClick={() => handleDelete(f.id)}
                                        style={{ background: 'red', color: 'white', border: 'none', borderRadius: '3px', padding: '2px 5px', cursor: 'pointer' }}
                                    >
                                        {t('delete')}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {feedbacks.length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '10px' }}>{t('noFeedbacks')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
      </div>
      <div className="copyright">
        {t('copyright', { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
};

export default Footer;
