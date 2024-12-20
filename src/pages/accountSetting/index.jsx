import { View, Text} from "@tarojs/components";
import { useLoad, redirectTo, navigateTo } from "@tarojs/taro";
import userStore from "@/store/userStore";
import {Image, Tag, Icon, Col, Row} from "@antmjs/vantui";
import auditIcon from "@/assets/image/audit-icon.svg";
import logoutIcon from "@/assets/image/logout-icon.svg";

import "@/pages/personalCenter/index.less";
import "./index.less";
import {useEffect, useState} from "react";
import {fetchUserInfo} from "@/api";

export default function AccountSetting() {

  const [avatarUrl, setAvatarUrl] = useState("https://img.yzcdn.cn/vant/cat.jpeg")
  const [userObj, setUserObj] = useState()

  const userInfo = userStore.getUserInfo();

  const getUserInfo = () => {
    fetchUserInfo().then(res => {
      if(res){
        const {data, status} = res
        if(status){
          setUserObj(data)
          if(data){
            const {wechat_avatar} = data
            if(wechat_avatar){
              setAvatarUrl(wechat_avatar)
            }
          }
        }
      }
    })
  }
  useEffect(() => {
    getUserInfo()
  },[])

  const gotoLogin = () => {
    redirectTo({
      url: "/pages/login/index",
    });
  };

  const handleLogout = () => {
    userStore?.removeUserInfo?.();
    gotoLogin();
  };

  useLoad(() => {
    console.log("Page loaded.");
    if(!userInfo){
      gotoLogin();
    }
  });

  return (
    <View className="personalCenter accountSetting">

      <View style={{display: 'flex',justifyContent: 'space-between', alignItems: 'center',padding: '25px 0 15px 0'}} onClick={() => {
        navigateTo({
          url: "/pages/personalInfoDetail/index",
        });
      }}
      >
        <View style={{display: 'flex', alignItems: 'center'}}>
          <Image
            round
            radius="50px"
            width="50px"
            height="50px"
            style={{paddingRight: '15px'}}
            src={avatarUrl}
          />
          <View>
            <View style={{display: 'block', marginBottom: '5px'}}>Hi, {userObj?.account}</View>
            <View style={{display: 'block', color: '#999', fontSize: '12px'}}>
              账号名：{userInfo?.nickname}
            </View>
          </View>
        </View>
        <View style={{display: 'flex',justifyContent: 'space-between'}}>
          <Icon name="arrow" className="icon" style={{color: '#999'}} />
        </View>
      </View>

      <View className="card">
        <View className="card-item">
          <View className="card-item--l">
            <Image width="16px" height="16px" src={logoutIcon} />
          </View>
          <View className="card-item--c" onClick={handleLogout}>
            退出登录
          </View>
        </View>
      </View>
    </View>
  );
}
