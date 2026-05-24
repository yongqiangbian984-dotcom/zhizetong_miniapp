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
    var that = this;
    wx.cloud.callFunction({
      name: 'api',
      data: {
        action: 'zexiao_init',
        data: { q1: '', q2: '', q3: '', q4: '' }
      },
      success: function(res) {
        if (res.result && res.result.code === 0) {
          var completion = res.result.data.completion || { total: 0, dimensions: {} };
          var dimList = [];
          var dims = completion.dimensions || {};
          for (var key in dims) {
            dimList.push({
              key: key,
              name: dims[key].name,
              completion: dims[key].completion || 0
            });
          }
          that.setData({
            completion: completion,
            dimList: dimList
          });
        }
      }
    });
  },

  goBack: function() {
    wx.navigateBack();
  },

  goToReport: function() {
    wx.navigateTo({ url: '/pages/zexiao-report/index' });
  },

  showParentTip: function() {
    wx.showModal({
      title: '报告生成说明',
      content: '因评估系统的需要暂时不能给您查看，需要了解您对孩子的期望或规划，我们会生成完整的评估报告给您。感谢理解与配合。',
      confirmText: '开始填写',
      cancelText: '我知道了',
      success: function(res) {
        if (res.confirm) {
          wx.navigateTo({ url: '/pages/zexiao-chat/index?role=parent' });
        }
      }
    });
  },

  goToChat: function() {
    wx.navigateTo({ url: '/pages/zexiao-chat/index?role=parent' });
  }
});
