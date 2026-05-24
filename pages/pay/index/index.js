Page({
  data: {
    orderId: '',
    outTradeNo: '',
    courseInfo: null,
    price: 0,
    priceDisplay: '0.00',
    loading: true,
    paying: false,
    orderStatus: '',
    errorMsg: ''
  },

  onLoad: function(options) {
    var that = this;
    var id = options.id || '';
    var price = options.price ? parseFloat(options.price) : 0;
    var title = decodeURIComponent(options.title || '课程');
    
    if (!id || price <= 0) {
      that.setData({
        loading: false,
        errorMsg: '参数错误'
      });
      return;
    }
    
    // 加载课程信息
    that.setData({
      courseInfo: {
        _id: id,
        title: title,
        price: price
      },
      price: price,
      priceDisplay: price.toFixed(2),
      loading: false
    });
  },

  onShow: function() {
    // 检查登录状态
    var openid = wx.getStorageSync('openid');
    if (!openid) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/user/login/index' });
          }
        }
      });
    }
  },

  // 创建订单并发起支付
  createPayment: function() {
    var that = this;
    var course = that.data.courseInfo;
    
    if (!course) {
      wx.showToast({ title: '课程信息错误', icon: 'none' });
      return;
    }
    
    that.setData({ paying: true });
    wx.showLoading({ title: '创建订单...' });
    
    wx.cloud.callFunction({
      name: 'api',
      data: {
        action: 'createPayment',
        data: {
          courseId: course._id,
          courseName: course.title,
          price: course.price
        }
      },
      success: function(res) {
        wx.hideLoading();
        console.log('createPayment返回:', JSON.stringify(res.result));
        
        if (res.result) {
          if (res.result.code === 200 && res.result.alreadyPurchased) {
            wx.showToast({ title: '您已购买过该课程', icon: 'success' });
            setTimeout(function() {
              wx.navigateBack();
            }, 1500);
            return;
          }
          
          if (res.result.code === 200 && res.result.alreadyPaid) {
            wx.showToast({ title: '订单已支付', icon: 'success' });
            setTimeout(function() {
              wx.navigateBack();
            }, 1500);
            return;
          }
          
          if (res.result.code !== 0) {
            that.setData({ paying: false, errorMsg: res.result.message });
            wx.showToast({ title: res.result.message || '创建订单失败', icon: 'none' });
            return;
          }
          
          var payParams = res.result.data.payParams;
          var orderId = res.result.data.orderId;
          var outTradeNo = res.result.data.outTradeNo;
          
          that.setData({
            orderId: orderId,
            outTradeNo: outTradeNo
          });
          
          // 调用微信支付
          that.requestPayment(payParams, orderId);
        } else {
          that.setData({ paying: false, errorMsg: '网络错误' });
          wx.showToast({ title: '网络错误', icon: 'none' });
        }
      },
      fail: function(err) {
        wx.hideLoading();
        that.setData({ paying: false, errorMsg: '请求失败' });
        console.error('创建订单失败', err);
        wx.showToast({ title: '创建订单失败', icon: 'none' });
      }
    });
  },

  // 调用微信支付
  requestPayment: function(payParams, orderId) {
    var that = this;
    
    wx.requestPayment({
      timeStamp: payParams.timeStamp,
      nonceStr: payParams.nonceStr,
      package: payParams.package,
      signType: payParams.signType || 'MD5',
      paySign: payParams.paySign,
      success: function(res) {
        console.log('支付成功', res);
        that.setData({ 
          paying: false,
          orderStatus: 'paid' 
        });
        
        // 主动确认支付状态
        that.confirmPayment(orderId);
      },
      fail: function(err) {
        console.log('支付失败', err);
        that.setData({ 
          paying: false,
          orderStatus: 'failed'
        });
        
        if (err.errMsg && err.errMsg.indexOf('cancel') !== -1) {
          wx.showToast({ title: '支付已取消', icon: 'none' });
        } else {
          wx.showToast({ title: '支付失败', icon: 'none' });
        }
      }
    });
  },

  // 重新支付
  onRetryPay: function() {
    this.createPayment();
  },

  // 确认支付结果
  confirmPayment: function(orderId) {
    var that = this;
    wx.showLoading({ title: '确认支付...' });
    
    wx.cloud.callFunction({
      name: 'api',
      data: {
        action: 'confirmPayment',
        data: { orderId: orderId }
      },
      success: function(res) {
        wx.hideLoading();
        console.log('confirmPayment返回:', JSON.stringify(res.result));
        
        if (res.result && res.result.paid) {
          that.setData({ orderStatus: 'paid' });
          wx.showModal({
            title: '支付成功',
            content: '恭喜您，课程购买成功！',
            showCancel: false,
            success: function() {
              var course = that.data.courseInfo;
              wx.redirectTo({
                url: '/pages/course/detail/index?id=' + course._id
              });
            }
          });
        } else {
          wx.showToast({ title: '支付确认中，请稍后查看', icon: 'none' });
          setTimeout(function() {
            var course = that.data.courseInfo;
            wx.redirectTo({
              url: '/pages/course/detail/index?id=' + course._id
            });
          }, 2000);
        }
      },
      fail: function(err) {
        wx.hideLoading();
        console.error('确认支付失败', err);
        // 即使确认失败也跳转，让用户在详情页看到状态
        var course = that.data.courseInfo;
        wx.redirectTo({
          url: '/pages/course/detail/index?id=' + course._id
        });
      }
    });
  },

  // 取消支付
  onCancelPay: function() {
    wx.showModal({
      title: '提示',
      content: '确定取消支付？',
      success: function(res) {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  }
});
