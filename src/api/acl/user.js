import request from '@/utils/request'

const api_name = '/admin/acl/user'

/*
登陆
*/
export function login({ username, password }) {
  return request({
    url: '/admin/acl/index/login',
    method: 'post',
    data: { username, password }
  })
}

/*
获取用户信息(根据token)
*/
export function getInfo() {
  return request({
    url: '/admin/acl/index/info',
    method: 'get'
  })
}

/*
登出
*/
export function logout() {
  return request({
    url: '/admin/acl/index/logout',
    method: 'post'
  })
}

/*
获取当前用户的菜单权限列表
*/
export function getMenu() {
  return request('/admin/acl/index/menu')
}

export function findAll() {
  return request({
    url: `${api_name}/findAll`,
    method: 'get'
  })
}

export function findByKeyword(keyword) {
  return request({
    url: `${api_name}/findByKeyword/${keyword}`,
    method: 'get'
  })
}
