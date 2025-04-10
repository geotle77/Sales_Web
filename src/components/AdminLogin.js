import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Admin.css';

function AdminLogin({ setIsAdmin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsAdmin(true);
        navigate('/admin');
      } else {
        setError(data.message || '登录失败，请重试');
      }
    } catch (error) {
      setError('登录请求失败，请检查网络连接');
      console.error('登录失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="admin-container">
      <div className="admin-card">
        <h2>管理员登录</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="admin-button" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        
        <div className="admin-note">
          <p>默认密码: admin123</p>
          <p>请在登录后修改默认密码</p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin; 