import apiRequest from '@/utils/request.js'

export function fetchStoresList(data) {
  return apiRequest({
    url: `/user/store/get_store_list/`,
    method: 'GET',
    data
  });
}
export function getStores(data) {
  return apiRequest({
    url: `/user/store/get_store_detail/`,
    method: 'GET',
    data
  });
}
export function updateStores(data) {
  return apiRequest({
    url: `/user/store/update_store_info/`,
    method: 'POST',
    data
  });
}










