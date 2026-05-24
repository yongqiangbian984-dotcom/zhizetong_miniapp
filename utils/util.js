// 微信云开发工具类
const cloud = require('./cloud.js');

/**
 * 数据库操作封装
 */
class Database {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }
  
  /**
   * 获取集合引用
   */
  getCollection() {
    return wx.cloud.database().collection(this.collectionName);
  }
  
  /**
   * 查询单条记录
   */
  async get(id) {
    try {
      const res = await this.getCollection().doc(id).get();
      return res.data;
    } catch (err) {
      console.error(`查询记录失败: ${id}`, err);
      return null;
    }
  }
  
  /**
   * 查询列表
   */
  async query(where = {}, orderBy = [], limit = 20, skip = 0) {
    try {
      let query = this.getCollection().where(where);
      
      // 排序
      if (orderBy.length > 0) {
        orderBy.forEach(item => {
          query = query.orderBy(item.field, item.order);
        });
      }
      
      // 分页
      query = query.limit(limit).skip(skip);
      
      const res = await query.get();
      return res.data;
    } catch (err) {
      console.error('查询列表失败', err);
      return [];
    }
  }
  
  /**
   * 添加记录
   */
  async add(data) {
    try {
      const res = await this.getCollection().add({ data });
      return res._id;
    } catch (err) {
      console.error('添加记录失败', err);
      return null;
    }
  }
  
  /**
   * 更新记录
   */
  async update(id, data) {
    try {
      await this.getCollection().doc(id).update({ data });
      return true;
    } catch (err) {
      console.error('更新记录失败', err);
      return false;
    }
  }
  
  /**
   * 删除记录
   */
  async remove(id) {
    try {
      await this.getCollection().doc(id).remove();
      return true;
    } catch (err) {
      console.error('删除记录失败', err);
      return false;
    }
  }
  
  /**
   * 统计数量
   */
  async count(where = {}) {
    try {
      const res = await this.getCollection().where(where).count();
      return res.total;
    } catch (err) {
      console.error('统计数量失败', err);
      return 0;
    }
  }
}

/**
 * 云函数调用封装
 */
class CloudFunction {
  /**
   * 调用云函数
   */
  static async call(name, data = {}) {
    try {
      const res = await wx.cloud.callFunction({
        name: name,
        data: data
      });
      return res.result;
    } catch (err) {
      console.error(`调用云函数 ${name} 失败`, err);
      return null;
    }
  }
  
  /**
   * 登录
   */
  static async login() {
    return await this.call('login');
  }
  
  /**
   * 获取课程列表
   */
  static async getCourses(where = {}, options = {}) {
    return await this.call('course', {
      action: 'list',
      where: where,
      ...options
    });
  }
  
  /**
   * 获取课程详情
   */
  static async getCourseDetail(courseId) {
    return await this.call('course', {
      action: 'detail',
      courseId: courseId
    });
  }
  
  /**
   * 获取章节列表
   */
  static async getChapters(courseId) {
    return await this.call('course', {
      action: 'chapters',
      courseId: courseId
    });
  }
  
  /**
   * 创建订单
   */
  static async createOrder(courseId) {
    return await this.call('order', {
      action: 'create',
      courseId: courseId
    });
  }
  
  /**
   * 支付订单
   */
  static async payOrder(orderId) {
    return await this.call('order', {
      action: 'pay',
      orderId: orderId
    });
  }
  
  /**
   * 获取分销数据
   */
  static async getDistributionData() {
    return await this.call('distribution', {
      action: 'getData'
    });
  }
  
  /**
   * 申请提现
   */
  static async applyWithdraw(amount) {
    return await this.call('withdraw', {
      action: 'apply',
      amount: amount
    });
  }
  
  /**
   * 获取佣金记录
   */
  static async getCommissions(options = {}) {
    return await this.call('commission', {
      action: 'list',
      ...options
    });
  }
}

/**
 * 存储操作封装
 */
class Storage {
  /**
   * 上传文件
   */
  static async upload(filePath, cloudPath) {
    try {
      const res = await wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: filePath
      });
      return res.fileID;
    } catch (err) {
      console.error('上传文件失败', err);
      return null;
    }
  }
  
  /**
   * 下载文件
   */
  static async download(fileID) {
    try {
      const res = await wx.cloud.downloadFile({
        fileID: fileID
      });
      return res.tempFilePath;
    } catch (err) {
      console.error('下载文件失败', err);
      return null;
    }
  }
  
  /**
   * 删除文件
   */
  static async delete(fileIDs) {
    try {
      await wx.cloud.deleteFile({
        fileList: [].concat(fileIDs)
      });
      return true;
    } catch (err) {
      console.error('删除文件失败', err);
      return false;
    }
  }
}

/**
 * 工具函数
 */
const Utils = {
  /**
   * 格式化价格
   */
  formatPrice(price) {
    if (price == 0) return '免费';
    return '¥' + (price / 100).toFixed(2);
  },
  
  /**
   * 格式化时间
   */
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },
  
  /**
   * 格式化日期
   */
  formatDate(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
  
  /**
   * 格式化时长（秒转分钟:秒）
   */
  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  },
  
  /**
   * 格式化时长（秒转小时:分钟）
   */
  formatDurationLong(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
  },
  
  /**
   * 数字格式化（添加千分位）
   */
  formatNumber(num) {
    return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },
  
  /**
   * 节流函数
   */
  throttle(fn, delay = 300) {
    let timer = null;
    return function(...args) {
      if (timer) return;
      timer = setTimeout(() => {
        fn.apply(this, args);
        timer = null;
      }, delay);
    };
  },
  
  /**
   * 防抖函数
   */
  debounce(fn, delay = 300) {
    let timer = null;
    return function(...args) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    };
  },
  
  /**
   * 生成唯一ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
  
  /**
   * 复制到剪贴板
   */
  copyToClipboard(text) {
    return wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: '复制成功',
          icon: 'success'
        });
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        });
      }
    });
  },
  
  /**
   * 显示加载提示
   */
  showLoading(title = '加载中...') {
    if (wx.showLoading) {
      wx.showLoading({ title, mask: true });
    } else {
      wx.showNavigationBarLoading();
    }
  },
  
  /**
   * 隐藏加载提示
   */
  hideLoading() {
    if (wx.hideLoading) {
      wx.hideLoading();
    } else {
      wx.hideNavigationBarLoading();
    }
  },
  
  /**
   * 错误提示
   */
  showError(msg = '请求失败') {
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 2000
    });
  },
  
  /**
   * 成功提示
   */
  showSuccess(msg = '操作成功') {
    wx.showToast({
      title: msg,
      icon: 'success',
      duration: 1500
    });
  },
  
  /**
   * 确认对话框
   */
  showConfirm(title, content) {
    return new Promise((resolve) => {
      wx.showModal({
        title: title,
        content: content,
        success: (res) => {
          resolve(res.confirm);
        }
      });
    });
  },
  
  /**
   * 页面跳转
   */
  navigateTo(url) {
    wx.navigateTo({ url });
  },
  
  /**
   * 跳转到TabBar页面
   */
  switchTab(url) {
    wx.switchTab({ url });
  },
  
  /**
   * 返回上一页
   */
  navigateBack(delta = 1) {
    wx.navigateBack({ delta });
  },
  
  /**
   * 获取页面参数
   */
  getPageParams() {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    return currentPage.options || {};
  },
  
  /**
   * 打电话
   */
  makePhoneCall(phoneNumber) {
    wx.makePhoneCall({
      phoneNumber: phoneNumber
    });
  },
  
  /**
   * 保存图片到相册
   */
  saveImageToAlbum(filePath) {
    return wx.saveImageToPhotosAlbum({
      filePath: filePath
    });
  },
  
  /**
   * 预览图片
   */
  previewImage(urls, current = 0) {
    wx.previewImage({
      urls: [].concat(urls),
      current: urls[current] || urls[0]
    });
  },
  
  /**
   * 设置剪贴板
   */
  setClipboardData(data) {
    wx.setClipboardData({
      data: data
    });
  },
  
  /**
   * 获取剪贴板内容
   */
  getClipboardData() {
    return new Promise((resolve) => {
      wx.getClipboardData({
        success: (res) => resolve(res.data),
        fail: () => resolve('')
      });
    });
  },
  
  /**
   * 获取设备信息
   */
  getSystemInfo() {
    return wx.getSystemInfoSync();
  },
  
  /**
   * 获取状态栏高度
   */
  getStatusBarHeight() {
    const info = wx.getSystemInfoSync();
    return info.statusBarHeight || 20;
  },
  
  /**
   * 获取胶囊按钮位置
   */
  getMenuButtonBoundingClientRect() {
    return wx.getMenuButtonBoundingClientRect();
  },
  
  /**
   * 计算导航栏高度
   */
  getNavBarHeight() {
    const statusBarHeight = this.getStatusBarHeight();
    const menuButton = this.getMenuButtonBoundingClientRect();
    if (menuButton) {
      return menuButton.bottom + menuButton.top - statusBarHeight * 2 + 8;
    }
    return statusBarHeight + 44;
  }
};

module.exports = {
  Database,
  CloudFunction,
  Storage,
  Utils
};
