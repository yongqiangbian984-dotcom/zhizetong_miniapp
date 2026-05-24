// 小程序入口
App({
  globalData: {
    isLogin: false,
    userInfo: null,
    openid: 'local_test_user'
  },

  onLaunch: function() {
    console.log('智择通小程序启动');
  }
});
