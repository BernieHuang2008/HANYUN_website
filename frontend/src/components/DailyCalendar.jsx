import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DailyCalendar = () => {
  const [dailyData, setDailyData] = useState(null);
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    // Set current date
    const now = new Date();
    setDateStr(`${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日`);

    // Fetch daily API
    axios.get('/api/daily')
      .then(res => setDailyData(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="section-card calendar-card">
        <div className="section-title">创意日历</div>
        <div className="date-display">{dateStr}</div>
        
        {dailyData ? (
            <div className="daily-content">
                {dailyData.type === 'quote' ? (
                    <blockquote style={{ fontSize: '1.2em', fontStyle: 'italic' }}>
                        "{dailyData.content}"
                    </blockquote>
                ) : (
                    <img 
                        src={dailyData.content} 
                        alt="Daily" 
                        className="daily-content-img"
                    />
                )}
                <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
                    {dailyData.description}
                </p>
            </div>
        ) : (
            <p>加载今日内容...</p>
        )}
    </div>
  );
};

export default DailyCalendar;
