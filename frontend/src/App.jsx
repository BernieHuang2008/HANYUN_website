import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from './LanguageContext';
import Login from './components/Login';
import MemberWall from './components/MemberWall';
import Resources from './components/Resources';
import Tools from './components/Tools';
import ClubBanner from './components/ClubBanner';
import DailyCalendar from './components/DailyCalendar';
import Footer from './components/Footer';

function App() {
  const { t, toggleLanguage, language } = useTranslation();
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [content, setContent] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('hanyun_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchContent();
  }, []);

  const fetchContent = () => {
    axios.get('/api/content')
      .then(res => setContent(res.data))
      .catch(err => console.error("Failed to fetch content", err));
  };

  const updateContent = (section, newData) => {
    const newContent = { ...content, [section]: newData };
    setContent(newContent);
    axios.post('/api/content', newContent)
      .catch(err => {
        console.error("Failed to save content", err);
        alert("Failed to save content.");
      });
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setShowLogin(false);
    localStorage.setItem('hanyun_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('hanyun_user');
    document.cookie = "hanyun_uid=; path=/; max-age=0";
    document.cookie = "hanyun_token=; path=/; max-age=0";
    setIsAdminMode(false);
  };

  if (showLogin) {
    return <Login onLogin={handleLogin} onCancel={() => setShowLogin(false)} />;
  }

  const isAdmin = user && (user.role === 'admin');

  return (
    <div className="app-container">
      <header style={{ padding: '20px', textAlign: 'center', background: '#8b0000', color: 'white', position: 'relative' }}>
          <h1 style={{ margin: 0 }}>{t('appName')}</h1>
          <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <button 
                onClick={toggleLanguage}
                style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid white', color: 'white', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}
             >
               {language === 'zh' ? 'EN' : '中文'}
             </button>
            {user ? (
              <>
                <span style={{ fontSize: '0.9rem' }}>{t('user_prefix')}{user.username.replace("🥒", `_${user.id}`)} ({user.id})</span>
                 {isAdmin && (
                    <button 
                      onClick={() => setIsAdminMode(!isAdminMode)}
                      style={{ 
                        background: isAdminMode ? 'white' : 'transparent', 
                        color: isAdminMode ? '#8b0000' : 'white', 
                        border: '1px solid white', 
                        padding: '5px 10px', 
                        cursor: 'pointer', 
                        borderRadius: '4px',
                        fontWeight: isAdminMode ? 'bold' : 'normal'
                      }}
                    >
                      {isAdminMode ? t('exitAdmin') : t('manage')}
                    </button>
                 )}
                <button 
                  onClick={handleLogout}
                  style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}
                >
                  {t('logout')}
                </button>
              </>
            ) : (
                <button 
                  onClick={() => setShowLogin(true)}
                  style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}
                >
                  {t('login')}
                </button>
            )}
          </div>
      </header>

      {isAdminMode && (
          <div style={{ backgroundColor: '#ffcccc', color: '#8b0000', textAlign: 'center', padding: '5px', fontSize: '0.9rem' }}>
              {t('adminModeActive')}
          </div>
      )}

      <div className="main-content">
        {/* Left Column */}
        <div className="left-column">
          <MemberWall isAdminMode={isAdminMode} />
          <Resources 
            data={content?.resources} 
            isAdminMode={isAdminMode} 
            onSave={(d) => updateContent('resources', d)} 
          />
          <Tools 
            data={content?.tools} 
            isAdminMode={isAdminMode} 
            onSave={(d) => updateContent('tools', d)} 
          />
        </div>

        {/* Right Column */}
        <div className="right-column">
          <ClubBanner 
            data={content?.banner} 
            isAdminMode={isAdminMode} 
            onSave={(d) => updateContent('banner', d)} 
          />
          <DailyCalendar />
        </div>
      </div>

      <Footer isAdminMode={isAdminMode} />
    </div>
  );
}

export default App;
