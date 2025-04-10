import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import '../styles/Admin.css';

// 子组件：物品列表
function ItemList({ items, onDelete, onToggleSold }) {
  return (
    <div className="admin-item-list">
      <h2>物品管理</h2>
      <div className="admin-controls">
        <Link to="/admin/add" className="admin-button">添加新物品</Link>
      </div>
      
      {items.length === 0 ? (
        <p>暂无物品</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>物品名称</th>
              <th>价格</th>
              <th>分类</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className={item.sold === 'true' ? 'sold-row' : ''}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>¥{item.price}</td>
                <td>{item.category}</td>
                <td>{item.sold === 'true' ? '已售出' : '在售'}</td>
                <td className="action-buttons">
                  <Link to={`/admin/edit/${item.id}`} className="edit-button">编辑</Link>
                  <button 
                    className="toggle-button" 
                    onClick={() => onToggleSold(item.id, item.sold !== 'true')}
                  >
                    {item.sold === 'true' ? '标记为在售' : '标记为已售'}
                  </button>
                  <button className="delete-button" onClick={() => onDelete(item.id)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// 子组件：添加/编辑物品表单
function ItemForm({ item, onSubmit, isEditing }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    condition: '',
    description: '',
    sold: false,
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // 如果是编辑模式，加载物品数据
  useEffect(() => {
    if (isEditing && item) {
      setFormData({
        name: item.name || '',
        price: item.price || '',
        category: item.category || '',
        condition: item.condition || '',
        description: item.description || '',
        sold: item.sold === 'true',
      });
      
      if (item.images && item.images.length > 0) {
        setExistingImages(item.images);
      }
    }
  }, [isEditing, item]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      // 提交物品信息
      const itemData = {
        ...formData,
        sold: formData.sold.toString()
      };
      
      const itemResult = await onSubmit(itemData);
      
      // 如果有新图片，上传图片
      if (images.length > 0 && itemResult.id) {
        const formData = new FormData();
        images.forEach(image => {
          formData.append('images', image);
        });
        
        const imageResponse = await fetch(`/api/items/${itemResult.id}/images`, {
          method: 'POST',
          body: formData
        });
        
        if (!imageResponse.ok) {
          throw new Error('上传图片失败');
        }
      }
      
      setSuccess('保存成功！');
      
      // 延迟导航，让用户看到成功消息
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (error) {
      setError('保存失败: ' + (error.message || '未知错误'));
      console.error('保存失败:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteImage = async (imageUrl) => {
    if (!isEditing || !item || !item.id) return;
    
    try {
      const filename = imageUrl.split('/').pop();
      const response = await fetch(`/api/items/${item.id}/images/${filename}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setExistingImages(prev => prev.filter(img => img !== imageUrl));
      } else {
        setError('删除图片失败');
      }
    } catch (error) {
      setError('删除图片失败: ' + error.message);
    }
  };

  return (
    <div className="admin-form-container">
      <h2>{isEditing ? '编辑物品' : '添加物品'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label htmlFor="name">物品名称</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="price">价格</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0"
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">分类</label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="condition">使用情况</label>
          <input
            type="text"
            id="condition"
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">物品描述</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
            disabled={loading}
          ></textarea>
        </div>
        
        {isEditing && (
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="sold"
                checked={formData.sold}
                onChange={handleChange}
                disabled={loading}
              />
              标记为已售出
            </label>
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="images">上传图片</label>
          <input
            type="file"
            id="images"
            name="images"
            onChange={handleImageChange}
            accept="image/*"
            multiple
            disabled={loading}
          />
          <small>可选择多张图片</small>
        </div>
        
        {existingImages.length > 0 && (
          <div className="existing-images">
            <h3>已有图片</h3>
            <div className="image-preview-container">
              {existingImages.map((img, index) => (
                <div key={index} className="image-preview">
                  <img src={img} alt={`物品图片 ${index + 1}`} />
                  <button 
                    type="button" 
                    className="delete-image-button"
                    onClick={() => handleDeleteImage(img)}
                    disabled={loading}
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="form-actions">
          <button type="submit" className="admin-button" disabled={loading}>
            {loading ? '保存中...' : '保存物品'}
          </button>
          <Link to="/admin" className="cancel-button">取消</Link>
        </div>
      </form>
    </div>
  );
}

// 子组件：密码修改
function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('新密码和确认密码不匹配');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setError('新密码至少需要6个字符');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('密码修改成功');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(data.message || '密码修改失败');
      }
    } catch (error) {
      setError('请求失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-container">
      <h2>修改管理员密码</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label htmlFor="currentPassword">当前密码</label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="newPassword">新密码</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <small>密码至少6个字符</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">确认新密码</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="admin-button" disabled={loading}>
            {loading ? '提交中...' : '修改密码'}
          </button>
        </div>
      </form>
    </div>
  );
}

// 主管理面板组件
function AdminPanel({ setItems }) {
  const [adminItems, setAdminItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 加载物品数据
  const loadItems = async () => {
    try {
      const response = await fetch('/api/items');
      if (!response.ok) {
        throw new Error('加载数据失败');
      }
      const data = await response.json();
      setAdminItems(data);
      setItems(data); // 同步更新App组件中的物品数据
      setLoading(false);
    } catch (error) {
      console.error('加载数据失败:', error);
      setError('加载数据失败，请刷新页面重试');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // 删除物品
  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除此物品吗？此操作不可撤销。')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // 删除成功后刷新物品列表
        loadItems();
      } else {
        throw new Error('删除失败');
      }
    } catch (error) {
      console.error('删除物品失败:', error);
      alert('删除物品失败: ' + error.message);
    }
  };

  // 切换已售出状态
  const handleToggleSold = async (id, soldValue) => {
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sold: soldValue.toString() })
      });
      
      if (response.ok) {
        // 更新成功后刷新物品列表
        loadItems();
      } else {
        throw new Error('更新失败');
      }
    } catch (error) {
      console.error('更新物品状态失败:', error);
      alert('更新物品状态失败: ' + error.message);
    }
  };

  // 添加新物品
  const handleAddItem = async (itemData) => {
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(itemData)
    });
    
    if (!response.ok) {
      throw new Error('添加物品失败');
    }
    
    const result = await response.json();
    await loadItems();
    return result;
  };

  // 编辑物品
  const handleEditItem = async (itemData) => {
    if (!selectedItem || !selectedItem.id) {
      throw new Error('无效的物品ID');
    }
    
    const response = await fetch(`/api/items/${selectedItem.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(itemData)
    });
    
    if (!response.ok) {
      throw new Error('更新物品失败');
    }
    
    const result = await response.json();
    await loadItems();
    return result;
  };

  // 加载单个物品详情
  const loadItemDetails = async (id) => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/items/${id}`);
      if (!response.ok) {
        throw new Error('加载物品详情失败');
      }
      
      const data = await response.json();
      setSelectedItem(data);
      setLoading(false);
    } catch (error) {
      console.error('加载物品详情失败:', error);
      setError('加载物品详情失败');
      setLoading(false);
    }
  };

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/admin\/edit\/(\d+)/);
    
    if (match && match[1]) {
      loadItemDetails(match[1]);
    }
  }, [window.location.pathname]);

  if (loading && !selectedItem) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-panel">
      <div className="admin-sidebar">
        <h2>管理菜单</h2>
        <nav>
          <Link to="/admin" className="sidebar-link">物品管理</Link>
          <Link to="/admin/password" className="sidebar-link">修改密码</Link>
          <Link to="/" className="sidebar-link">返回前台</Link>
        </nav>
      </div>
      
      <div className="admin-content">
        <Routes>
          <Route path="/" element={
            <ItemList 
              items={adminItems} 
              onDelete={handleDelete} 
              onToggleSold={handleToggleSold} 
            />
          } />
          <Route path="/add" element={
            <ItemForm 
              onSubmit={handleAddItem} 
              isEditing={false} 
            />
          } />
          <Route path="/edit/:id" element={
            loading ? (
              <div className="loading">加载中...</div>
            ) : (
              <ItemForm 
                item={selectedItem} 
                onSubmit={handleEditItem} 
                isEditing={true} 
              />
            )
          } />
          <Route path="/password" element={<ChangePassword />} />
        </Routes>
      </div>
    </div>
  );
}

export default AdminPanel; 