import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import '../styles/ItemList.css';

function ItemList({ items }) {
  const [filteredItems, setFilteredItems] = useState([]);
  const { categoryName } = useParams();
  const location = useLocation();
  
  useEffect(() => {
    // 获取URL中的搜索参数
    const searchParams = new URLSearchParams(location.search);
    const searchTerm = searchParams.get('search') || '';
    
    let filtered = [...items];
    
    // 按分类筛选
    if (categoryName) {
      filtered = filtered.filter(item => item.category === categoryName);
    }
    
    // 按搜索词筛选
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(term) || 
        item.description.toLowerCase().includes(term)
      );
    }
    
    setFilteredItems(filtered);
  }, [items, categoryName, location.search]);
  
  if (filteredItems.length === 0) {
    return (
      <div className="no-items">
        <h2>没有找到符合条件的物品</h2>
        <Link to="/" className="back-link">返回首页</Link>
      </div>
    );
  }
  
  return (
    <div className="item-list">
      <h2 className="list-title">
        {categoryName ? `${categoryName}类物品` : '所有物品'}
      </h2>
      
      <div className="items-grid">
        {filteredItems.map(item => (
          <Link to={`/item/${item.id}`} key={item.id} className={`item-card ${item.sold === 'true' ? 'sold-item' : ''}`}>
            {item.sold === 'true' && <div className="sold-label">已售出</div>}
            <div className="item-image">
              <img 
                src={item.images && item.images.length > 0 ? item.images[0] : '/images/placeholder.jpg'} 
                alt={item.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/placeholder.jpg';
                }}
              />
            </div>
            <div className="item-info">
              <h3>{item.name}</h3>
              <p className="item-price">¥{item.price}</p>
              <p className="item-condition">{item.condition}</p>
              <p className="item-category">{item.category}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ItemList; 