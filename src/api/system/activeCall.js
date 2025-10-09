import request from '@/utils/request'

/**
 * 获取当前用户实时通话状态
 */
export function getActiveCall() {
  return request({
    url: '/system/callRecord/activeCall',
    method: 'get'
  })
}

/**
 * 设置当前用户实时通话状态
 */
export function setActiveCall(data) {
  return request({
    url: '/system/callRecord/activeCall',
    method: 'post',
    data: data
  })
}

/**
 * 清除当前用户实时通话状态
 */
export function clearActiveCall() {
  return request({
    url: '/system/callRecord/activeCall',
    method: 'delete'
  })
}

