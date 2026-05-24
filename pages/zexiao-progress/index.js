Page({
  data: {
    completion: { total: 0, dimensions: {} },
    dimList: [],
    statusBarHeight: 44
  },

  onLoad: function() {
    var sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 44 });
    this.loadProgress();
  },

  onShow: function() {
    this.loadProgress();
  },

  loadProgress: function() {
    // 从缓存读取进度数据
    var completion = null;
    try { completion = wx.getStorageSync('zexiao_chat_student'); } catch(e) {}
    
    if (completion && completion.completion) {
      var comp = completion.completion;
      var dimList = [];
      var dims = comp.dimensions || {};
      for (var key in dims) {
        dimList.push({
          key: key,
          completion: dims[key] || 0
        });
      }
      this.setData({
        completion: comp,
        dimList: dimList
      });
    } else {
      this.setData({
        completion: { total: 0, dimensions: {} },
        dimList: []
      });
    }
  },

  goBack: function() {
    wx.navigateBack();
  },

  goToChat: function() {
    wx.navigateTo({ url: '/pages/zexiao-chat/index' });
  }
});
