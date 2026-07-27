import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from '../LanguageContext';

const ProfilePage = ({ user, onBack, onLogout, onUserUpdate }) => {
  const { t } = useTranslation();
  const [nickname, setNickname] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const displayName = (user?.username || '🥒').replace('🥒', `_${user?.id}`);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    if (bio.length > 250) {
      setMessage(t('bioTooLong'));
      setIsError(true);
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const res = await axios.put('/api/user/profile', {
        nickname: nickname.trim(),
        avatar: avatar.trim(),
        bio: bio.trim(),
      });
      if (res.data.success) {
        setMessage(t('profileUpdated'));
        setIsError(false);
        onUserUpdate(res.data.user);
      } else {
        setMessage(t('profileUpdateFailed'));
        setIsError(true);
      }
    } catch {
      setMessage(t('profileUpdateFailed'));
      setIsError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.topBorder} />
      <div style={styles.container}>
        <button onClick={onBack} style={styles.backBtn}>&larr; {t('cancelBtn')}</button>
        <h2 style={styles.pageTitle}>{t('profileTitle')}</h2>

        <div style={styles.card}>
          <div style={styles.cardDecorLine} />
          <div style={styles.avatarCircle}>
            {avatar ? (
              <img src={avatar} alt={displayName} style={styles.avatarImage} />
            ) : (
              <span style={styles.avatarChar}>{displayName.charAt(0)}</span>
            )}
          </div>
          <p style={styles.idLabel}>{t('studentNo')}：<span style={styles.idValue}>{user.id}</span></p>
          <p style={styles.nameLabel}>{t('user_prefix')}<span style={styles.nameValue}>{displayName}</span></p>
          {user.role === 'admin' && <p style={styles.roleTag}>⚙ {t('manage')}</p>}
          <div style={styles.cardDecorLine} />
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>✦ {t('profileEditTitle')} ✦</h3>
          <form onSubmit={handleSaveProfile} style={styles.form}>
            <label style={styles.label}>{t('newUsername')}</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t('enterNewUsername')}
              style={styles.input}
              maxLength={30}
            />

            <label style={styles.label}>{t('avatarUrlLabel')}</label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder={t('avatarUrlPlaceholder')}
              style={styles.input}
            />

            <label style={styles.label}>{t('memberBioTitle')} ({bio.length}/250)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t('bioPlaceholder')}
              style={{ ...styles.input, minHeight: '90px', resize: 'vertical' }}
              maxLength={250}
            />

            {message && <p style={{ ...styles.msg, color: isError ? '#c0392b' : '#2e7d32' }}>{message}</p>}
            <button type="submit" style={styles.saveBtn} disabled={saving || !nickname.trim()}>
              {saving ? t('savingUsername') : t('saveChanges')}
            </button>
          </form>
        </div>

        <div style={styles.logoutSection}>
          <button onClick={onLogout} style={styles.logoutBtn}>{t('logout')}</button>
        </div>
      </div>
      <div style={styles.topBorder} />
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #fdf6e3 0%, #f4e4bc 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    fontFamily: '"Kaiti", "STKaiti", "KaiTi", serif',
  },
  topBorder: {
    width: '80%',
    maxWidth: '480px',
    height: '6px',
    background: 'repeating-linear-gradient(90deg, #8b0000 0px, #8b0000 8px, transparent 8px, transparent 14px)',
    borderRadius: '3px',
    margin: '10px 0',
  },
  container: {
    width: '100%',
    maxWidth: '480px',
    background: 'rgba(255,252,240,0.95)',
    border: '2px solid #8b0000',
    borderRadius: '4px',
    padding: '30px 36px',
    boxShadow: '0 4px 20px rgba(139,0,0,0.12)',
  },
  backBtn: {
    background: 'transparent',
    border: '1px solid #8b0000',
    color: '#8b0000',
    padding: '4px 12px',
    cursor: 'pointer',
    borderRadius: '3px',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    marginBottom: '20px',
  },
  pageTitle: {
    textAlign: 'center',
    color: '#8b0000',
    fontSize: '1.8rem',
    letterSpacing: '0.2em',
    margin: '0 0 24px',
    fontWeight: 'bold',
  },
  card: { textAlign: 'center', marginBottom: '28px' },
  cardDecorLine: { width: '60%', margin: '8px auto', borderTop: '1px solid #c8956c' },
  avatarCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: '#8b0000',
    border: '3px solid #c8956c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '12px auto',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarChar: { color: '#fdf6e3', fontSize: '1.8rem', fontWeight: 'bold' },
  idLabel: { color: '#888', fontSize: '0.9rem', margin: '6px 0' },
  idValue: { color: '#555', fontWeight: 'bold' },
  nameLabel: { color: '#555', fontSize: '1.1rem', margin: '6px 0' },
  nameValue: { color: '#8b0000', fontWeight: 'bold', fontSize: '1.2rem' },
  roleTag: {
    display: 'inline-block',
    background: '#8b0000',
    color: '#fdf6e3',
    fontSize: '0.8rem',
    padding: '2px 10px',
    borderRadius: '10px',
    margin: '6px 0',
  },
  section: {
    marginBottom: '28px',
    padding: '16px',
    background: 'rgba(244,228,188,0.5)',
    border: '1px solid #c8956c',
    borderRadius: '4px',
  },
  sectionTitle: { color: '#8b0000', fontSize: '1rem', letterSpacing: '0.15em', textAlign: 'center', margin: '0 0 14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  label: { color: '#666', fontSize: '0.9rem' },
  input: {
    padding: '8px 12px',
    border: '1px solid #c8956c',
    borderRadius: '3px',
    background: '#fffdf5',
    fontFamily: 'inherit',
    fontSize: '1rem',
    color: '#333',
    outline: 'none',
  },
  msg: { margin: '0', fontSize: '0.88rem' },
  saveBtn: {
    padding: '8px',
    background: '#8b0000',
    color: '#fdf6e3',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '1rem',
    letterSpacing: '0.1em',
  },
  logoutSection: { textAlign: 'center' },
  logoutBtn: {
    padding: '8px 32px',
    background: 'transparent',
    color: '#8b0000',
    border: '1px solid #8b0000',
    borderRadius: '3px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: '1rem',
    letterSpacing: '0.1em',
  },
};

export default ProfilePage;
