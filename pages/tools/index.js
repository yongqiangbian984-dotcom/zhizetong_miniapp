Page({
  data: {
    tools: [],
    loading: true
  },

  onLoad: function() {
    this.loadTools();
  },

  onShow: function() {
    this.loadTools();
  },

  loadTools: function() {
    var that = this;
    that.setData({ loading: true });
    
    wx.cloud.callFunction({
      name: 'api',
      data: {
        action: 'getTools'
      },
      success: function(res) {
        console.log('获取工具列表成功', res);
        if (res.result && res.result.code === 0) {
          that.setData({
            tools: res.result.data || [],
            loading: false
          });
        } else {
          that.setData({ loading: false });
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          });
        }
      },
      fail: function(err) {
        console.error('获取工具列表失败', err);
        that.setData({ loading: false });
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      }
    });
  },

  onDownload: function(e) {
    var url = e.currentTarget.dataset.url;
    var name = e.currentTarget.dataset.name;
    
    if (!url) {
      wx.showToast({
        title: '链接无效',
        icon: 'none'
      });
      return;
    }

    wx.setClipboardData({
      data: url,
      success: function() {
        wx.showModal({
          title: '复制成功',
          content: name + ' 下载链接已复制到剪贴板，请打开夸克网盘App粘贴下载',
          showCancel: false,
          confirmText: '知道了'
        });
      },
      fail: function() {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        });
      }
    });
  },

  onShareAppMessage: function() {
    return {
      title: 'AI开发工具下载',
      path: '/pages/tools/index/index'
    };
  }
});
