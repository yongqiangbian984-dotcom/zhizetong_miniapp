# AI客服聊天功能 - 代码变更说明

## 概述
为课程小程序添加AI客服聊天功能，用户可通过底部导航栏的"AI助手"入口与AI进行对话。

## 新增文件

### 1. pages/chat/index.js（聊天页面逻辑）
**路径**: `./小程序课程平台/pages/chat/index.js`

**功能**:
- 页面数据管理（messages, inputText, loading）
- 聊天记录本地存储（wx.setStorageSync/wx.getStorageSync）
- 发送消息调用云函数api action=chat
- 格式化时间显示
- 清空聊天记录

### 2. pages/chat/index.wxml（聊天页面结构）
**路径**: `./小程序课程平台/pages/chat/index.wxml`

**功能**:
- 消息列表（scroll-view）
- 气泡样式区分（user消息靠右蓝色，ai消息靠左白色）
- 底部输入区域（input + send button）
- 加载状态显示

### 3. pages/chat/index.wxss（聊天页面样式）
**路径**: `./小程序课程平台/pages/chat/index.wxss`

**功能**:
- 消息气泡样式（圆角、阴影）
- 用户/AI消息不同对齐方向
- 输入框圆角样式
- 发送按钮状态样式

### 4. pages/chat/index.json（页面配置）
**路径**: `./小程序课程平台/pages/chat/index.json`

**功能**:
- 页面标题"AI助手"
- 组件配置

### 5. assets/images/tab_ai.png & tab_ai_active.png
**路径**: `./小程序课程平台/assets/images/`

**功能**:
- AI助手tabBar图标（普通/选中状态）

---

## 修改文件

### 1. app.json
**修改内容**:
1. `pages` 数组添加: `"pages/chat/index"`
2. `tabBar.list` 添加AI助手入口:
```json
{
  "pagePath": "pages/chat/index",
  "text": "AI助手",
  "iconPath": "assets/images/tab_ai.png",
  "selectedIconPath": "assets/images/tab_ai_active.png"
}
```

### 2. cloudfunctions/api/index.js
**修改内容**:

1. **顶部添加配置**（约第10行后）:
```javascript
// DeepSeek API 配置（请替换为你的实际API Key）
const DEEPSEEK_API_KEY = 'YOUR_DEEPSEEK_API_KEY';

// AI助手System Prompt（赤狐豆豆）
const AI_SYSTEM_PROMPT = `你是"赤狐豆豆"...`;
```

2. **switch语句添加case**（约第113行）:
```javascript
case 'chat': return await handleChat(data);
```

3. **新增函数**（文件末尾，约第620行后）:
```javascript
// ========== AI聊天 ==========
async function handleChat(data) { ... }
function callDeepSeekAPI(userMessage) { ... }
```

---

## 关键代码位置

### 前端调用云函数
```javascript
// 文件: pages/chat/index.js
// 位置: onSend 函数
wx.cloud.callFunction({
  name: 'api',
  data: {
    action: 'chat',
    data: { message: text }
  },
  success: function(res) { ... },
  fail: function(err) { ... }
});
```

### 后端chat action处理
```javascript
// 文件: cloudfunctions/api/index.js
// 位置: exports.main switch语句 + handleChat函数
case 'chat': return await handleChat(data);
```

### DeepSeek API调用
```javascript
// 文件: cloudfunctions/api/index.js
// 位置: callDeepSeekAPI函数（约第660行）
// API端点: https://api.deepseek.com/chat/completions
// 模型: deepseek-chat
// max_tokens: 2000
```

---

## 部署步骤

### 1. 小程序前端部署
1. 打开微信开发者工具
2. 导入项目，选择`./小程序课程平台`目录
3. 上传所有新增的chat页面文件
4. 上传修改的app.json
5. 上传图标文件到`assets/images/`
6. 编译并测试

### 2. 云函数部署
1. 在微信开发者工具中打开`cloudfunctions/api`目录
2. 修改`index.js`中的`DEEPSEEK_API_KEY`为实际API Key
3. 右键点击api文件夹 → 上传并部署
4. 等待部署完成

### 3. API Key配置
找到`./小程序课程平台/cloudfunctions/api/index.js`文件开头，修改:
```javascript
const DEEPSEEK_API_KEY = 'YOUR_DEEPSEEK_API_KEY';
```
将`YOUR_DEEPSEEK_API_KEY`替换为实际的DeepSeek API Key。

---

## 功能说明

### 聊天记录
- 存储在本地Storage，key为`chat_history`
- 最多保留最近100条记录
- 支持清空历史记录

### AI角色
- 名称：赤狐豆豆
- 身份：电商运营和AI学习领域助手
- 熟悉课程：Coze底层逻辑课、Coze视频工作流教学、Python全栈开发入门、AI大模型Prompt工程、Python全栈课程V3.0

### 注意事项
- API Key必须配置后才能使用AI功能
- 聊天记录仅存储在用户本地，不上传服务器
- 使用DeepSeek的deepseek-chat模型

---

## 文件清单

| 文件路径 | 操作 | 说明 |
|---------|------|------|
| pages/chat/index.js | 新增 | 聊天页面逻辑 |
| pages/chat/index.wxml | 新增 | 聊天页面结构 |
| pages/chat/index.wxss | 新增 | 聊天页面样式 |
| pages/chat/index.json | 新增 | 页面配置 |
| assets/images/tab_ai.png | 新增 | AI tab图标 |
| assets/images/tab_ai_active.png | 新增 | AI tab选中图标 |
| app.json | 修改 | 添加页面和tabBar |
| cloudfunctions/api/index.js | 修改 | 添加chat action |
