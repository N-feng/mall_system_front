import apiRequest from '@/utils/request.js'

export function fetchCartsList(data) {
  return apiRequest({
    url: `/goods/cart/get_cart_data/`,
    method: 'GET',
    data
  });
}
export function addOrRemoveCart(data) {
  return apiRequest({
    url: `/goods/cart/add_or_remove_cart/`,
    method: 'POST',
    data
  });
}










