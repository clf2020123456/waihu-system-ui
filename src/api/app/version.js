import request from '@/utils/request'

// 查询应用版本管理列表
export function listVersion(query) {
  return request({
    url: '/app/version/list',
    method: 'get',
    params: query
  })
}

// 查询应用版本管理详细
export function getVersion(id) {
  return request({
    url: '/app/version/' + id,
    method: 'get'
  })
}

// 新增应用版本管理
export function addVersion(data) {
  return request({
    url: '/app/version',
    method: 'post',
    data: data
  })
}

// 修改应用版本管理
export function updateVersion(data) {
  return request({
    url: '/app/version',
    method: 'put',
    data: data
  })
}

// 删除应用版本管理
export function delVersion(id) {
  return request({
    url: '/app/version/' + id,
    method: 'delete'
  })
}

// 检查更新（测试用）
export function checkUpdate(platform, versionCode) {
  return request({
    url: '/app/version/check',
    method: 'get',
    params: {
      platform,
      versionCode
    }
  })
}

// 获取最新版本
export function getLatestVersion(platform) {
  return request({
    url: '/app/version/latest',
    method: 'get',
    params: {
      platform
    }
  })
}

