import request from '@/utils/request'

const api_name = '/admin/base/wareConfig'

export default {

  get() {
    return request({
      url: `${api_name}/get`,
      method: 'get'
    })
  },

  updateById(wareConfig) {
    return request({
      url: `${api_name}/update`,
      method: 'put',
      data: wareConfig
    })
  }
}
