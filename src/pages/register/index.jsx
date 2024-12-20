import {useEffect, useState} from "react";
import classNames from "classnames";
import { View, Text, Image } from "@tarojs/components";
import {useLoad, showToast, switchTab, navigateTo} from "@tarojs/taro";
import { Button, Form, FormItem, Field, Icon, RadioGroup, Radio, } from "@antmjs/vantui";
import {fetchRole, loginUser, registerUser} from "@/api/user";
import bg from "@/assets/image/bg.png";
import userStore from "@/store/userStore";
import { isUndefined } from "lodash";
import CopyRight from "@/pages/login/components/copyRight";

import "@/pages/login/index.less";
import "./index.module.less";


export default function Register() {
  const formIt = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [usernameFocus, setUsernameFocus] = useState(false);
  const [pswFocus, setPswFocus] = useState(false);
  const [pswConfirmFocus, setPswConfirmFocus] = useState(false);
  const [pswVisible, setPswVisible] = useState(false);
  const [pswConfirmVisible, setPswConfirmVisible] = useState(false);
  const [isPswConfirmDisabled, setPswConfirmDisabled] = useState(true);
  const [filterCustomerTypeList, setCustomerTypeList] = useState([])

  const [userType, setUserType] = useState('');

  useLoad(() => {
    console.log("Page loaded.");
  });

  const getRoleList = () => {
    fetchRole().then((res) => {
      setCustomerTypeList(res.data);
    });
  };
  useEffect(() => {
    getRoleList();
  },[])

  const handleClick = () => {
    if (loading) {
      return;
    }
    formIt.validateFields((errorMessage, fieldValues) => {
      if ((!errorMessage || errorMessage.length === 0) && !loading) {
        setLoading(true);
        registerUser({
          account: fieldValues?.account?.trim(),
          password: fieldValues?.password?.trim(),
          // role_id: fieldValues?.role_id,
        })
          .then((res) => {
            const { message, status } = res;
            console.log('message',message);
            if(status){
              showToast({
                title: `${message}, 2秒钟返回到登陆页面`,
                icon: "none",
                duration: 2000,
              }).then(()=>{
                gotoLogin();
              });
            }else{
              showToast({
                title: `${message}`,
                icon: "error",
                duration: 2000,
              })
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }
    });
  };

  const gotoLogin = () => {
    navigateTo({
      url: "/pages/login/index",
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
    <View className="login register">
      <Image mode="scaleToFill" src={bg} className="bg" />
      <View className="container">
        <View className="welcome-text">
          <Text className="welcome-text-2">
            欢迎注册
            <Text className="welcome-text-3">{process.env.TARO_APP_NAME}</Text>
          </Text>
        </View>
        <View className="form">
          <Form form={formIt} onFinish={(errs, res) => console.info(errs, res)}>
            <View
              className={classNames(usernameFocus === true ? "focus" : "blur")}
            >
              {/*<FormItem label="分类" name="role_id" required requiredIcon={<></>}>
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
              </FormItem>*/}
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
                // trigger="onBlur"
                validateTrigger="onChange"
                // valueFormat={(e) => e.detail.value}
                rules={[{
                  rule: /^[0-9a-zA-Z]{6,12}$/,
                  message: '仅支持数字、字母，且长度为6到12位',
                }, {
                  rule: (value, call) => {
                    console.log(value, call)
                    const tempValue = formIt.getFieldValue("passwordConfirm");
                    console.log(value, tempValue)
                    if (isUndefined(value)) {
                      return call(`密码不能为空`)
                    }
                    if (value !== tempValue && !isUndefined(tempValue)) {
                      return call(`两次密码不一致`)
                    }
                    return call('')
                  },
                }]}
              >
                <Field
                  type={pswVisible ? "text" : "password"}
                  placeholder="密码"
                  border={false}
                  onInput={(e) => {
                    formIt?.setFieldsValue(
                      "password",
                      (e?.detail ?? "").trim(),
                    );
                    setPswConfirmDisabled(isUndefined(e?.detail))
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
            <View className={classNames(pswConfirmFocus === true ? "focus" : "blur")}>
              <FormItem
                label=""
                name="passwordConfirm"
                required
                requiredIcon={<></>}
                trigger="onBlur"
                validateTrigger="onChange"
                // valueFormat={(e) => e.detail.value}
                rules={[{
                  rule: /^[0-9a-zA-Z]+$/,
                  message: '仅支持数字、字母',
                }, {
                  rule: (value, call) => {
                    console.log(value, call)
                    const tempValue = formIt.getFieldValue("password");
                    console.log(value, tempValue)
                    if (isUndefined(value)) {
                      return call(`确认密码不能为空`)
                    }
                    if (value !== tempValue) {
                      return call(`两次密码不一致`)
                    }
                    return call('')
                  },
                }]}
              >
                <Field
                  type={pswConfirmVisible ? "text" : "password"}
                  placeholder="确认密码"
                  border={false}
                  // disabled={isPswConfirmDisabled}
                  onInput={(e) => {
                    formIt?.setFieldsValue(
                      "passwordConfirm",
                      (e?.detail ?? "").trim(),
                    );
                  }}
                  onFocus={() => {
                    setPswConfirmFocus(true);
                  }}
                  onBlur={() => {
                    setPswConfirmFocus(false);
                  }}
                  renderButton={
                    <View
                      className="toggle-psw-btn"
                      onClick={() => {
                        setPswConfirmVisible(!pswConfirmVisible);
                      }}
                    >
                      {pswConfirmVisible ? (
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
          loadingText="注册中..."
          loading={loading}
        >
          注 册
        </Button>
        <View style={{textAlign: "center", marginTop: '20px'}}>
          <Text>已经有账号了？</Text>
          <Text style={{color: '#006be6'}} onClick={() => {
            navigateTo({
              url: `/pages/login/index`,
            });
          }}
          >去登录</Text>
        </View>

      </View>
      <CopyRight />
    </View>
  );
}
