import React from 'react';
import { useTranslation } from '../LanguageContext';
import { getSafeAvatarUrl } from '../utils/member';

const MemberDetailPage = ({ member, onBack }) => {
  const { t } = useTranslation();

  if (!member) {
    return (
      <div style={{ padding: '20px' }}>
        <button onClick={onBack}>&larr; {t('cancelBtn')}</button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button onClick={onBack} style={styles.backBtn}>&larr; {t('cancelBtn')}</button>
        <img src={getSafeAvatarUrl(member.avatar, 'https://via.placeholder.com/120?text=%E9%9B%85')} alt={member.nickname} style={styles.avatar} />
        <h2 style={styles.name}>{member.nickname}</h2>
        <p><strong>{t('studentNo')}:</strong> {member.id}</p>
        <p><strong>{t('memberBioTitle')}:</strong> {member.bio || t('noBio')}</p>
        <p><strong>{t('memberRole')}:</strong> {member.role}</p>
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
  card: {
    maxWidth: '560px',
    margin: '0 auto',
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center',
  },
  backBtn: {
    float: 'left',
    background: 'transparent',
    border: '1px solid #8b0000',
    color: '#8b0000',
    padding: '4px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  avatar: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #f4e4bc',
    marginTop: '20px',
  },
  name: {
    color: '#8b0000',
  },
};

export default MemberDetailPage;
