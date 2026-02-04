import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MemberWall = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const MAX_DISPLAY = 9; // Limit visible members

  useEffect(() => {
    axios.get('/api/members')
      .then(res => {
        setMembers(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch members", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading Members...</div>;

  const displayMembers = members.slice(0, MAX_DISPLAY);
  const hasMore = members.length > MAX_DISPLAY;

  return (
    <div className="section-card">
      <div className="section-title">社员墙</div>
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
             <div className="member-name">更多</div>
           </div>
        )}
      </div>
    </div>
  );
};

export default MemberWall;
