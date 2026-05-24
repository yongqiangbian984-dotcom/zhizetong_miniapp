var config = require('../../config.js');

Page({
  data: {
    reportHtml: '',
    loading: true,
    error: '',
    generating: false,
    mode: 'chat',
    reportData: null,
    dimKeys: [
      { key: 'step1_personality', icon: '🧠', title: '性格特质', index: '一' },
      { key: 'step2_fri', icon: '💰', title: '家庭资源', index: '二' },
      { key: 'step3_kondratiev', icon: '📈', title: '行业周期', index: '三' },
      { key: 'step4_location', icon: '🏙️', title: '地域价值', index: '四' },
      { key: 'step5_competition', icon: '🎓', title: '升学竞争', index: '五' },
      { key: 'step6_contingency', icon: '🎯', title: '容错规划', index: '六' }
    ]
  },

  onLoad: function(options) {
    var sysInfo = wx.getSystemInfoSync();
    this.setData({ statusBarHeight: sysInfo.statusBarHeight || 44 });

    var mode = (options && options.mode === 'full') ? 'full' : 'chat';
    this.setData({ mode: mode });

    if (mode === 'full') {
      this.loadFullReport();
    } else {
      this.loadFullReport();
    }
  },

  loadFullReport: function() {
    var that = this;
    var reportData = null;
    try { reportData = wx.getStorageSync('zexiao_report_data'); } catch(e) {}

    if (reportData) {
      that.setData({ reportData: reportData, loading: false });
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
          that.setData({ reportData: res.data.data, loading: false, generating: false });
          try { wx.setStorageSync('zexiao_report_data', res.data.data); } catch(e) {}
        } else {
          var errMsg = '生成失败';
          if (res.data && res.data.message) errMsg = res.data.message;
          that.setData({ loading: false, error: errMsg, generating: false });
        }
      },
      fail: function() {
        wx.hideLoading();
        that.setData({ loading: false, error: '网络请求失败，请检查后端是否运行', generating: false });
      }
    });
  },

  goBack: function() {
    wx.navigateBack();
  },

  retryReport: function() {
    this.loadFullReport();
  },

  getDimValue: function(key, field) {
    var data = this.data.reportData;
    if (!data || !data[key]) return '-';
    return data[key][field] || '-';
  }
});
