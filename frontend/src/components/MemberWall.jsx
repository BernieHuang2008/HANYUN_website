import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EditModal from './EditModal';
import { useTranslation } from '../LanguageContext';

const MemberWall = ({ isAdminMode }) => {
  const { t } = useTranslation();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const MAX_DISPLAY = 9; // Limit visible members

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = () => {
    axios.get('/api/members')
      .then(res => {
        setMembers(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch members", err);
        setLoading(false);
      });
  };

  const handleSave = (newMembers) => {
      axios.post('/api/members', newMembers)
        .then(() => {
            setMembers(newMembers);
            setIsEditing(false);
        })
        .catch(err => alert("Failed to save members: " + err));
  };


  if (loading) return <div>{t('loading')}</div>;

  const displayMembers = members.slice(0, MAX_DISPLAY);
  const hasMore = members.length > MAX_DISPLAY;

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
        onSave={handleSave} 
        data={members} 
        title={t('memberWall')}
      />
      <div className="section-title">{t('memberWall')}</div>
      <div className="member-grid">
        {displayMembers.map(member => (
          <div key={member.id} className="member-item">
            <img src={member.avatar} alt={member.name} className="member-avatar" />
            <div className="member-name">{member.name}</div>
            <div className="member-tooltip">
              <strong>{member.name}</strong><br/>
              {member.detail}
            </div>
          </div>
        ))}
        {hasMore && (
           <div className="member-item">
             <div className="member-more">...</div>
             <div className="member-name">{t('more')}</div>
           </div>
        )}
      </div>
    </div>
  );
};

export default MemberWall;
