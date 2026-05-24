Page({
  data: {
    orders: [],
    loading: true,
    currentTab: 'all',
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'pending', label: '待支付' },
      { key: 'paid', label: '已支付' },
      { key: 'refunded', label: '已退款' }
    ],
    page: 1,
    hasMore: true,
    emptyText: '暂无订单'
  },

  onLoad: function(options) {
    var status = options && options.status ? options.status : 'all';
    this.setData({ currentTab: status });
    this.loadOrders();
  },

  onShow: function() {
    // 每次显示页面时刷新订单列表
    this.setData({ page: 1, orders: [], hasMore: true });
    this.loadOrders();
  },

  onTabChange: function(e) {
    var status = e.currentTarget.dataset.status;
    this.setData({ 
      currentTab: status,
      page: 1,
      orders: [],
      hasMore: true
    });
    this.loadOrders();
  },

  loadOrders: function() {
    var that = this;
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
      return;
    }
    
    that.setData({ loading: true });
    
    wx.cloud.callFunction({
      name: 'api',
      data: {
        action: 'getMyOrders',
        data: {
          status: that.data.currentTab === 'all' ? null : that.data.currentTab,
          page: that.data.page,
          pageSize: 20
        }
      },
      success: function(res) {
        that.setData({ loading: false });
        
        if (res.result && res.result.code === 0) {
          var newOrders = that.data.orders.concat(res.result.data);
          that.setData({
            orders: newOrders,
            hasMore: res.result.data.length >= 20,
            emptyText: '暂无订单'
          });
        } else {
          that.setData({
            orders: [],
            emptyText: '加载失败'
          });
        }
      },
      fail: function(err) {
        that.setData({ 
          loading: false,
          orders: [],
          emptyText: '网络错误'
        });
        console.error('加载订单失败', err);
      }
    });
  },

  onReachBottom: function() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 });
      this.loadOrders();
    }
  },

  onOrderTap: function(e) {
    var orderId = e.currentTarget.dataset.id;
    var order = e.currentTarget.dataset.order;
    
    if (order.status === 'paid') {
      // 已支付的订单，跳转到课程详情
      wx.navigateTo({
        url: '/pages/course/detail/index?id=' + order.courseId
      });
    } else if (order.status === 'pending') {
      // 待支付的订单，跳转到支付页面
      var courseInfo = order.courseInfo || {};
      wx.navigateTo({
        url: '/pages/pay/index/index?id=' + order.courseId + '&price=' + order.price + '&title=' + encodeURIComponent(order.courseName || courseInfo.title || '课程')
      });
    }
  },

  getStatusClass: function(status) {
    var classMap = {
      'pending': 'status-pending',
      'paid': 'status-paid',
      'refunded': 'status-refunded',
      'cancelled': 'status-cancelled'
    };
    return classMap[status] || '';
  },

  getStatusText: function(status) {
    var textMap = {
      'pending': '待支付',
      'paid': '已支付',
      'refunded': '已退款',
      'cancelled': '已取消'
    };
    return textMap[status] || status;
  }
});
