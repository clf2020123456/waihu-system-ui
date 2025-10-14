import request from '@/utils/request'

// 查询通话记录列表
export function listCallRecord(query) {
  return request({
    url: '/system/callRecord/list',
    method: 'get',
    params: query
  })
}

// 查询通话记录详细
export function getCallRecord(id) {
  return request({
    url: '/system/callRecord/' + id,
    method: 'get'
  })
}

// 获取通话统计数据
export function getCallStatistics(query) {
  return request({
    url: '/system/callRecord/statistics',
    method: 'get',
    params: query
  })
}

// 获取用户通话统计列表
export function getUserCallStatistics(query) {
  return request({
    url: '/system/callRecord/userStatistics',
    method: 'get',
    params: query
  })
}

// 新增通话记录
export function addCallRecord(data) {
  return request({
    url: '/system/callRecord',
    method: 'post',
    data: data
  })
}

// 修改通话记录
export function updateCallRecord(data) {
  return request({
    url: '/system/callRecord',
    method: 'put',
    data: data
  })
}

// 删除通话记录
export function delCallRecord(id) {
  return request({
    url: '/system/callRecord/' + id,
    method: 'delete'
  })
}
