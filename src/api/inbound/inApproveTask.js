import request from '@/utils/request'

const api_name = '/admin/inbound/inApproveTask'

export default {

  getPageList(page, limit, searchObj) {
    return request({
      url: `${api_name}/${page}/${limit}`,
      method: 'get',
      params: searchObj
    })
  },
  getById(id) {
    return request({
      url: `${api_name}/get/${id}`,
      method: 'get'
    })
  },

  save(role) {
    return request({
      url: `${api_name}/save`,
      method: 'post',
      data: role
    })
  },

  submitApprove(inOrderId) {
    return request({
      url: `${api_name}/submitApprove/${inOrderId}`,
      method: 'get'
    })
  },
  approve(inApproveFormVo) {
    return request({
      url: `${api_name}/approve`,
      method: 'post',
      data: inApproveFormVo
    })
  }
}
