import request from '@/utils/request'

// 查询106短信记录列表
export function listSms106Record(query) {
  return request({
    url: '/system/Sms106Record/list',
    method: 'get',
    params: query
  })
}

// 查询106短信记录详细
export function getSms106Record(id) {
  return request({
    url: '/system/Sms106Record/' + id,
    method: 'get'
  })
}

// 新增106短信记录
export function addSms106Record(data) {
  return request({
    url: '/system/Sms106Record',
    method: 'post',
    data: data
  })
}

// 修改106短信记录
export function updateSms106Record(data) {
  return request({
    url: '/system/Sms106Record',
    method: 'put',
    data: data
  })
}

// 删除106短信记录
export function delSms106Record(id) {
  return request({
    url: '/system/Sms106Record/' + id,
    method: 'delete'
  })
}
