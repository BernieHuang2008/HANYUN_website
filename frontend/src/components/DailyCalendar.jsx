import React, { useEffect, useState } from 'react';
import quotesData from '../quotes.json';

const DailyCalendar = () => {
  const [dailyData, setDailyData] = useState(null);
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    // Set current date
    const now = new Date();
    setDateStr(`${now.getFullYear()}年${now.getMonth()+1}月${now.getDate()}日`);

    // Logic to pick a quote locally
    // 1. Check for special date (MM-DD)
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const dateKey = `${month}-${day}`;

    const specialQuote = quotesData.special.find(q => q.date === dateKey);

    if (specialQuote) {
        setDailyData({
            t: specialQuote.type || 'quote',
            c: specialQuote.content,
            d: specialQuote.description
        });
    } else {
        // 2. Pick a daily random quote from default list
        // Use a seed based on the date so it doesn't change on refresh
        const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const index = dayOfYear % quotesData.default.length;
        const dailyQuote = quotesData.default[index];
        
        setDailyData({
            t: dailyQuote.type || 'quote',
            c: dailyQuote.content,
            d: dailyQuote.description
        });
    }

  }, []);

  return (
    <div className="section-card calendar-card">
        <div className="section-title">创意日历</div>
        <div className="date-display">{dateStr}</div>
        
        {dailyData ? (
            <div className="daily-content">
                {dailyData.t === 'quote' ? (
                    <blockquote style={{ fontSize: '1.2em', fontStyle: 'italic' }}>
                        "{dailyData.c}"
                    </blockquote>
                ) : (
                    <img 
                        src={dailyData.c} 
                        alt="Daily" 
                        className="daily-content-img"
                    />
                )}
                <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
                    {dailyData.d}
                </p>
            </div>
        ) : (
            <p>加载今日内容...</p>
        )}
    </div>
  );
};

export default DailyCalendar;
