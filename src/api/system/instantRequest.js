import request from '@/utils/request'

// 查询一键拨号/短信请求列表
export function listInstantRequest(query) {
  return request({
    url: '/system/instantRequest/list',
    method: 'get',
    params: query
  })
}

// 查询当前用户的待处理请求列表
export function getPendingRequests() {
  return request({
    url: '/system/instantRequest/pending',
    method: 'get'
  })
}

// 查询一键拨号/短信请求详细
export function getInstantRequest(id) {
  return request({
    url: '/system/instantRequest/' + id,
    method: 'get'
  })
}

// 新增一键拨号/短信请求
export function addInstantRequest(data) {
  return request({
    url: '/system/instantRequest',
    method: 'post',
    data: data
  })
}

// 修改一键拨号/短信请求
export function updateInstantRequest(data) {
  return request({
    url: '/system/instantRequest',
    method: 'put',
    data: data
  })
}

// 更新请求状态
export function updateRequestStatus(id, data) {
  return request({
    url: '/system/instantRequest/updateStatus/' + id,
    method: 'put',
    data: data
  })
}

// 删除一键拨号/短信请求
export function delInstantRequest(id) {
  return request({
    url: '/system/instantRequest/' + id,
    method: 'delete'
  })
}

