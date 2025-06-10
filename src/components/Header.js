import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';

function Header({ categories, isAdmin, onLogout, items }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  
  // 从localStorage加载搜索历史
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);
  
  // 处理搜索建议
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSuggestions([]);
      return;
    }
    
    const filtered = items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
    
    setSuggestions(filtered);
  }, [searchTerm, items]);
  
  // 点击外部关闭搜索建议
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() === '') return;
    
    // 更新搜索历史
    const newHistory = [searchTerm, ...searchHistory.filter(item => item !== searchTerm)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    
    navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    setShowSuggestions(false);
  };
  
  const handleSuggestionClick = (item) => {
    setSearchTerm(item.name);
    navigate(`/item/${item.id}`);
    setShowSuggestions(false);
  };
  
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };
  
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <h1>毕业生二手市场</h1>
        </Link>
        
        <div className="search-container" ref={searchRef}>
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="搜索物品..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            <button type="submit">搜索</button>
          </form>
          
          {showSuggestions && (
            <div className="search-suggestions">
              {suggestions.length > 0 && (
                <div className="suggestion-section">
                  <h4>搜索建议</h4>
                  {suggestions.map(item => (
                    <div 
                      key={item.id} 
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(item)}
                    >
                      <img src={item.images?.[0] || '/images/placeholder.jpg'} alt={item.name} />
                      <div>
                        <div className="suggestion-name">{item.name}</div>
                        <div className="suggestion-price">¥{item.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {searchHistory.length > 0 && (
                <div className="suggestion-section">
                  <div className="suggestion-header">
                    <h4>搜索历史</h4>
                    <button 
                      className="clear-history"
                      onClick={clearSearchHistory}
                    >
                      清除历史
                    </button>
                  </div>
                  {searchHistory.map((term, index) => (
                    <div 
                      key={index}
                      className="history-item"
                      onClick={() => {
                        setSearchTerm(term);
                        handleSearch({ preventDefault: () => {} });
                      }}
                    >
                      <span className="history-icon">⌛</span>
                      {term}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        <nav className="categories-nav">
          <div className="categories-dropdown">
            <button className="categories-toggle">
              <span>分类</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            <div className="categories-menu">
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
            </div>
          </div>
          <div className="categories-list">
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
          </div>
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