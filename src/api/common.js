
import apiRequest from '@/utils/request.js'


export function fetchConfiguresXmfj(data) {
  return apiRequest({
    url: `/api/business/configures/xmfj/`,
    method: 'GET',
    data: { ...data }
  });
}
