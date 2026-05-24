const coursesData = require('../../../data/courses_data.js');
const categoriesData = require('../../../data/categories_data.js');
const chapters1 = require('../../../data/chapters_data_1.js');
const chapters2 = require('../../../data/chapters_data_2.js');
const chapters3 = require('../../../data/chapters_data_3.js');
const chapters4 = require('../../../data/chapters_data_4.js');

const db = wx.cloud.database();

Page({
  data: {
    importing: false,
    completed: false,
    done: 0,
    total: 0,
    percent: 0,
    results: [],
    step: ''
  },

  async startImport() {
    const allChapters = [...chapters1, ...chapters2, ...chapters3, ...chapters4];
    const total = allChapters.length + coursesData.length + categoriesData.length;
    
    this.setData({ 
      importing: true, 
      completed: false, 
      done: 0, 
      total: total, 
      percent: 0, 
      results: [],
      step: '导入课程...'
    });

    let done = 0;
    let results = [];

    // Step 1: Import courses
    this.setData({ step: '导入课程数据...' });
    for (const course of coursesData) {
      try {
        await db.collection('courses').add({ data: course });
        results.push({ title: course.name || course.title || '课程', success: true });
      } catch (err) {
        results.push({ title: course.name || course.title || '课程', success: false, error: err.message || '' });
      }
      done++;
      this.setData({ done, percent: Math.round(done / total * 100), results });
    }

    // Step 2: Import categories
    this.setData({ step: '导入分类数据...' });
    for (const cat of categoriesData) {
      try {
        await db.collection('categories').add({ data: cat });
        results.push({ title: cat.name || '分类', success: true });
      } catch (err) {
        results.push({ title: cat.name || '分类', success: false, error: err.message || '' });
      }
      done++;
      this.setData({ done, percent: Math.round(done / total * 100), results });
    }

    // Step 3: Import chapters
    this.setData({ step: '导入章节内容...' });
    for (const chapter of allChapters) {
      try {
        await db.collection('chapters').add({ data: chapter });
        results.push({ title: chapter.title || '章节', success: true });
      } catch (err) {
        results.push({ title: chapter.title || '章节', success: false, error: err.message || '' });
      }
      done++;
      this.setData({ done, percent: Math.round(done / total * 100), results });
    }

    const successCount = results.filter(r => r.success).length;
    this.setData({ importing: false, completed: true, step: `完成！${successCount}/${total} 成功` });
    wx.showToast({ title: `导入完成 ${successCount}/${total}`, icon: 'none', duration: 3000 });
  }
});
