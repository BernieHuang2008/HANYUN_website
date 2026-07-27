import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useTranslation } from '../LanguageContext';
import { getMemberDisplayName, getSafeAvatarUrl } from '../utils/member';

const MemberWall = ({ isAdminMode, members, allMembers, onOpenAllMembers, onOpenMember, onMembersChanged }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setSelectedIds(members.map((member) => member.id));
      setSearchKeyword('');
    }
  }, [isEditing, members]);

  const selectedMembers = useMemo(() => {
    const map = new Map(allMembers.map((member) => [member.id, member]));
    return selectedIds.map((id) => map.get(id)).filter(Boolean);
  }, [allMembers, selectedIds]);

  const filteredCandidates = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    const selectedSet = new Set(selectedIds);
    return allMembers.filter((member) => {
      if (selectedSet.has(member.id)) return false;
      if (!keyword) return true;
      return getMemberDisplayName(member.nickname).toLowerCase().includes(keyword);
    });
  }, [allMembers, searchKeyword, selectedIds]);

  const moveSelectedMember = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= selectedIds.length || fromIndex === toIndex) return;
    const next = [...selectedIds];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    setSelectedIds(next);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post('/api/members', { memberIds: selectedIds });
      await onMembersChanged();
      setIsEditing(false);
    } catch (error) {
      alert(t('memberSaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="section-card member-wall-section" style={{ position: 'relative' }}>
      {isAdminMode && (
        <button onClick={() => setIsEditing(true)} style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.8rem' }}>
          {t('edit')}
        </button>
      )}

      <div className="section-title">{t('memberWall')}</div>
      <div className="member-grid">
        {members.map((member) => {
          const displayName = getMemberDisplayName(member.nickname);
          return (
            <button key={member.id} className="member-item member-button" onClick={() => onOpenMember(member)}>
              <img src={getSafeAvatarUrl(member.avatar)} alt={displayName} className="member-avatar" />
              <div className="member-name">{displayName}</div>
              <div className="member-tooltip">
                <strong>{displayName}</strong>
                <br />
                {member.bio || t('noBio')}
              </div>
            </button>
          );
        })}
        <button className="member-item member-button" onClick={onOpenAllMembers}>
          <div className="member-more">...</div>
          <div className="member-name">{t('more')}</div>
        </button>
      </div>

      {isEditing && (
        <div className="member-edit-overlay">
          <div className="member-edit-modal">
            <h3>{t('memberWallEditTitle')}</h3>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder={t('memberSearchPlaceholder')}
              className="member-edit-input"
            />

            <div className="member-edit-columns">
              <div>
                <h4>{t('memberCandidates')}</h4>
                <div className="member-edit-list">
                  {filteredCandidates.map((member) => {
                    const displayName = getMemberDisplayName(member.nickname);
                    return (
                      <button
                        key={member.id}
                        className="member-select-row"
                        onClick={() => setSelectedIds([...selectedIds, member.id])}
                      >
                        <img src={getSafeAvatarUrl(member.avatar)} alt={displayName} className="member-mini-avatar" />
                        <span>{displayName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4>{t('memberSelected')}</h4>
                <div className="member-edit-list">
                  {selectedMembers.map((member, index) => {
                    const displayName = getMemberDisplayName(member.nickname);
                    return (
                      <div
                        key={member.id}
                        className="member-selected-row"
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('text/plain', String(index))}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const fromIndex = Number(e.dataTransfer.getData('text/plain'));
                          moveSelectedMember(fromIndex, index);
                        }}
                      >
                        <img src={getSafeAvatarUrl(member.avatar)} alt={displayName} className="member-mini-avatar" />
                        <span>{displayName}</span>
                        <button
                          className="member-remove-btn"
                          onClick={() => setSelectedIds(selectedIds.filter((id) => id !== member.id))}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="member-edit-actions">
              <button onClick={() => setIsEditing(false)}>{t('cancelBtn')}</button>
              <button onClick={handleSave} disabled={saving}>
                {saving ? t('savingUsername') : t('saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberWall;
