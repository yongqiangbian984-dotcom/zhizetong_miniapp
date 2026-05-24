Page({
  data: {
    currentTab: 'team',
    userInfo: null,
    hasLogin: false,
    teamCount: { level1: 0, level2: 0, level3: 0 },
    todayEarnings: 0,
    todayEarningsText: '0.00',
    totalEarningsText: '0.00',
    availableEarningsText: '0.00',
    commissionList: [],
    teamList: []
  },

  onLoad: function() {
    this.loadData();
  },

  onShow: function() {
    this.loadData();
  },

  loadData: function() {
    var that = this;
    var userInfo = wx.getStorageSync('userInfo');
    var openid = wx.getStorageSync('openid');
    if (!userInfo || !openid) {
      that.setData({ hasLogin: false });
      return;
    }
    that.setData({
      hasLogin: true,
      userInfo: userInfo,
      totalEarningsText: that.formatMoney(userInfo.totalEarnings || 0),
      availableEarningsText: that.formatMoney(userInfo.availableEarnings || 0)
    });

    wx.cloud.callFunction({
      name: 'api',
      data: { action: 'getDistributionInfo' },
      success: function(res) {
        if (res.result && res.result.code === 0) {
          var data = res.result.data;
          that.setData({
            userInfo: data.userInfo,
            teamCount: data.teamCount,
            todayEarnings: data.todayEarnings,
            todayEarningsText: that.formatMoney(data.todayEarnings || 0),
            totalEarningsText: that.formatMoney(data.userInfo.totalEarnings || 0),
            availableEarningsText: that.formatMoney(data.userInfo.availableEarnings || 0)
          });
          wx.setStorageSync('userInfo', data.userInfo);
        }
      },
      fail: function(err) {
        console.log('获取分销信息失败', err);
      }
    });

    that.loadTeamList('level1');
  },

  formatMoney: function(num) {
    var n = Number(num) || 0;
    return n.toFixed(2);
  },

  onTabChange: function(e) {
    var tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    if (tab === 'team') {
      this.loadTeamList('level1');
    } else {
      this.loadCommissionList();
    }
  },

  onTeamLevelTap: function(e) {
    var level = e.currentTarget.dataset.level;
    this.loadTeamList(level);
  },

  loadTeamList: function(level) {
    var that = this;
    wx.cloud.callFunction({
      name: 'api',
      data: { action: 'getTeamList', data: { level: level } },
      success: function(res) {
        if (res.result && res.result.code === 0) {
          that.setData({ teamList: res.result.data });
        }
      },
      fail: function() {}
    });
  },

  loadCommissionList: function() {
    var that = this;
    wx.cloud.callFunction({
      name: 'api',
      data: { action: 'getCommissionList' },
      success: function(res) {
        if (res.result && res.result.code === 0) {
          var list = res.result.data.map(function(item) {
            item.amountText = that.formatMoney(item.amount || 0);
            return item;
          });
          that.setData({ commissionList: list });
        }
      },
      fail: function() {}
    });
  },

  onWithdraw: function() {
    wx.showToast({ title: '提现功能开发中', icon: 'none' });
  },

  onShareAppMessage: function() {
    var openid = wx.getStorageSync('openid') || '';
    return {
      title: '技能提升课堂 - 自学提高技能，分享还能赚钱',
      path: '/pages/index/index?inviter=' + openid
    };
  }
});
