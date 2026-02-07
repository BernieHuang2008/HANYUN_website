import React, { useState } from 'react';
import EditModal from './EditModal';

const ClubBanner = ({ data, isAdminMode, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);

  const banner = data || {
      // Fallback
      "imageUrl": "https://picsum.photos/800/400?grayscale",
      "title": "Loading...",
      "subtitle": ""
  };

  return (
    <div className="club-banner" style={{ position: 'relative' }}>
      {isAdminMode && (
          <button 
            onClick={() => setIsEditing(true)}
            style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, fontSize: '0.8rem' }}
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
        data={banner} 
        title="Banner" 
      />
      <img 
        src={banner.imageUrl} 
        alt="Club Event" 
        className="banner-img"
      />
      <div className="overlay-text">
        <h2>{banner.title}</h2>
        <p>{banner.subtitle}</p>
      </div>
    </div>
  );
};

export default ClubBanner;
