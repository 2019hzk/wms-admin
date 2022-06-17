import request from '@/utils/request'

const api_name = '/admin/inventory/invMoveTask'

export default {

  getPageList(page, limit) {
    return request({
      url: `${api_name}/${page}/${limit}`,
      method: 'get'
    })
  },
  getById(id) {
    return request({
      url: `${api_name}/get/${id}`,
      method: 'get'
    })
  },

  assign(invMoveTaskFormVo) {
    return request({
      url: `${api_name}/assign`,
      method: 'post',
      data: invMoveTaskFormVo
    })
  },

  update(invMoveItemList) {
    return request({
      url: `${api_name}/update`,
      method: 'post',
      data: invMoveItemList
    })
  },

  syncInventory(id) {
    return request({
      url: `${api_name}/syncInventory/${id}`,
      method: 'get'
    })
  }
}
