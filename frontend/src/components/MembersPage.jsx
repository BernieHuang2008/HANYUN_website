import React from 'react';
import { useTranslation } from '../LanguageContext';
import { getSafeAvatarUrl } from '../utils/member';

const MembersPage = ({ members, onBack, onOpenMember }) => {
  const { t } = useTranslation();

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button onClick={onBack} style={styles.backBtn}>&larr; {t('cancelBtn')}</button>
        <h2 style={styles.title}>{t('allMembersTitle')}</h2>
        <div className="member-grid">
          {members.map((member) => (
            <button key={member.id} className="member-item member-button" onClick={() => onOpenMember(member)}>
              <img src={getSafeAvatarUrl(member.avatar)} alt={member.nickname} className="member-avatar" />
              <div className="member-name">{member.nickname}</div>
              <div className="member-tooltip">
                <strong>{member.nickname}</strong>
                <br />
                {member.bio || t('noBio')}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f9f9f9',
    padding: '20px',
  },
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
  },
  title: {
    margin: '0 0 20px',
    color: '#8b0000',
  },
  backBtn: {
    background: 'transparent',
    border: '1px solid #8b0000',
    color: '#8b0000',
    padding: '4px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '16px',
  },
};

export default MembersPage;
