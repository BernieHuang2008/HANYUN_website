import React from 'react';

const Tools = () => {
  return (
    <div className="section-card">
      <div className="section-title">实用工具</div>
      <ul className="tool-list">
        <li>
            <a href="/tools/calendar" className="tool-link">📅 活动日历查询</a>
        </li>
        <li>
            <a href="/tools/rent" className="tool-link">👘 服装借用系统</a>
        </li>
        <li>
            <a href="/tools/checkin" className="tool-link">📝 社员签到入口</a>
        </li>
      </ul>
    </div>
  );
};

export default Tools;
