import React, { useState } from 'react';
import axios from 'axios';
import md5 from 'js-md5';
import { useTranslation } from '../LanguageContext';

const Login = ({ onLogin, onCancel }) => {
  const { t } = useTranslation();
  const [studentNo, setStudentNo] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const passwordHash = md5(password);
      const response = await axios.post('/api/login', { 
        studentNo, 
        password: passwordHash 
      });

      if (response.data.success) {
        // Set cookies
        const maxAge = rememberMe ? 31536000 : 86400; // 1 year vs 24 hours
        document.cookie = `hanyun_uid=${studentNo}; path=/; max-age=${maxAge}`;
        document.cookie = `hanyun_token=${passwordHash}; path=/; max-age=${maxAge}`;
        
        onLogin(response.data.user);
      } else {
        setError(response.data.message || t('loginError'));
      }
    } catch (err) {
      console.error(err);
      setError(t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>{t('loginTitle')}</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="studentNo" style={styles.label}>{t('studentNo')}</label>
            <input
              type="text"
              id="studentNo"
              value={studentNo}
              onChange={(e) => setStudentNo(e.target.value)}
              style={styles.input}
              placeholder={t('enterStudentNo')}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>{t('password')}</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder={t('enterPassword')}
              required
            />
          </div>
          <div style={styles.checkboxGroup}>
              <input 
                type="checkbox" 
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe">{t('rememberMe')}</label>
          </div>

          {error && <div style={styles.error}>{error}</div>}
          <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
              <button type="button" onClick={onCancel} style={{ ...styles.button, background: '#ccc', flex: 1 }} disabled={loading}>
                {t('cancelBtn')}
              </button>
              <button type="submit" style={{ ...styles.button, marginTop: 0, flex: 1 }} disabled={loading}>
                {loading ? t('loggingIn') : t('loginBtn')}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  card: {
    background: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    width: '90%',
    maxWidth: '400px',
  },
  title: {
    textAlign: 'center',
    color: '#8b0000',
    marginTop: 0,
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem'
  },
  label: {
    fontSize: '0.9rem',
    color: '#666',
  },
  input: {
    padding: '0.75rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#8b0000',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    fontSize: '0.875rem',
    marginTop: '0.5rem',
  },
};

export default Login;
