import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import ItemList from './components/ItemList';
import ItemDetail from './components/ItemDetail';
import Footer from './components/Footer';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';

function App() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);

  // 检查登录状态
  useEffect(() => {
    fetch('/api/check-auth')
      .then(response => response.json())
      .then(data => {
        setIsAdmin(data.isAdmin);
      })
      .catch(error => {
        console.error('检查登录状态失败:', error);
      });
  }, []);

  // 加载物品数据
  useEffect(() => {
    fetch('/api/items')
      .then(response => {
        if (!response.ok) {
          throw new Error('加载数据失败');
        }
        return response.json();
      })
      .then(data => {
        setItems(data);
        
        // 提取所有分类
        const uniqueCategories = [...new Set(data.map(item => item.category))];
        setCategories(uniqueCategories);
        
        setLoading(false);
      })
      .catch(error => {
        console.error('加载数据失败:', error);
        setError('加载数据失败，请刷新页面重试');
        setLoading(false);
      });
  }, []);

  // 管理员登出
  const handleLogout = () => {
    fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setIsAdmin(false);
        }
      })
      .catch(error => {
        console.error('登出失败:', error);
      });
  };

  return (
    <Router>
      <div className="app">
        <Header 
          categories={categories} 
          isAdmin={isAdmin}
          onLogout={handleLogout}
        />
        
        <main className="main-content">
          {error ? (
            <div className="error-message">{error}</div>
          ) : loading ? (
            <div className="loading">加载中...</div>
          ) : (
            <Routes>
              <Route path="/" element={<ItemList items={items} />} />
              <Route path="/category/:categoryName" element={<ItemList items={items} />} />
              <Route path="/item/:itemId" element={<ItemDetail />} />
              <Route path="/admin/login" element={
                isAdmin ? <Navigate to="/admin" /> : <AdminLogin setIsAdmin={setIsAdmin} />
              } />
              <Route path="/admin/*" element={
                isAdmin ? <AdminPanel setItems={setItems} /> : <Navigate to="/admin/login" />
              } />
            </Routes>
          )}
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App; 