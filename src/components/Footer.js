import React from 'react';
import '../styles/Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-info">
          <h3>毕业生二手市场</h3>
          <p>一个面向毕业生的轻量级二手物品展示平台</p>
        </div>
        
        <div className="footer-links">
          <h4>快速链接</h4>
          <ul>
            <li><a href="/">首页</a></li>
            <li><a href="/#about">关于我们</a></li>
            <li><a href="/#contact">联系方式</a></li>
            <li><a href="/#terms">使用条款</a></li>
          </ul>
        </div>
        
        <div className="footer-contact">
          <h4>联系我们</h4>
          <p>有任何问题或建议？随时联系我们！</p>
          <p>邮箱: contact@example.com</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© {currentYear} 毕业生二手市场. 保留所有权利.</p>
      </div>
    </footer>
  );
}

export default Footer; 