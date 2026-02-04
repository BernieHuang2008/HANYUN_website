import React, { useState } from 'react';
import axios from 'axios';

const Footer = () => {
  const [suggestion, setSuggestion] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!suggestion.trim()) return;

    try {
      await axios.post('/api/suggestion', { suggestion });
      alert("感谢您的建议！");
      setSuggestion("");
    } catch (error) {
      alert("提交失败，请稍后再试。");
    }
  };

  return (
    <footer className="footer">
      <div className="suggestion-box">
        <h3>建议信箱</h3>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            className="suggestion-input"
            placeholder="请输入您的建议..."
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
          />
          <button type="submit" className="suggestion-btn">提交</button>
        </form>
      </div>
      <div className="copyright">
        &copy; {new Date().getFullYear()} 深圳实验学校汉韵社 版权所有
      </div>
    </footer>
  );
};

export default Footer;
