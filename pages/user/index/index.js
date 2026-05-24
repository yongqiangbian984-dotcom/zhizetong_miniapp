Page({
  data: {
    userInfo: null,
    hasLogin: false
  },

  onLoad: function() {
    this.checkLogin();
  },

  onShow: function() {
    this.checkLogin();
  },

  checkLogin: function() {
    var that = this;
    if (!wx.cloud) return;
    var db = wx.cloud.database();
    wx.callCloudFunction = wx.callCloudFunction || function() {};

    wx.cloud.database === undefined ? false : true;
    // 尝试从本地缓存读取用户信息
    var userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      that.setData({ userInfo: userInfo, hasLogin: true });
    }
  },

  onLoginTap: function() {
    var that = this;
    wx.showLoading({ title: '登录中...' });

    wx.cloud.callFunction({
      name: 'api',
      data: { action: 'login' },
      success: function(res) {
        wx.hideLoading();
        if (res.result && res.result.code === 0) {
          var userInfo = res.result.data.userInfo;
          var openid = res.result.data.openid;
          wx.setStorageSync('userInfo', userInfo);
          wx.setStorageSync('openid', openid);
          that.setData({ userInfo: userInfo, hasLogin: true });
          wx.showToast({ title: '登录成功', icon: 'success' });
        } else {
          wx.showToast({ title: '登录失败', icon: 'none' });
        }
      },
      fail: function(err) {
        wx.hideLoading();
        console.log('登录失败', err);
        wx.showToast({ title: '登录失败', icon: 'none' });
      }
    });
  },

  goToOrders: function() {
    if (!this.data.hasLogin) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/order/list/index' });
  },

  goToOrdersWithStatus: function(e) {
    if (!this.data.hasLogin) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    var status = e.currentTarget.dataset.status;
    wx.navigateTo({ url: '/pages/order/list/index?status=' + status });
  },

  goToMyCourses: function() {
    if (!this.data.hasLogin) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  goToLearning: function() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  goToFavorites: function() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  goToDistribution: function() {
    wx.switchTab({ url: '/pages/distributor/index/index' });
  },

  goToSettings: function() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  goToAbout: function() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  goToAdmin: function() {
    wx.navigateTo({ url: '/pages/admin/index/index' });
  }
});
