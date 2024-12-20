import apiRequest from '@/utils/request.js'
import Taro from "@tarojs/taro";
import {APP_API_KEY_PREFIX} from "@/utils/constant";

export const fetchHomePageList = (data) => {
  /*return Taro.request({
    url: 'http://47.112.100.255/user/home_page/get_home_page_info/',
    method: 'GET',
    data: { ...data },
    header: {
      Authorization: `${APP_API_KEY_PREFIX} eyJhbGciOiJIUzI1NiIsInR5cCI6Imp3dCJ9.eyJ1c2VyX2lkIjoxLCJyb2xlX2lkIjoxLCJleHAiOjE3MzQ3NzI5NjB9.vpopbwLbnE5zI3J68m40-ETh3Un10dOOchN0uMZQm_o`,
      ["Content-Type"]: 'application/json', // Default
      'X-CSRFToken': Math.random()
    },
  })*/

  return apiRequest({
    url: `/user/home_page/get_home_page_info/`,
    method: 'GET',
    data: { ...data }
  })
}

