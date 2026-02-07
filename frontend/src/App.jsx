import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import MemberWall from './components/MemberWall';
import Resources from './components/Resources';
import Tools from './components/Tools';
import ClubBanner from './components/ClubBanner';
import DailyCalendar from './components/DailyCalendar';
import Footer from './components/Footer';

function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('hanyun_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setShowLogin(false);
    localStorage.setItem('hanyun_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('hanyun_user');
  };

  if (showLogin) {
    return <Login onLogin={handleLogin} onCancel={() => setShowLogin(false)} />;
  }

  return (
    <div className="app-container">
      <header style={{ padding: '20px', textAlign: 'center', background: '#8b0000', color: 'white', position: 'relative' }}>
          <h1 style={{ margin: 0 }}>深圳实验学校汉韵社</h1>
          <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {user ? (
              <>
                <span style={{ fontSize: '0.9rem' }}>{user.n.replace("🥒", `用户_${user.id}`)} ({user.id})</span>
                <button 
                  onClick={handleLogout}
                  style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}
                >
                  Logout
                </button>
              </>
            ) : (
                <button 
                  onClick={() => setShowLogin(true)}
                  style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}
                >
                  Login
                </button>
            )}
          </div>
      </header>

      <div className="main-content">
        {/* Left Column */}
        <div className="left-column">
          <MemberWall />
          <Resources />
          <Tools />
        </div>

        {/* Right Column */}
        <div className="right-column">
          <ClubBanner />
          <DailyCalendar />
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default App;
