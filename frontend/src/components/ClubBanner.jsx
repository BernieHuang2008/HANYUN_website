import React from 'react';

const ClubBanner = () => {
  return (
    <div className="club-banner">
      <img 
        src="https://picsum.photos/800/400?grayscale" 
        alt="Club Event" 
        className="banner-img"
      />
      <div className="overlay-text">
        <h2>汉韵社秋季招新火热进行中</h2>
        <p>期待与你在深实相遇</p>
      </div>
    </div>
  );
};

export default ClubBanner;
