/*
 * @Description: 新增客户编辑页
 */
import {useCallback, useState, useEffect, useRef} from "react";
import {View, Button as TaroButton, Text} from "@tarojs/components";
import Taro, { navigateBack, getCurrentPages, showToast, uploadFile } from "@tarojs/taro";
import {
  Form,
  FormItem,
  Button,
  Field,
  RadioGroup,
  Radio, Uploader, Toast, Image, Icon,
} from "@antmjs/vantui";
import cns from "classnames";
import { throttle } from "lodash";

import styles from "@/pages/intentionDetail/index.module.less";
import {fetchUserInfo, updatePersonalInfo} from "@/api";
import {fetchHomePageList} from "@/api/homePage";
import {APP_API_KEY_PREFIX} from "@/utils/constant";
import userStore from "@/store/userStore";

import "./index.less";

export default function GoodsManagementDetail() {
  const [searchData, setSearchData] = useState(null); // 拜访携带信息
  const [loading, setLoading] = useState(false);
  const [userObj, setUserObj] = useState()
  const formIt = Form.useForm();
  const [currentFileId, setCurrentFileId] = useState(null)
  const baseURL = process.env.TARO_APP_BASE_API;

  useEffect(() => {
    formIt.registerRequiredMessageCallback((label) => {
      return `${label}不能为空`;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUserInfo = () => {
    fetchUserInfo().then(res => {
      if(res){
        const {data, status} = res
        if(status){
          setUserObj(data)
          formIt.setFields(data)
          if(data){
            const {wechat_avatar} = data
            if(wechat_avatar){
              setAvatarUrl(wechat_avatar)
            } else {
              setAvatarUrl(baseURL+data.file_path)
            }
          }
        }
      }
    })
  }
  useEffect(() => {
    getUserInfo()
  },[])

  const handleSubmit = useCallback(() => {
    formIt.validateFields(async (errorMessage, fieldValues) => {
      console.log(fieldValues);
      if (errorMessage && errorMessage.length) {
        return console.info("errorMessage", errorMessage);
      }

      setLoading(true);

      const { unit_name, ...opt } = fieldValues;

      const _data = {
        ...opt,
        customer: searchData?.customer?.id,
        connect_person: searchData?.id,
        kind: searchData?.kind?.id,
      };

      const { data, message, status } = await updatePersonalInfo({
        ..._data,
        file_id: currentFileId,
      });
      showToast({ title: `${message}`, icon: status?"success":'error', duration: 2000 });
      setLoading(false);
      // handleBack(data?.id);
      handleBack()
    });
  }, [searchData, currentFileId, formIt]);

  const handleBack = () => {
    setTimeout(() => {
      var pages = getCurrentPages();
      //上一个页面
      var prevPage = pages[pages.length - 2];
      //直接调用上一个页面的setState()方法，把数据存到上一个页面中去
      prevPage?.setData({ needRefresh: true });
      // 返回上一页
      navigateBack({
        delta: 1,
      });
      setLoading(false);
    }, 2000);
  };

  const valueFormatUpload = (event, formName, instance) => {
    Toast.loading('上传中...')
    const { file } = event.detail
    let fileList = instance.getFieldValue(formName) || []
    fileList = fileList.concat(file)
    // 异步更新
    return new Promise((resolve) => {
      setTimeout(() => {
        Toast.clear()
        resolve(fileList)
      }, 3000)
    })
  }

  const formRef = useRef(null)
  const deleteFile = (event) => {
    const { index, fileList } = event.detail
    fileList.splice(index, 1)

    formRef.current?.setFieldsValue('file', fileList)
  }
  const [avatarUrl, setAvatarUrl] = useState("")
  const handleChooseAvatar = async (e) => {
    console.log(e)
    setAvatarUrl(e.detail.avatarUrl)
    uploadAvatar(e.detail.avatarUrl)
  }

  // const getList = ()=>{
  //   fetchHomePageList().then(res=>{

  //   })
  // };
  // useEffect(() => {
  //   getList()
  // }, []);

  const uploadAvatar = async (url) => {
    const { token = "" } = userStore.getUserInfo();
    try {
      // 1. 上传到服务器
      const uploadResult = await uploadFile({
        url: process.env.TARO_APP_BASE_API+'/common/upload/create_file/',
        filePath: url,
        name: 'file',
        header: {Authorization: `${APP_API_KEY_PREFIX} ${token}`,},
        formData: {
          file_type: 'user',
          is_common: false
        }
      })

      // 2. 处理上传结果
      const serverAvatarUrl = JSON.parse(uploadResult.data).avatarUrl
      const tempData = JSON.parse(uploadResult.data)
      if(tempData){
        const {data, message, status} = tempData
        console.log('uploadResult',uploadResult)
        console.log('uploadResult?.data?.id',data?.id)
        setCurrentFileId(data?.id)
        showToast({ title: `${message}`, icon: status?"success":'error', duration: 2000 });
        /*if(){
          formIt.setErrorMessage('userName', '这是自定义错误xxxxx')
        }*/
      }
      // 3. 更新用户信息
      // await updateUserProfile({ avatarUrl: serverAvatarUrl })

      return serverAvatarUrl
    } catch (error) {
      console.error('上传头像失败', error)
    }
  }
  const handleGetUserInfo = (e) => {
    console.log(e)
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
  return (
    <View className={cns(styles["intentionDetail"], "personalInfo")}>
      <View className={styles.container}>
        <View className={cns(styles.form, "form")}>
          <Form
            initialValues={{}}
            form={formIt}
            ref={formRef}
            onFinish={(errs, res) => console.info(errs, res)}
            className={styles.form}
          >
            <View className="form-card">
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
                />
              </FormItem>
              <FormItem
                label="单位名称"
                name="company_name"
                valueFormat={(e) => e.detail}
              >
                <Field
                  className={styles.textarea}
                  placeholderClass={styles["textarea-placeholder"]}
                  type="textarea"
                  placeholder="请输入单位名称"
                  autosize={{ minHeight: "30px" }}
                  border={false}
                  onInput={(e) => {
                    formIt?.setFieldsValue("company_name", e?.detail);
                  }}
                />
              </FormItem>
              <FormItem
                label="联系人"
                name="name"
                valueFormat={(e) => e.detail}
              >
                <Field
                  className={styles.textarea}
                  placeholderClass={styles["textarea-placeholder"]}
                  type="textarea"
                  placeholder="请输入联系人"
                  autosize={{ minHeight: "30px" }}
                  border={false}
                  onInput={(e) => {
                    formIt?.setFieldsValue("name", e?.detail);
                  }}
                />
              </FormItem>
              <FormItem
                label="手机号"
                name="phone"
                required
                valueFormat={(e) => e.detail}
              >
                <Field
                  className={styles.textarea}
                  placeholderClass={styles["textarea-placeholder"]}
                  type="textarea"
                  placeholder="请输入手机号"
                  autosize={{ minHeight: "30px" }}
                  border={false}
                  onInput={(e) => {
                    formIt?.setFieldsValue("phone", e?.detail);
                  }}
                />
              </FormItem>
              <FormItem
                label="职位"
                name="job_title"
                valueFormat={(e) => e.detail}
              >
                <Field
                  className={styles.textarea}
                  placeholderClass={styles["textarea-placeholder"]}
                  type="textarea"
                  placeholder="请输入职位"
                  autosize={{ minHeight: "30px" }}
                  border={false}
                  onInput={(e) => {
                    formIt?.setFieldsValue("job_title", e?.detail);
                  }}
                />
              </FormItem>
              <FormItem
                label="单位地址"
                name="company_address"
                valueFormat={(e) => e.detail}
              >
                <Field
                  className={styles.textarea}
                  placeholderClass={styles["textarea-placeholder"]}
                  type="textarea"
                  placeholder="请输入单位地址"
                  autosize={{ minHeight: "30px" }}
                  border={false}
                  onInput={(e) => {
                    formIt?.setFieldsValue("company_address", e?.detail);
                  }}
                />
              </FormItem>
              <FormItem
                name="file_id"
                mutiLevel
                // required
                // layout="vertical"
                label={<>
                  <Text style={{color: 'red', marginLeft: '-6px'}}>*</Text>头像
                </>}
                valueKey="fileList"
                valueFormat={valueFormatUpload}
                trigger="onAfterRead"
                validateTrigger="onAfterRead"
              >
                {/*<Uploader name="file1" onDelete={deleteFile}></Uploader>*/}

                <TaroButton
                  className="no-border"
                  style={{backgroundColor: 'rgb(247, 248, 250)', width: '88px', height: '88px',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    padding: '0',
                    marginLeft: '0',
                  }}
                  buttonStyle="border: none;"
                  open-type="chooseAvatar"
                  onChooseAvatar={handleChooseAvatar}
                >
                  {avatarUrl ? (
                    <Image
                      round
                      width="100%"
                      height="100%"
                      src={avatarUrl}
                      // onClick={handleGetUserInfo}
                    />
                  ) : (
                    <Icon
                      name="photo-o"
                      size="26px"
                      className="van-icon van-icon-photograph van-uploader__upload-icon"
                    ></Icon>
                  )}
                </TaroButton>
              </FormItem>
            </View>
            <Button
              type="primary"
              className="van-button-submit"
              onClick={throttle(handleSubmit, 2 * 1000)}
              loading={loading}
            >
              修改
            </Button>
          </Form>
        </View>
      </View>
    </View>
  );
}
