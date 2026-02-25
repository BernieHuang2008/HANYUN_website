import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from '../LanguageContext';

const FinancePage = ({ onBack, isAdminMode }) => {
  const { t } = useTranslation();
  const [data, setData] = useState({ balance: 0, records: [] });
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null); // null = add, obj = edit
  const [formData, setFormData] = useState({
      time: '',
      money: '',
      people: '',
      detail: ''
  });

  const fetchFinance = () => {
    axios.get('/api/finance')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch finance", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const handleDelete = (id) => {
      if (!window.confirm("Confirm delete?")) return;
      axios.delete(`/api/finance/${id}`)
        .then(() => fetchFinance())
        .catch(err => alert("Delete failed: " + err));
  };

  const handleEditClick = (record) => {
      setCurrentRecord(record);
      setFormData({
          time: record.time,
          money: record.money,
          people: record.people,
          detail: record.detail
      });
      setIsModalOpen(true);
  };

  const handleAddClick = () => {
      setCurrentRecord(null);
      // Default to now
      const now = new Date();
      // Format datetime-local: YYYY-MM-DDTHH:mm
      // Manual formatting to local time string for input
      const offset = now.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(now - offset)).toISOString().slice(0, 16);
      
      setFormData({
          time: localISOTime,
          money: '',
          people: '',
          detail: ''
      });
      setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
      e.preventDefault();
      const payload = { ...formData, money: parseFloat(formData.money) };
      
      if (currentRecord) {
          // Update
          axios.put(`/api/finance/${currentRecord.id}`, payload)
            .then(() => {
                setIsModalOpen(false);
                fetchFinance();
            })
            .catch(err => alert("Update failed"));
      } else {
          // Add
          axios.post('/api/finance', payload)
            .then(() => {
                setIsModalOpen(false);
                fetchFinance();
            })
            .catch(err => alert("Add failed"));
      }
  };

  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="finance-page" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', background: 'rgba(255,255,255,0.9)', borderRadius: '8px', minHeight: '80vh', fontFamily: '"Kaiti", "STKaiti", serif' }}>
      <button onClick={onBack} style={{ marginBottom: '20px', padding: '5px 10px', fontFamily: '"Kaiti", "STKaiti", serif', cursor: 'pointer' }}>&larr; 返回</button>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: '"Kaiti", "STKaiti", serif' }}>{t('finance_full_title') || "度支总览"}</h2>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              库银: {data.balance.toFixed(2)} 元
          </div>
      </div>

      {isAdminMode && (
          <button 
            onClick={handleAddClick} 
            style={{ 
                marginBottom: '15px', 
                padding: '8px 15px', 
                background: '#8b0000', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: '"Kaiti", "STKaiti", serif'
            }}>
              + 笔录新账
          </button>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
              <tr style={{ background: '#f4e4bc', borderBottom: '2px solid #8b0000' }}>
                  <th style={{ padding: '10px' }}>时辰</th>
                  <th style={{ padding: '10px' }}>事由</th>
                  <th style={{ padding: '10px' }}>经手人</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>银两</th>
                  {isAdminMode && <th style={{ padding: '10px', textAlign: 'center' }}>操作</th>}
              </tr>
          </thead>
          <tbody>
              {data.records.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #ddd' }}>
                      <td style={{ padding: '10px' }}>{new Date(r.time).toLocaleString()}</td>
                      <td style={{ padding: '10px' }}>{r.detail}</td>
                      <td style={{ padding: '10px' }}>{r.people}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: r.money >= 0 ? '#8b0000' : 'green', fontWeight: 'bold' }}>
                          {r.money.toFixed(2)}
                      </td>
                      {isAdminMode && (
                          <td style={{ padding: '10px', textAlign: 'center' }}>
                              <button onClick={() => handleEditClick(r)} style={{ marginRight: '5px', cursor: 'pointer' }}>修订</button>
                              <button onClick={() => handleDelete(r.id)} style={{ color: 'red', cursor: 'pointer' }}>删除</button>
                          </td>
                      )}
                  </tr>
              ))}
          </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && (
          <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
              <div style={{ background: '#fff9c4', padding: '20px', borderRadius: '8px', width: '400px', border: '2px solid #8b0000' }}>
                  <h3 style={{ borderBottom: '1px solid #8b0000', paddingBottom: '10px', color: '#8b0000' }}>{currentRecord ? '修订账目' : '新增账目'}</h3>
                  <form onSubmit={handleFormSubmit}>
                      <div style={{ marginBottom: '10px' }}>
                          <label>日期:</label>
                          <input 
                            type="datetime-local" 
                            name="time" 
                            value={formData.time} 
                            onChange={handleInputChange} 
                            required 
                            style={{ width: '100%', padding: '5px' }}
                          />
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                          <label>金额 (+收 / -支):</label>
                          <input 
                            type="number" 
                            step="0.01" 
                            name="money" 
                            value={formData.money} 
                            onChange={handleInputChange} 
                            required 
                            style={{ width: '100%', padding: '5px' }}
                          />
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                          <label>经手人:</label>
                          <input 
                            type="text" 
                            name="people" 
                            value={formData.people} 
                            onChange={handleInputChange} 
                            required 
                            style={{ width: '100%', padding: '5px' }}
                          />
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                          <label>事由:</label>
                          <textarea 
                            name="detail" 
                            value={formData.detail} 
                            onChange={handleInputChange} 
                            required 
                            style={{ width: '100%', padding: '5px', height: '60px' }}
                          />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                          <button type="button" onClick={() => setIsModalOpen(false)}>作罢</button>
                          <button type="submit" style={{ background: '#8b0000', color: 'white', border: 'none', padding: '5px 15px' }}>保存</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default FinancePage;
