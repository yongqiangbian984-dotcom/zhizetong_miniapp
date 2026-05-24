Page({
  data: {
    currentTab: 'intro',
    course: null,
    chapters: [],
    loading: true,
    hasResourceLink: false,
    hasPurchased: false,
    resourceLink: null,
    showResourceModal: false,
    priceDisplay: '0.00',
    buttonText: '立即购买'
  },

  onLoad: function(options) {
    var id = options && options.id ? options.id : '';
    var inviterId = options && options.inviter ? options.inviter : '';
    
    // 保存邀请人ID
    if (inviterId) {
      wx.setStorageSync('inviterId', inviterId);
    }
    
    if (id) {
      this.loadCourseDetail(id);
    } else {
      this.loadMockData();
    }
  },

  onShow: function() {
    var that = this;
    var course = that.data.course;
    
    if (course && course._id) {
      // 每次显示页面时检查购买状态
      that.checkPurchaseStatus(course._id);
    }
  },

  loadCourseDetail: function(courseId) {
    var that = this;
    var db = wx.cloud.database();

    wx.showLoading({ title: '加载中...' });
    
    wx.cloud.callFunction({
      name: 'api',
      data: {
        action: 'getCourseDetail',
        data: { courseId: courseId }
      },
      success: function(res) {
        wx.hideLoading();
        
        if (res.result && res.result.code === 0) {
          var course = res.result.data.course;
          var hasPurchased = res.result.data.hasPurchased || false;
          
          wx.setNavigationBarTitle({ title: course.title || '课程详情' });
          
          // 检查是否有资源链接
          var hasResourceLink = !!(course.resourceLink && course.resourceLink.url);
          
          // 格式化价格
          var priceDisplay = '0.00';
          if (course.price && !course.isFree) {
            priceDisplay = course.price.toFixed(2);
          }
          
          // 更新按钮文字
          var buttonText = that.getButtonText(course, hasResourceLink, hasPurchased);
          
          that.setData({ 
            course: course, 
            chapters: res.result.data.chapters || [],
            loading: false,
            hasResourceLink: hasResourceLink,
            hasPurchased: hasPurchased,
            resourceLink: course.resourceLink || null,
            priceDisplay: priceDisplay,
            buttonText: buttonText
          });
        } else {
          that.loadMockData();
        }
      },
      fail: function(err) {
        wx.hideLoading();
        console.error('加载课程详情失败', err);
        that.loadMockData();
      }
    });
  },

  checkPurchaseStatus: function(courseId) {
    var that = this;
    
    wx.cloud.callFunction({
      name: 'api',
      data: {
        action: 'getResourceLink',
        data: { courseId: courseId }
      },
      success: function(res) {
        if (res.result && res.result.code === 0) {
          var hasPurchased = res.result.hasAccess || false;
          var hasResourceLink = that.data.hasResourceLink;
          
          // 更新按钮文字
          var buttonText = that.getButtonText(that.data.course, hasResourceLink, hasPurchased);
          
          that.setData({ 
            hasPurchased: hasPurchased,
            resourceLink: hasPurchased ? (res.result.data || that.data.resourceLink) : that.data.resourceLink,
            buttonText: buttonText
          });
        }
      },
      fail: function() {
        // 检查用户是否已购买（通过user_courses集合）
        that.checkUserCourses(courseId);
      }
    });
  },

  checkUserCourses: function(courseId) {
    var that = this;
    var openid = wx.getStorageSync('openid');
    
    if (!openid) {
      return;
    }
    
    wx.cloud.database().collection('user_courses').where({
      _openid: openid,
      courseId: courseId
    }).get({
      success: function(res) {
        var hasPurchased = res.data && res.data.length > 0;
        var buttonText = that.getButtonText(that.data.course, that.data.hasResourceLink, hasPurchased);
        
        that.setData({
          hasPurchased: hasPurchased,
          buttonText: buttonText
        });
      }
    });
  },

  getButtonText: function(course, hasResourceLink, hasPurchased) {
    if (!course) return '立即购买';
    
    if (course.isFree) {
      return '免费学习';
    }
    
    if (hasResourceLink) {
      return hasPurchased ? '查看资源' : '获取完整课程';
    }
    
    return hasPurchased ? '已购买' : '立即购买';
  },

  loadMockData: function() {
    this.setData({
      course: { _id: 'mock1', title: 'Coze底层逻辑课（全案版）', price: 299, originalPrice: 599, isFree: false, studentCount: 1256, description: '23章全案深度讲解Coze平台底层逻辑', color1: '#667eea', color2: '#764ba2' },
      chapters: [
        { _id: 'ch1', title: '第一章 认识Coze平台', type: 'video', order: 1 },
        { _id: 'ch2', title: '第二章 智能体基础架构', type: 'video', order: 2 },
        { _id: 'ch3', title: '第三章 工作流设计原理', type: 'video', order: 3 }
      ],
      loading: false,
      hasResourceLink: false,
      hasPurchased: false,
      priceDisplay: '299.00',
      buttonText: '立即购买'
    });
  },

  onTabChange: function(e) {
    this.setData({ currentTab: e.currentTarget.dataset.tab });
  },

  onChapterTap: function(e) {
    var id = e.currentTarget.dataset.id;
    var isFree = e.currentTarget.dataset.isfree;
    if (id) {
      wx.navigateTo({ url: '/pages/course/article/index?id=' + id });
    }
  },

  onBuy: function() {
    var course = this.data.course;
    if (!course) return;
    
    // 免费课程
    if (course.isFree) {
      this.handleFreeCourse();
      return;
    }
    
    // 有资源链接的课程
    if (this.data.hasResourceLink) {
      if (this.data.hasPurchased) {
        this.showResourceModal();
      } else {
        this.showResourceGuide();
      }
      return;
    }
    
    // 普通付费课程 - 检查登录状态
    this.checkLoginAndPay();
  },

  handleFreeCourse: function() {
    var that = this;
    var course = that.data.course;
    
    wx.showModal({
      title: '免费学习',
      content: '确定要开始学习《' + course.title + '》吗？',
      success: function(res) {
        if (res.confirm) {
          // 记录用户课程
          var openid = wx.getStorageSync('openid');
          if (openid && course._id && course._id.indexOf('mock') === -1) {
            wx.cloud.database().collection('user_courses').add({
              data: {
                _openid: openid,
                courseId: course._id,
                purchaseTime: new Date(),
                status: 'active',
                grantType: 'free'
              },
              success: function() {
                wx.showToast({ title: '开始学习', icon: 'success' });
              }
            });
          } else {
            wx.showToast({ title: '免费课程，直接学习', icon: 'success' });
          }
        }
      }
    });
  },

  checkLoginAndPay: function() {
    var that = this;
    var openid = wx.getStorageSync('openid');
    
    if (!openid) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再购买课程',
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/user/login/index?redirect=/pages/course/detail/index?id=' + that.data.course._id });
          }
        }
      });
      return;
    }
    
    // 已购买
    if (that.data.hasPurchased) {
      wx.showToast({ title: '您已购买过该课程', icon: 'success' });
      return;
    }
    
    // 未购买，跳转支付
    var course = that.data.course;
    wx.navigateTo({ 
      url: '/pages/pay/index/index?id=' + course._id + '&price=' + course.price + '&title=' + encodeURIComponent(course.title)
    });
  },

  showResourceGuide: function() {
    wx.showModal({
      title: '获取完整课程',
      content: '请联系客服微信完成支付，支付成功后客服会为您提供网盘链接。',
      confirmText: '复制客服微信',
      cancelText: '关闭',
      success: function(res) {
        if (res.confirm) {
          wx.setClipboardData({
            data: 'doudou152',
            success: function() {
              wx.showToast({ title: '已复制客服微信', icon: 'success' });
            }
          });
        }
      }
    });
  },

  showResourceModal: function() {
    var resourceLink = this.data.resourceLink;
    if (!resourceLink) return;
    
    wx.showModal({
      title: '课程资源链接',
      content: '链接: ' + resourceLink.url + '\n提取码: ' + resourceLink.password,
      showCancel: true,
      confirmText: '复制链接',
      cancelText: '关闭',
      success: function(res) {
        if (res.confirm) {
          var text = '链接: ' + resourceLink.url + '\n提取码: ' + resourceLink.password;
          wx.setClipboardData({
            data: text,
            success: function() {
              wx.showToast({ title: '已复制到剪贴板', icon: 'success' });
            }
          });
        }
      }
    });
  },

  onGetResource: function() {
    var that = this;
    var course = that.data.course;
    
    // 已购买用户直接显示链接
    if (that.data.hasPurchased) {
      that.showResourceModal();
      return;
    }
    
    // 未购买用户引导联系客服
    that.showResourceGuide();
  }
});
