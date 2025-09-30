import request from '@/utils/request'

// 查询客户跟进列表
export function listCustomerFollowUp(query) {
  return request({
    url: '/system/customerFollowUp/list',
    method: 'get',
    params: query
  })
}

// 查询客户跟进详细
export function getCustomerFollowUp(id) {
  return request({
    url: '/system/customerFollowUp/' + id,
    method: 'get'
  })
}

// 新增客户跟进
export function addCustomerFollowUp(data) {
  return request({
    url: '/system/customerFollowUp',
    method: 'post',
    data: data
  })
}

// 修改客户跟进
export function updateCustomerFollowUp(data) {
  return request({
    url: '/system/customerFollowUp',
    method: 'put',
    data: data
  })
}

// 删除客户跟进
export function delCustomerFollowUp(id) {
  return request({
    url: '/system/customerFollowUp/' + id,
    method: 'delete'
  })
}
