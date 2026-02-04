import React from 'react';
import MemberWall from './components/MemberWall';
import Resources from './components/Resources';
import Tools from './components/Tools';
import ClubBanner from './components/ClubBanner';
import DailyCalendar from './components/DailyCalendar';
import Footer from './components/Footer';

function App() {
  return (
    <div className="app-container">
      <header style={{ padding: '20px', textAlign: 'center', background: '#8b0000', color: 'white' }}>
          <h1 style={{ margin: 0 }}>深圳实验学校汉韵社</h1>
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
