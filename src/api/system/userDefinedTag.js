import request from '@/utils/request'

/**
 * 用户自定义标签相关API
 */

// 查询用户自定义标签列表
export function listUserDefinedTag(query) {
  return request({
    url: '/system/userDefinedTag/list',
    method: 'get',
    params: query
  })
}

// 根据用户ID获取自定义标签列表
export function getTagsByUser() {
  return request({
    url: '/system/userDefinedTag/tagsByUser',
    method: 'get'
  })
}

// 获取用户自定义标签详细信息
export function getUserDefinedTag(id) {
  return request({
    url: '/system/userDefinedTag/' + id,
    method: 'get'
  })
}

// 新增用户自定义标签
export function addUserDefinedTag(data) {
  return request({
    url: '/system/userDefinedTag',
    method: 'post',
    data: data
  })
}

// 修改用户自定义标签
export function updateUserDefinedTag(data) {
  return request({
    url: '/system/userDefinedTag',
    method: 'put',
    data: data
  })
}

// 删除用户自定义标签
export function delUserDefinedTag(ids) {
  return request({
    url: '/system/userDefinedTag/' + ids,
    method: 'delete'
  })
}