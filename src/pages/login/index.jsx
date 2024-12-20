import {useEffect, useLayoutEffect, useRef, useState} from "react";
import classNames from "classnames";
import { View, Text, Image } from "@tarojs/components";
import {useLoad, showToast, switchTab, navigateTo} from "@tarojs/taro";
import { Button, Form, FormItem, Field, Icon, RadioGroup, Radio, } from "@antmjs/vantui";
import {fetchRole, loginUser} from "@/api/user";
import bg from "@/assets/image/bg.png";
import userStore from "@/store/userStore";

import "./index.less";
import CopyRight from "./components/copyRight"

export default function Login() {
  const formIt = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [usernameFocus, setUsernameFocus] = useState(false);
  const [pswFocus, setPswFocus] = useState(false);
  const [pswVisible, setPswVisible] = useState(false);

  const [filterCustomerTypeList, setCustomerTypeList] = useState([])
  const [userType, setUserType] = useState('');

  useLoad(() => {
    console.log("Page loaded.");
  });

  const gotoIndex = () => {
    switchTab({
      url: "/pages/index/index",
    });
  };
  const getRoleList = () => {
    fetchRole().then((res) => {
      setCustomerTypeList(res.data);
    });
  };
  useEffect(() => {
    getRoleList();
  },[])
  // const firstUpdate = useRef(true);
  useLayoutEffect(() => {
    /*if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }*/
    // getRoleList();
  }, []);




  const handleClick = () => {
    if (loading) {
      return;
    }
    formIt.validateFields((errorMessage, fieldValues) => {
      if ((!errorMessage || errorMessage.length === 0) && !loading) {
        setLoading(true);
        /*const user = {
          id: 'string',
          is_admin: true,
          token: 'string',
          account: fieldValues?.account?.trim(),
          nickname: userType==='admin'?'管理员':'',
          userType: userType,
          authority_module: ['admin','301','302','303'], // 权限
          permissions: [],
          re_login: false,
        }
        userStore.setUserInfo(user);*/
        // gotoIndex();
        loginUser({
          account: fieldValues?.account?.trim(),
          password: fieldValues?.password?.trim(),
          role_id: fieldValues?.role_id,
        })
          .then((res) => {
            console.log(res);
            const { data = {}, message, status } = res;
            if(status){
              userStore.setUserInfo(data);
              gotoIndex();
            }else{
              showToast({
                title: `${message}`,
                icon: "error",
                duration: 2000,
              });
            }

          })
          .catch(() => {
            showToast({
              title: "账号密码错误",
              icon: "error",
              duration: 2000,
            });
          })
          .finally(() => {
            setLoading(false);
          });
      }
    });
  };

  const clickClassificationBtn = (e) => {
    setUserType(e.detail)
  };
  const handleWechatClick = () => {
    showToast({
      title: "暂未开发",
      icon: "none",
      duration: 1000,
    });
  };

  return (
    <View className="login">
      <Image mode="scaleToFill" src={bg} className="bg" />
      <View className="container">
        <View className="welcome-text">
          <Text className="welcome-text-1">Hi,</Text>
          <Text className="welcome-text-2">
            欢迎使用
            <Text className="welcome-text-3">{process.env.TARO_APP_NAME}</Text>
          </Text>
        </View>
        <View className="form">
          <Form form={formIt} onFinish={(errs, res) => console.info(errs, res)}>
            <View
              className={classNames(usernameFocus === true ? "focus" : "blur")}
            >
              <FormItem label="分类" name="role_id" required requiredIcon={<></>}>
                <RadioGroup direction="horizontal" onClick={clickClassificationBtn}>
                  {filterCustomerTypeList.map((e) => (
                    <Radio
                      name={e.id}
                      checkedColor="#07c160"
                      iconSize="18px"
                      key={e.id}
                    >
                      {e.name}
                    </Radio>
                  ))}
                </RadioGroup>
              </FormItem>
              <FormItem
                label="账号"
                name="account"
                required
                requiredIcon={<></>}
                trigger="onInput"
                validateTrigger="onBlur"
                valueFormat={(e) => e.detail.value}
              >
                <Field
                  placeholder="请输入账号"
                  border={false}
                  onInput={(e) => {
                    formIt?.setFieldsValue(
                      "account",
                      (e?.detail ?? "").trim(),
                    );
                  }}
                  onFocus={() => {
                    setUsernameFocus(true);
                  }}
                  onBlur={() => {
                    setUsernameFocus(false);
                  }}
                />
              </FormItem>
            </View>
            <View className={classNames(pswFocus === true ? "focus" : "blur")}>
              <FormItem
                label="密码"
                name="password"
                required
                requiredIcon={<></>}
                trigger="onInput"
                validateTrigger="onBlur"
                valueFormat={(e) => e.detail.value}
              >
                <Field
                  type={pswVisible ? "text" : "password"}
                  placeholder="请输入密码"
                  border={false}
                  onInput={(e) => {
                    formIt?.setFieldsValue(
                      "password",
                      (e?.detail ?? "").trim(),
                    );
                  }}
                  onFocus={() => {
                    setPswFocus(true);
                  }}
                  onBlur={() => {
                    setPswFocus(false);
                  }}
                  renderButton={
                    <View
                      className="toggle-psw-btn"
                      onClick={() => {
                        setPswVisible(!pswVisible);
                      }}
                    >
                      {pswVisible ? (
                        <Icon name="eye-o" size="20px" className="icon"></Icon>
                      ) : (
                        <Icon
                          name="closed-eye"
                          size="20px"
                          className="icon"
                        ></Icon>
                      )}
                    </View>
                  }
                />
              </FormItem>
            </View>
          </Form>
        </View>
        <Button
          type="primary"
          className="login-btn"
          onClick={handleClick}
          loadingText=" 登录中..."
          loading={loading}
        >
          登 录
        </Button>
        {/* <View plain className="wechat-login-btn" onClick={handleWechatClick}>
          <Icon
            color="#00bf7e"
            name="chat-o"
            size="18px"
            className="icon"
          ></Icon>
          微信登录
        </View> */}
        <View style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: '20px'}}>
          <View style={{width: '35%', borderBottom: '1px solid #aaa'}}></View>
          <Text style={{fontSize: '14px'}}>其他登录方式</Text>
          <View style={{width: '35%', borderBottom: '1px solid #aaa'}}></View>
        </View>
        <View style={{textAlign: "center", marginTop: '20px'}}>
          <Text>还没有账号？</Text>
          <Text style={{color: '#006be6'}} onClick={()=>{
            navigateTo({
              url: `/pages/register/index`,
            });
          }}
          >创建账号</Text>
        </View>
      </View>
      <CopyRight />
    </View>
  );
}
