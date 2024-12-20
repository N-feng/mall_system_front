/*
 * @Description: 新增客户编辑页
 */
import {useCallback, useState, useEffect, useRef} from "react";
import { View } from "@tarojs/components";
import { navigateBack, getCurrentPages, showToast } from "@tarojs/taro";
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
import {addGoods, addVerification} from "@/api";
import {uploadImage} from "@/api/upload";
import CustomUploader from "@/components/customUploader";
import {mockGoods} from "@/utils/utils";

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

      const {file, ...rest} = fieldValues
      setLoading(true);
      const _data = {
        ...rest,
        id_card_front: currentFileId1,
        id_card_back: currentFileId2,
      };
      console.log('_data', _data)

      addVerification({
        ..._data,
      }).then((res)=>{
        const {message, status} = res
        showToast({ title: `${message}`, icon: status?"success":'error', duration: 2000 });
        // handleBack(data?.id);
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
        setCurrentFileId1(res.data.id)

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
      return fileList1;
    }).catch((error) => {
      Toast.clear();
      throw error;
    }).finally(() => {
      Toast.clear()
    });
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
                valueKey="fileList"
                valueFormat={valueFormatUpload1}
                trigger="onAfterRead"
                validateTrigger="onAfterRead"
                rules={{
                  rule: (values, call) => {
                    values.forEach((item, index) => {
                      // console.log('item',item)
                      if (item.size > 3 * 1024 * 1024) {
                        return call(`图片(${index + 1})大小不得大于 3M`)
                      }
                      call('')
                    })
                  },
                }}
              >
                <Uploader name="file1" accept="image" onDelete={deleteFile1} maxCount={1}></Uploader>
              </FormItem>

              <FormItem
                name="id_card_back"
                mutiLevel
                required
                // layout="vertical"
                label="身份证反面(图片大小不得大于 3M)"
                valueKey="fileList"
                valueFormat={valueFormatUpload2}
                trigger="onAfterRead"
                validateTrigger="onAfterRead"
                rules={{
                  rule: (values, call) => {
                    values.forEach((item, index) => {
                      console.log('item',item)
                      if (item.size > 3 * 1024 * 1024) {
                        return call(`图片(${index + 1})大小不得大于 3M`)
                      }
                      call('')
                    })
                  },
                }}
              >
                <Uploader name="file2" accept="image" onDelete={deleteFile2} maxCount={1}></Uploader>
              </FormItem>
              <FormItem
                label="联系人信息"
                name="contact_info"
                required
              >
                <Field
                  className={styles.textarea}
                  placeholderClass={styles["textarea-placeholder"]}
                  type="textarea"
                  placeholder="请输入联系人信息"
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
