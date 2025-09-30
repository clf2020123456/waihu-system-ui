import request from '@/utils/request'

// 查询任务客户关联列表
export function listTaskCustomerRelation(query) {
  return request({
    url: '/system/taskCustomerRelation/list',
    method: 'get',
    params: query
  })
}

// 查询任务客户关联详细
export function getTaskCustomerRelation(id) {
  return request({
    url: '/system/taskCustomerRelation/' + id,
    method: 'get'
  })
}

// 新增任务客户关联
export function addTaskCustomerRelation(data) {
  return request({
    url: '/system/taskCustomerRelation',
    method: 'post',
    data: data
  })
}

// 修改任务客户关联
export function updateTaskCustomerRelation(data) {
  return request({
    url: '/system/taskCustomerRelation',
    method: 'put',
    data: data
  })
}

// 删除任务客户关联
export function delTaskCustomerRelation(id) {
  return request({
    url: '/system/taskCustomerRelation/' + id,
    method: 'delete'
  })
}
