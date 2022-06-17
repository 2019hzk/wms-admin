import request from '@/utils/request'

const api_name = '/admin/inventory/invStatistics'

export default {

  getCount(type) {
    return request({
      url: `${api_name}/get/${type}`,
      method: 'get'
    })
  }
}
