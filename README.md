# 毕业生二手市场

一个轻量级的二手物品展示网站，专为准毕业生设计。

## 项目特点

- 简洁美观的界面展示二手物品
- 按类别浏览和搜索功能
- 物品详情页展示多张图片
- 响应式设计，适配各种设备
- 使用CSV文件作为简易数据库

## 如何使用

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

### 构建生产版本

```bash
npm run build
```

## 数据结构

项目使用CSV文件存储物品数据，位于`public/data.csv`，格式如下：

```
id,name,price,category,condition,description,image_folder
1,自行车,200,交通工具,8成新,捷安特自行车，适合校园通勤,bike_1
```

## 图片存储

物品图片应放置在`public/images/[image_folder]`目录下，例如ID为1的自行车图片位于：
- public/images/bike_1/1.jpg
- public/images/bike_1/2.jpg
- public/images/bike_1/3.jpg

## 自定义

您可以通过修改以下文件来自定义网站：

- `src/App.js`: 主应用逻辑
- `src/components`: React组件
- `src/styles`: CSS样式
- `public/data.csv`: 物品数据 