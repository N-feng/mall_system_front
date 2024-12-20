import apiRequest from '@/utils/request.js'

export function fetchGoodsList(data) {
  return apiRequest({
    url: `/goods/info/goods_list/`,
    method: 'GET',
    data
  });
}
export function addGoods(data) {
  return apiRequest({
    url: `/goods/info/add_goods/`,
    method: 'POST',
    data
  });
}
export function deleteGoods(data) {
  return apiRequest({
    url: `/goods/info/del_goods/`,
    method: 'POST',
    data
  });
}
export function getGoods(data) {
  return apiRequest({
    url: `/goods/info/goods_detail/`,
    method: 'GET',
    data
  });
}
export function updateGoods(data) {
  return apiRequest({
    url: `/goods/info/update_goods/`,
    method: 'POST',
    data
  });
}










