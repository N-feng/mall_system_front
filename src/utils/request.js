import Taro, { redirectTo, showToast } from '@tarojs/taro';
import userStore from "@/store/userStore";
import {isUndefined} from "lodash";
import { handleRedirectToLogin } from './utils';
import {
  APP_API_KEY_PREFIX,
} from './constant';

console.log('process.env.NODE_ENV:', process.env.NODE_ENV, process.env.TARO_APP_BASE_API);

const redirectToLogin = (api) => {
  const NO_NEED_AUTH_API = ['/user/login/', '/user/register/'];
  const flag = NO_NEED_AUTH_API.includes(api)

  if (!flag) {
    handleRedirectToLogin();
    return;
  }
};

const apiRequest = (config) => {
  return new Promise((resolve, reject) => {
    const baseURL = process.env.TARO_APP_BASE_API;

    const { token = "" } = userStore.getUserInfo();

    const loginOrRegister = config.url.includes('login') || config.url.includes('register')

    if (!loginOrRegister&&!token) {
      // 登录数据失效，去登录
      redirectToLogin(config.url);
    }
    const contentType = isUndefined(config?.header)?'application/json':config?.header['content-type']

    const header = loginOrRegister?{
      // ["Content-Type"]: contentType, // Default
      'X-CSRFToken': Math.random()
    }:{
      Authorization: `${APP_API_KEY_PREFIX} ${token}`,
      // ["Content-Type"]: contentType, // Default
      'X-CSRFToken': Math.random()
    }

    // Taro[config.url.includes('upload')?'uploadFile':'request']
    Taro.request({
      url: baseURL + config.url,
      data: config?.data,
      method: config?.method,
      header: header,
      timeout: 10 * 1000,
      // mode: 'no-cors',
      success: function (res) {
        console.log('res', res)
        const { statusCode } = res;

        var response = {
          ...res,
          status: statusCode,
          statusText: res.errMsg,
          headers: res.header,
          config: config,
          request: null
        };

        // 用户未认证
        if (statusCode === 401) {
          showToast({ title: "登录态过期", icon: "error", duration: 2000 });
          redirectToLogin(config.url);
          reject(response);
          return;
        }

        // 接口没有访问权限
        if (statusCode === 403) {
          showToast({ title: "暂无访问权限", icon: "error", duration: 2000 });
          reject(response);
          return;
        }

        // 参数错误等等
        if (statusCode === 400) {
          reject(response);
          return;
        }

        // 用户未认证
        if (statusCode === 502) {
          showToast({ title: "服务端错误", icon: "error", duration: 2000 });
          reject(response);
          return;
        }

        if (statusCode !== 200) {
          reject(response);
          return;
        }

        resolve(response.data)
      },
      fail: function (res) {
        console.log('http fail res:', res);
        var response = {
          ...res,
          status: res.statusCode,
          statusText: res.errMsg,
          headers: res.header,
          config: config,
          request: null
        };
        reject(response)
      }
    })
  })
}



export default apiRequest;
