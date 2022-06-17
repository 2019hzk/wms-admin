import request from '@/utils/request'

const api_name = '/admin/inventory/invCountingTask'

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

  assign(invCountingTaskFormVo) {
    return request({
      url: `${api_name}/assign`,
      method: 'post',
      data: invCountingTaskFormVo
    })
  },

  update(invCountingItemList) {
    return request({
      url: `${api_name}/update`,
      method: 'post',
      data: invCountingItemList
    })
  },

  syncInventory(id) {
    return request({
      url: `${api_name}/syncInventory/${id}`,
      method: 'get'
    })
  }
}
