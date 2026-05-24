# 技能提升课堂 - 知识付费+三级分销课程小程序

<p align="center">
  <img src="https://img.yzcdn.cn/vant/apple-1.jpg" width="200" alt="Logo"/>
</p>

<p align="center">
  基于微信小程序云开发的知识付费平台，支持课程学习与三级分销功能
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version"/>
  <img src="https://img.shields.io/badge/platform-WeChat-green.svg" alt="Platform"/>
  <img src="https://img.shields.io/badge/license-MIT-orange.svg" alt="License"/>
</p>

---

## 📋 目录

- [项目介绍](#项目介绍)
- [功能特性](#功能特性)
- [技术架构](#技术架构)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [数据库设计](#数据库设计)
- [分销机制](#分销机制)
- [部署指南](#部署指南)
- [后续对接清单](#后续对接清单)
- [常见问题](#常见问题)

---

## 🎯 项目介绍

技能提升课堂是一款基于微信小程序的在线教育平台，采用"自学提高技能+分享赚钱"的双重商业模式。用户可以通过平台学习各种技能课程，同时也可以通过分享课程获得分销佣金。

### 目标用户

- 想要学习新技能的用户（Coze、Python、AI等）
- 希望副业变现的创业者
- 拥有私域流量的KOL

---

## ✨ 功能特性

### 用户端功能

| 功能模块 | 描述 |
|---------|------|
| 课程学习 | 视频播放、图文阅读、资源下载 |
| 课程购买 | 支持微信支付（预留接口） |
| 分销赚钱 | 三级分销体系，分享即可赚钱 |
| 个人中心 | 学习记录、订单管理、收益查看 |
| 学习笔记 | 边学边记，整理学习心得 |

### 管理端功能

| 功能模块 | 描述 |
|---------|------|
| 课程管理 | 增删改查课程、章节管理 |
| 订单管理 | 订单列表、退款处理 |
| 用户管理 | 用户列表、分销员管理 |
| 数据统计 | 课程销量、收益统计 |

---

## 🏗 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                     微信小程序前端                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │  首页   │ │  课程   │ │  分销   │ │   我的  │        │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘        │
└───────┼───────────┼───────────┼───────────┼────────────┘
        │           │           │           │
        └───────────┴─────┬─────┴───────────┘
                          │
                    ┌─────▼─────┐
                    │  微信云开发  │
                    │  ┌─────┐  │
                    │  │云函数│  │
                    │  │云存储│  │
                    │  │云数据库│ │
                    │  └─────┘  │
                    └───────────┘
                          │
                    ┌─────▼─────┐
                    │  腾讯云VOD │ (预留)
                    └───────────┘
                          │
                    ┌─────▼─────┐
                    │  微信支付  │ (预留)
                    └───────────┘
```

### 技术栈

| 类别 | 技术 |
|-----|------|
| 前端框架 | 微信小程序原生 (WXML + WXSS + JS) |
| 后端服务 | 微信云开发 (云函数 + 云数据库 + 云存储) |
| 视频服务 | 腾讯云VOD (预留) |
| 支付服务 | 微信支付 (预留) |

---

## 🚀 快速开始

### 环境要求

- 微信开发者工具 (最新版)
- 微信公众平台账号 (已认证)
- 腾讯云账号 (可选)

### 配置步骤

1. **克隆项目**
   ```bash
   git clone <repository_url>
   ```

2. **导入项目**
   - 打开微信开发者工具
   - 点击"导入项目"
   - 选择项目目录
   - 填写 AppID: `wxd529975e822683e7`

3. **初始化云开发环境**
   - 在微信公众平台开通云开发
   - 创建云环境
   - 复制环境 ID 并更新代码中的配置

4. **更新配置**
   - 编辑 `utils/cloud.js`，填入云环境 ID
   - 编辑 `config.js`，确认 AppID 等配置

5. **初始化数据库**
   - 在云开发控制台中创建集合
   - 或运行 `scripts/init-database.js` 初始化

6. **部署云函数**
   - 在微信开发者工具中右键 cloudfunctions 文件夹
   - 选择"上传并部署"
   - 依次部署所有云函数

7. **运行测试**
   - 点击"编译"运行项目
   - 在模拟器中测试各项功能

---

## 📁 项目结构

```
小程序课程平台/
├── app.js                    # 小程序入口文件
├── app.json                  # 全局配置
├── app.wxss                  # 全局样式
├── config.js                 # 项目配置
├── project.config.json       # 项目配置文件
│
├── pages/                    # 页面文件
│   ├── index/               # 首页
│   ├── course/
│   │   ├── list/           # 课程列表
│   │   ├── detail/         # 课程详情
│   │   ├── video/          # 视频播放
│   │   ├── article/        # 图文阅读
│   │   └── resource/       # 资源下载
│   ├── distributor/         # 分销中心
│   ├── user/
│   │   ├── index/          # 个人中心
│   │   └── login/          # 登录页
│   ├── pay/                # 支付页
│   └── admin/              # 管理后台
│       ├── index/          # 管理首页
│       ├── course/         # 课程管理
│       └── order/          # 订单管理
│
├── components/              # 公共组件
│
├── cloudfunctions/         # 云函数
│   ├── login/              # 登录
│   ├── course/              # 课程操作
│   ├── order/               # 订单操作
│   ├── distribution/         # 分销操作
│   ├── commission/           # 佣金操作
│   └── withdraw/            # 提现操作
│
├── utils/                   # 工具函数
│   ├── util.js             # 通用工具
│   └── cloud.js            # 云开发配置
│
├── styles/                  # 样式文件
│   └── common.wxss          # 公共样式
│
├── assets/                  # 静态资源
│   └── images/             # 图片资源
│
├── scripts/                 # 脚本文件
│   └── init-database.js    # 数据库初始化
│
└── README.md                # 项目说明
```

---

## 🗄 数据库设计

### 集合列表

| 集合名 | 描述 |
|-------|------|
| courses | 课程表 |
| chapters | 章节表 |
| users | 用户表 |
| orders | 订单表 |
| purchases | 购买记录表 |
| commissions | 佣金表 |
| withdrawals | 提现表 |
| categories | 分类表 |
| banners | Banner表 |
| notes | 笔记表 |
| learning_progress | 学习进度表 |

### 主要数据模型

#### courses (课程表)
```javascript
{
  _id: String,
  title: String,           // 课程标题
  cover: String,            // 封面图
  description: String,     // 课程描述
  price: Number,            // 价格(分)
  originalPrice: Number,   // 原价(分)
  category: String,        // 分类key
  teacher: String,         // 讲师
  teacherAvatar: String,   // 讲师头像
  totalChapters: Number,   // 章节数
  totalDuration: Number,   // 总时长(分钟)
  studentCount: Number,    // 学习人数
  rating: Number,         // 评分
  isFree: Boolean,         // 是否免费
  isHot: Boolean,          // 是否热门
  isNew: Boolean,          // 是否新上
  status: String,          // published/draft
  sort: Number,            // 排序
  createTime: Date,
  updateTime: Date
}
```

#### users (用户表)
```javascript
{
  _id: String,
  openid: String,           // 微信openid
  nickname: String,        // 昵称
  avatar: String,          // 头像
  phone: String,           // 手机号
  isDistributor: Boolean,  // 是否分销员
  distributorLevel: String, // 见习/普通/高级
  parentId: String,        // 上级ID
  grandparentId: String,   // 上上级ID
  inviteCount: Number,     // 邀请人数
  totalEarnings: Number,   // 累计收益
  availableEarnings: Number, // 可提现
  createTime: Date
}
```

#### orders (订单表)
```javascript
{
  _id: String,
  userId: String,          // 用户ID
  courseId: String,        // 课程ID
  courseName: String,       // 课程名称
  amount: Number,          // 支付金额
  originalAmount: Number,   // 原价
  status: String,          // pending/paid/refunded
  payTime: Date,           // 支付时间
  createTime: Date
}
```

#### commissions (佣金表)
```javascript
{
  _id: String,
  userId: String,          // 收款用户
  orderId: String,         // 关联订单
  buyerId: String,          // 购买者
  courseId: String,        // 课程ID
  courseName: String,      // 课程名称
  level: Number,           // 佣金等级 1/2/3
  amount: Number,           // 佣金金额
  status: String,          // pending/available/withdrawn
  createTime: Date
}
```

---

## 💰 分销机制

### 佣金规则

| 分销员等级 | 升级条件 | 一级佣金 | 二级佣金 | 三级佣金 |
|-----------|---------|---------|---------|---------|
| 见习分销员 | 购买任意课程 | 20% | 5% | 0% |
| 普通分销员 | 累计邀请3人购买 | 25% | 8% | 3% |
| 高级分销员 | 累计邀请10人购买 | 30% | 10% | 5% |

### 分销链路

```
用户A (高级分销员)
    │
    ├── 一级佣金 (30%) ── 用户B (购买者)
    │                      │
    │                      ├── 二级佣金 (10%) ── 用户C
    │                      │                      │
    │                      │                      └── 三级佣金 (5%) ── 用户D
    │                      │
    └── 二级佣金 (10%) ── 用户C
```

### 分销关系绑定

1. 用户通过分享链接进入时，自动绑定分销关系
2. 分销关系存储在 users 表的 parentId、grandparentId 字段
3. 购买课程时自动计算并发放佣金

---

## 📦 部署指南

### 云函数部署

1. 在微信开发者工具中打开云函数目录
2. 右键点击 cloudfunctions 文件夹
3. 选择"上传并部署"
4. 等待部署完成

### 数据库初始化

1. 打开云开发控制台
2. 创建所需集合
3. 或运行初始化脚本

### 管理后台访问

管理后台页面已内置在项目中，访问路径：
- `/pages/admin/index/index` - 管理首页
- `/pages/admin/course/index` - 课程管理
- `/pages/admin/order/index` - 订单管理

---

## 📋 后续对接清单

### 必须对接

| 项目 | 优先级 | 状态 |
|-----|-------|-----|
| 微信支付商户号申请 | 🔴高 | 待完成 |
| 云环境ID配置 | 🔴高 | 待完成 |
| 视频上传到腾讯云VOD | 🟡中 | 预留接口 |
| 腾讯云账号配置 | 🟡中 | 待完成 |

### 可选对接

| 项目 | 优先级 | 状态 |
|-----|-------|-----|
| 小程序认证 | 🔴高 | 待完成 |
| 短信通知 | 🟡中 | 预留接口 |
| 邮件通知 | 🟡中 | 预留接口 |
| 数据统计接入 | 🟢低 | 预留接口 |

### 腾讯云配置

```
腾讯云账号1: 100048674468
腾讯云账号2: 100048853294

VOD配置（待填写）:
- AppId: 
- SecretId: 
- SecretKey: 
- Bucket: 
- Region: 
```

---

## ❓ 常见问题

### Q: 如何成为分销员？
A: 购买任意课程后自动成为见习分销员。

### Q: 佣金什么时候可以提现？
A: 佣金实时到账，满10元即可申请提现。

### Q: 如何升级分销员等级？
A: 通过累计邀请人数自动升级（3人升级普通，10人升级高级）。

### Q: 退款后佣金怎么处理？
A: 退款订单的佣金会被扣除。

### Q: 视频播放不了怎么办？
A: 请检查视频URL是否有效，或联系管理员上传视频到腾讯云VOD。

---

## 📄 许可证

本项目采用 MIT 许可证。

---

## 📞 联系方式

- 项目作者：阿边
- 微信：xxx
- 邮箱：xxx@example.com

---

<p align="center">
  如果这个项目对你有帮助，欢迎 star ⭐
</p>
