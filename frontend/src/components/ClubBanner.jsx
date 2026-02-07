import React, { useState } from 'react';
import EditModal from './EditModal';
import { useTranslation } from '../LanguageContext';

const ClubBanner = ({ data, isAdminMode, onSave }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  const banner = data || {
      // Fallback
      "img": "https://picsum.photos/800/400?grayscale",
      "t": t('loading'),
      "st": ""
  };

  return (
    <div className="club-banner" style={{ position: 'relative' }}>
      {isAdminMode && (
          <button 
            onClick={() => setIsEditing(true)}
            style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, fontSize: '0.8rem' }}
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
        data={banner} 
        title={t('clubBanner')}
      />
      <img 
        src={banner.img} 
        alt="Club Event" 
        className="banner-img"
      />
      <div className="overlay-text">
        <h2>{banner.t}</h2>
        <p>{banner.st}</p>
      </div>
    </div>
  );
};

export default ClubBanner;
