import request from '@/utils/request'

const api_name = '/admin/inventory/inventoryInfo'

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

  findByStorehouseId(storehouseId) {
    return request({
      url: `${api_name}/findByStorehouseId/${storehouseId}`,
      method: 'get'
    })
  },

  updateInventory(inventoryFormVo) {
    return request({
      url: `${api_name}/updateInventory`,
      method: 'post',
      data: inventoryFormVo
    })
  }
}
