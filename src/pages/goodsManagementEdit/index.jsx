/*
 * @Description: 新增客户编辑页
 */
import {useCallback, useState, useEffect, useRef} from "react";
import {View, Button as TaroButton, Text} from "@tarojs/components";
import { navigateBack, getCurrentPages, showToast, chooseImage, uploadFile, getCurrentInstance } from "@tarojs/taro";
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
import {updateGoods, getGoods} from "@/api";
import {uploadImage} from "@/api/upload";
import CustomUploader from "@/components/customUploader";
import {mockGoods} from "@/utils/utils";
import userStore from "@/store/userStore";
import {APP_API_KEY_PREFIX} from "@/utils/constant";

export default function GoodsManagementDetail() {
  const [keySearchVisible, setKeySearchVisible] = useState(false);
  const [visitHidden, setVisitHidden] = useState(true); // 默认隐藏拜访
  const [searchData, setSearchData] = useState(null); // 拜访携带信息
  const [visitOptions, setVisitOptions] = useState([]); // 拜访记录
  const [loading, setLoading] = useState(false);
  const [isPublished, setPublished] = useState(true);
  const formIt = Form.useForm();
  const [goodInfo, setGoodInfo] = useState({});
  const [productList] = useState(mockGoods())
  const [currentFile, setCurrentFile] = useState(null)
  const [currentFileId, setCurrentFileId] = useState(null)

  const ins = getCurrentInstance();
  const { process_id } = ins.router.params;
  const baseURL = process.env.TARO_APP_BASE_API;
  console.log('process_id: ', process_id);

  useEffect(() => {
    formIt.registerRequiredMessageCallback((label) => {
      return `${label}不能为空`;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [avatarUrl, setAvatarUrl] = useState("")
  const handleChooseAvatar = async (e) => {
    console.log(e)
    setAvatarUrl(e.detail.avatarUrl)
    uploadAvatar(e.detail.avatarUrl)
  }
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

  const handleSubmit = () => {
    formIt.validateFields((errorMessage, fieldValues) => {
      console.log('fieldValues',fieldValues);
      if (errorMessage && errorMessage.length) {
        return console.info("errorMessage", errorMessage);
      }
      const {file, ...rest} = fieldValues
      setLoading(true);
      const _data = {
        ...rest,
        file_id: currentFileId,
        is_published: isPublished,
        file_path: avatarUrl,
        product_id: process_id
      };

      console.log('currentFile', currentFile)
      console.log('currentFileId', currentFileId)
      console.log('_data', _data)
      updateGoods(_data).then((res)=>{
        const {message, status} = res
        showToast({ title: `${message}`, icon: status?"success":'error', duration: 2000 });
        // handleBack(data?.id);
        handleBack()
      }).finally(() => {
        setLoading(false);
      })
    });
  };

  const getGoodInfo = useCallback(async () => {
    const { data = {} } = await getGoods({ product_id: process_id});
    console.log('data: ', data);
    setGoodInfo(data);

    setTimeout(() => {
      formIt.setFields({
        category: data.category,
        name: data.name,
        description: data.description,
        is_published: data.is_published,
        price: data.price,
        stock: data.stock,
        file_path: baseURL+data.file_path,
      });
      setAvatarUrl(baseURL+data.file_path)
      setCurrentFile(baseURL+data.file_path)
    }, 0);
  }, [formIt, process_id, baseURL]);

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
    if (process_id) {
      getGoodInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [process_id]);

  useEffect(() => {
    console.log('currentFileId changed:', currentFileId);
  }, [currentFileId]);
  const valueFormatUpload = (event, formName, instance) => {
    console.log('event, formName, instance',event, formName, instance);
    Toast.loading('上传中...')
    const { file } = event.detail
    let fileList = instance.getFieldValue(formName) || []
    fileList = fileList.concat(file)

    console.log(file, fileList)
    console.log('process.env.TARO_ENV', process.env.TARO_ENV)
    console.log('process.env.TARO_ENV === \'weapp\'', process.env.TARO_ENV === 'weapp')

    if(process.env.TARO_ENV === 'weapp'){
      console.log('process.env.TARO_ENV === \'weapp\'', process.env.TARO_ENV === 'weapp')
      chooseImage({
        success (res) {
          const tempFilePaths = res.tempFilePaths
          console.log('tempFilePaths', tempFilePaths)
          uploadFile({
            url: `${process.env.TARO_APP_BASE_API}/common/upload/create_file/`, //仅为示例，非真实的接口地址
            filePath: tempFilePaths[0],
            name: 'file',
            formData: {
              'user': 'test'
            },
            // eslint-disable-next-line no-shadow
            success (res){
              const data = res.data
              console.log('小程序上传图片成功', res)
              //do something
            }
          })
        }
      })
    }

    if(process.env.TARO_ENV === 'h5'){
      const formData = new FormData();
      formData.append('is_common', false);
      formData.append('file_type', 'goods');
      formData.append('file', file.originalFileObj);
      return uploadImage(formData).then((res) => {
        if (res) {
          const { data, message, status } = res
          console.log('uploadImage.res', res)
          console.log('uploadImage.res.data', res.data)
          console.log('uploadImage.res.data.id', res.data.id)
          setCurrentFile(data)
          setCurrentFileId(res.data.id)

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
  }

  const afterRead = (event) => {
    const { file } = event.detail
    console.log(file)
    const formData = new FormData();
    formData.append('file_type', 'goods');
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
  const deleteFile = (event) => {
    const { index, fileList } = event.detail
    fileList.splice(index, 1)

    formRef.current?.setFieldsValue('file', fileList)
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
                label="商品分类"
                name="category"
                required
              >
                <Field
                  placeholderClass={styles["filed-placeholder"]}
                  placeholder="请输入商品分类"
                  border={false}
                />
              </FormItem>
              <FormItem
                label="商品名称"
                name="name"
                required
              >
                <Field
                  placeholderClass={styles["filed-placeholder"]}
                  placeholder="请输入商品名称"
                  border={false}
                />
              </FormItem>
              <FormItem
                label="商品描述"
                name="description"
                required
              >
                <Field
                  className={styles.textarea}
                  placeholderClass={styles["textarea-placeholder"]}
                  type="textarea"
                  placeholder="请输入商品描述"
                  autosize={{ minHeight: "30px" }}
                  border={false}
                />
              </FormItem>
              <FormItem
                label="是否上架"
                name="is_published"
                // valueKey="checked"
              >
                <Switch checked={isPublished} onChange={(e) => setPublished(e.detail)} />
              </FormItem>
              <FormItem
                label="价格"
                name="price"
                required
              >
                <Field
                  placeholderClass={styles["filed-placeholder"]}
                  type="number"
                  placeholder="请输入价格"
                  border={false}
                  renderButton="¥"
                />
              </FormItem>
              <FormItem
                label="商品库存"
                name="stock"
                required
              >
                <Field
                  className={styles.textarea}
                  placeholderClass={styles["filed-placeholder"]}
                  type="number"
                  placeholder="请输入商品库存"
                  autosize={{ minHeight: "30px" }}
                  border={false}
                />
              </FormItem>
              <FormItem
                name="file"
                mutiLevel
                // required
                // layout="vertical"
                label={<>
                  <Text style={{color: 'red', marginLeft: '-6px'}}>*</Text>上传图片
                </>}
                valueKey="fileList"
                valueFormat={valueFormatUpload}
                trigger="onAfterRead"
                validateTrigger="onAfterRead"
                /*rules={{
                  rule: (values, call) => {
                    values.forEach((item, index) => {
                      console.log('item',item)
                      if (item.size > 3 * 1024 * 1024) {
                        return call(`图片(${index + 1})大小不得大于 3M`)
                      }
                      call('')
                    })
                  },
                }}*/
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
                    onChooseAvatar={handleChooseAvatar}
                  >
                    {avatarUrl ? (
                      <Image
                        // round
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
                }
                {
                  process.env.TARO_ENV === 'h5' && <Uploader name="file1" accept="image" onDelete={deleteFile} maxCount={1}></Uploader>
                }
              </FormItem>
              {/*<CustomUploader />*/}
            </View>
            <Button
              type="primary"
              className="van-button-submit"
              onClick={throttle(handleSubmit, 2 * 1000)}
              loading={loading}
            >
              编辑商品
            </Button>
          </Form>
        </View>
      </View>

      {/* 客户+课题组+负责人 搜索 */}
      {/*<KeySearch
        visible={keySearchVisible}
        showAdd={false}
        onClose={() => {
          setKeySearchVisible(false);
        }}
        onConfirm={(data, name) => {
          console.log(data, name);
          setKeySearchVisible(false);
          setSearchData(data);
          formIt.setFieldsValue("unit_name", name);
          handleGetVisitRecords(data?.id);
          // 取消课题组禁用
          setVisitHidden(false);
        }}
      />*/}
    </View>
  );
}
