Page({
  data: {
    logs: ['等待操作...'],
    isRunning: false,
    isDone: false
  },

  addLog: function(msg) {
    var logs = this.data.logs;
    logs.push(msg);
    this.setData({ logs: logs });
  },

  onBeginInit: function() {
    var that = this;
    if (that.data.isRunning) return;
    that.setData({ isRunning: true, logs: [] });
    that.addLog('>>> 开始初始化');
    wx.showLoading({ title: '初始化中...' });

    if (typeof wx.cloud === 'undefined') {
      that.addLog('ERROR: wx.cloud 未初始化');
      that.setData({ isRunning: false });
      wx.hideLoading();
      return;
    }

    var db = wx.cloud.database();
    that.addLog('云数据库已连接');

    // 先检查courses集合是否已有数据
    db.collection('courses').count({
      success: function(res) {
        if (res.total > 0) {
          that.addLog('课程数据已存在(' + res.total + '条)，跳过初始化');
          that.addLog('如需重新初始化，请先清空数据库');
          wx.hideLoading();
          that.setData({ isDone: true, isRunning: false });
          return;
        }
        that.insertCategories(db);
      },
      fail: function(err) {
        that.addLog('检查数据失败: ' + (err.errMsg || JSON.stringify(err)));
        that.addLog('尝试直接写入...');
        that.insertCategories(db);
      }
    });
  },

  insertCategories: function(db) {
    var that = this;
    that.addLog('--- 录入分类数据 ---');

    var categories = [
      { name: 'Coze课', key: 'coze', emoji: '🤖', order: 1 },
      { name: 'Python', key: 'python', emoji: '🐍', order: 2 },
      { name: '大模型', key: 'ai', emoji: '🧠', order: 3 },
      { name: '更多', key: 'other', emoji: '📚', order: 4 }
    ];

    var catIdx = 0;
    function addCat() {
      if (catIdx >= categories.length) {
        that.addLog('--- 分类录入完毕 ---');
        that.insertCourses(db);
        return;
      }
      db.collection('categories').add({
        data: categories[catIdx],
        success: function() {
          that.addLog('  ' + categories[catIdx].name + ' OK');
          catIdx++;
          addCat();
        },
        fail: function(err) {
          that.addLog('  ' + categories[catIdx].name + ' FAIL: ' + (err.errMsg || ''));
          catIdx++;
          addCat();
        }
      });
    }
    addCat();
  },

  insertCourses: function(db) {
    var that = this;
    that.addLog('--- 录入课程数据 ---');

    var courses = [
      { title: 'Coze底层逻辑课（全案版）', description: '23章全案深度讲解Coze平台底层逻辑', price: 299, originalPrice: 599, isFree: false, category: 'coze', categoryName: 'Coze课', studentCount: 1256, totalChapters: 23, rating: 4.9, color1: '#667eea', color2: '#764ba2', isHot: true, isNew: false, status: 'published' },
      { title: 'Python全栈开发入门', description: '零基础到全栈，Python最佳入门课', price: 49, originalPrice: 199, isFree: false, category: 'python', categoryName: 'Python', studentCount: 896, totalChapters: 15, rating: 4.8, color1: '#f093fb', color2: '#f5576c', isHot: false, isNew: true, status: 'published' },
      { title: 'AI大模型Prompt工程', description: '掌握Prompt设计，驾驭大模型', price: 0, originalPrice: 0, isFree: true, category: 'ai', categoryName: '大模型', studentCount: 2341, totalChapters: 8, rating: 4.7, color1: '#4facfe', color2: '#00f2fe', isHot: true, isNew: false, status: 'published' },
      { title: 'Coze视频工作流底层教学', description: '6章深入视频工作流核心原理', price: 199, originalPrice: 399, isFree: false, category: 'coze', categoryName: 'Coze课', studentCount: 567, totalChapters: 6, rating: 4.9, color1: '#43e97b', color2: '#38f9d7', isHot: false, isNew: false, status: 'published' }
    ];

    var courseIdx = 0;
    function addOne() {
      if (courseIdx >= courses.length) {
        that.addLog('');
        that.addLog('初始化完成！共写入4条分类+4条课程');
        wx.hideLoading();
        wx.showToast({ title: '初始化完成', icon: 'success' });
        that.setData({ isDone: true, isRunning: false });
        return;
      }
      db.collection('courses').add({
        data: courses[courseIdx],
        success: function() {
          that.addLog('  ' + courses[courseIdx].title + ' OK');
          courseIdx++;
          addOne();
        },
        fail: function(err) {
          that.addLog('  ' + courses[courseIdx].title + ' FAIL: ' + (err.errMsg || ''));
          courseIdx++;
          addOne();
        }
      });
    }
    addOne();
  }
});
