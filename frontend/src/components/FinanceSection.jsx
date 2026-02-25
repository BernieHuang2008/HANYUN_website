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
      .then(async res => {
        const AU_PRICE = 19.552;
        res.data.balance_xag = res.data.balance / AU_PRICE / 50; // 50g / 两
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
  const color = '#fff9c4';

  const jaggedStyle = {
    background: color, // Yellowish receipt color
    position: 'relative',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
    padding: '20px',
    marginBottom: '20px',
    marginTop: '10px',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: '"Courier New", Courier, monospace',
    color: '#333',
  };

  const sawtoothCss = {
      position: 'absolute',
      left: 0,
      width: '100%',
      height: '10px',
      zIndex: 1
  };
  
  // Encode SVG for URL
  const topSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 10' preserveAspectRatio='none'%3E%3Cpath d='M0 10 L10 0 L20 10 Z' fill='%23fff9c4'/%3E%3C/svg%3E`;
  const bottomSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 10' preserveAspectRatio='none'%3E%3Cpath d='M0 0 L10 10 L20 0 Z' fill='%23fff9c4'/%3E%3C/svg%3E`;

  return (
    <div className="receipt-container" style={jaggedStyle}>
      <div style={{
          ...sawtoothCss,
          top: '-10px',
          backgroundImage: `url("${topSvg}")`,
          backgroundSize: '20px 10px',
          backgroundRepeat: 'repeat-x'
      }} />

      <div style={{
          ...sawtoothCss,
          bottom: '-10px',
          backgroundImage: `url("${bottomSvg}")`,
          backgroundSize: '20px 10px',
          backgroundRepeat: 'repeat-x'
      }} />

      {isAdminMode && (
          <button 
            onClick={onShowMore}
            style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.8rem' }}
          >
            {t('edit')}
          </button>
      )}

      <div className="receipt-content">
        <h2 style={{ textAlign: 'center', borderBottom: '1px dashed #333', paddingBottom: '10px', marginBottom: '10px', fontSize: '1.5rem', fontFamily: '"Kaiti", "STKaiti", serif' }}>
            {t('finance_title')}
        </h2>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: 'bold', fontFamily: '"Kaiti", "STKaiti", serif', fontSize: '1.2rem' }}>
            <span>{t('finance_balance')}:</span>
            <span>{(data.balance_xag || 0).toFixed(3)} {t('finance_unit_xag')} / {(data.balance || 0).toFixed(2)} {t('finance_unit_cny')}</span>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem', fontFamily: '"Kaiti", "STKaiti", serif' }}>
            <thead>
                <tr style={{ borderBottom: '1px solid #333' }}>
                    <th style={{ textAlign: 'left' }}>{t('finance_date')}</th>
                    <th style={{ textAlign: 'left' }}>{t('finance_summary')}</th>
                    <th style={{ textAlign: 'right' }}>{t('finance_amount')}</th>
                </tr>
            </thead>
            <tbody>
                {data.records.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px dashed #ccc' }}>
                        <td style={{ padding: '5px 0' }}>{formatDate(r.time).split(' ')[0]}</td>
                        <td style={{ padding: '5px 0' }}>
                            <div>{r.detail}</div>
                            <div style={{ fontSize: '0.8em', color: '#666' }}>{t('finance_handler')} {r.people}</div>
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
                    fontSize: '1rem',
                    fontFamily: '"Kaiti", "STKaiti", serif'
                }}>
                {t('finance_more')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default FinanceSection;
