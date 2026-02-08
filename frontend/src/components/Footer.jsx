import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from '../LanguageContext';

const Footer = ({ isAdminMode }) => {
  const { t } = useTranslation();
  const [suggestion, setSuggestion] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);

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

    try {
      await axios.post('/api/suggestion', { suggestion });
      alert(t('suggestionSuccess'));
      setSuggestion("");
    } catch (error) {
      alert(t('suggestionFail'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this suggestion?")) return;
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
              />
              <button type="submit" className="suggestion-btn">{t('submit')}</button>
            </form>
        ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto', background: 'white', color: 'black', borderRadius: '4px', padding: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ background: '#eee' }}>
                            <th style={{ padding: '5px', border: '1px solid #ddd' }}>ID</th>
                            <th style={{ padding: '5px', border: '1px solid #ddd' }}>User</th>
                            <th style={{ padding: '5px', border: '1px solid #ddd' }}>Time</th>
                            <th style={{ padding: '5px', border: '1px solid #ddd' }}>Content</th>
                            <th style={{ padding: '5px', border: '1px solid #ddd' }}>Controls</th>
                        </tr>
                    </thead>
                    <tbody>
                        {feedbacks.map(f => (
                            <tr key={f.id}>
                                <td style={{ padding: '5px', border: '1px solid #ddd', textAlign: 'center' }}>{f.id}</td>
                                <td style={{ padding: '5px', border: '1px solid #ddd', textAlign: 'center' }}>{f.uid}</td>
                                <td style={{ padding: '5px', border: '1px solid #ddd', textAlign: 'center', fontSize: '0.8rem' }}>{f.time}</td>
                                <td style={{ padding: '5px', border: '1px solid #ddd' }}>{f.suggestion}</td>
                                <td style={{ padding: '5px', border: '1px solid #ddd', textAlign: 'center' }}>
                                    <button 
                                        onClick={() => handleDelete(f.id)}
                                        style={{ background: 'red', color: 'white', border: 'none', borderRadius: '3px', padding: '2px 5px', cursor: 'pointer' }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {feedbacks.length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '10px' }}>No feedbacks</td></tr>
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
