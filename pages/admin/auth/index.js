Page({
  data: {
    openid: '',
    courseList: [],
    selectedCourseId: '',
    selectedCourseName: '',
    grantList: [],
    loading: false,
    grantLoading: false
  },

  onLoad: function() {
    this.loadCourseList();
    this.loadGrantList();
  },

  // 加载课程列表
  loadCourseList: function() {
    var that = this;
    wx.cloud.database().collection('courses').field({
      _id: true,
      title: true,
      price: true,
      isFree: true,
      resourceLink: true
    }).get({
      success: function(res) {
        that.setData({ courseList: res.data || [] });
      },
      fail: function() {
        wx.showToast({ title: '加载课程失败', icon: 'none' });
      }
    });
  },

  // 加载已授权列表
  loadGrantList: function() {
    var that = this;
    wx.cloud.database().collection('user_courses').orderBy('grantTime', 'desc').limit(50).get({
      success: function(res) {
        var list = res.data || [];
        // 补充课程信息
        that.enrichCourseInfo(list);
      },
      fail: function() {
        wx.showToast({ title: '加载授权记录失败', icon: 'none' });
      }
    });
  },

  // 补充课程信息
  enrichCourseInfo: function(list) {
    var that = this;
    var courseList = this.data.courseList;
    var enrichedList = list.map(function(item) {
      var course = courseList.find(function(c) { return c._id === item.courseId; });
      return Object.assign({}, item, {
        courseTitle: course ? course.title : '未知课程'
      });
    });
    that.setData({ grantList: enrichedList });
  },

  // 输入openid
  onOpenidInput: function(e) {
    this.setData({ openid: e.detail.value });
  },

  // 选择课程
  onCourseSelect: function(e) {
    var index = e.detail.value;
    var course = this.data.courseList[index];
    if (course) {
      this.setData({
        selectedCourseId: course._id,
        selectedCourseName: course.title
      });
    }
  },

  // 一键授权
  onGrant: function() {
    var that = this;
    var openid = this.data.openid.trim();
    var courseId = this.data.selectedCourseId;

    if (!openid) {
      wx.showToast({ title: '请输入用户openid', icon: 'none' });
      return;
    }

    if (!courseId) {
      wx.showToast({ title: '请选择课程', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认授权',
      content: '确定要为该用户开通该课程访问权限吗？',
      success: function(res) {
        if (res.confirm) {
          that.doGrant(openid, courseId);
        }
      }
    });
  },

  // 执行授权
  doGrant: function(openid, courseId) {
    var that = this;
    that.setData({ grantLoading: true });

    wx.cloud.callFunction({
      name: 'api',
      data: {
        action: 'grantCourseAccess',
        data: { openid: openid, courseId: courseId }
      },
      success: function(res) {
        that.setData({ grantLoading: false });
        if (res.result && res.result.code === 0) {
          wx.showToast({ title: '授权成功', icon: 'success' });
          that.setData({ openid: '', selectedCourseId: '', selectedCourseName: '' });
          that.loadGrantList();
        } else {
          wx.showToast({ title: res.result.message || '授权失败', icon: 'none' });
        }
      },
      fail: function(err) {
        that.setData({ grantLoading: false });
        wx.showToast({ title: '网络错误', icon: 'none' });
        console.error(err);
      }
    });
  },

  // 复制openid
  onCopyOpenid: function(e) {
    var openid = e.currentTarget.dataset.openid;
    wx.setClipboardData({
      data: openid,
      success: function() {
        wx.showToast({ title: '已复制', icon: 'success' });
      }
    });
  },

  // 格式化时间
  formatTime: function(timestamp) {
    if (!timestamp) return '';
    var date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    var y = date.getFullYear();
    var m = (date.getMonth() + 1).toString().padStart(2, '0');
    var d = date.getDate().toString().padStart(2, '0');
    var h = date.getHours().toString().padStart(2, '0');
    var min = date.getMinutes().toString().padStart(2, '0');
    return y + '-' + m + '-' + d + ' ' + h + ':' + min;
  }
});
