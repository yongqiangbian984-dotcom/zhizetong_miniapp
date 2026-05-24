Page({
  data: {},
  onLoad: function() {},
  goInit: function() {
    wx.navigateTo({ url: '/pages/admin/init/index' });
  },
  goCourse: function() {
    wx.navigateTo({ url: '/pages/admin/course/index' });
  },
  goOrder: function() {
    wx.navigateTo({ url: '/pages/admin/order/index' });
  },
  goAuth: function() {
    wx.navigateTo({ url: '/pages/admin/auth/index' });
  },
  goImport: function() {
    wx.navigateTo({ url: '/pages/admin/import/index' });
  }
});
