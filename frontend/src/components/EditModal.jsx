import React, { useState, useEffect } from 'react';

const EditModal = ({ isOpen, onClose, onSave, data, title }) => {
  const [jsonContent, setJsonContent] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (data) {
      setJsonContent(JSON.stringify(data, null, 2));
    }
  }, [data]);

  if (!isOpen) return null;

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      onSave(parsed);
      onClose();
    } catch (e) {
      setError("Invalid JSON format: " + e.message);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '80%', maxWidth: '600px',
        display: 'flex', flexDirection: 'column', gap: '10px'
      }}>
        <h3>Edit {title}</h3>
        {error && <div style={{ color: 'red', fontSize: '0.8rem' }}>{error}</div>}
        <textarea
          style={{ width: '100%', height: '300px', fontFamily: 'monospace', padding: '10px' }}
          value={jsonContent}
          onChange={(e) => {
            setJsonContent(e.target.value);
            setError(null);
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} style={{ padding: '8px 16px' }}>Cancel</button>
          <button onClick={handleSave} style={{ padding: '8px 16px', backgroundColor: '#8b0000', color: 'white', border: 'none', borderRadius: '4px' }}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
