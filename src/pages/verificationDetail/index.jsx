/*
 * @Description: 新增客户编辑页
 */
import {useCallback, useState, useEffect, useRef} from "react";
import { View } from "@tarojs/components";
import {navigateBack, getCurrentPages, showToast, getCurrentInstance} from "@tarojs/taro";
import {
  Form,
  FormItem,
  Button,
  Field,
  RadioGroup,
  Radio, Uploader, Toast, Switch,
} from "@antmjs/vantui";
import cns from "classnames";
import { throttle } from "lodash";
import { getVisitRecords } from "@/api/visit";
import { addIntention } from "@/api/intention";
import FormSelect from "@/components/formSelect";
import KeySearch from "@/pages/intentionDetail/components/keySearch";
import styles from "@/pages/intentionDetail/index.module.less";
import {addGoods, addVerification, examineVerification, fetchApplicationDetail, fetchUserInfo} from "@/api";
import {uploadImage} from "@/api/upload";
import CustomUploader from "@/components/customUploader";
import {mockGoods} from "@/utils/utils";

export default function VerificationDetail() {
  const instance = getCurrentInstance();
  const { id, intention_id } = instance.router.params;
  const [keySearchVisible, setKeySearchVisible] = useState(false);
  const [visitHidden, setVisitHidden] = useState(true); // 默认隐藏拜访
  const [searchData, setSearchData] = useState(null); // 拜访携带信息
  const [visitOptions, setVisitOptions] = useState([]); // 拜访记录
  const [loading, setLoading] = useState(false);
  const [isPublished, setPublished] = useState(false);
  const formIt = Form.useForm();
  const [productList] = useState(mockGoods())
  const [userObj, setUserObj] = useState()


  const getApplicationDetail = () => {
    fetchApplicationDetail({id: id}).then(res => {
      if(res){
        const {data, status} = res
        if(status){
          setUserObj(data)
          formIt.setFields(data)
          if(data){
          }
        }
      }
    })
  }
  useEffect(() => {
    getApplicationDetail()
  },[])

  useEffect(() => {
    formIt.registerRequiredMessageCallback((label) => {
      return `${label}不能为空`;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    formIt.validateFields((errorMessage, fieldValues) => {
      console.log(fieldValues);
      if (errorMessage && errorMessage.length) {
        return console.info("errorMessage", errorMessage);
      }

      setLoading(true);

      const { id_card_front, id_card_back, contact_info, ...opt } = fieldValues;

      const _data = {
        ...opt,

        id: id,
        status: isPublished?'approved':'rejected', // ('approved', '审核通过'),  ('rejected', '审核拒绝')
      };

      examineVerification({
        ..._data,
      }).then((res)=>{
        const {message, status} = res
        showToast({ title: `${message}`, icon: status?"success":'error', duration: 2000 });
        handleBack();
      }).finally(() => {
        setLoading(false);
      })
    });
  };

  const handleGetVisitRecords = async (_id) => {
    const { results = [] } = await getVisitRecords(_id, {
      not_page: true,
    });
    const _options = results.map((e) => {
      return {
        label: e?.result,
        value: e?.id,
      };
    });
    setVisitOptions(_options);
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

  const valueFormatUpload = (event, formName, instance) => {
    Toast.loading('上传中...')
    const { file } = event.detail
    let fileList = instance.getFieldValue(formName) || []
    fileList = fileList.concat(file)

    console.log(file, fileList)
    const formData = new FormData();
    formData.append('is_common', false);
    formData.append('file_type', 'goods');
    formData.append('file', file.originalFileObj);

    uploadImage(formData).then((res)=>{
      console.log(res)
      if(res){
        const {message, status} = res
        if(status){
          showToast({
            title: message,
            icon: "none",
            duration: 1000,
          });
        }else{
          showToast({
            title: message,
            icon: "error",
            duration: 1000,
          });
        }
      }
    }).finally(() => {
      Toast.clear()
    })
    // 异步更新
    /*return new Promise((resolve) => {
      setTimeout(() => {
        Toast.clear()
        resolve(fileList)
      }, 3000)
    })*/
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
            {/*<View className="form-title">关联拜访</View>
            <View className="form-card">
              <FormItem
                required
                label="所属负责人"
                name="unit_name"
                valueFormat={(e) => e.detail.value}
                onClick={() => {
                  setKeySearchVisible(true);
                }}
              >
                <FormSelect placeholder="所属负责人" />
              </FormItem>
              {!visitHidden && (
                <>
                  {visitOptions?.length > 0 ? (
                    <FormItem required label="关联拜访记录" name="visit">
                      <RadioGroup>
                        {visitOptions.map((e) => (
                          <Radio
                            name={e.value}
                            checkedColor="#07c160"
                            iconSize="18px"
                            key={e.value}
                          >
                            {e.label}
                          </Radio>
                        ))}
                      </RadioGroup>
                    </FormItem>
                  ) : (
                    <FormItem required label="关联拜访记录" name="visit">
                      <View className={styles["intention-empty"]}>
                        该负责人暂无可关联拜访记录
                      </View>
                    </FormItem>
                  )}
                </>
              )}
            </View>
            <View className="form-title">意向信息</View>*/}
            <View className="form-card">
              <FormItem
                label="身份证正面"
                name="id_card_front"
                valueFormat={(e) => e.detail}
              >
                <Field
                  placeholderClass={styles["filed-placeholder"]}
                  placeholder="请输入身份证正面"
                  border={false}
                  disabled
                  onInput={(e) => {
                    formIt?.setFieldsValue("id_card_front", (e?.detail ?? "").trim());
                  }}
                />
              </FormItem>
              <FormItem
                label="身份证反面"
                name="id_card_back"
                valueFormat={(e) => e.detail}
              >
                <Field
                  placeholderClass={styles["filed-placeholder"]}
                  placeholder="请输入身份证反面"
                  border={false}
                  disabled
                  onInput={(e) => {
                    formIt?.setFieldsValue("id_card_back", (e?.detail ?? "").trim());
                  }}
                />
              </FormItem>
              <FormItem
                label="联系人信息"
                name="contact_info"
                valueFormat={(e) => e.detail}
              >
                <Field
                  className={styles.textarea}
                  placeholderClass={styles["textarea-placeholder"]}
                  type="textarea"
                  placeholder="请输入联系人信息"
                  autosize={{ minHeight: "30px" }}
                  border={false}
                  disabled
                  onInput={(e) => {
                    formIt?.setFieldsValue("contact_info", e?.detail);
                  }}
                />
              </FormItem>
              <FormItem
                label="是否通过"
                name="status"
                // valueKey="checked"
              >
                <Switch checked={isPublished} onChange={(e) => {
                  console.log(e.detail);
                  setPublished(e.detail);
                }}
                />
              </FormItem>
              <FormItem
                label="审核意见"
                name="review_comment"
                required
              >
                <Field
                  className={styles.textarea}
                  placeholderClass={styles["textarea-placeholder"]}
                  type="textarea"
                  placeholder="请输入审核意见"
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
              提交
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
