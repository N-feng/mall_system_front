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
import {addGoods} from "@/api";
import {uploadImage} from "@/api/upload";
import CustomUploader from "@/components/customUploader";
import {mockGoods} from "@/utils/utils";
import {addOrder} from "@/api/order";

export default function OrderDetail() {
  const [keySearchVisible, setKeySearchVisible] = useState(false);
  const [visitHidden, setVisitHidden] = useState(true); // 默认隐藏拜访
  const [searchData, setSearchData] = useState(null); // 拜访携带信息
  const [visitOptions, setVisitOptions] = useState([]); // 拜访记录
  const [loading, setLoading] = useState(false);
  const [isPublished, setPublished] = useState(false);
  const formIt = Form.useForm();
  const [productList] = useState(mockGoods())


  useEffect(() => {
    formIt.registerRequiredMessageCallback((label) => {
      return `${label}不能为空`;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = useCallback(() => {
    formIt.validateFields((errorMessage, fieldValues) => {
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

      for(let i=0; i<100; i++){
        addOrder({
          merchant_id: 0,
          total_amount: 676,
          items:[
            {
              product_id: Math.floor(Math.random()*2000),
              quantity: 18,
              price: Math.floor(Math.random()*2000),
            }
          ]
        }).then((res)=>{
          const {message, status} = res
          showToast({ title: `${message}`, icon: status?"success":'error', duration: 2000 });
          // handleBack(data?.id);
        }).finally(() => {
          setLoading(false);
        })
      }
      addOrder({
        ..._data,
      }).then((res)=>{
        const {message, status} = res
        showToast({ title: `${message}`, icon: status?"success":'error', duration: 2000 });
        // handleBack(data?.id);
      }).finally(() => {
        setLoading(false);
      })
    });
  }, [searchData, formIt]);

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
                label="分类"
                name="category"
                required
                valueFormat={(e) => e.detail}
              >
                <Field
                  placeholderClass={styles["filed-placeholder"]}
                  placeholder="请输入商品分类"
                  border={false}
                  onInput={(e) => {
                    formIt?.setFieldsValue("category", (e?.detail ?? "").trim());
                  }}
                />
              </FormItem>
              <FormItem
                label="商品名称"
                name="name"
                required
                valueFormat={(e) => e.detail}
              >
                <Field
                  placeholderClass={styles["filed-placeholder"]}
                  placeholder="请输入商品名称"
                  border={false}
                  onInput={(e) => {
                    formIt?.setFieldsValue("name", (e?.detail ?? "").trim());
                  }}
                />
              </FormItem>
              <FormItem
                label="商品描述"
                name="description"
                required
                valueFormat={(e) => e.detail}
              >
                <Field
                  className={styles.textarea}
                  placeholderClass={styles["textarea-placeholder"]}
                  type="textarea"
                  placeholder="请输入商品描述"
                  autosize={{ minHeight: "30px" }}
                  border={false}
                  onInput={(e) => {
                    formIt?.setFieldsValue("description", e?.detail);
                  }}
                />
              </FormItem>
              <FormItem
                label="商品主图地址"
                name="file_id"
                required
                valueFormat={(e) => e.detail}
              >
                <Field
                  className={styles.textarea}
                  placeholderClass={styles["textarea-placeholder"]}
                  type="textarea"
                  placeholder="请输入商品主图地址"
                  autosize={{ minHeight: "30px" }}
                  border={false}
                  onInput={(e) => {
                    formIt?.setFieldsValue("file_id", e?.detail);
                  }}
                />
              </FormItem>
              <FormItem
                label="是否上架"
                name="is_published"
              >
                <Switch checked={isPublished} onChange={(e) => setPublished(e.detail)} />
              </FormItem>
              <FormItem
                label="价格"
                name="price"
                required
                valueFormat={(e) => e.detail}
              >
                <Field
                  className={styles.textarea}
                  placeholderClass={styles["textarea-placeholder"]}
                  type="number"
                  placeholder="请输入价格"
                  autosize={{ minHeight: "30px" }}
                  border={false}
                  onInput={(e) => {
                    formIt?.setFieldsValue("price", e?.detail);
                  }}
                  renderButton="¥"
                />
              </FormItem>
              <FormItem
                label="商品库存"
                name="stock"
                required
                valueFormat={(e) => e.detail}
              >
                <Field
                  className={styles.textarea}
                  placeholderClass={styles["textarea-placeholder"]}
                  type="textarea"
                  placeholder="请输入商品库存"
                  autosize={{ minHeight: "30px" }}
                  border={false}
                  onInput={(e) => {
                    formIt?.setFieldsValue("stock", e?.detail);
                  }}
                />
              </FormItem>
              <FormItem
                label="店铺id"
                name="store_id"
                required
                valueFormat={(e) => e.detail}
              >
                <Field
                  className={styles.textarea}
                  placeholderClass={styles["textarea-placeholder"]}
                  type="textarea"
                  placeholder="请输入店铺id"
                  autosize={{ minHeight: "30px" }}
                  border={false}
                  onInput={(e) => {
                    formIt?.setFieldsValue("store_id", e?.detail);
                  }}
                />
              </FormItem>
              {/*<FormItem
                name="file"
                mutiLevel
                required
                // layout="vertical"
                label="上传图片(图片大小不得大于 3M)"
                valueKey="fileList"
                valueFormat={valueFormatUpload}
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
                <Uploader name="file1" accept="image" onDelete={deleteFile}></Uploader>
              </FormItem>*/}
              {/*<CustomUploader />*/}
            </View>
            <Button
              type="primary"
              className="van-button-submit"
              onClick={throttle(handleSubmit, 2 * 1000)}
              loading={loading}
            >
              创建订单
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
