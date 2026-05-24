// 小程序入口
App({
  globalData: {
    isLogin: false,
    userInfo: null,
    openid: ''
  },

  onLaunch: function() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }
    wx.cloud.init({
      env: 'cloudbase-d3gvl5muqbafacebb',
      traceUser: true
    });
    console.log('云开发初始化成功');

    // 自动登录获取openid
    var that = this;
    wx.cloud.callFunction({
      name: 'login',
      success: function(res) {
        if (res.result && res.result.openid) {
          that.globalData.openid = res.result.openid;
          that.globalData.isLogin = true;
          console.log('登录成功, openid:', res.result.openid);
        }
      },
      fail: function(err) {
        console.log('登录失败，使用模拟模式', err);
      }
    });
  }
});
