import request from '@/utils/request'

// 查询客户列表
export function listCustomer(query) {
  // 处理数组参数，将tags数组转换为逗号分隔的字符串
  const params = { ...query }
  if (params.tags && Array.isArray(params.tags) && params.tags.length > 0) {
    // 将数组转换为逗号分隔的字符串
    params.tags = params.tags.join(',')
    console.log('发送的tags参数:', params.tags)
  } else if (params.tags && Array.isArray(params.tags) && params.tags.length === 0) {
    // 如果是空数组，设置为null或undefined，避免发送空字符串
    params.tags = null
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
