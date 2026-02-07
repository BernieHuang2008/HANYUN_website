import React, { useState } from 'react';
import EditModal from './EditModal';

const Resources = ({ data, isAdminMode, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Default fallback if data is missing/loading
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
        title="Resources" 
      />
      <div className="section-title">资料整理</div>
      <ul className="resource-list">
        {list.map((item, index) => (
            <li key={index}><a href={item.url}>{item.title}</a></li>
        ))}
      </ul>
    </div>
  );
};

export default Resources;
