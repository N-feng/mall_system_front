import apiRequest from '@/utils/request.js'

export function fetchOrdersList(data) {
  return apiRequest({
    url: `/order/list/order_info/`,
    method: 'GET',
    data
  });
}
export function addOrder(data) {
  return apiRequest({
    url: `/order/create/order_info/`,
    method: 'POST',
    data: { ...data }
  });
}










