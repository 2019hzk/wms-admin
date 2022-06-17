import request from '@/utils/request'

const api_name = '/admin/inbound/inReceivingTask'

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

  receiving(inReceivingFormVo) {
    return request({
      url: `${api_name}/receiving`,
      method: 'post',
      data: inReceivingFormVo
    })
  }
}
