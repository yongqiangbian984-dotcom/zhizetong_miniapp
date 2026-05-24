// 数据库初始化脚本 - 在云开发控制台运行
// 创建集合：users, courses, chapters, categories, orders, commissions, user_courses

// ===== 分类数据 =====
db.collection('categories').add({
  data: [
    { name: 'Coze课', key: 'coze', emoji: '🤖', order: 1, courseCount: 3 },
    { name: 'Python', key: 'python', emoji: '🐍', order: 2, courseCount: 2 },
    { name: '大模型', key: 'ai', emoji: '🧠', order: 3, courseCount: 1 },
    { name: '更多', key: 'other', emoji: '📚', order: 4, courseCount: 0 }
  ]
});

// ===== 课程数据 =====
db.collection('courses').add({
  data: [
    {
      title: 'Coze底层逻辑课（全案版）',
      description: '23章全案深度讲解Coze平台底层逻辑，从0到1掌握Coze智能体搭建的核心方法论',
      price: 299,
      originalPrice: 599,
      isFree: false,
      category: 'coze',
      categoryName: 'Coze课',
      studentCount: 1256,
      totalChapters: 23,
      rating: 4.9,
      color1: '#667eea',
      color2: '#764ba2',
      learnList: ['Coze平台核心架构理解', '智能体搭建底层逻辑', '工作流设计最佳实践', 'Prompt工程进阶技巧'],
      isHot: true,
      isNew: false,
      status: 'published',
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    },
    {
      title: 'Python全栈开发入门',
      description: '零基础到全栈，Python最佳入门课',
      price: 49,
      originalPrice: 199,
      isFree: false,
      category: 'python',
      categoryName: 'Python',
      studentCount: 896,
      totalChapters: 15,
      rating: 4.8,
      color1: '#f093fb',
      color2: '#f5576c',
      learnList: ['Python基础语法', 'Web开发入门', '数据库操作', '项目实战'],
      isHot: false,
      isNew: true,
      status: 'published',
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    },
    {
      title: 'AI大模型Prompt工程',
      description: '掌握Prompt设计，驾驭大模型',
      price: 0,
      originalPrice: 0,
      isFree: true,
      category: 'ai',
      categoryName: '大模型',
      studentCount: 2341,
      totalChapters: 8,
      rating: 4.7,
      color1: '#4facfe',
      color2: '#00f2fe',
      learnList: ['Prompt设计原则', '高级技巧', '场景实战', '效果评估'],
      isHot: true,
      isNew: false,
      status: 'published',
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    },
    {
      title: 'Coze视频工作流底层教学',
      description: '6章深入视频工作流核心原理',
      price: 199,
      originalPrice: 399,
      isFree: false,
      category: 'coze',
      categoryName: 'Coze课',
      studentCount: 567,
      totalChapters: 6,
      rating: 4.9,
      color1: '#43e97b',
      color2: '#38f9d7',
      learnList: ['视频工作流架构', '节点设计原理', '调试与优化', '实战案例'],
      isHot: false,
      isNew: false,
      status: 'published',
      createTime: db.serverDate(),
      updateTime: db.serverDate()
    }
  ]
});
