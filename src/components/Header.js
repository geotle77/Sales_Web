import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';

function Header({ categories, isAdmin, onLogout }) {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/?search=${encodeURIComponent(searchTerm)}`);
  };
  
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <h1>毕业生二手市场</h1>
        </Link>
        
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="搜索物品..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">搜索</button>
        </form>
        
        <nav className="categories-nav">
          <span>分类: </span>
          <Link to="/" className="category-link">全部</Link>
          {categories.map(category => (
            <Link 
              key={category} 
              to={`/category/${encodeURIComponent(category)}`}
              className="category-link"
            >
              {category}
            </Link>
          ))}
        </nav>
        
        <div className="admin-controls">
          {isAdmin ? (
            <>
              <Link to="/admin" className="admin-link">管理面板</Link>
              <button onClick={onLogout} className="logout-button">登出</button>
            </>
          ) : (
            <Link to="/admin/login" className="admin-link">管理员登录</Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header; 