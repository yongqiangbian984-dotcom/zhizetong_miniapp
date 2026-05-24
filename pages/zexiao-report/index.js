var config = require('../../config.js');

Page({
  data: {
    loading: true,
    error: '',
    generating: false,
    mode: 'full',
    reportData: null
  },

  onLoad: function(options) {
    var sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 44 });
    this.loadFullReport();
  },

  loadFullReport: function() {
    var that = this;
    var reportData = null;
    try { reportData = wx.getStorageSync('zexiao_report_data'); } catch(e) {}

    if (reportData) {
      that.setData({ reportData: that._flattenReport(reportData), loading: false });
      return;
    }

    var profile = null;
    try { profile = wx.getStorageSync('zexiao_profile'); } catch(e) {}

    if (!profile || !profile.province || !profile.score) {
      that.setData({ loading: false, error: '缺少用户信息，请重新填写' });
      return;
    }

    that.setData({ generating: true });
    wx.showLoading({ title: '6维引擎生成中…', mask: true });

    var apiBase = config.zexiaoApiBase || 'http://192.168.2.10:8080';
    wx.request({
      url: apiBase + '/api/v1/consult',
      method: 'POST',
      header: { 'content-type': 'application/json' },
      data: {
        profile: {
          province: profile.province || '',
          score: profile.score || 0,
          subject: profile.subject || '理科',
          target_major: profile.target_major || '',
          target_university: profile.target_university || '',
          family_budget: profile.family_budget || '',
          personality: profile.personality || '',
          career_goal: profile.career_goal || '产业就业'
        }
      },
      timeout: 120000,
      success: function(res) {
        wx.hideLoading();
        if (res.statusCode === 200 && res.data && res.data.status === 'success') {
          var flatData = that._flattenReport(res.data.data);
          that.setData({ reportData: flatData, loading: false, generating: false });
          try { wx.setStorageSync('zexiao_report_data', flatData); } catch(e) {}
        } else {
          var errMsg = '生成失败';
          if (res.data && res.data.message) errMsg = res.data.message;
          that.setData({ loading: false, error: errMsg, generating: false });
        }
      },
      fail: function() {
        wx.hideLoading();
        that.setData({ loading: false, error: '网络请求失败', generating: false });
      }
    });
  },

  // 把对象类型的值递归转成字符串
  _flattenReport: function(data) {
    if (!data) return data;
    var result = {};
    for (var key in data) {
      var val = data[key];
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        // 递归处理子对象
        var sub = {};
        for (var k in val) {
          if (typeof val[k] === 'object' && val[k] !== null) {
            sub[k] = JSON.stringify(val[k], null, 2);
          } else {
            sub[k] = val[k];
          }
        }
        result[key] = sub;
      } else if (typeof val === 'object' && val !== null) {
        result[key] = JSON.stringify(val, null, 2);
      } else {
        result[key] = val;
      }
    }
    return result;
  },

  goBack: function() { wx.navigateBack(); },
  retryReport: function() { this.loadFullReport(); },
  copyWechat: function() {
    wx.setClipboardData({ data: 'zhizetong_ai', success: function() { wx.showToast({ title: '微信号已复制' }); } });
  }
});
