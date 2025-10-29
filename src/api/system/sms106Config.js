import request from '@/utils/request'

// 根据用户ID获取106短信配置
export function getSms106ConfigByUserId(userId) {
  return request({
    url: '/system/sms106Config/user/' + userId,
    method: 'get'
  })
}

// 保存或更新106短信配置
export function saveSms106Config(data) {
  if (data.id) {
    // 更新配置
    return request({
      url: '/system/sms106Config',
      method: 'put',
      data: data
    })
  } else {
    // 新增配置
    return request({
      url: '/system/sms106Config',
      method: 'post',
      data: data
    })
  }
}

