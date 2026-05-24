Page({
  data: {
    chapter: null,
    loading: true,
    contentHtml: '',
    hasVideo: false,
    videoUrls: [],
    currentVideoIndex: 0,
    currentVideoUrl: '',
    showVideoCard: false,
    courseId: '',
    course: null,
    hasResourceLink: false,
    hasPurchased: false,
    resourceLink: null
  },
  onLoad: function(options) {
    var id = options && options.id ? options.id : '';
    var courseId = options && options.courseId ? options.courseId : '';
    if (id) {
      this.loadChapter(id, courseId);
    }
  },
  loadChapter: function(chapterId, courseId) {
    var that = this;
    var db = wx.cloud.database();
    db.collection('chapters').doc(chapterId).get({
      success: function(res) {
        var chapter = res.data;
        wx.setNavigationBarTitle({ title: chapter.title || '课程内容' });
        
        // 获取课程ID
        var cId = courseId || chapter.courseId;
        // 支持base64编码的contentHtml（迁移数据用）
        var htmlContent = chapter.contentHtml || '';
        if (!htmlContent && chapter.contentHtmlB64) {
          try {
            htmlContent = decodeURIComponent(escape(atob(chapter.contentHtmlB64)));
          } catch(e) {
            htmlContent = '';
          }
        }
        
        that.setData({ 
          chapter: chapter, 
          loading: false,
          contentHtml: htmlContent,
          courseId: cId
        });
        
        // 如果有课程ID，加载课程信息检查资源链接
        if (cId) {
          that.loadCourseResource(cId);
        }
        
        // 检测是否有VOD视频
        var hasVideo = false;
        var videoUrls = [];
        var videoUrl = chapter.videoUrl;
        
        if (videoUrl) {
          if (typeof videoUrl === 'string') {
            videoUrls = [videoUrl];
          } else if (Array.isArray(videoUrl)) {
            videoUrls = videoUrl;
          }
          if (videoUrls.length > 0) {
            hasVideo = true;
          }
        }
        
        that.setData({
          hasVideo: hasVideo,
          videoUrls: videoUrls,
          currentVideoIndex: 0,
          currentVideoUrl: videoUrls.length > 0 ? videoUrls[0] : '',
          showVideoCard: hasVideo
        });
      },
      fail: function() {
        that.setData({ loading: false });
        wx.showToast({ title: '加载失败', icon: 'none' });
      }
    });
  },
  loadCourseResource: function(courseId) {
    var that = this;
    // 获取课程信息
    wx.cloud.database().collection('courses').doc(courseId).get({
      success: function(res) {
        var course = res.data;
        var hasResourceLink = !!(course.resourceLink && course.resourceLink.url);
        that.setData({
          course: course,
          hasResourceLink: hasResourceLink,
          resourceLink: course.resourceLink || null
        });
        
        // 如果有资源链接，检查购买状态
        if (hasResourceLink) {
          that.checkPurchaseStatus(courseId);
        }
      },
      fail: function() {}
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
          that.setData({ 
            hasPurchased: true,
            resourceLink: res.result.data
          });
        } else {
          that.setData({ hasPurchased: false });
        }
      },
      fail: function() {
        that.setData({ hasPurchased: false });
      }
    });
  },
  // 切换视频
  onSwitchVideo: function(e) {
    var index = e.currentTarget.dataset.index;
    var videoUrls = this.data.videoUrls;
    if (index >= 0 && index < videoUrls.length) {
      this.setData({
        currentVideoIndex: index,
        currentVideoUrl: videoUrls[index]
      });
    }
  },
  // 视频播放错误处理
  onVideoError: function(e) {
    console.error('视频播放错误:', e.detail.errMsg);
    wx.showToast({ title: '视频播放失败', icon: 'none' });
  },
  // 展开/收起视频列表
  onToggleVideoList: function() {
    this.setData({
      showVideoCard: !this.data.showVideoCard
    });
  },
  // 显示资源链接
  onShowResource: function() {
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
  // 联系客服获取课程
  onContactService: function() {
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
  }
});
