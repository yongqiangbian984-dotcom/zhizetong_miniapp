var config = require('../../config.js');

Page({
  data: {
    step: 1,
    role: '',
    qaStep: 1,
    qaTitle: '你目前是什么阶段？',
    answers: { q1: '', q2: '', q3: '', q4: '' },
    openid: 'local_test_user',
    detailStep: 1,
    detailAnswers: {
      province: '',
      score: '',
      subject: '',
      target_major: '',
      target_university: '',
      family_budget: '',
      personality: '',
      career_goal: ''
    }
  },

  onLoad: function(options) {
    var inviterRole = options.inviter_role || '';
    if (inviterRole === 'parent') {
      this.setData({ step: 2, role: 'parent' });
    }
  },

  selectRole: function(e) {
    var role = e.currentTarget.dataset.role;
    this.setData({ step: 2, role: role });
  },

  selectQA: function(e) {
    var key = e.currentTarget.dataset.key;
    var val = e.currentTarget.dataset.val;
    var answers = this.data.answers;
    answers[key] = val;

    var qaStep = this.data.qaStep + 1;
    var qaTitles = {
      1: '你目前是什么阶段？',
      2: '你的成绩大概在什么位置？',
      3: '你倾向去哪里读书？',
      4: '选专业方向你更想怎么做？'
    };

    if (qaStep > 4) {
      this.setData({ step: 3, answers: answers });
    } else {
      this.setData({ qaStep: qaStep, qaTitle: qaTitles[qaStep] || '', answers: answers });
    }
  },

  qaBack: function() {
    if (this.data.qaStep > 1) {
      var qaTitles = {
        1: '你目前是什么阶段？',
        2: '你的成绩大概在什么位置？',
        3: '你倾向去哪里读书？',
        4: '选专业方向你更想怎么做？'
      };
      this.setData({
        qaStep: this.data.qaStep - 1,
        qaTitle: qaTitles[this.data.qaStep - 1] || ''
      });
    }
  },

  selectDetail: function(e) {
    var key = e.currentTarget.dataset.key;
    var val = e.currentTarget.dataset.val;
    var detailAnswers = this.data.detailAnswers;
    detailAnswers[key] = val;

    var detailStep = this.data.detailStep + 1;

    if (detailStep > 8) {
      this.setData({ step: 4, detailAnswers: detailAnswers });
    } else {
      this.setData({ detailStep: detailStep, detailAnswers: detailAnswers });
    }
  },

  detailBack: function() {
    if (this.data.detailStep > 1) {
      this.setData({ detailStep: this.data.detailStep - 1 });
    }
  },

  startChat: function() {
    var profile = {
      province: this.data.answers.q3 || '',
      score: '',
      subject: '',
      target_major: this.data.answers.q4 || '',
      target_university: '',
      family_budget: '',
      personality: '',
      career_goal: '',
      quickAnswers: this.data.answers
    };
    try { wx.setStorageSync('zexiao_profile', profile); } catch(e) {}
    wx.navigateTo({ url: '/pages/zexiao-chat/index' });
  },

  startFullAssessment: function() {
    var d = this.data.detailAnswers;
    var profile = {
      province: d.province || '',
      score: d.score ? parseInt(d.score) : 0,
      subject: d.subject || '',
      target_major: d.target_major || '',
      target_university: d.target_university || '',
      family_budget: d.family_budget || '',
      personality: d.personality || '',
      career_goal: d.career_goal || '',
      quickAnswers: this.data.answers
    };
    try { wx.setStorageSync('zexiao_profile', profile); } catch(e) {}
    wx.navigateTo({ url: '/pages/zexiao-chat/index?mode=full' });
  },

  goToProgress: function() {
    wx.navigateTo({ url: '/pages/zexiao-progress/index' });
  },

  onShareAppMessage: function() {
    var role = this.data.role === 'student' ? 'parent' : 'student';
    return {
      title: '智择通 - AI智能择校评估',
      path: '/pages/zexiao-entry/index?inviter_role=' + role
    };
  }
});
