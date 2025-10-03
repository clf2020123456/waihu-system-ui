import request from '@/utils/request'

// 查询待办事项列表
export function listTodoItem(query) {
  return request({
    url: '/system/todoItem/list',
    method: 'get',
    params: query
  })
}

// 查询待办事项详细
export function getTodoItem(id) {
  return request({
    url: '/system/todoItem/' + id,
    method: 'get'
  })
}

// 新增待办事项
export function addTodoItem(data) {
  return request({
    url: '/system/todoItem',
    method: 'post',
    data: data
  })
}

// 修改待办事项
export function updateTodoItem(data) {
  return request({
    url: '/system/todoItem',
    method: 'put',
    data: data
  })
}

// 删除待办事项
export function delTodoItem(id) {
  return request({
    url: '/system/todoItem/' + id,
    method: 'delete'
  })
}

// 获取当前用户未读待办事项数量
export function getUnreadCount() {
  return request({
    url: '/system/todoItem/unreadCount',
    method: 'get'
  })
}

// 标记待办事项为已读
export function markAsRead(id) {
  return request({
    url: '/system/todoItem/markAsRead/' + id,
    method: 'put'
  })
}

// 批量标记为已读
export function batchMarkAsRead(ids) {
  return request({
    url: '/system/todoItem/batchMarkAsRead',
    method: 'put',
    data: ids
  })
}

