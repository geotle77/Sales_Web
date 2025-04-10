const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('build'));
app.use('/uploads', express.static('uploads'));
app.use(session({
  secret: 'sales_web_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1天
}));

// 确保目录存在
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');
const itemsFile = path.join(dataDir, 'items.csv');

if (!fs.existsSync(dataDir)){
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)){
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 初始化CSV文件（如果不存在）
if (!fs.existsSync(itemsFile)) {
  const header = 'id,name,price,category,condition,description,image_folder,sold\n';
  fs.writeFileSync(itemsFile, header);
}

// 存储管理员密码的散列值
let adminPasswordHash = '$2a$10$H8OVvjwITCZRpzDLtOvdIONg2FRSfkjM0bMtxlqqR.yLRz7dUg/Ta'; // 默认密码: admin123

// 图片上传配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const itemId = req.params.id;
    const itemDir = path.join(uploadsDir, itemId);
    
    if (!fs.existsSync(itemDir)){
      fs.mkdirSync(itemDir, { recursive: true });
    }
    
    cb(null, itemDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// 获取所有物品
app.get('/api/items', (req, res) => {
  const results = [];
  
  fs.createReadStream(itemsFile)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      // 为每个物品添加图片URLs
      const itemsWithImages = results.map(item => {
        const itemDir = path.join(uploadsDir, item.image_folder);
        let images = [];
        
        if (fs.existsSync(itemDir)) {
          images = fs.readdirSync(itemDir)
            .filter(file => ['.jpg', '.jpeg', '.png', '.gif'].includes(path.extname(file).toLowerCase()))
            .map(file => `/uploads/${item.image_folder}/${file}`);
        }
        
        return {
          ...item,
          images: images
        };
      });
      
      res.json(itemsWithImages);
    });
});

// 获取单个物品详情
app.get('/api/items/:id', (req, res) => {
  const { id } = req.params;
  const results = [];
  
  fs.createReadStream(itemsFile)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      const item = results.find(item => item.id === id);
      
      if (!item) {
        return res.status(404).json({ message: '物品未找到' });
      }
      
      const itemDir = path.join(uploadsDir, item.image_folder);
      let images = [];
      
      if (fs.existsSync(itemDir)) {
        images = fs.readdirSync(itemDir)
          .filter(file => ['.jpg', '.jpeg', '.png', '.gif'].includes(path.extname(file).toLowerCase()))
          .map(file => `/uploads/${item.image_folder}/${file}`);
      }
      
      res.json({
        ...item,
        images: images
      });
    });
});

// 管理员登录
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  
  if (bcrypt.compareSync(password, adminPasswordHash)) {
    req.session.isAdmin = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: '密码错误' });
  }
});

// 检查登录状态
app.get('/api/check-auth', (req, res) => {
  if (req.session.isAdmin) {
    res.json({ isAdmin: true });
  } else {
    res.json({ isAdmin: false });
  }
});

// 登出
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// 中间件检查管理员权限
const isAdmin = (req, res, next) => {
  if (!req.session.isAdmin) {
    return res.status(403).json({ message: '无权限访问' });
  }
  next();
};

// 添加新物品（需要管理员权限）
app.post('/api/items', isAdmin, (req, res) => {
  const item = req.body;
  const results = [];
  
  fs.createReadStream(itemsFile)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      // 生成新ID
      const maxId = results.length > 0 ? Math.max(...results.map(i => parseInt(i.id))) : 0;
      const newId = (maxId + 1).toString();
      
      const newItem = {
        id: newId,
        name: item.name,
        price: item.price,
        category: item.category,
        condition: item.condition,
        description: item.description,
        image_folder: newId, // 使用ID作为图片文件夹名
        sold: 'false'
      };
      
      results.push(newItem);
      
      // 写入CSV
      const csvWriter = createCsvWriter({
        path: itemsFile,
        header: [
          {id: 'id', title: 'id'},
          {id: 'name', title: 'name'},
          {id: 'price', title: 'price'},
          {id: 'category', title: 'category'},
          {id: 'condition', title: 'condition'},
          {id: 'description', title: 'description'},
          {id: 'image_folder', title: 'image_folder'},
          {id: 'sold', title: 'sold'}
        ]
      });
      
      csvWriter.writeRecords(results)
        .then(() => {
          res.status(201).json(newItem);
        })
        .catch(err => {
          res.status(500).json({ message: '保存物品失败', error: err.message });
        });
    });
});

// 上传物品图片（需要管理员权限）
app.post('/api/items/:id/images', isAdmin, upload.array('images', 10), (req, res) => {
  const files = req.files;
  
  if (!files || files.length === 0) {
    return res.status(400).json({ message: '没有上传文件' });
  }
  
  const fileUrls = files.map(file => `/uploads/${req.params.id}/${file.filename}`);
  res.json({ success: true, files: fileUrls });
});

// 删除物品图片（需要管理员权限）
app.delete('/api/items/:id/images/:filename', isAdmin, (req, res) => {
  const { id, filename } = req.params;
  const filePath = path.join(uploadsDir, id, filename);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } else {
    res.status(404).json({ message: '文件不存在' });
  }
});

// 更新物品信息（需要管理员权限）
app.put('/api/items/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const updatedItem = req.body;
  const results = [];
  
  fs.createReadStream(itemsFile)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      const index = results.findIndex(item => item.id === id);
      
      if (index === -1) {
        return res.status(404).json({ message: '物品未找到' });
      }
      
      // 更新物品信息，保留ID和图片文件夹名
      results[index] = {
        ...results[index],
        name: updatedItem.name || results[index].name,
        price: updatedItem.price || results[index].price,
        category: updatedItem.category || results[index].category,
        condition: updatedItem.condition || results[index].condition,
        description: updatedItem.description || results[index].description,
        sold: updatedItem.sold !== undefined ? updatedItem.sold : results[index].sold
      };
      
      // 写入CSV
      const csvWriter = createCsvWriter({
        path: itemsFile,
        header: [
          {id: 'id', title: 'id'},
          {id: 'name', title: 'name'},
          {id: 'price', title: 'price'},
          {id: 'category', title: 'category'},
          {id: 'condition', title: 'condition'},
          {id: 'description', title: 'description'},
          {id: 'image_folder', title: 'image_folder'},
          {id: 'sold', title: 'sold'}
        ]
      });
      
      csvWriter.writeRecords(results)
        .then(() => {
          res.json(results[index]);
        })
        .catch(err => {
          res.status(500).json({ message: '更新物品失败', error: err.message });
        });
    });
});

// 删除物品（需要管理员权限）
app.delete('/api/items/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const results = [];
  
  fs.createReadStream(itemsFile)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      const index = results.findIndex(item => item.id === id);
      
      if (index === -1) {
        return res.status(404).json({ message: '物品未找到' });
      }
      
      const deletedItem = results[index];
      results.splice(index, 1);
      
      // 写入CSV
      const csvWriter = createCsvWriter({
        path: itemsFile,
        header: [
          {id: 'id', title: 'id'},
          {id: 'name', title: 'name'},
          {id: 'price', title: 'price'},
          {id: 'category', title: 'category'},
          {id: 'condition', title: 'condition'},
          {id: 'description', title: 'description'},
          {id: 'image_folder', title: 'image_folder'},
          {id: 'sold', title: 'sold'}
        ]
      });
      
      csvWriter.writeRecords(results)
        .then(() => {
          // 删除图片文件夹
          const itemDir = path.join(uploadsDir, deletedItem.image_folder);
          if (fs.existsSync(itemDir)) {
            fs.rmdirSync(itemDir, { recursive: true });
          }
          
          res.json({ success: true });
        })
        .catch(err => {
          res.status(500).json({ message: '删除物品失败', error: err.message });
        });
    });
});

// 修改管理员密码
app.post('/api/change-password', isAdmin, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!bcrypt.compareSync(currentPassword, adminPasswordHash)) {
    return res.status(401).json({ success: false, message: '当前密码错误' });
  }
  
  // 生成新密码的哈希值
  const salt = bcrypt.genSaltSync(10);
  adminPasswordHash = bcrypt.hashSync(newPassword, salt);
  
  res.json({ success: true });
});

// 将所有其他请求发送到React应用
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 