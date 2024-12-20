import Taro from '@tarojs/taro';
import {
  APP_AUTH_KEY,
} from "@/utils/constant";

/**
 * 设置当前用户信息
 * @param loginUser 当前登录用户信息
 */

// type UserInfo = {
//   id: string;
//   is_admin: boolean;
//   token: string;
//   username?: string;
//   nickname?: string;
//   authority_module?: string[]; // 权限
//   permissions?: string[];
//   re_login?: boolean;
// };

class UserStore {
  userInfo = null;

  constructor() {
    this.userInfo = Taro.getStorageSync(APP_AUTH_KEY)
  }

  handleLogin = async (data) => {
    console.log('handlelogin', data);
  }

  handleWeixinLogin = async () => {
    // Taro.showLoading({ title: '登录中...' });
    try {
      //       const { userInfo } = await Taro.getUserProfile({
      //         lang: 'zh_CN',
      //         desc: '完成头像和名称信息并登录',
      //       });
      //
      //       const { code } = await Taro.login();
      //       const { miniProgram } = Taro.getAccountInfoSync();
      //       const res = await LoginWechatByCode({
      //         code,
      //         wx_app_id: miniProgram.appId,
      //         is_login_for_mini_program: true,
      //       });
      //       this.setLoginInfo(res);
      //       this.setUserInfo(userInfo);
      //
      //       await UpdateWechatUserInfoWx({
      //         nick_name: userInfo.nickName,
      //         avatar: userInfo.avatarUrl,
      //       });

      return Promise.resolve();
    } catch (error) {
      Taro.showToast({ title: '登录失败', icon: 'none', duration: 2000 });
      console.error(error);
      return Promise.reject(error);
    } finally {
      Taro.hideLoading();
    }
  }

  setUserInfo = (userInfo) => {
    this.userInfo = userInfo;

    Taro.setStorage({
      key: APP_AUTH_KEY,
      data: userInfo,
    });
  };

  getUserInfo = () => {
    var value = this.userInfo || Taro.getStorageSync(APP_AUTH_KEY)
    return value ?? null
  };

  removeUserInfo = () => {
    this.userInfo = null;
    Taro.removeStorage({
      key: APP_AUTH_KEY
    }).then(res => {
      console.log('removeUserInfo Success：', res);
    }).catch(err => {
      console.log('removeUserInfo Error：', err);
    });
  };
}

const userStore = new UserStore();
export default userStore;
