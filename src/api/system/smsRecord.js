import request from '@/utils/request'

// 查询短信记录列表
export function listSmsRecord(query) {
  return request({
    url: '/system/smsRecord/list',
    method: 'get',
    params: query
  })
}

// 查询短信记录详细
export function getSmsRecord(id) {
  return request({
    url: '/system/smsRecord/' + id,
    method: 'get'
  })
}

// 新增短信记录
export function addSmsRecord(data) {
  return request({
    url: '/system/smsRecord',
    method: 'post',
    data: data
  })
}

// 修改短信记录
export function updateSmsRecord(data) {
  return request({
    url: '/system/smsRecord',
    method: 'put',
    data: data
  })
}

// 删除短信记录
export function delSmsRecord(id) {
  return request({
    url: '/system/smsRecord/' + id,
    method: 'delete'
  })
}

// 获取短信统计数据
export function getSmsStatistics(query) {
  return request({
    url: '/system/smsRecord/statistics',
    method: 'get',
    params: query
  })
}

// 获取用户短信统计树形列表
export function getUserSmsStatisticsTree(query) {
  return request({
    url: '/system/smsRecord/userStatisticsTree',
    method: 'get',
    params: query
  })
}