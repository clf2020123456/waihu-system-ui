import request from '@/utils/request'

// 查询OEM贴牌系统列表
export function listOemSystem(query) {
  return request({
    url: '/system/oemSystem/list',
    method: 'get',
    params: query
  })
}

// 查询OEM贴牌系统详细
export function getOemSystem(id) {
  return request({
    url: '/system/oemSystem/' + id,
    method: 'get'
  })
}

// 新增OEM贴牌系统
export function addOemSystem(data) {
  return request({
    url: '/system/oemSystem',
    method: 'post',
    data: data
  })
}

// 修改OEM贴牌系统
export function updateOemSystem(data) {
  return request({
    url: '/system/oemSystem',
    method: 'put',
    data: data
  })
}

// 删除OEM贴牌系统
export function delOemSystem(id) {
  return request({
    url: '/system/oemSystem/' + id,
    method: 'delete'
  })
}

// 验证OEM系统是否可用
export function validateOemSystem(systemName) {
  return request({
    url: '/system/oemSystem/validate/' + systemName,
    method: 'get'
  })
}

