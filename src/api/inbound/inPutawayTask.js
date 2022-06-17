import request from '@/utils/request'

const api_name = '/admin/inbound/inPutawayTask'

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

  putaway(inPutawayFormVo) {
    return request({
      url: `${api_name}/putaway`,
      method: 'post',
      data: inPutawayFormVo
    })
  },

  syncInventory(id) {
    return request({
      url: `${api_name}/syncInventory/${id}`,
      method: 'get'
    })
  },
}
