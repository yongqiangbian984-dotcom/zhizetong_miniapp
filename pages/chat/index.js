Page({
  data: {
    messages: [],
    inputText: '',
    scrollTop: 0,
    scrollIntoView: '',
    loading: false,
    keyboardHeight: 0
  },

  onLoad: function() {
    this.loadHistory();
    if (this.data.messages.length === 0) {
      this.addSystemMessage('你好！我是赤狐豆豆 🦊\n\n我是你的AI学习助手，关于课程有任何问题都可以问我，也能陪你闲聊~');
    }
  },

  onShow: function() {
    this.scrollToBottom();
  },

  loadHistory: function() {
    var history = wx.getStorageSync('chat_history');
    if (history && Array.isArray(history)) {
      this.setData({ messages: history });
    }
  },

  saveHistory: function() {
    var messages = this.data.messages;
    if (messages.length > 100) {
      messages = messages.slice(-100);
    }
    wx.setStorageSync('chat_history', messages);
  },

  addSystemMessage: function(content) {
    var messages = this.data.messages;
    messages.push({
      id: Date.now(),
      role: 'system',
      content: content,
      time: this.formatTime(new Date())
    });
    this.setData({ messages: messages });
    this.scrollToBottom();
  },

  addUserMessage: function(content) {
    var messages = this.data.messages;
    messages.push({
      id: Date.now(),
      role: 'user',
      content: content,
      time: this.formatTime(new Date())
    });
    this.setData({ messages: messages, inputText: '' });
    this.scrollToBottom();
    this.saveHistory();
  },

  addAiMessage: function(content) {
    var messages = this.data.messages;
    messages.push({
      id: Date.now(),
      role: 'ai',
      content: content,
      time: this.formatTime(new Date())
    });
    this.setData({ messages: messages });
    this.scrollToBottom();
    this.saveHistory();
  },

  scrollToBottom: function() {
    var that = this;
    setTimeout(function() {
      that.setData({ scrollIntoView: 'msg-bottom' });
    }, 100);
  },

  formatTime: function(date) {
    var hour = date.getHours();
    var minute = date.getMinutes();
    if (hour < 10) hour = '0' + hour;
    if (minute < 10) minute = '0' + minute;
    return hour + ':' + minute;
  },

  onInput: function(e) {
    this.setData({ inputText: e.detail.value });
  },

  onInputFocus: function(e) {
    var height = e.detail.height || 0;
    this.setData({ keyboardHeight: height });
    this.scrollToBottom();
  },

  onInputBlur: function() {
    this.setData({ keyboardHeight: 0 });
  },

  onSend: function() {
    var text = this.data.inputText.trim();
    if (!text) return;
    if (this.data.loading) return;

    this.addUserMessage(text);
    this.setData({ loading: true });

    var that = this;
    wx.cloud.callFunction({
      name: 'api',
      data: {
        action: 'chat',
        data: { message: text }
      },
      success: function(res) {
        that.setData({ loading: false });
        if (res.result && res.result.code === 0) {
          that.addAiMessage(res.result.data);
        } else {
          var errMsg = (res.result && res.result.message) || '抱歉，我暂时无法回答，请稍后再试。';
          that.addAiMessage(errMsg);
        }
      },
      fail: function(err) {
        that.setData({ loading: false });
        console.error('chat error:', err);
        that.addAiMessage('抱歉，网络连接出现问题，请稍后重试。');
      }
    });
  },

  onClearHistory: function() {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定清空聊天记录吗？',
      success: function(res) {
        if (res.confirm) {
          that.setData({ messages: [] });
          wx.removeStorageSync('chat_history');
        }
      }
    });
  }
});
