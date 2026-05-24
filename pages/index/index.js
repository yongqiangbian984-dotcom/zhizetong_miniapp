Page({
  data: {
    banners: [
      { id: '1', title: 'Coze底层逻辑课 限时特惠', color1: '#4A90D9', color2: '#6BA3E0' },
      { id: '2', title: 'Python全栈开发 新课上线', color1: '#667eea', color2: '#764ba2' },
      { id: '3', title: 'AI大模型 免费开放', color1: '#52c41a', color2: '#73d13d' }
    ],
    categories: [],
    hotCourses: [],
    newCourses: [],
    loading: true,
    showInit: false
  },

  onLoad: function(options) {
    this.loadData();
    if (options && options.inviter) {
      this.bindInviter(options.inviter);
    }
  },

  loadData: function() {
    var that = this;
    if (!wx.cloud) {
      that.loadMockData();
      return;
    }
    var db = wx.cloud.database();

    db.collection('categories').orderBy('order', 'asc').limit(10).get({
      success: function(res) {
        if (res.data && res.data.length > 0) {
          that.setData({ categories: res.data });
        } else {
          that.setData({ categories: [
            { key: 'coze', name: 'Coze课', emoji: '🤖' },
            { key: 'python', name: 'Python', emoji: '🐍' },
            { key: 'ai', name: '大模型', emoji: '🧠' },
            { key: 'other', name: '更多', emoji: '📚' }
          ]});
        }
      },
      fail: function() {
        that.setData({ categories: [
          { key: 'coze', name: 'Coze课', emoji: '🤖' },
          { key: 'python', name: 'Python', emoji: '🐍' },
          { key: 'ai', name: '大模型', emoji: '🧠' },
          { key: 'other', name: '更多', emoji: '📚' }
        ]});
      }
    });

    db.collection('courses').limit(20).get({
      success: function(res) {
        if (res.data && res.data.length > 0) {
          var all = res.data;
          var hot = all.filter(function(c) { return c.isHot; }).slice(0, 4);
          var newC = all.filter(function(c) { return c.isNew; }).slice(0, 3);
          if (hot.length === 0) hot = all.slice(0, 4);
          if (newC.length === 0) newC = all.slice(0, 3);
          that.setData({
            hotCourses: hot,
            newCourses: newC,
            loading: false,
            showInit: false
          });
        } else {
          that.loadMockData();
          that.setData({ showInit: true });
        }
      },
      fail: function(err) {
        console.log('课程读取失败', err);
        that.loadMockData();
        that.setData({ showInit: true });
      }
    });
  },

  loadMockData: function() {
    this.setData({
      categories: [
        { key: 'coze', name: 'Coze课', emoji: '🤖' },
        { key: 'python', name: 'Python', emoji: '🐍' },
        { key: 'ai', name: '大模型', emoji: '🧠' },
        { key: 'other', name: '更多', emoji: '📚' }
      ],
      hotCourses: [
        { _id: 'course1', title: 'Coze底层逻辑课', price: 299, isFree: false, studentCount: 1256, color1: '#667eea', color2: '#764ba2' },
        { _id: 'course2', title: 'Python全栈开发', price: 49, isFree: false, studentCount: 896, color1: '#f093fb', color2: '#f5576c' },
        { _id: 'course3', title: 'AI Prompt工程', price: 0, isFree: true, studentCount: 2341, color1: '#4facfe', color2: '#00f2fe' },
        { _id: 'course4', title: '视频工作流教学', price: 199, isFree: false, studentCount: 567, color1: '#43e97b', color2: '#38f9d7' }
      ],
      newCourses: [],
      loading: false
    });
  },

  bindInviter: function(inviterId) {
    var openid = wx.getStorageSync('openid');
    if (!openid) return;
    wx.cloud.callFunction({
      name: 'api',
      data: { action: 'bindInviter', data: { inviterId: inviterId } },
      success: function(res) {
        if (res.result && res.result.code === 0) {
          console.log('邀请人绑定成功');
        }
      },
      fail: function() {}
    });
  },

  onBannerTap: function() {},
  onCategoryTap: function(e) {
    var id = e.currentTarget.dataset.id || e.currentTarget.dataset.key;
    wx.navigateTo({ url: '/pages/course/list/index?category=' + id });
  },
  onFreeZoneTap: function() {
    wx.navigateTo({ url: '/pages/course/list/index?isFree=true' });
  },
  goToTools: function() {
    wx.navigateTo({ url: '/pages/tools/index' });
  },
  goToZexiao: function() {
    wx.navigateTo({ url: '/pages/zexiao-entry/index' });
  },
  onSearchTap: function() {
    wx.navigateTo({ url: '/pages/course/list/index' });
  },
  onCourseTap: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/course/detail/index?id=' + id });
  },
  goToCourseList: function() {
    wx.switchTab({ url: '/pages/course/list/index' });
  },
  goToInit: function() {
    wx.navigateTo({ url: '/pages/admin/init/index' });
  },
  onPullDownRefresh: function() {
    this.loadData();
    wx.stopPullDownRefresh();
  }
});
