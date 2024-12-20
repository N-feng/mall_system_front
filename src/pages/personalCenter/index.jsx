import { View, Text, Button} from "@tarojs/components";
import Taro, {useLoad, redirectTo, navigateTo, getEnv, ENV_TYPE, switchTab, setStorageSync} from "@tarojs/taro";
import userStore from "@/store/userStore";
import {Image, Tag, Icon, Col, Row, Tab} from "@antmjs/vantui";
import auditIcon from "@/assets/image/audit-icon.svg";
import logoutIcon from "@/assets/image/logout-icon.svg";
import {useEffect,useState} from "react";

import "./index.less";
import {fetchUserInfo} from "@/api";
import {sellerTabList, userTabList} from "@/utils/utils";


export default function Index() {
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
  const clickToOrderBtn = (status) => {
    setStorageSync('tabParams', { key: status });
    switchTab({
      url: `/pages/order/index`,
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

  const handleGetUserInfo = () => {
    Taro.getUserProfile({
      desc: '用于完善用户信息', // 声明获取用户信息的目的
      success: (res) => {
        // 获取用户头像
        const tempUrl = res.userInfo.avatarUrl
        setAvatarUrl(tempUrl)
        console.log('用户头像', tempUrl)
        console.log('res.userInfo', res.userInfo)
      },
      fail: (err) => {
        console.error('获取用户信息失败', err)
      }
    })
  }
  /*useEffect(()=>{
    if(getEnv() === ENV_TYPE.WEAPP){
      handleGetUserInfo()
    }
  },[])*/
  const handleChooseAvatar = async (e) => {
    setAvatarUrl(e.detail.avatarUrl)
  }

  return (
    <View className="personalCenter">
      <View className="user-info">
        <View className="text-1">Hi, {userInfo?.nickname}</View>
        <View className="text-2">{userInfo?.email}</View>
        <View className="version-info">版本：V0.0.1</View>
      </View>

      <View style={{display: 'flex',justifyContent: 'space-between', alignItems: 'center',paddingBottom: '15px'}}>
        <View style={{display: 'flex', alignItems: 'center'}}>
          <Image
            round
            radius="50px"
            width="50px"
            height="50px"
            style={{paddingRight: '15px'}}
            src={avatarUrl}
            // onClick={handleGetUserInfo}
          />

          <View>
            <View style={{display: 'block', marginBottom: '5px'}}>Hi, {userObj?.account}</View>
            <View style={{display: 'block'}}>
              {
                (userObj?.is_verified)?<Tag type="success">已认证</Tag>:<Tag type="default">未认证</Tag>
              }
            </View>
          </View>
        </View>

        <View style={{display: 'flex',justifyContent: 'space-between'}}>
          <Icon name="setting-o" className="icon" onClick={() => {
            navigateTo({
              url: "/pages/accountSetting/index",
            });
          }}
          />
        </View>
      </View>

      <View className="card">
        <View className="audit" style={{padding: '10px 0'}}>
          <View className="audit-header">
            <View className="audit-header--l">我的订单</View>
            <View
              className="audit-header--r"
              onClick={() => {
                switchTab({
                  url: "/pages/order/index",
                });
              }}
            >
              全部
            </View>
          </View>

          <Row className="iconsWrapper">
            {
              userInfo?.role_id === 1 && <>
                {
                  userTabList.map((a, index) => {
                    return <Col span="6" gutter={8} key={a.name} style={{marginBottom: '15px'}}>
                      <View className="item" onClick={()=>clickToOrderBtn(a.name)}>
                        <Icon name={a.icon} size="32px" className="icon" />
                        <Text className="text">{a.title}</Text>
                      </View>
                    </Col>
                  })
                }
              </>
            }
            {
              userInfo?.role_id === 2 && <>
                {
                  sellerTabList.map((a, index) => {
                    return <Col span="6" gutter={8} key={a.name} style={{marginBottom: '15px'}}>
                      <View className="item" onClick={()=>clickToOrderBtn(a.name)}>
                        <Icon name={a.icon} size="32px" className="icon" />
                        <Text className="text">{a.title}</Text>
                      </View>
                    </Col>
                  })
                }
              </>
            }
          </Row>
        </View>
      </View>
      <View className="card">
        <View className="audit" style={{padding: '10px 0'}}>
          <View className="audit-header">
            <View className="audit-header--l">购物车</View>
          </View>

          <Row className="iconsWrapper">
            <Col span="6">
              <View className="item" onClick={() => {
                navigateTo({
                  url: `/pages/cart/index`,
                });
              }}
              >
                <Icon name="cart-o" size="32px" className="icon" />
                <Text className="text">购物车</Text>
              </View>
            </Col>
            {
              userInfo?.role_id === 2 && <Col span="6">
                <View className="item" onClick={() => {
                  navigateTo({
                    url: `/pages/goodsManagement/index`,
                  });
                }}
                >
                  <Icon name="setting-o" size="32px" className="icon" />
                  <Text className="text">商品管理</Text>
                </View>
              </Col>
            }
            {
              userInfo?.role_id === 3 && <Col span="6">
                <View className="item" onClick={() => {
                  navigateTo({
                    url: `/pages/verification/index`,
                  });
                }}
                >
                  <Icon name="certificate" size="32px" className="icon" />
                  <Text className="text">实名认证</Text>
                </View>
              </Col>
            }
          </Row>
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
