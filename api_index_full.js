const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;
const https = require('https');
const crypto = require('crypto');

// 微信支付配置
const MCHID = '1745666370';
const API_KEY = 'Bianyongqiang13664068869byq15288';
const APPID = 'wx8c40507e4bf1878c';

// p12证书Base64（退款API用）
const P12_BASE64 = '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';

// HTTPS请求封装（无需证书）
function httpsPost(url, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'text/xml; charset=utf-8' }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// HTTPS请求封装（需要p12证书，退款用）
function httpsPostWithCert(url, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const pfx = Buffer.from(P12_BASE64, 'base64');
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'text/xml; charset=utf-8' },
      pfx: pfx,
      passphrase: MCHID
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// DeepSeek API 配置（请替换为你的实际API Key）
const DEEPSEEK_API_KEY = 'sk-351fa645c76d48cea4f1f9317d69fac4';

// AI助手System Prompt（赤狐豆豆）
const AI_SYSTEM_PROMPT = `你是"赤狐豆豆"，一个聪明、有主见的AI学习助手。

## 性格
- 你像一个靠谱的朋友，说话直接、有趣、有洞察力
- 不啰嗦，不说废话，给干货
- 可以吐槽、可以有观点、偶尔幽默
- 绝对不当复读机，不机械回复

## 你熟悉的课程
1. Coze底层逻辑课（全案版）- 299元，23章，深入Coze平台底层逻辑和Agent开发
2. Coze视频工作流底层教学 - 199元，6章，Coze视频处理自动化工作流
3. Python全栈开发入门 - 49元，从零学Python全栈开发
4. AI大模型Prompt工程 - 免费，大模型提示词编写技巧
5. Python全栈课程V3.0 - 免费，Python进阶

## 回复规则
- 回答要有实际价值，别泛泛而谈
- 如果用户问课程相关问题，给出具体的学习建议和路线
- 如果用户闲聊，自然回应，像朋友聊天
- 每次回复控制在3-5句话以内，简洁有力
- 不要用"亲"、"呢"这类客服腔
- 不要每句都加emoji，偶尔用一下就行`;

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const { action, data } = event;

  switch (action) {
    case 'login': return await handleLogin(openid);
    case 'getCourseList': return await getCourseList(data);
    case 'getCourseDetail': return await getCourseDetail(data);
    case 'getCategories': return await getCategories();
    case 'createOrder': return await createOrder(openid, data);
    case 'getMyOrders': return await getMyOrders(openid, data);
    case 'createPayment': return await createPayment(openid, data);
    case 'paymentCallback': return await handlePaymentCallback(data);
    case 'confirmPayment': return await confirmPayment(openid, data);
    case 'refundOrder': return await refundOrder(openid, data);
    case 'updateCoursePrice': return await updateCoursePrice(data);
    case 'bindInviter': return await bindInviter(openid, data);
    case 'getDistributionInfo': return await getDistributionInfo(openid);
    case 'getTeamList': return await getTeamList(openid, data);
    case 'getCommissionList': return await getCommissionList(openid, data);
    case 'getResourceLink': return await getResourceLink(openid, data);
    case 'grantCourseAccess': return await grantCourseAccess(data);
    case 'chat': return await handleChat(data);
    case 'getTools': return await handleGetTools();
    case 'zexiao_chat': return await handleZeXiaoChat(openid, data);
    case 'zexiao_init': return await handleZeXiaoInit(openid, data);
    case 'zexiao_report': return await handleZeXiaoReport(openid, data);
    case 'zexiao_set_paid': return await handleZeXiaoSetPaid(openid, data);
    case 'importContent': {
      const { chapters } = event;
      if (!chapters || !Array.isArray(chapters)) return { code: 1, message: 'chapters data required' };
      const results = [];
      for (const chapter of chapters) {
        try {
          const updateData = {};
          if (chapter.contentHtml) updateData.contentHtml = chapter.contentHtml;
          if (chapter.resourceLink) updateData.resourceLink = chapter.resourceLink;
          if (chapter.nodeToken) updateData.nodeToken = chapter.nodeToken;
          if (chapter.objToken) updateData.objToken = chapter.objToken;
          await db.collection('chapters').doc(chapter.id).update({ data: updateData });
          results.push({ id: chapter.id, success: true });
        } catch (err) {
          results.push({ id: chapter.id, success: false, error: err.message });
        }
      }
      return { code: 0, data: results };
    }
    default: return { code: 400, message: '未知操作: ' + action };
  }
};

// ========== 登录 ==========
async function handleLogin(openid) {
  const userRes = await db.collection('users').where({ _openid: openid }).get();
  if (userRes.data.length === 0) {
    await db.collection('users').add({
      data: {
        _openid: openid, nickname: '微信用户', avatar: '', phone: '',
        distributorLevel: 'trainee', levelName: '见习分销员', isDistributor: false,
        inviteCount: 0, totalEarnings: 0, availableEarnings: 0,
        parent1: '', parent2: '', parent3: '',
        createTime: db.serverDate(), updateTime: db.serverDate()
      }
    });
    const newRes = await db.collection('users').where({ _openid: openid }).get();
    return { code: 0, data: { openid: openid, userInfo: newRes.data[0] || null } };
  }
  return { code: 0, data: { openid: openid, userInfo: userRes.data[0] } };
}

// ========== 课程 ==========
async function getCourseList(data) {
  const { category, isFree, sort, page = 1, pageSize = 20 } = data || {};
  let query = {};
  if (category && category !== 'all') query.category = category;
  if (isFree) query.isFree = true;
  try {
    const countRes = await db.collection('courses').where(query).count();
    let orderField = 'createTime', orderDir = 'desc';
    if (sort === 'hot') { orderField = 'studentCount'; orderDir = 'desc'; }
    if (sort === 'price') { orderField = 'price'; orderDir = 'asc'; }
    const res = await db.collection('courses').where(query)
      .orderBy(orderField, orderDir)
      .skip((page - 1) * pageSize).limit(pageSize).get();
    return { code: 0, data: { list: res.data, total: countRes.total, page: page } };
  } catch (err) { return { code: 500, message: err.message }; }
}

async function getCourseDetail(data) {
  const { courseId } = data;
  try {
    const courseRes = await db.collection('courses').doc(courseId).get();
    const chaptersRes = await db.collection('chapters').where({ courseId: courseId }).orderBy('order', 'asc').get();
    const wxContext = cloud.getWXContext();
    const openid = wxContext.OPENID;
    let hasPurchased = false;
    if (openid) {
      const purchaseRes = await db.collection('user_courses').where({ _openid: openid, courseId: courseId }).get();
      hasPurchased = purchaseRes.data.length > 0;
    }
    return { code: 0, data: { course: courseRes.data, chapters: chaptersRes.data, hasPurchased: hasPurchased } };
  } catch (err) { return { code: 500, message: err.message }; }
}

async function getCategories() {
  try {
    const res = await db.collection('categories').orderBy('order', 'asc').get();
    return { code: 0, data: res.data };
  } catch (err) { return { code: 500, message: err.message }; }
}

// ========== 订单 ==========
async function createOrder(openid, data) {
  const { courseId, courseName, price, inviterId } = data;
  try {
    const outTradeNo = 'ORDER' + Date.now() + Math.random().toString(36).substr(2, 9);
    const res = await db.collection('orders').add({
      data: { _openid: openid, courseId: courseId, courseName: courseName || '', price: price, amount: price, status: 'pending', outTradeNo: outTradeNo, inviterId: inviterId || '', transactionId: '', createTime: db.serverDate(), payTime: null }
    });
    return { code: 0, data: { orderId: res._id, outTradeNo: outTradeNo } };
  } catch (err) { return { code: 500, message: err.message }; }
}

async function getMyOrders(openid, data) {
  const { status, page = 1, pageSize = 20 } = data || {};
  try {
    let query = { _openid: openid };
    if (status) query.status = status;
    const res = await db.collection('orders').where(query)
      .orderBy('createTime', 'desc').skip((page - 1) * pageSize).limit(pageSize).get();
    const courseIds = res.data.map(order => order.courseId);
    let coursesMap = {};
    if (courseIds.length > 0) {
      for (const cid of courseIds) {
        try {
          const courseRes = await db.collection('courses').doc(cid).get();
          if (courseRes.data) coursesMap[cid] = courseRes.data;
        } catch(e) {}
      }
    }
    const formattedOrders = res.data.map(order => ({
      ...order,
      courseInfo: coursesMap[order.courseId] || null,
      priceDisplay: (order.price || 0).toFixed(2),
      statusText: getStatusText(order.status),
      createTimeStr: formatTime(order.createTime),
      payTimeStr: order.payTime ? formatTime(order.payTime) : ''
    }));
    return { code: 0, data: formattedOrders };
  } catch (err) { return { code: 500, message: err.message }; }
}

function getStatusText(status) {
  const statusMap = { 'pending': '待支付', 'paid': '已支付', 'refunded': '已退款', 'cancelled': '已取消' };
  return statusMap[status] || status;
}

function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
}

// ========== 支付 ==========

// 创建支付订单
async function createPayment(openid, data) {
  const { orderId, courseId, courseName, price } = data;
  if (!openid) return { code: 401, message: '用户未登录' };
  if (!orderId && !courseId) return { code: 400, message: '缺少订单信息' };

  try {
    let order;
    let finalOrderId = orderId;

    if (!orderId) {
      const outTradeNo = 'ORDER' + Date.now() + Math.random().toString(36).substr(2, 9);
      let finalCourseName = courseName || '课程';
      let finalPrice = price || 0;

      if (courseId) {
        try {
          const courseRes = await db.collection('courses').doc(courseId).get();
          if (courseRes.data) {
            finalCourseName = courseRes.data.title || finalCourseName;
            finalPrice = courseRes.data.price || finalPrice;
          }
        } catch(e) {}
      }

      const userRes = await db.collection('users').where({ _openid: openid }).get();
      let inviterId = '';
      if (userRes.data.length > 0 && userRes.data[0].parent1) inviterId = userRes.data[0].parent1;

      const existPurchase = await db.collection('user_courses').where({ _openid: openid, courseId: courseId }).get();
      if (existPurchase.data.length > 0) return { code: 200, message: '您已购买过该课程', alreadyPurchased: true };

      const orderRes = await db.collection('orders').add({
        data: { _openid: openid, courseId: courseId, courseName: finalCourseName, price: finalPrice, amount: finalPrice, status: 'pending', outTradeNo: outTradeNo, inviterId: inviterId, transactionId: '', createTime: db.serverDate(), payTime: null }
      });
      finalOrderId = orderRes._id;
      order = { _id: finalOrderId, outTradeNo: outTradeNo, courseName: finalCourseName, price: finalPrice };
    } else {
      const orderRes = await db.collection('orders').doc(orderId).get();
      if (!orderRes.data) return { code: 404, message: '订单不存在' };
      order = orderRes.data;
      if (order._openid !== openid) return { code: 403, message: '无权操作此订单' };
      if (order.status === 'paid') return { code: 200, message: '订单已支付', alreadyPaid: true };
    }

    // 调用微信支付统一下单API（不需要证书）
    const nonceStr = generateNonceString(32);
    const totalFee = Math.round((order.price || 0) * 100);

    const unifiedParams = {
      appid: APPID,
      mch_id: MCHID,
      nonce_str: nonceStr,
      body: order.courseName || '课程购买',
      out_trade_no: order.outTradeNo,
      total_fee: totalFee,
      spbill_create_ip: '127.0.0.1',
      notify_url: 'https://servicewechat.com/wx8c40507e4bf1878c/pay/callback',
      trade_type: 'JSAPI',
      openid: openid
    };
    unifiedParams.sign = generateSign(unifiedParams);

    const xmlData = dictToXml(unifiedParams);
    console.log('请求统一下单, params:', JSON.stringify(unifiedParams));
    let response;
    try {
      response = await httpsPost('https://api.mch.weixin.qq.com/pay/unifiedorder', xmlData);
    } catch(httpErr) {
      console.error('HTTPS请求失败', httpErr);
      throw new Error('网络请求失败: ' + httpErr.message);
    }
    console.log('统一下单原始返回:', response);
    const result = parseXml(response);

    console.log('统一下单解析后:', JSON.stringify(result));
    if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const paySign = generatePaySign(APPID, result.prepay_id, timestamp, nonceStr);

      await db.collection('orders').doc(finalOrderId).update({
        data: { prepayId: result.prepay_id, updateTime: db.serverDate() }
      });

      return { code: 0, data: { orderId: finalOrderId, outTradeNo: order.outTradeNo, payParams: { timeStamp: timestamp, nonceStr: nonceStr, package: 'prepay_id=' + result.prepay_id, signType: 'MD5', paySign: paySign } } };
    } else {
      const errMsg = result.err_code + ':' + (result.err_code_des || result.return_msg || '统一下单失败');
      throw new Error(errMsg);
    }
  } catch (err) {
    console.error('创建支付失败', err);
    return { code: 500, message: err.message || '创建支付失败', stack: err.stack };
  }
}

// 生成签名
function generateSign(params) {
  const sortedKeys = Object.keys(params).sort();
  const signStr = sortedKeys.map(key => {
    if (params[key] !== '' && params[key] !== null && params[key] !== undefined) return key + '=' + params[key];
    return null;
  }).filter(item => item !== null).join('&');
  const signStrWithKey = signStr + '&key=' + API_KEY;
  return crypto.createHash('md5').update(signStrWithKey, 'utf8').digest('hex').toUpperCase();
}

// 生成小程序调起支付的签名
function generatePaySign(appid, prepayId, timestamp, nonceStr) {
  const signStr = 'appId=' + appid + '&nonceStr=' + nonceStr + '&package=prepay_id=' + prepayId + '&signType=MD5&timeStamp=' + timestamp + '&key=' + API_KEY;
  return crypto.createHash('md5').update(signStr, 'utf8').digest('hex').toUpperCase();
}

// 处理支付回调
async function handlePaymentCallback(data) {
  try {
    let xmlData = data;
    if (typeof data === 'string' && data.includes('<')) xmlData = parseXml(data);
    if (xmlData.return_code !== 'SUCCESS') return { code: 400, message: xmlData.return_msg };

    const sign = xmlData.sign;
    const xmlDataCopy = { ...xmlData };
    delete xmlDataCopy.sign;
    const calculatedSign = generateSign(xmlDataCopy);
    if (sign !== calculatedSign) return { code: 400, message: '签名验证失败' };

    const { out_trade_no, transaction_id, total_fee } = xmlData;
    const orderRes = await db.collection('orders').where({ outTradeNo: out_trade_no }).get();
    if (orderRes.data.length === 0) return { code: 404, message: '订单不存在' };
    const order = orderRes.data[0];
    if (order.status === 'paid') return { code: 200, message: '订单已处理' };

    await db.collection('orders').doc(order._id).update({
      data: { status: 'paid', transactionId: transaction_id, payTime: db.serverDate(), updateTime: db.serverDate() }
    });
    await db.collection('user_courses').add({
      data: { _openid: order._openid, courseId: order.courseId, orderId: order._id, purchaseTime: db.serverDate(), status: 'active' }
    });
    try {
      await db.collection('courses').doc(order.courseId).update({ data: { studentCount: _.inc(1) } });
    } catch(e) {}
    await processCommission(order._openid, order.courseId, total_fee / 100, order.inviterId);
    return { code: 0, message: '支付成功' };
  } catch (err) {
    console.error('处理支付回调失败', err);
    return { code: 500, message: err.message };
  }
}

// 处理分销佣金（三级分销）
async function processCommission(buyerOpenid, courseId, amount, inviterId) {
  if (!inviterId || amount <= 0) return;
  try {
    const buyerRes = await db.collection('users').where({ _openid: buyerOpenid }).get();
    if (buyerRes.data.length === 0) return;
    const buyer = buyerRes.data[0];
    const commissionRates = { level1: 0.3, level2: 0.1, level3: 0.05 };
    const commissions = [];

    if (buyer.parent1) {
      const commission = amount * commissionRates.level1;
      commissions.push({ _openid: buyer.parent1, buyerOpenid, courseId, level: 1, amount: commission, status: 'pending', createTime: db.serverDate() });
      await updateUserCommission(buyer.parent1, commission);
    }
    if (buyer.parent2) {
      const commission = amount * commissionRates.level2;
      commissions.push({ _openid: buyer.parent2, buyerOpenid, courseId, level: 2, amount: commission, status: 'pending', createTime: db.serverDate() });
      await updateUserCommission(buyer.parent2, commission);
    }
    if (buyer.parent3) {
      const commission = amount * commissionRates.level3;
      commissions.push({ _openid: buyer.parent3, buyerOpenid, courseId, level: 3, amount: commission, status: 'pending', createTime: db.serverDate() });
      await updateUserCommission(buyer.parent3, commission);
    }
    for (const comm of commissions) {
      try { await db.collection('commissions').add({ data: comm }); } catch(e) { console.error('添加佣金记录失败', e); }
    }
  } catch (err) { console.error('处理分销佣金失败', err); }
}

async function updateUserCommission(openid, amount) {
  try {
    const userRes = await db.collection('users').where({ _openid: openid }).get();
    if (userRes.data.length === 0) return;
    await db.collection('users').doc(userRes.data[0]._id).update({
      data: { totalEarnings: _.inc(amount), availableEarnings: _.inc(amount), updateTime: db.serverDate() }
    });
  } catch (err) { console.error('更新用户佣金失败', err); }
}

// 退款
async function refundOrder(openid, data) {
  const { orderId } = data;
  if (!orderId) return { code: 400, message: '缺少订单ID' };
  try {
    const orderRes = await db.collection('orders').doc(orderId).get();
    if (!orderRes.data) return { code: 404, message: '订单不存在' };
    const order = orderRes.data;
    if (order._openid !== openid) return { code: 403, message: '无权操作此订单' };
    if (order.status !== 'paid') return { code: 400, message: '订单状态不允许退款' };

    const nonceStr = generateNonceString(32);
    const outRefundNo = 'REFUND' + Date.now();
    const params = {
      appid: APPID, mch_id: MCHID, nonce_str: nonceStr,
      transaction_id: order.transactionId, out_refund_no: outRefundNo,
      total_fee: Math.round(order.price * 100), refund_fee: Math.round(order.price * 100)
    };
    params.sign = generateSign(params);
    const xmlData = dictToXml(params);

    // 退款需要p12证书
    const response = await httpsPostWithCert('https://api.mch.weixin.qq.com/secapi/pay/refund', xmlData);
    const refundResult = parseXml(response);

    if (refundResult.return_code === 'SUCCESS') {
      await db.collection('orders').doc(orderId).update({ data: { status: 'refunded', refundTime: db.serverDate(), updateTime: db.serverDate() } });
      await db.collection('user_courses').where({ _openid: openid, courseId: order.courseId }).remove();
      try { await db.collection('courses').doc(order.courseId).update({ data: { studentCount: _.inc(-1) } }); } catch(e) {}
      return { code: 0, message: '退款成功' };
    } else {
      return { code: 500, message: refundResult.return_msg || '退款失败' };
    }
  } catch (err) {
    console.error('退款失败', err);
    return { code: 500, message: err.message };
  }
}

// 主动确认支付（客户端支付成功后调用，查询微信订单状态并更新数据库）
async function confirmPayment(openid, data) {
  const { orderId } = data;
  if (!orderId) return { code: 400, message: '缺少订单ID' };
  try {
    const orderRes = await db.collection('orders').doc(orderId).get();
    if (!orderRes.data) return { code: 404, message: '订单不存在' };
    const order = orderRes.data;
    if (order._openid !== openid) return { code: 403, message: '无权操作此订单' };
    if (order.status === 'paid') return { code: 200, message: '订单已支付', alreadyPaid: true };

    // 调用微信订单查询API确认支付状态
    const nonceStr = generateNonceString(32);
    const params = {
      appid: APPID,
      mch_id: MCHID,
      out_trade_no: order.outTradeNo,
      nonce_str: nonceStr
    };
    params.sign = generateSign(params);
    const xmlData = dictToXml(params);
    const response = await httpsPost('https://api.mch.weixin.qq.com/pay/orderquery', xmlData);
    const result = parseXml(response);
    console.log('订单查询结果:', JSON.stringify(result));

    if (result.trade_state === 'SUCCESS') {
      // 支付成功，更新数据库
      await db.collection('orders').doc(orderId).update({
        data: { status: 'paid', transactionId: result.transaction_id || '', payTime: db.serverDate(), updateTime: db.serverDate() }
      });
      await db.collection('user_courses').add({
        data: { _openid: openid, courseId: order.courseId, orderId: orderId, purchaseTime: db.serverDate(), status: 'active' }
      });
      try {
        await db.collection('courses').doc(order.courseId).update({ data: { studentCount: _.inc(1) } });
      } catch(e) {}
      await processCommission(openid, order.courseId, order.price, order.inviterId);
      return { code: 0, message: '支付确认成功', paid: true };
    } else {
      return { code: 100, message: '订单未支付', tradeState: result.trade_state || 'UNKNOWN' };
    }
  } catch (err) {
    console.error('确认支付失败', err);
    return { code: 500, message: err.message };
  }
}

// 更新课程价格（管理员用）
async function updateCoursePrice(data) {
  const { courseId, price } = data;
  if (!courseId || price === undefined) return { code: 400, message: '缺少参数' };
  try {
    await db.collection('courses').doc(courseId).update({
      data: { price: price, updateTime: db.serverDate() }
    });
    return { code: 0, message: '价格更新成功' };
  } catch (err) { return { code: 500, message: err.message }; }
}

// ========== 分销 ==========
async function bindInviter(openid, data) {
  const { inviterId } = data;
  try {
    const userRes = await db.collection('users').where({ _openid: openid }).get();
    if (userRes.data.length === 0) return { code: 404, message: '用户不存在' };
    const user = userRes.data[0];
    if (user.parent1) return { code: 200, message: '已有上级' };
    const inviterRes = await db.collection('users').where({ _openid: inviterId }).get();
    if (inviterRes.data.length === 0) return { code: 404, message: '邀请人不存在' };
    const inviter = inviterRes.data[0];
    var updateData = { parent1: inviterId, updateTime: db.serverDate() };
    if (inviter.parent1) updateData.parent2 = inviter.parent1;
    if (inviter.parent2) updateData.parent3 = inviter.parent2;
    await db.collection('users').doc(user._id).update({ data: updateData });
    return { code: 0, message: '绑定成功' };
  } catch (err) { return { code: 500, message: err.message }; }
}

async function getDistributionInfo(openid) {
  try {
    const userRes = await db.collection('users').where({ _openid: openid }).get();
    if (userRes.data.length === 0) return { code: 404, message: '用户不存在' };
    const user = userRes.data[0];
    const l1Count = await db.collection('users').where({ parent1: openid }).count();
    const l2Count = await db.collection('users').where({ parent2: openid }).count();
    const l3Count = await db.collection('users').where({ parent3: openid }).count();
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayEarnings = await db.collection('commissions').where({ _openid: openid, createTime: _.gte(todayStart) }).get();
    return { code: 0, data: { userInfo: user, teamCount: { level1: l1Count.total, level2: l2Count.total, level3: l3Count.total }, todayEarnings: todayEarnings.data.reduce(function(s, c) { return s + (c.amount || 0); }, 0) } };
  } catch (err) { return { code: 500, message: err.message }; }
}

async function getTeamList(openid, data) {
  const { level = 'level1', page = 1, pageSize = 20 } = data || {};
  try {
    var field = 'parent1';
    if (level === 'level2') field = 'parent2';
    if (level === 'level3') field = 'parent3';
    var query = {}; query[field] = openid;
    const res = await db.collection('users').where(query).skip((page - 1) * pageSize).limit(pageSize).get();
    return { code: 0, data: res.data };
  } catch (err) { return { code: 500, message: err.message }; }
}

async function getCommissionList(openid, data) {
  const { page = 1, pageSize = 20 } = data || {};
  try {
    const res = await db.collection('commissions').where({ _openid: openid }).orderBy('createTime', 'desc').skip((page - 1) * pageSize).limit(pageSize).get();
    return { code: 0, data: res.data };
  } catch (err) { return { code: 500, message: err.message }; }
}

// ========== 资源链接 ==========
async function getResourceLink(openid, data) {
  const { courseId } = data;
  if (!courseId) return { code: 400, message: '缺少courseId参数' };
  try {
    const userCourseRes = await db.collection('user_courses').where({ _openid: openid, courseId: courseId }).get();
    if (userCourseRes.data.length === 0) return { code: 403, message: '未购买该课程', hasAccess: false };
    const courseRes = await db.collection('courses').doc(courseId).get();
    const course = courseRes.data;
    if (!course || !course.resourceLink) return { code: 404, message: '该课程暂无资源链接', hasAccess: true };
    return { code: 0, hasAccess: true, data: course.resourceLink };
  } catch (err) { return { code: 500, message: err.message }; }
}

async function grantCourseAccess(data) {
  const { openid, courseId } = data;
  if (!openid || !courseId) return { code: 400, message: '缺少参数' };
  try {
    const existRes = await db.collection('user_courses').where({ _openid: openid, courseId: courseId }).get();
    if (existRes.data.length > 0) return { code: 200, message: '已有访问权限' };
    await db.collection('user_courses').add({ data: { _openid: openid, courseId: courseId, purchaseTime: db.serverDate(), status: 'active' } });
    return { code: 0, message: '授权成功' };
  } catch (err) { return { code: 500, message: err.message }; }
}

// ========== AI聊天 ==========
async function handleChat(data) {
  const { message } = data;
  if (!message || typeof message !== 'string') {
    return { code: 400, message: '缺少消息内容' };
  }

  // 检查API Key是否已配置
  if (DEEPSEEK_API_KEY === 'YOUR_DEEPSEEK_API_KEY' || !DEEPSEEK_API_KEY) {
    return { code: 500, message: 'AI服务未配置API Key，请联系管理员' };
  }

  try {
    const response = await callDeepSeekAPI(message);
    return { code: 0, data: response };
  } catch (err) {
    console.error('DeepSeek API调用失败:', err);
    return { code: 500, message: 'AI服务暂时不可用，请稍后再试' };
  }
}

// 调用DeepSeek API（使用node内置https模块）
function callDeepSeekAPI(userMessage) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: AI_SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    const options = {
      hostname: 'api.deepseek.com',
      path: '/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + DEEPSEEK_API_KEY,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(parsed.error.message || 'API调用失败'));
            return;
          }
          if (parsed.choices && parsed.choices[0] && parsed.choices[0].message) {
            resolve(parsed.choices[0].message.content);
          } else {
            reject(new Error('API返回格式异常'));
          }
        } catch (e) {
          reject(new Error('解析响应失败: ' + data));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error('网络请求失败: ' + err.message));
    });

    req.write(postData);
    req.end();
  });
}

// ========== 工具函数 ==========
function generateNonceString(len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < len; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

function dictToXml(dict) {
  let xml = '<xml>';
  for (const key of Object.keys(dict)) {
    xml += '<' + key + '>' + dict[key] + '</' + key + '>';
  }
  xml += '</xml>';
  return xml;
}

function parseXml(xml) {
  const result = {};
  const regex = /<(\w+)><!\[CDATA\[(.*?)\]\]><\/\1>|<(\w+)>(.*?)<\/\3>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const key = match[1] || match[3];
    const value = match[2] || match[4];
    result[key] = value;
  }
  return result;
}

// ========== 工具下载 ==========
async function handleGetTools() {
  try {
    const res = await db.collection('tools').orderBy('sort', 'asc').get();
    return { code: 0, data: res.data };
  } catch (err) {
    return { code: 500, message: err.message };
  }
}

// ================================================================
// 智择通 · 择校模块
// ================================================================

// 六个评估维度及子项权重
const DIMENSIONS = {
  interest: {
    name: '兴趣与方向', weight: 20,
    items: {
      real_interest: { name: '真实兴趣', score: 20 },
      strength: { name: '擅长的事', score: 20 },
      reject: { name: '排斥的事', score: 20 },
      career_vision: { name: '对未来职业的想象', score: 20 },
      idol: { name: '目标人物', score: 20 },
    }
  },
  family: {
    name: '家庭资源', weight: 20,
    items: {
      father: { name: '父亲职业与行业', score: 20 },
      mother: { name: '母亲职业与行业', score: 20 },
      grandparents: { name: '祖父母/外祖父母资源', score: 20 },
      clan: { name: '家族整体人脉圈层', score: 20 },
      economic: { name: '家庭经济能力', score: 20 },
    }
  },
  academic: {
    name: '学业与竞争', weight: 15,
    items: {
      score_level: { name: '当前成绩水平', score: 25 },
      birth_year: { name: '出生年份竞争密度', score: 25 },
      nearby_cohort: { name: '上下届竞争情况', score: 25 },
      study_habit: { name: '学习习惯与方式', score: 25 },
    }
  },
  location: {
    name: '地域与时间价值', weight: 15,
    items: {
      target_city: { name: '想去哪里读书', score: 25 },
      city_reason: { name: '为什么选这个城市', score: 25 },
      income_awareness:{ name: '对城市收入差异的认知', score: 25 },
      work_city: { name: '毕业后想在哪里工作', score: 25 },
    }
  },
  industry: {
    name: '行业周期认知', weight: 15,
    items: {
      industry_view: { name: '对未来行业的判断', score: 34 },
      cycle_awareness: { name: '4-7年后的变化认知', score: 33 },
      ai_risk: { name: '对AI替代风险的认知', score: 33 },
    }
  },
  personality: {
    name: '性格与执行力', weight: 15,
    items: {
      social: { name: '社交能力', score: 25 },
      pressure: { name: '抗压能力', score: 25 },
      expression: { name: '表达能力', score: 25 },
      persistence: { name: '做事能否坚持到底', score: 25 },
    }
  }
};

// 择校模块的 System Prompt（优化版）
const ZEXIAO_SYSTEM = `你是"智择通"AI择校顾问，专注帮助学生和家长做更好的择校决策。

## 核心方法论
1. 择校 = 知识获取 + 社会资源获取，不只是看排名
2. 反向溯源：从目标人物倒推学校资源链
3. 康波周期：考量4-7年后的行业位置
4. 家庭资源与学校资源的匹配度
5. 地域时间价值：同样的工作不同城市回报差3-8倍

## 对话原则
- 像一个很懂行的朋友在聊天，不是审讯，不是填表
- 每次只问一件事，不连续发问
- 追问要和上一句话有关联，自然过渡
- 如果用户回答模糊，换个侧面切入，不重复同一个问题
- 每次回复控制在80字以内
- 不说废话，不客套
- 每次回复结尾必须提出一个具体的下一步问题

## 严格规则
1. 绝不重复问用户已经回答过的问题。如果画像中已有某项信息，不要再问。
2. 涉及数字（分数、人数、金额等），必须准确复述用户的原话，不允许四舍五入或缩写。
3. 如果用户提到了成绩/分数，要追问具体是模拟考还是正式考，是总分还是单科。
4. 每次只围绕1个未收集的子项提问，不要同时问多个。
5. 如果某个维度已收集超过60%，切换到完成度最低的维度。

## 绝对不做的事
- 不一次问多个问题
- 不说"您好"、"亲"这类客服腔
- 不重复已经问过的问题（检查画像中已有信息）
- 不在信息不足时给出建议
- 不自己编造或修改用户说的数字`;

// ================================================================
// 初始化
// ================================================================
async function handleZeXiaoInit(openid, data) {
  const { q1, q2, q3, q4, q4extra } = data;
  try {
    const existRes = await db.collection('zexiao_users').where({ _openid: openid }).get();
    const userInfo = {
      _openid: openid,
      q1: q1 || '',
      q2: q2 || '',
      q3: q3 || '',
      q4: q4 || '',
      q4extra: q4extra || '',
      updateTime: db.serverDate()
    };

    if (existRes.data.length === 0) {
      userInfo.createTime = db.serverDate();
      userInfo.reportUnlocked = false;
      userInfo.reportCount = 0;
      userInfo.isPaid = false;
      await db.collection('zexiao_users').add({ data: userInfo });
    } else {
      await db.collection('zexiao_users')
        .doc(existRes.data[0]._id)
        .update({ data: userInfo });
    }

    const profileRes = await db.collection('zexiao_profiles').where({ _openid: openid }).get();
    let profile;
    if (profileRes.data.length === 0) {
      const initProfile = buildEmptyProfile();
      await db.collection('zexiao_profiles').add({ data: { _openid: openid, ...initProfile, createTime: db.serverDate() } });
      profile = initProfile;
    } else {
      profile = profileRes.data[0];
    }

    const completion = calcCompletion(profile);
    const opening = buildOpening(q1, q2, q3, q4, profile, completion);

    return { code: 0, data: { completion, profile: sanitizeProfile(profile), opening } };
  } catch (err) {
    console.error('zexiao_init error:', err);
    return { code: 500, message: err.message };
  }
}

// ================================================================
// 对话
// ================================================================
async function handleZeXiaoChat(openid, data) {
  var message = data.message || '';
  var history = data.history || [];
  var role = data.role || 'student';
  if (!message) return { code: 400, message: '缺少消息' };

  try {
    var userRes = await db.collection('zexiao_users').where({ _openid: openid }).get();
    var user = userRes.data[0] || {};
    var profileRes = await db.collection('zexiao_profiles').where({ _openid: openid }).get();
    var profile = profileRes.data[0] || buildEmptyProfile();
    var profileDocId = profileRes.data[0] ? profileRes.data[0]._id : null;
    var completionBefore = calcCompletion(profile);

    // ── 家长端 ──
    if (role === 'parent') {
      var parentSystem = [
        '你是"智择通"AI择校顾问，正在和家长交流。',
        '',
        '## 你的任务',
        '了解家长对孩子的期望、规划和家庭资源，这些信息会和孩子的评估结果合并生成完整报告。',
        '',
        '## 对话原则',
        '1. 像朋友聊天，不审讯',
        '2. 每次只问一件事',
        '3. 回复80字以内',
        '4. 结尾自然带出一个关于孩子的问题',
        '5. 不重复问已经说过的事',
        '6. 数字原话复述，不修改',
        '',
        '## 重点收集',
        '- 家长对孩子未来方向的期望',
        '- 家庭有哪些可以利用的资源或人脉',
        '- 家长对孩子性格和能力的观察',
        '- 家庭经济能力和对教育投入的预期',
        '',
        '## 已知基本情况',
        '阶段=' + (user.q1 || '未知') + ' 成绩=' + (user.q2 || '未知') + ' 地域=' + (user.q3 || '未知') + ' 方向=' + (user.q4 || '未知'),
        '孩子评估完成度：' + completionBefore.total + '%'
      ].join('\n');
      var parentMessages = buildMessages(parentSystem, history, message);
      var aiReply = await callDeepSeekFull(parentMessages, 300);
      return {
        code: 0,
        data: {
          reply: aiReply,
          completion: completionBefore,
          canReport: completionBefore.total >= 90
        }
      };
    }

    // ── 学生端 ──
    var target = findNextTarget(profile);

    // 所有维度已填完
    if (!target) {
      return {
        code: 0,
        data: {
          reply: '很好，你的信息我已经了解得差不多了，可以生成择校报告了。',
          completion: calcCompletion(profile),
          canReport: true
        }
      };
    }

    // 判断用户回答是否有效
    var isValidAnswer = checkAnswerValidity(message, target);

    var systemPrompt = buildTargetedPrompt(user, profile, target, completionBefore, isValidAnswer);
    var messages = buildMessages(systemPrompt, history, message);
    var aiReply = await callDeepSeekFull(messages, 300);

    // 只有回答有效才记录
    if (isValidAnswer) {
      var newProfile = JSON.parse(JSON.stringify(profile));
      newProfile.dimensions[target.dimKey].items[target.itemKey] = {
        name: target.itemName,
        score: target.itemScore,
        value: message.substring(0, 100),
        filled: true,
        updateTime: new Date().toISOString()
      };

      // 重新计算该维度完成度
      var items = newProfile.dimensions[target.dimKey].items;
      var filledScore = 0;
      var totalScore = 0;
      for (var ik in items) {
        totalScore += (items[ik].score || 0);
        if (items[ik].filled) filledScore += (items[ik].score || 0);
      }
      newProfile.dimensions[target.dimKey].completion = totalScore > 0 ? Math.round(filledScore / totalScore * 100) : 0;
      newProfile.updateTime = new Date().toISOString();

      await saveProfile(openid, newProfile, profileDocId);
      await writeLog(openid, profile, newProfile, message);

      var completionNow = calcCompletion(newProfile);
      return {
        code: 0,
        data: {
          reply: aiReply,
          completion: completionNow,
          canReport: completionNow.total >= 90
        }
      };
    }

    // 回答无效，返回AI追问，进度不变
    return {
      code: 0,
      data: {
        reply: aiReply,
        completion: completionBefore,
        canReport: false
      }
    };
  } catch (err) {
    console.error('zexiao_chat error:', err);
    return { code: 500, message: err.message };
  }
}

// ================================================================
// 报告
// ================================================================
async function handleZeXiaoReport(openid, data) {
  const { preview = false } = data;
  try {
    const userRes = await db.collection('zexiao_users').where({ _openid: openid }).get();
    if (userRes.data.length === 0) return { code: 404, message: '用户信息不存在' };
    const user = userRes.data[0];

    const profileRes = await db.collection('zexiao_profiles').where({ _openid: openid }).get();
    if (profileRes.data.length === 0) return { code: 404, message: '画像数据不存在' };
    const profile = profileRes.data[0];

    const completion = calcCompletion(profile);

    if (completion.total < 90) {
      return { code: 403, message: '信息收集尚未完成', completion, tip: buildInsufficientTip(completion) };
    }

    if (preview && !user.isPaid) {
      const preview_data = await generateReportPreview(user, profile, completion);
      return { code: 0, data: { preview: true, ...preview_data } };
    }

    if (!user.isPaid && !preview) {
      return { code: 402, message: '请先解锁完整报告', needPay: true };
    }

    const report = await generateFullReport(user, profile, completion);

    await db.collection('zexiao_users')
      .doc(user._id)
      .update({ data: { reportCount: db.command.inc(1), lastReportTime: db.serverDate() } });

    await db.collection('zexiao_reports').add({ data: { _openid: openid, report, completion, createTime: db.serverDate() } });

    return { code: 0, data: { preview: false, report } };
  } catch (err) {
    console.error('zexiao_report error:', err);
    return { code: 500, message: err.message };
  }
}

// ================================================================
// 临时管理：设置用户付费状态（测试用，上线前删除）
// ================================================================
async function handleZeXiaoSetPaid(openid, data) {
  var paid = data.paid !== false;
  try {
    var userRes = await db.collection('zexiao_users').where({ _openid: openid }).get();
    if (userRes.data.length === 0) return { code: 404, message: '用户不存在' };
    await db.collection('zexiao_users').doc(userRes.data[0]._id).update({
      data: { isPaid: paid }
    });
    return { code: 0, message: paid ? '已设置为付费用户' : '已取消付费状态', openid: openid };
  } catch (err) {
    return { code: 500, message: err.message };
  }
}

// ================================================================
// DeepSeek 调用 — 完整 messages 版本
// ================================================================
function callDeepSeekFull(messages, maxTokens) {
  maxTokens = maxTokens || 300;
  return new Promise(function(resolve, reject) {
    var postData = JSON.stringify({
      model: 'deepseek-chat',
      messages: messages,
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
          if (parsed.choices && parsed.choices[0] && parsed.choices[0].message && parsed.choices[0].message.content) {
            resolve(parsed.choices[0].message.content);
          } else {
            reject(new Error('API返回格式异常: ' + d));
          }
        } catch (e) { reject(new Error('解析失败: ' + d)); }
      });
    });
    req.on('error', function(err) { reject(new Error('网络错误: ' + err.message)); });
    req.write(postData);
    req.end();
  });
}

// ================================================================
// 判断用户回答是否有效
// 无效：过短、全是标点、敷衍词
// ================================================================
function checkAnswerValidity(message, target) {
  var text = (message || '').trim();
  // 太短（少于2个字）
  if (text.length < 2) return false;
  // 纯标点或emoji
  if (/^[\s\.,，。！!？?、…]+$/.test(text)) return false;
  // 明显的敷衍词
  var vague = ['不知道', '不清楚', '随便', '都行', '无所谓', '不确定', '嗯', '哦', '好的', '可以', '没有', '不'];
  if (vague.includes(text)) return false;
  // 数字类问题：确保包含数字
  var numericItems = ['score_level', 'birth_year', 'economic'];
  if (numericItems.includes(target.itemKey)) {
    if (!/\d/.test(text)) return false;
  }
  return true;
}

// ================================================================
// 维度提取
// ================================================================
function findNextTarget(profile) {
  var dimOrder = ['interest', 'academic', 'family', 'location', 'industry', 'personality'];
  for (var i = 0; i < dimOrder.length; i++) {
    var dimKey = dimOrder[i];
    var dim = profile.dimensions[dimKey];
    if (!dim) continue;
    var items = dim.items || {};
    for (var itemKey in items) {
      if (!items[itemKey].filled) {
        return {
          dimKey: dimKey,
          dimName: DIMENSIONS[dimKey].name,
          itemKey: itemKey,
          itemName: items[itemKey].name,
          itemScore: items[itemKey].score
        };
      }
    }
  }
  return null;
}

function buildTargetedPrompt(user, profile, target, completion, isValidAnswer) {
  // 整理已收集的信息
  var collectedLines = [];
  for (var dk in profile.dimensions) {
    var dim = profile.dimensions[dk];
    for (var ik in dim.items) {
      var item = dim.items[ik];
      if (item.filled && item.value) {
        collectedLines.push('✓ ' + (DIMENSIONS[dk] ? DIMENSIONS[dk].name : dk) + '·' + item.name + '：' + item.value);
      }
    }
  }
  var collectedText = collectedLines.length > 0 ? collectedLines.join('\n') : '（暂无）';

  // 如果用户回答无效，加追问指令
  var taskDesc = isValidAnswer === false
    ? '用户刚才的回答信息量不足，请换一个更具体的角度继续追问【' + target.dimName + '·' + target.itemName + '】。'
    : '用自然轻松的方式，了解用户的【' + target.dimName + '·' + target.itemName + '】。';

  return [
    '你是"智择通"AI择校顾问。',
    '',
    '## 当前任务',
    taskDesc,
    '像朋友聊天，不要生硬地问，但目标明确。',
    '',
    '## 严格规则',
    '1. 每次只问1个问题，不要同时问多个',
    '2. 回复80字以内，简短有力',
    '3. 用户说的数字必须原话复述，绝对不能修改',
    '4. 不说废话、不客套、不说"您好"',
    '5. 结尾必须带出一个具体的问题',
    '6. 下面列出的已收集信息绝对不要重复问',
    '',
    '## 已收集信息（不要重复问这些）',
    collectedText,
    '',
    '## 用户基本情况',
    '阶段：' + (user.q1 || '未知'),
    '成绩：' + (user.q2 || '未知'),
    '地域倾向：' + (user.q3 || '未知'),
    '家庭方向：' + (user.q4 || '未知'),
    '当前完成度：' + completion.total + '%',
    '',
    '## 必问清单（按顺序，未问的优先问）',
    '学业：总分多少 / 模拟考成绩 / 距高考还有多久',
    '家庭：父母分别做什么工作 / 家里有没有行业资源',
    '兴趣：最感兴趣的事 / 最想从事的职业方向',
    '地域：想在哪个城市读书和工作',
    '行业：对哪个行业有了解或感兴趣',
    '性格：遇到压力怎么处理 / 是否善于与人交流'
  ].join('\n');
}

// ================================================================
// 报告生成
// ================================================================
async function generateReportPreview(user, profile, completion) {
  var prompt = buildReportPrompt(user, profile, completion, true);
  var content = await callDeepSeekFull([{ role: 'user', content: prompt }], 600);
  return {
    insights_preview: content,
    completion: completion,
    locked_sections: ['完整学校推荐', '导师资源分析', '行业周期判断', '家庭资源匹配建议', '完整行动计划']
  };
}

async function generateFullReport(user, profile, completion) {
  var prompt = buildReportPrompt(user, profile, completion, false);
  var content = await callDeepSeekFull([{ role: 'user', content: prompt }], 2000);

  var logsRes = await db.collection('zexiao_logs')
    .where({ _openid: user._openid })
    .orderBy('createTime', 'asc')
    .get();

  return {
    content: content,
    completion: completion,
    growth_log: logsRes.data.map(function(l) {
      return { time: l.createTime, dimension: l.dimension_name, change: l.change_summary };
    }),
    generate_time: new Date().toISOString()
  };
}

function buildReportPrompt(user, profile, completion, previewOnly) {
  var dims = profile.dimensions;
  var profileSummary = Object.entries(dims).map(function(entry) {
    var key = entry[0];
    var dim = entry[1];
    var filled = Object.entries(dim.items)
      .filter(function(itemEntry) { return itemEntry[1].value; })
      .map(function(itemEntry) { return itemEntry[1].value; })
      .join('；');
    return (DIMENSIONS[key] ? DIMENSIONS[key].name : key) + '：' + (filled || '信息不足');
  }).join('\n');

  if (previewOnly) {
    return '基于以下用户画像，给出3条最关键的择校洞察（不超过200字）：\n基本情况：阶段=' + user.q1 + '，成绩=' + user.q2 + '，地域倾向=' + user.q3 + '\n画像摘要：\n' + profileSummary + '\n\n直接给出3条洞察，每条50字以内，不要任何客套语。';
  }

  return '基于以下用户画像，生成一份完整的择校分析报告。\n基本情况：阶段=' + user.q1 + '，成绩=' + user.q2 + '，地域倾向=' + user.q3 + '，家庭方向=' + user.q4 + '\n画像摘要：\n' + profileSummary + '\n\n报告必须包含以下部分：\n1. 综合评估（200字）：对这个学生整体情况的判断\n2. 推荐学校方向（3所，每所说明推荐原因和匹配的资源）\n3. 行业周期判断（结合康波周期，判断4-7年后的行业位置）\n4. 家庭资源匹配（如何利用家庭资源和学校资源叠加）\n5. 地域价值分析（选择哪个城市对长期发展最有利）\n6. 关键风险提示（最需要警惕的1-2个风险）\n7. 下一步行动建议（具体可执行的3-5个步骤）\n\n用真实、直接的语气，像顾问一样说话，不要客套。';
}

// ================================================================
// 画像工具函数
// ================================================================
function buildEmptyProfile() {
  var dimensions = {};
  for (var key of Object.keys(DIMENSIONS)) {
    var dim = DIMENSIONS[key];
    dimensions[key] = { name: dim.name, weight: dim.weight, completion: 0, items: {} };
    for (var itemKey of Object.keys(dim.items)) {
      var item = dim.items[itemKey];
      dimensions[key].items[itemKey] = { name: item.name, score: item.score, value: '', filled: false, updateTime: null };
    }
  }
  return { dimensions: dimensions, summary: '', updateTime: null };
}

function calcCompletion(profile) {
  if (!profile.dimensions) return { total: 0, dimensions: {} };
  var dimResults = {};
  var totalWeighted = 0;
  var totalWeight = 0;
  for (var key of Object.keys(profile.dimensions)) {
    var dim = profile.dimensions[key];
    var items = dim.items || {};
    var itemKeys = Object.keys(items);
    if (itemKeys.length === 0) { dimResults[key] = { completion: 0, name: dim.name }; continue; }
    var filledScore = 0;
    var totalScore = 0;
    for (var ik of itemKeys) {
      totalScore += (items[ik].score || 0);
      if (items[ik].filled) filledScore += (items[ik].score || 0);
    }
    var dimCompletion = totalScore > 0 ? Math.round(filledScore / totalScore * 100) : 0;
    dimResults[key] = { completion: dimCompletion, name: dim.name, weight: dim.weight };
    totalWeighted += dimCompletion * (dim.weight || 0);
    totalWeight += (dim.weight || 0);
  }
  var total = totalWeight > 0 ? Math.round(totalWeighted / totalWeight) : 0;
  return { total: total, dimensions: dimResults };
}

function applyUpdates(profile, updates) {
  var newProfile = JSON.parse(JSON.stringify(profile));
  for (var i = 0; i < updates.length; i++) {
    var update = updates[i];
    if (update.confidence < 0.5) continue;
    if (!newProfile.dimensions[update.dimension]) continue;
    if (!newProfile.dimensions[update.dimension].items[update.item]) continue;
    newProfile.dimensions[update.dimension].items[update.item] = {
      name: newProfile.dimensions[update.dimension].items[update.item].name,
      score: newProfile.dimensions[update.dimension].items[update.item].score,
      value: update.value,
      filled: true,
      updateTime: new Date().toISOString()
    };
  }
  for (var key of Object.keys(newProfile.dimensions)) {
    var dim = newProfile.dimensions[key];
    var items = Object.values(dim.items);
    var filledScore = 0;
    var totalScore = 0;
    for (var j = 0; j < items.length; j++) {
      totalScore += (items[j].score || 0);
      if (items[j].filled) filledScore += (items[j].score || 0);
    }
    newProfile.dimensions[key].completion = totalScore > 0 ? Math.round(filledScore / totalScore * 100) : 0;
  }
  newProfile.updateTime = new Date().toISOString();
  return newProfile;
}

async function saveProfile(openid, profile, docId) {
  if (docId) {
    await db.collection('zexiao_profiles').doc(docId).update({ data: { dimensions: profile.dimensions, summary: profile.summary, updateTime: db.serverDate() } });
  } else {
    await db.collection('zexiao_profiles').add({ data: { _openid: openid, dimensions: profile.dimensions, summary: profile.summary, createTime: db.serverDate() } });
  }
}

async function writeLog(openid, oldProfile, newProfile, triggerMessage) {
  var changes = [];
  for (var dimKey of Object.keys(newProfile.dimensions)) {
    for (var itemKey of Object.keys(newProfile.dimensions[dimKey].items)) {
      var item = newProfile.dimensions[dimKey].items[itemKey];
      var oldItem = (oldProfile.dimensions[dimKey] && oldProfile.dimensions[dimKey].items[itemKey]) ? oldProfile.dimensions[dimKey].items[itemKey] : null;
      if (item.filled && (!oldItem || !oldItem.filled)) {
        changes.push({ dimension: dimKey, dimension_name: DIMENSIONS[dimKey] ? DIMENSIONS[dimKey].name : dimKey, item: itemKey, item_name: item.name, value: item.value });
      }
    }
  }
  if (changes.length === 0) return;
  var changeSummary = changes.map(function(c) { return c.dimension_name + '·' + c.item_name + '：' + c.value; }).join('；');
  await db.collection('zexiao_logs').add({ data: { _openid: openid, changes: changes, change_summary: changeSummary, trigger_message: triggerMessage, completion_before: calcCompletion(oldProfile).total, completion_after: calcCompletion(newProfile).total, createTime: db.serverDate() } });
}

function sanitizeProfile(profile) {
  var result = {};
  for (var key of Object.keys(profile.dimensions || {})) {
    var dim = profile.dimensions[key];
    result[key] = { name: dim.name, completion: dim.completion || 0 };
  }
  return result;
}

// ================================================================
// Prompt 构建（优化版）
// ================================================================
// buildChatSystemPrompt 已替换为 buildTargetedPrompt

function buildMessages(systemPrompt, history, currentMessage) {
  var messages = [{ role: 'system', content: systemPrompt }];
  var recentHistory = history.slice(-10);
  for (var i = 0; i < recentHistory.length; i++) {
    if (recentHistory[i].role && recentHistory[i].content) {
      messages.push({ role: recentHistory[i].role, content: recentHistory[i].content });
    }
  }
  messages.push({ role: 'user', content: currentMessage });
  return messages;
}

function buildOpening(q1, q2, q3, q4, profile, completion) {
  var isReturning = completion.total > 0;
  if (isReturning) {
    var lowestDim = findLowestDimension(profile);
    return '你好，我们继续。\n\n你目前的评估完成了 ' + completion.total + '%，' + lowestDim + '这个方向还有些信息没聊到。上次说到哪了，还记得吗？';
  }
  return '你好，我是智择通。\n\n我已经知道你的基本情况——' + q1 + '，成绩在' + q2 + '，倾向' + q3 + '读书。\n\n接下来我想多了解你这个人，才能给出真正有价值的建议。\n\n先问你一件事：你平时最愿意花时间做的事是什么？不用和专业有关，就是最感兴趣的。';
}

// buildProgressTip 已删除（不再需要toast提示）

function buildInsufficientTip(completion) {
  var dims = completion.dimensions;
  var weak = Object.entries(dims)
    .filter(function(entry) { return entry[1].completion < 60; })
    .map(function(entry) { return entry[1].name; });
  return '还需要补充：' + weak.join('、') + ' 等方面的信息，才能生成准确的报告。';
}

function findLowestDimension(profile) {
  var lowestKey = null;
  var lowestVal = 101;
  for (var key of Object.keys(profile.dimensions || {})) {
    var c = profile.dimensions[key].completion || 0;
    if (c < lowestVal) { lowestVal = c; lowestKey = key; }
  }
  return lowestKey ? (DIMENSIONS[lowestKey] ? DIMENSIONS[lowestKey].name : lowestKey) : '兴趣与方向';
}
