import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/ItemDetail.css';

function ItemDetail() {
  const [item, setItem] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { itemId } = useParams();
  
  useEffect(() => {
    // 从API获取单个物品数据
    fetch(`/api/items/${itemId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('物品未找到');
        }
        return response.json();
      })
      .then(data => {
        setItem(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('加载物品详情失败:', error);
        setError('无法加载物品详情，请返回首页重试');
        setLoading(false);
      });
  }, [itemId]);
  
  if (loading) {
    return <div className="loading">加载中...</div>;
  }
  
  if (error || !item) {
    return (
      <div className="error-container">
        <p className="error-message">{error || '物品未找到'}</p>
        <Link to="/" className="back-button">返回首页</Link>
      </div>
    );
  }
  
  const handlePrevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? item.images.length - 1 : prev - 1
    );
  };
  
  const handleNextImage = () => {
    setCurrentImageIndex(prev => 
      prev === item.images.length - 1 ? 0 : prev + 1
    );
  };
  
  // 如果没有图片，显示占位图
  const images = item.images && item.images.length > 0 
    ? item.images 
    : ['/images/placeholder.jpg'];
  
  return (
    <div className="item-detail">
      <Link to="/" className="back-button">返回列表</Link>
      
      <div className={`detail-container ${item.sold === 'true' ? 'sold-item' : ''}`}>
        {item.sold === 'true' && <div className="sold-overlay">已售出</div>}
        
        <div className="detail-images">
          <div className="main-image">
            <img 
              src={images[currentImageIndex]} 
              alt={item.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/placeholder.jpg';
              }}
            />
            
            {images.length > 1 && (
              <div className="image-controls">
                <button onClick={handlePrevImage} className="control-button">❮</button>
                <button onClick={handleNextImage} className="control-button">❯</button>
              </div>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="image-thumbnails">
              {images.map((url, index) => (
                <img 
                  key={index}
                  src={url}
                  alt={`${item.name} - 图片 ${index + 1}`}
                  className={index === currentImageIndex ? 'active' : ''}
                  onClick={() => setCurrentImageIndex(index)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="detail-info">
          <h1>{item.name}</h1>
          
          <div className="price-condition">
            <p className="price">¥{item.price}</p>
            <p className="condition">{item.condition}</p>
          </div>
          
          <div className="detail-section">
            <h2>物品详情</h2>
            <p>{item.description}</p>
          </div>
          
          <div className="detail-section">
            <h2>分类</h2>
            <p>{item.category}</p>
          </div>
          
          <div className="contact-info">
            <p>此物品仅供展示，如有意向请联系卖家</p>
            <p className="note">注意：本平台仅提供物品展示，不负责交易过程</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetail; 