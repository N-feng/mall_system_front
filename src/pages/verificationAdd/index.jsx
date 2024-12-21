/*
 * @Description: 新增客户编辑页
 */
import {useCallback, useState, useEffect, useRef} from "react";
import { View, Button as TaroButton } from "@tarojs/components";
import { navigateBack, getCurrentPages, showToast, uploadFile } from "@tarojs/taro";
import {
  Form,
  FormItem,
  Button,
  Field,
  RadioGroup,
  Radio, Uploader, Toast, Switch, Image, Icon,
} from "@antmjs/vantui";
import cns from "classnames";
import { throttle } from "lodash";
import { getVisitRecords } from "@/api/visit";
import { addIntention } from "@/api/intention";
import FormSelect from "@/components/formSelect";
import KeySearch from "@/pages/intentionDetail/components/keySearch";
import styles from "@/pages/intentionDetail/index.module.less";
import {addGoods, addVerification,fetchApplicationDetail} from "@/api";
import {uploadImage} from "@/api/upload";
import CustomUploader from "@/components/customUploader";
import {mockGoods} from "@/utils/utils";
import userStore from "@/store/userStore";
import {APP_API_KEY_PREFIX} from "@/utils/constant";

export default function AddVerificationDetail() {
  const [keySearchVisible, setKeySearchVisible] = useState(false);
  const [visitHidden, setVisitHidden] = useState(true); // 默认隐藏拜访
  const [searchData, setSearchData] = useState(null); // 拜访携带信息
  const [visitOptions, setVisitOptions] = useState([]); // 拜访记录
  const [loading, setLoading] = useState(false);
  const [isPublished, setPublished] = useState(false);
  const formIt = Form.useForm();
  const [currentFileId1, setCurrentFileId1] = useState(null)
  const [currentFileId2, setCurrentFileId2] = useState(null)
  const [avatarUrl1, setAvatarUrl1] = useState("")
  const [avatarUrl2, setAvatarUrl2] = useState("")

  useEffect(() => {
    formIt.registerRequiredMessageCallback((label) => {
      return `${label}不能为空`;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChooseAvatar1 = async (e) => {
    console.log(e)
    setAvatarUrl1(e.detail.avatarUrl)
    uploadAvatar1(e.detail.avatarUrl)
  }
  const uploadAvatar1 = async (url) => {
    const { token = "" } = userStore.getUserInfo();
    try {
      // 1. 上传到服务器
      const uploadResult = await uploadFile({
        url: process.env.TARO_APP_BASE_API+'/common/upload/create_file/',
        filePath: url,
        name: 'file',
        header: {Authorization: `${APP_API_KEY_PREFIX} ${token}`,},
        formData: {
          file_type: 'goods',
          is_common: false
        }
      })

      /*file_name: "/static/uploaded_files/lYzuMLiENvFp8c9bdc3c8bc388d6cc06377ac7b12787.jpg"
id: 118
image_id: 118*/
      // 2. 处理上传结果
      const serverAvatarUrl = JSON.parse(uploadResult.data).avatarUrl
      const tempData = JSON.parse(uploadResult.data)
      if(tempData){
        const {data, message, status} = tempData
        console.log('uploadResult',uploadResult)
        console.log('uploadResult?.data?.id',data?.id)
        // setCurrentFileId(data?.id)
        formRef.current?.setFieldsValue('id_card_front', data?.id)
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

  const handleChooseAvatar2 = async (e) => {
    console.log(e)
    setAvatarUrl2(e.detail.avatarUrl)
    uploadAvatar2(e.detail.avatarUrl)
  }
  const uploadAvatar2 = async (url) => {
    const { token = "" } = userStore.getUserInfo();
    try {
      // 1. 上传到服务器
      const uploadResult = await uploadFile({
        url: process.env.TARO_APP_BASE_API+'/common/upload/create_file/',
        filePath: url,
        name: 'file',
        header: {Authorization: `${APP_API_KEY_PREFIX} ${token}`,},
        formData: {
          file_type: 'goods',
          is_common: false
        }
      })

      /*file_name: "/static/uploaded_files/lYzuMLiENvFp8c9bdc3c8bc388d6cc06377ac7b12787.jpg"
id: 118
image_id: 118*/
      // 2. 处理上传结果
      const serverAvatarUrl = JSON.parse(uploadResult.data).avatarUrl
      const tempData = JSON.parse(uploadResult.data)
      if(tempData){
        const {data, message, status} = tempData
        console.log('uploadResult',uploadResult)
        console.log('uploadResult?.data?.id',data?.id)
        // setCurrentFileId(data?.id)
        formRef.current?.setFieldsValue('id_card_back', data?.id)
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

  const handleSubmit = () => {
    formIt.validateFields((errorMessage, fieldValues) => {
      console.log(fieldValues);
      if (errorMessage && errorMessage.length) {
        return console.info("errorMessage", errorMessage);
      }

      setLoading(true);

      const {file, ...rest} = fieldValues
      setLoading(true);
      const _data = {
        ...rest,
        // id_card_front: currentFileId1,
        // id_card_back: currentFileId2,
      };
      console.log('_data', _data)

      addVerification({
        ..._data,
      }).then((res)=>{
        const {message, status} = res
        showToast({ title: `${message}`, icon: status?"success":'error', duration: 2000 });
        // handleBack(data?.id);
        handleBack();
      }).finally(() => {
        setLoading(false);
      })
    });
  };

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

  useEffect(() => {
    console.log('currentFileId1 changed:', currentFileId1);
  }, [currentFileId1]);
  useEffect(() => {
    console.log('currentFileId2 changed:', currentFileId2);
  }, [currentFileId2]);

  const valueFormatUpload1 = (event, formName, instance) => {
    console.log('event, formName, instance',event, formName, instance);
    Toast.loading('上传中...')
    const { file } = event.detail
    let fileList1 = instance.getFieldValue(formName) || []
    fileList1 = fileList1.concat(file)

    console.log(file, fileList1)
    console.log('process.env.TARO_ENV', process.env.TARO_ENV)
    console.log('process.env.TARO_ENV === \'weapp\'', process.env.TARO_ENV === 'weapp')
    // const formData = new FormData();
    // formData.append('is_common', false);
    // formData.append('file_type', 'user');
    // formData.append('file', file.originalFileObj);

    // return uploadImage(formData).then((res) => {
    //   if (res) {
    //     const { data, message, status } = res
    //     console.log('uploadImage.res', res)
    //     console.log('uploadImage.res.data', res.data)
    //     console.log('uploadImage.res.data.id', res.data.id)
    //     setCurrentFileId1(res.data.id)
    //     formIt.setFieldsValue("id_card_front", res.data.id)

    //     if (status) {
    //       showToast({
    //         title: message,
    //         icon: "none",
    //         duration: 1000,
    //       });
    //     } else {
    //       showToast({
    //         title: message,
    //         icon: "error",
    //         duration: 1000,
    //       });
    //     }
    //   }
    //   return fileList1;
    // }).catch((error) => {
    //   Toast.clear();
    //   throw error;
    // }).finally(() => {
    //   Toast.clear()
    // });
  }
  const valueFormatUpload2 = (event, formName, instance) => {
    Toast.loading('上传中...')
    const { file } = event.detail
    let fileList = instance.getFieldValue(formName) || []
    fileList = fileList.concat(file)

    console.log(file, fileList)
    const formData = new FormData();
    formData.append('is_common', false);
    formData.append('file_type', 'user');
    formData.append('file', file.originalFileObj);

    return uploadImage(formData).then((res) => {
      if (res) {
        const { data, message, status } = res
        console.log('uploadImage.res', res)
        console.log('uploadImage.res.data', res.data)
        console.log('uploadImage.res.data.id', res.data.id)
        setCurrentFileId2(res.data.id)

        if (status) {
          showToast({
            title: message,
            icon: "none",
            duration: 1000,
          });
        } else {
          showToast({
            title: message,
            icon: "error",
            duration: 1000,
          });
        }
      }
      return fileList;
    }).catch((error) => {
      Toast.clear();
      throw error;
    }).finally(() => {
      Toast.clear()
    });
  }

  const afterRead = (event) => {
    const { file } = event.detail
    console.log(file)
    const formData = new FormData();
    formData.append('file_type', 'file');
    formData.append('file', file.originalFileObj);
    Toast.loading('上传中...')
    uploadImage(formData).then((res)=>{
      console.log(res)
    }).finally(() => {
      Toast.clear()
    })
    // setValue(value.concat(file))
  }

  const formRef = useRef(null)
  const deleteFile1 = (event) => {
    const { index, fileList } = event.detail
    fileList.splice(index, 1)

    formRef.current?.setFieldsValue('id_card_front', fileList)
  }
  const deleteFile2 = (event) => {
    const { index, fileList } = event.detail
    fileList.splice(index, 1)

    formRef.current?.setFieldsValue('id_card_back', fileList)
  }
  return (
    <View className={styles.intentionDetail}>
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
                name="id_card_front"
                mutiLevel
                required
                // layout="vertical"
                label="身份证正面(图片大小不得大于 3M)"
                valueKey="id_card_front"
                valueFormat={valueFormatUpload1}
                trigger="onAfterRead"
                validateTrigger="onAfterRead"
                // rules={{
                //   rule: (values, call) => {
                //     values.forEach((item, index) => {
                //       // console.log('item',item)
                //       if (item.size > 3 * 1024 * 1024) {
                //         return call(`图片(${index + 1})大小不得大于 3M`)
                //       }
                //       call('')
                //     })
                //   },
                // }}
              >
                {
                  process.env.TARO_ENV === 'weapp' && <TaroButton
                    className="no-border"
                    style={{backgroundColor: 'rgb(247, 248, 250)', width: '88px', height: '88px',
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      padding: '0',
                      marginLeft: '0',
                    }}
                    buttonStyle="border: none;"
                    open-type="chooseAvatar"
                    onChooseAvatar={handleChooseAvatar1}
                  >
                    {avatarUrl1 ? (
                      <Image
                        // round
                        width="100%"
                        height="100%"
                        src={avatarUrl1}
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
                }
                {
                  process.env.TARO_ENV === 'h5' && <Uploader name="file1" accept="image" onDelete={deleteFile1} maxCount={1}></Uploader>
                }
                {/* <Uploader name="file1" accept="image" onDelete={deleteFile1} maxCount={1}></Uploader> */}
              </FormItem>

              <FormItem
                name="id_card_back"
                mutiLevel
                required
                // layout="vertical"
                label="身份证反面(图片大小不得大于 3M)"
                valueKey="id_card_back"
                valueFormat={valueFormatUpload2}
                trigger="onAfterRead"
                validateTrigger="onAfterRead"
                // rules={{
                //   rule: (values, call) => {
                //     values.forEach((item, index) => {
                //       console.log('item',item)
                //       if (item.size > 3 * 1024 * 1024) {
                //         return call(`图片(${index + 1})大小不得大于 3M`)
                //       }
                //       call('')
                //     })
                //   },
                // }}
              >
                {
                  process.env.TARO_ENV === 'weapp' && <TaroButton
                    className="no-border"
                    style={{backgroundColor: 'rgb(247, 248, 250)', width: '88px', height: '88px',
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                      padding: '0',
                      marginLeft: '0',
                    }}
                    buttonStyle="border: none;"
                    open-type="chooseAvatar"
                    onChooseAvatar={handleChooseAvatar2}
                  >
                    {avatarUrl2 ? (
                      <Image
                        // round
                        width="100%"
                        height="100%"
                        src={avatarUrl2}
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
                }
                {
                  process.env.TARO_ENV === 'h5' && <Uploader name="file1" accept="image" onDelete={deleteFile2} maxCount={1}></Uploader>
                }
                {/* <Uploader name="file2" accept="image" onDelete={deleteFile2} maxCount={1}></Uploader> */}
              </FormItem>
              <FormItem
                label="联系方式"
                name="contact_info"
                required
              >
                <Field
                  className={styles.textarea}
                  placeholderClass={styles["textarea-placeholder"]}
                  type="textarea"
                  placeholder="请输入联系方式"
                  autosize={{ minHeight: "30px" }}
                  border={false}
                />
              </FormItem>
            </View>
            <Button
              type="primary"
              className="van-button-submit"
              onClick={throttle(handleSubmit, 2 * 1000)}
              loading={loading}
            >
              提交审核
            </Button>
          </Form>
        </View>
      </View>
    </View>
  );
}
