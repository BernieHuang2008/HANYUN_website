import React, { useState } from 'react';
import EditModal from './EditModal';
import { useTranslation } from '../LanguageContext';

const Resources = ({ data, isAdminMode, onSave }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  
  // Default fallback if data is missing/loading
  const list = data || [
      { "title": t('loading'), "url": "#" }
  ];

  return (
    <div className="section-card" style={{ position: 'relative' }}>
      {isAdminMode && (
          <button 
            onClick={() => setIsEditing(true)}
            style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.8rem' }}
          >
            {t('edit')}
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
        title={t('resources')}
      />
      <div className="section-title">{t('resources')}</div>
      <ul className="resource-list">
        {list.map((item, index) => (
            <li key={index}><a href={item.url}>{item.title}</a></li>
        ))}
      </ul>
    </div>
  );
};

export default Resources;
