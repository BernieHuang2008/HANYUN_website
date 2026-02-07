import React, { useState, useEffect } from 'react';

// --- Helper Components for Visual Editing ---

const PrimitiveInput = ({ value, onChange }) => {
  const isLong = typeof value === 'string' && value.length > 50;
  
  if (isLong) {
      return (
          <textarea 
            style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'inherit' }}
            value={value}
            onChange={e => onChange(e.target.value)}
            rows={3}
          />
      );
  }
  return (
    <input
      type="text"
      style={{ width: '100%', padding: '5px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'inherit' }}
      value={value === undefined || value === null ? '' : value}
      onChange={e => onChange(e.target.value)}
    />
  );
};

const ObjectEditor = ({ data, onChange }) => {
  const handleChange = (key, newValue) => {
    onChange({ ...data, [key]: newValue });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {Object.keys(data).map(key => (
        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#555' }}>
            {key}:
          </label>
          {typeof data[key] === 'object' && data[key] !== null ? (
             <div style={{ paddingLeft: '10px', borderLeft: '2px solid #eee' }}>
               {!Array.isArray(data[key]) ? (
                   <ObjectEditor data={data[key]} onChange={(val) => handleChange(key, val)} />
               ) : (
                    <div style={{color: '#999', fontStyle: 'italic', fontSize: '0.8rem'}}>
                        List (switch to Advanced mode to edit)
                    </div>
               )}
             </div>
          ) : (
             <PrimitiveInput value={data[key]} onChange={(val) => handleChange(key, val)} />
          )}
        </div>
      ))}
    </div>
  );
};

const ArrayEditor = ({ data, onChange }) => {
  const addItem = () => {
    // Try to guess template from first item
    let template = {};
    if (data.length > 0) {
        const first = data[0];
        if (typeof first === 'object' && first !== null) {
            Object.keys(first).forEach(k => template[k] = "");
        } else {
            template = "";
        }
    } else {
        template = { title: "New Item", url: "#" }; // Fallback guess
    }
    onChange([...data, template]);
  };

  const removeItem = (index) => {
    const newData = [...data];
    newData.splice(index, 1);
    onChange(newData);
  };

  const updateItem = (index, newVal) => {
    const newData = [...data];
    newData[index] = newVal;
    onChange(newData);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {data.map((item, index) => (
        <div key={index} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '6px', position: 'relative', backgroundColor: '#fafafa' }}>
          <button 
            onClick={() => removeItem(index)}
            style={{ 
                position: 'absolute', top: '5px', right: '5px', 
                background: '#ffdddd', color: 'red', border: 'none', 
                borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1
            }}
            title="Remove Item"
          >
            ×
          </button>
          
          <div style={{ marginBottom: '8px', fontSize: '0.8rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Item {index + 1}
          </div>
          
          {typeof item === 'object' && item !== null ? (
            <ObjectEditor data={item} onChange={(val) => updateItem(index, val)} />
          ) : (
            <PrimitiveInput value={item} onChange={(val) => updateItem(index, val)} />
          )}
        </div>
      ))}
      <button 
        onClick={addItem}
        style={{ 
            padding: '10px', background: '#f0f0f0', border: '1px dashed #aaa', 
            borderRadius: '6px', cursor: 'pointer', color: '#555',
            fontWeight: 'bold'
        }}
      >
        + Add Item
      </button>
    </div>
  );
};

// --- Main Modal ---

const EditModal = ({ isOpen, onClose, onSave, data, title }) => {
  const [mode, setMode] = useState('visual'); // 'visual' or 'json'
  const [currentData, setCurrentData] = useState(null);
  const [jsonString, setJsonString] = useState('');
  const [error, setError] = useState(null);

  // Sync props to state when modal opens or data changes
  useEffect(() => {
    if (isOpen && data) {
      setCurrentData(data);
      setJsonString(JSON.stringify(data, null, 2));
      setMode('visual');
      setError(null);
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  const handleSwitchToJSON = () => {
    setJsonString(JSON.stringify(currentData, null, 2));
    setMode('json');
  };

  const handleSwitchToVisual = () => {
    try {
      const parsed = JSON.parse(jsonString);
      setCurrentData(parsed);
      setMode('visual');
      setError(null);
    } catch (e) {
      setError("Invalid JSON: Can't switch to visual mode yet. Fix errors first.");
    }
  };

  const handleSave = () => {
    if (mode === 'json') {
      try {
        const parsed = JSON.parse(jsonString);
        onSave(parsed);
        onClose();
      } catch (e) {
        setError("Invalid JSON: " + e.message);
      }
    } else {
      onSave(currentData);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            <h3 style={{ margin: 0, color: '#333' }}>
                Edit {title} 
                <span style={{ marginLeft: '10px', fontSize:'0.75rem', fontWeight:'normal', color:'#888', backgroundColor: '#eee', padding: '2px 6px', borderRadius: '4px' }}>
                    {mode === 'visual' ? 'Visual Mode' : 'Advanced JSON Mode'}
                </span>
            </h3>
            <div style={{ display: 'flex', gap: '5px' }}>
                <button 
                  onClick={mode === 'visual' ? handleSwitchToJSON : handleSwitchToVisual}
                  style={{ 
                    fontSize: '0.8rem', padding: '6px 12px', cursor: 'pointer',
                    background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px',
                    color: '#555'
                  }}
                >
                    {mode === 'visual' ? '🔧 Advanced' : '🎨 Visual Editor'}
                </button>
            </div>
        </div>

        {error && <div style={{ color: '#d32f2f', fontSize: '0.85rem', background: '#ffebee', padding: '10px', borderRadius: '4px', border: '1px solid #ffcdd2' }}>{error}</div>}

        <div style={{ flex: 1, overflowY: 'auto', padding: '5px' }}>
            {mode === 'json' ? (
                <textarea
                  style={{ width: '100%', height: '400px', fontFamily: 'Consolas, monospace', border: '1px solid #ccc', borderRadius: '4px', padding: '10px', fontSize: '14px', boxSizing: 'border-box' }}
                  value={jsonString}
                  onChange={(e) => {
                    setJsonString(e.target.value);
                    setError(null);
                  }}
                  spellCheck={false}
                />
            ) : (
                <>
                {Array.isArray(currentData) ? (
                    <ArrayEditor data={currentData} onChange={setCurrentData} />
                ) : (
                    <ObjectEditor data={currentData || {}} onChange={setCurrentData} />
                )}
                </>
            )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', cursor: 'pointer', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px' }}>Cancel</button>
          <button 
            onClick={handleSave} 
            style={{ 
                padding: '8px 16px', backgroundColor: '#8b0000', color: 'white', 
                border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
