// ================================================================
// generateReportWorker · 异步报告生成云函数
// 这是一个独立的云函数，需要单独创建
// 路径：cloudfunctions/generateReportWorker/index.js
// ================================================================

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const DEEPSEEK_API_KEY = 'sk-351fa645c76d48cea4f1f9317d69fac4';

const DIMENSIONS = {
  interest: { name: '兴趣与方向' },
  family: { name: '家庭资源' },
  academic: { name: '学业与竞争' },
  location: { name: '地域与时间价值' },
  industry: { name: '行业周期认知' },
  personality: { name: '性格与执行力' }
};

exports.main = async (event) => {
  const { openid, task_id } = event;

  try {
    // 获取用户信息
    const userRes = await db.collection('zexiao_users').where({ _openid: openid }).get();
    if (userRes.data.length === 0) throw new Error('用户不存在');
    const user = userRes.data[0];

    // 获取画像
    const profileRes = await db.collection('zexiao_profiles').where({ _openid: openid }).get();
    if (profileRes.data.length === 0) throw new Error('画像不存在');
    const profile = profileRes.data[0];

    // 获取变化日志
    const logsRes = await db.collection('zexiao_logs')
      .where({ _openid: openid })
      .orderBy('createTime', 'asc')
      .get();

    // 构建画像摘要
    const profileSummary = buildProfileSummary(profile);

    // 构建成长轨迹文字
    const growthText = logsRes.data.length > 0
      ? logsRes.data.map((l, i) => '第' + (i + 1) + '次更新：' + l.change_summary).join('\n')
      : '暂无成长记录';

    // 生成完整报告
    const reportPrompt = '你是智择通AI择校顾问，请基于以下用户画像生成一份完整的择校分析报告。\n\n## 用户基本情况\n阶段：' + (user.q1 || '未知') + '\n成绩：' + (user.q2 || '未知') + '\n地域倾向：' + (user.q3 || '未知') + '\n家庭方向：' + (user.q4 || '未知') + '\n身份：' + (user.role === 'parent' ? '家长' : '学生') + '\n\n## 画像摘要\n' + profileSummary + '\n\n## 认知成长轨迹\n' + growthText + '\n\n## 报告结构要求（按顺序输出，用【】标注章节）\n\n【综合评估】\n对这个学生整体情况的直接判断，200字以内，说真话，不客套。\n\n【核心洞察】\n3条最关键的发现，每条用"▶"开头，50字以内，具体有价值。\n\n【推荐学校方向】\n根据成绩、兴趣、家庭资源、地域，推荐3个学校方向。\n每个方向格式：学校名称 | 推荐专业 | 推荐理由（重点说资源匹配）\n\n【行业周期判断】\n结合康波周期，判断用户感兴趣方向4-7年后的行业位置。\n明确说：现在入场是好时机还是需要警惕。\n\n【地域价值分析】\n根据用户的地域倾向，分析选择这个城市对长期发展的影响。\n对比不同城市的时间价值差异，给出具体建议。\n\n【家庭资源匹配】\n如何利用家庭现有资源，和学校资源叠加。\n如果家庭资源不足，说清楚需要补什么。\n\n【关键风险提示】\n最需要警惕的2个风险，直接说，不要绕弯子。\n\n【认知成长轨迹】\n基于对话记录，描述用户在这段时间里认知发生了哪些变化。\n这部分要有温度，让用户感受到被真正理解。\n\n【下一步行动计划】\n5个具体可执行的步骤，每步用数字标注，动词开头，可操作。\n\n语气：像顾问说话，直接、真实、有判断力，不说废话。';

    const reportContent = await callDeepSeekFull(reportPrompt, 2500);

    // 构建成长日志摘要
    const growthLog = logsRes.data.map(function(l) {
      return {
        time: l.createTime,
        summary: l.change_summary,
        completion_before: l.completion_before,
        completion_after: l.completion_after
      };
    });

    // 更新报告状态为完成
    const reportRes = await db.collection('zexiao_reports')
      .where({ task_id: task_id, _openid: openid }).get();
    if (reportRes.data.length > 0) {
      await db.collection('zexiao_reports').doc(reportRes.data[0]._id).update({
        data: {
          status: 'completed',
          content: reportContent,
          growth_log: growthLog,
          completeTime: db.serverDate()
        }
      });
    }

    // 更新用户报告计数
    await db.collection('zexiao_users')
      .where({ _openid: openid })
      .update({
        data: {
          reportCount: db.command.inc(1),
          lastReportTime: db.serverDate()
        }
      });

    return { code: 0, message: '报告生成成功' };

  } catch (err) {
    console.error('generateReportWorker error:', err);

    // 更新报告状态为失败
    try {
      const reportRes = await db.collection('zexiao_reports')
        .where({ task_id: task_id, _openid: openid }).get();
      if (reportRes.data.length > 0) {
        await db.collection('zexiao_reports').doc(reportRes.data[0]._id).update({
          data: {
            status: 'failed',
            error: err.message,
            failTime: db.serverDate()
          }
        });
      }
    } catch (e) {}

    return { code: 500, message: err.message };
  }
};

// ── DeepSeek 调用 ──
function callDeepSeekFull(content, maxTokens) {
  maxTokens = maxTokens || 2500;
  return new Promise(function(resolve, reject) {
    var postData = JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: content }],
      max_tokens: maxTokens,
      temperature: 0.7
    });
    var options = {
      hostname: 'api.deepseek.com',
      path: '/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + DEEPSEEK_API_KEY,
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    var req = require('https').request(options, function(res) {
      var d = '';
      res.on('data', function(c) { d += c; });
      res.on('end', function() {
        try {
          var parsed = JSON.parse(d);
          if (parsed.error) { reject(new Error(parsed.error.message)); return; }
          var text = parsed.choices && parsed.choices[0] && parsed.choices[0].message && parsed.choices[0].message.content;
          if (text) resolve(text);
          else reject(new Error('API返回格式异常'));
        } catch (e) { reject(new Error('解析失败: ' + d.slice(0, 200))); }
      });
    });
    req.on('error', function(err) { reject(new Error('网络错误: ' + err.message)); });
    req.setTimeout(55000, function() {
      req.destroy();
      reject(new Error('请求超时'));
    });
    req.write(postData);
    req.end();
  });
}

// ── 画像摘要 ──
function buildProfileSummary(profile) {
  return Object.entries(profile.dimensions || {}).map(function(entry) {
    var key = entry[0];
    var dim = entry[1];
    var filled = Object.entries(dim.items || {})
      .filter(function(itemEntry) { return itemEntry[1].filled && itemEntry[1].value; })
      .map(function(itemEntry) { return itemEntry[1].name + ':' + itemEntry[1].value; })
      .join('、');
    return (dim.name || key) + '(' + (dim.completion || 0) + '%)：' + (filled || '信息不足');
  }).join('\n');
}
