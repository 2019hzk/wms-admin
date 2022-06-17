import request from '@/utils/request'

const api_name = '/admin/outbound/outDeliverTask'

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

  deliverSave(deliver) {
    return request({
      url: `${api_name}/deliver`,
      method: 'post',
      data: deliver
    })
  }
}
