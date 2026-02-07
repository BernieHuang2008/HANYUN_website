import React, { useState } from 'react';
import EditModal from './EditModal';

const Tools = ({ data, isAdminMode, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);

  const list = data || [
    { "title": "Loading...", "url": "#" }
  ];

  return (
    <div className="section-card" style={{ position: 'relative' }}>
      {isAdminMode && (
          <button 
            onClick={() => setIsEditing(true)}
            style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.8rem' }}
          >
            Edit
          </button>
      )}
      <EditModal 
        isOpen={isEditing} 
        onClose={() => setIsEditing(false)} 
        onSave={(newData) => {
            onSave(newData);
            setIsEditing(false);
        }} 
        data={list} 
        title="Tools" 
      />
      <div className="section-title">实用工具</div>
      <ul className="tool-list">
        {list.map((item, index) => (
            <li key={index}>
                <a href={item.url} className="tool-link">{item.title}</a>
            </li>
        ))}
      </ul>
    </div>
  );
};

export default Tools;
