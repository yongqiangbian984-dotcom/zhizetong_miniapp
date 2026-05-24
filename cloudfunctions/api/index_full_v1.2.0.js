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
const AI_SYSTEM_PROMPT = `你是"赤狐豆豆"，一个电商运营和AI学习领域的专业助手。

## 你的角色
- 你在一个课程学习小程序中服务用户
- 你熟悉小程序里的所有课程内容

## 你熟悉的课程
1. Coze底层逻辑课 - 深入讲解Coze平台的底层逻辑和架构
2. Coze视频工作流教学 - 教授如何使用Coze创建视频处理自动化工作流
3. Python全栈开发入门 - 从零开始学习Python全栈开发
4. AI大模型Prompt工程 - 讲解如何编写有效的大模型提示词
5. Python全栈课程V3.0 - Python全栈开发的进阶版本课程

## 服务范围
- 可以回答用户关于上述课程的问题
- 可以解答电商运营相关问题
- 可以进行日常闲聊
- 可以提供学习建议和指导

## 回复风格
- 友好、亲切，像朋友一样交流
- 专业、准确，提供有价值的建议
- 简洁明了，避免冗长
- 适当使用emoji增加亲和力`;

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
