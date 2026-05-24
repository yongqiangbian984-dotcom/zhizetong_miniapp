const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  
  // 查找或创建用户
  const userRes = await db.collection('users').where({ _openid: openid }).get()
  if (userRes.data.length === 0) {
    await db.collection('users').add({
      data: {
        _openid: openid,
        nickname: '微信用户',
        avatar: '',
        phone: '',
        distributorLevel: 'trainee',
        levelName: '见习分销员',
        isDistributor: false,
        inviteCount: 0,
        totalEarnings: 0,
        availableEarnings: 0,
        parent1: '',
        parent2: '',
        parent3: '',
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })
  }
  
  return {
    openid: openid,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID || ''
  }
}
