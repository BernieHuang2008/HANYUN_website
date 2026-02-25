import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from '../LanguageContext';

const FinanceSection = ({ isAdminMode, onShowMore }) => {
  const { t } = useTranslation();
  const [data, setData] = useState({ balance: 0, records: [] });
  const [loading, setLoading] = useState(true);

  const fetchFinance = () => {
    // Get latest 5
    axios.get('/api/finance?limit=5')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch finance", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    // Format to YYYY-MM-DD HH:mm (UTC+8 is implied if stored or server returns it, 
    // but usually browsers handle timezone. The requirement says UTC+8. 
    // If the server returns ISO, the browser converts to local. 
    // Let's assume we want to display as is or local. 
    // To match typical receipt style: 
    return date.toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
  };

  const jaggedStyle = {
    background: '#fff9c4', // Yellowish receipt color
    position: 'relative',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
    padding: '20px',
    margin: '20px auto',
    maxWidth: '100%',
    fontFamily: '"Courier New", Courier, monospace', // Monospace for receipt feel
    color: '#333',
    // Torn paper effect using radial gradient
    // This creates a "tooth" pattern at the top and bottom
    // We can use mask-image (modern) or background-image hack
  };

  return (
    <div className="receipt-container" style={jaggedStyle}>
      {/* Top jagged edge */}
      <div style={{
          position: 'absolute',
          top: '-10px',
          left: 0,
          right: 0,
          height: '10px',
          background: `radial-gradient(circle, transparent, transparent 50%, #fff9c4 50%, #fff9c4) 0 0/20px 20px`
          // Actually, standard "sawtooth" is easier with linear-gradient
      }} />
       <div style={{
          position: 'absolute',
          top: '-10px',
          left: 0,
          width: '100%',
          height: '10px',
          background: 'linear-gradient(45deg, transparent 33.333%, #fff9c4 33.333%, #fff9c4 66.667%, transparent 66.667%), linear-gradient(-45deg, transparent 33.333%, #fff9c4 33.333%, #fff9c4 66.667%, transparent 66.667%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0'
      }} />

      <div className="receipt-content">
        <h2 style={{ textAlign: 'center', borderBottom: '1px dashed #333', paddingBottom: '10px', marginBottom: '10px', fontSize: '1.2rem' }}>
            {t('finance_title') || "汉韵账房"}
        </h2>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: 'bold' }}>
            <span>{t('finance_balance') || "结余"}:</span>
            <span>¥ {data.balance.toFixed(2)}</span>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
                <tr style={{ borderBottom: '1px solid #333' }}>
                    <th style={{ textAlign: 'left' }}>Date</th>
                    <th style={{ textAlign: 'left' }}>Item</th>
                    <th style={{ textAlign: 'right' }}>Amt</th>
                </tr>
            </thead>
            <tbody>
                {data.records.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px dashed #ccc' }}>
                        <td style={{ padding: '5px 0' }}>{formatDate(r.time).split(' ')[0]}</td>
                        <td style={{ padding: '5px 0' }}>
                            <div>{r.detail}</div>
                            <div style={{ fontSize: '0.8em', color: '#666' }}>@{r.people}</div>
                        </td>
                        <td style={{ textAlign: 'right', padding: '5px 0', color: r.money >= 0 ? 'green' : 'red' }}>
                            {r.money > 0 ? '+' : ''}{r.money.toFixed(2)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        
        <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <button 
                onClick={onShowMore}
                style={{ 
                    background: 'transparent', 
                    border: '1px solid #333', 
                    borderRadius: '20px',
                    padding: '5px 15px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                }}>
                {t('more') || "展开更多"}
            </button>
        </div>

        {isAdminMode && (
             <div 
                onClick={onShowMore}
                style={{ 
                   position: 'absolute', 
                   top: 0, left: 0, right: 0, bottom: 0, 
                   background: 'rgba(0,0,0,0.05)', 
                   cursor: 'pointer',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   color: 'rgba(0,0,0,0.5)',
                   fontSize: '1.2rem',
                   fontWeight: 'bold',
                   opacity: 0,
                   transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => e.target.style.opacity = 1}
                onMouseLeave={(e) => e.target.style.opacity = 0}
             >
                {t('edit')}
             </div>
        )}
      </div>
    </div>
  );
};

export default FinanceSection;
