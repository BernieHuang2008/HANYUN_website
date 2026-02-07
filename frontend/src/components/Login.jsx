import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from '../LanguageContext';

const Login = ({ onLogin, onCancel }) => {
  const { t } = useTranslation();
  const [studentNo, setStudentNo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/login', { studentNo });
      if (response.data.success) {
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
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    background: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    width: '100%',
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
