import request from '@/utils/request'

const api_name = '/admin/outbound/outOrder'

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

  show(id) {
    return request({
      url: `${api_name}/show/${id}`,
      method: 'get'
    })
  }
}
