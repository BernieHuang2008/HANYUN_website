import React, { useState } from 'react';
import EditModal from './EditModal';
import { useTranslation } from '../LanguageContext';

const Tools = ({ data, isAdminMode, onSave }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  const list = data || [
    { "t": t('loading'), "l": "#" }
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
        title={t('tools')}
      />
      <div className="section-title">{t('tools')}</div>
      <ul className="tool-list">
        {list.map((item, index) => (
            <li key={index}>
                <a href={item.l} className="tool-link">{item.t}</a>
            </li>
        ))}
      </ul>
    </div>
  );
};

export default Tools;
