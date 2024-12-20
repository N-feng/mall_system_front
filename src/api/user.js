import apiRequest from '@/utils/request.js'
import Taro from "@tarojs/taro";

// 账号密码登录
export function loginUser(data) {
  return apiRequest({
    url: '/user/login/login/',
    method: 'POST',
    data: { ...data }
  })
}
export function registerUser(data) {
  return apiRequest({
    url: '/user/register/user_create/',
    method: 'POST',
    data: { ...data }
  })
}
export function fetchRole(data) {
  return apiRequest({
    url: '/user/login/get_role/',
    method: 'GET',
    data: { ...data }
  })
}
export function fetchUserInfo(data) {
  return apiRequest({
    url: '/user/operate/ge_user_info/',
    method: 'GET',
    data
  })
}
export function updatePersonalInfo(data) {
  return apiRequest({
    url: '/user/operate/update_user_data/',
    method: 'POST',
    data: { ...data }
  })
}
