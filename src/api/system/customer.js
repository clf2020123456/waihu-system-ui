import request from '@/utils/request'

// 查询客户列表
export function listCustomer(query) {
  // 处理数组参数，确保tags数组正确传递
  const params = { ...query }
  if (params.tags && Array.isArray(params.tags)) {
    // 对于数组参数，axios会自动处理为 tags[] 格式
    console.log('发送的tags参数:', params.tags)
  }
  return request({
    url: '/system/customer/list',
    method: 'get',
    params: params
  })
}

// 查询客户详细
export function getCustomer(id) {
  return request({
    url: '/system/customer/' + id,
    method: 'get'
  })
}

// 新增客户
export function addCustomer(data) {
  return request({
    url: '/system/customer',
    method: 'post',
    data: data
  })
}

// 修改客户
export function updateCustomer(data) {
  return request({
    url: '/system/customer',
    method: 'put',
    data: data
  })
}

// 删除客户
export function delCustomer(id) {
  return request({
    url: '/system/customer/' + id,
    method: 'delete'
  })
}

// 下载导入模板
export function exportTemplate() {
  return request({
    url: '/system/customer/importTemplate',
    method: 'get',
    responseType: 'blob'
  })
}
