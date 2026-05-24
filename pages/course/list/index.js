Page({
  data: {
    currentCategory: 'all',
    categories: [],
    courses: [],
    loading: true
  },

  onLoad: function(options) {
    if (options && options.category) {
      this.setData({ currentCategory: options.category });
    }
    this.loadData();
  },

  loadData: function() {
    var that = this;
    if (!wx.cloud) {
      that.loadMockData();
      return;
    }
    var db = wx.cloud.database();

    db.collection('courses').limit(50).get({
      success: function(res) {
        if (res.data && res.data.length > 0) {
          that.setData({ allCourses: res.data });
          that.filterCourses();
          // 同时加载分类
          db.collection('categories').orderBy('order', 'asc').limit(10).get({
            success: function(res2) {
              if (res2.data && res2.data.length > 0) {
                that.setData({ categories: res2.data });
              }
            }
          });
        } else {
          that.loadMockData();
        }
      },
      fail: function() {
        that.loadMockData();
      }
    });
  },

  loadMockData: function() {
    this.setData({
      categories: [
        { key: 'coze', name: 'Coze课' },
        { key: 'python', name: 'Python' },
        { key: 'ai', name: '大模型' },
        { key: 'other', name: '更多' }
      ],
      allCourses: [
        { _id: 'course1', title: 'Coze底层逻辑课（全案版）', price: 299, originalPrice: 599, isFree: false, studentCount: 1256, description: '23章全案深度讲解Coze平台底层逻辑', category: 'coze', color1: '#667eea', color2: '#764ba2' },
        { _id: 'course2', title: 'Python全栈开发入门', price: 49, originalPrice: 199, isFree: false, studentCount: 896, description: '零基础到全栈，Python最佳入门课', category: 'python', color1: '#f093fb', color2: '#f5576c' },
        { _id: 'course3', title: 'AI大模型Prompt工程', price: 0, isFree: true, studentCount: 2341, description: '掌握Prompt设计，驾驭大模型', category: 'ai', color1: '#4facfe', color2: '#00f2fe' },
        { _id: 'course4', title: 'Coze视频工作流底层教学', price: 199, originalPrice: 399, isFree: false, studentCount: 567, description: '6章深入视频工作流核心原理', category: 'coze', color1: '#43e97b', color2: '#38f9d7' }
      ],
      loading: false
    });
    this.filterCourses();
  },

  onCategoryChange: function(e) {
    var id = e.currentTarget.dataset.id;
    this.setData({ currentCategory: id });
    this.filterCourses();
  },

  filterCourses: function() {
    var cat = this.data.currentCategory;
    var all = this.data.allCourses || [];
    var courses = cat === 'all' ? all : all.filter(function(c) { return c.category === cat; });
    this.setData({ courses: courses, loading: false });
  },

  goToDetail: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/course/detail/index?id=' + id });
  }
});
