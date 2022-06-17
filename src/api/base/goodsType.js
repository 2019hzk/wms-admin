import request from '@/utils/request'

const api_name = '/admin/base/goodsType'

export default {

  findByParentId(parentId) {
    return request({
      url: `${api_name}/findByParentId/${parentId}`,
      method: 'get'
    })
  },

  findNodes() {
    return request({
      url: `${api_name}/findNodes`,
      method: 'get'
    })
  }
}
