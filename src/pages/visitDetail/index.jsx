/*
 * @Description: 新增拜访
 */
import { useCallback, useState, useEffect } from "react";
import { View } from "@tarojs/components";
import {
  useLoad,
  useDidShow,
  showToast,
  getCurrentInstance,
  navigateBack,
  getCurrentPages,
} from "@tarojs/taro";
import {
  Form,
  FormItem,
  Button,
  Stepper,
  Field,
  CheckboxGroup,
  Checkbox,
} from "@antmjs/vantui";
import moment from "moment";
import cns from "classnames";
import {  throttle } from "lodash";
import { addVisit } from "@/api/visit";
import { fetchIntentionList } from "@/api/intention";
import { getContact } from "@/api/customer";
import FormSelect from "@/components/formSelect";
import DateTimePicker from "@/components/dateTimePicker";
import styles from "./index.module.less";

export default function Index() {
  const instance = getCurrentInstance();
  const { id, intention_id } = instance.router.params;

  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [curTimeType, setCurTimeType] = useState("");
  const [defaultValue, setDefaultValue] = useState(null);
  const [intentionList, setIntentionList] = useState([]);
  const [contactInfo, setContactInfo] = useState({});
  const [loading,setLoading] = useState(false)


  const formIt = Form.useForm();

  useEffect(() => {
    formIt.registerRequiredMessageCallback((label) => {
      return `${label}不能为空`;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      setLoading(false)
    }, 2000);
  };

  const handleSubmit = useCallback(() => {
    formIt.validateFields(async (errorMessage, fieldValues) => {
      console.log(fieldValues);
      if (errorMessage && errorMessage.length) {
        return console.info("errorMessage", errorMessage);
      }

      if(loading){
        return;
      }

      setLoading(true)

      const {
        visit_time,
        next_visit_time,
        remind_start_time,
        result,
        remind_interval,
        intention_projects,
      } = fieldValues;

      let data = {
        visit_time:moment(visit_time).format("YYYY-MM-DD HH:mm:ss"),
        next_visit_time:moment(next_visit_time).format("YYYY-MM-DD HH:mm:ss"),
        remind_start_time:moment(remind_start_time).format("YYYY-MM-DD HH:mm:ss"),
        customer:+contactInfo?.customer?.id,
        remind_interval:remind_interval,
        connect_person:+contactInfo?.id,
        result:result,
        intention_projects:intention_projects
      }

      const { results } = await addVisit(data);
      showToast({ title: "保存成功", icon: "success", duration: 2000 });
      handleBack(results?.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactInfo?.customer?.id, id,loading]);

  const getContactInfo = useCallback(async () => {
    const { results = {} } = await getContact(id);
    setContactInfo(results);
    const _kind =
      (results?.kind?.category ?? []).join(" / ") + " / " + results?.kind?.name;

    setTimeout(() => {
      formIt.setFields({
        customer_name: results?.customer?.unit_name,
        research_group: results?.customer?.research_group,
        name: results?.name,
        kind: _kind,
      });
    }, 0);
  }, [formIt, id]);

  // 这里需要过滤一下已经被关联的意向
  const getIntentionList = useCallback(async () => {
    const { results = [] } = await fetchIntentionList({
      connect_person: id,
      not_page: true,
      visit__isnull: true,
    });
    setIntentionList(results);
  }, [id]);

  useDidShow(() => {
    console.log("useDidShow");
  });

  useLoad(() => {
    console.log("useLoad");
  });

  useEffect(() => {
    if (id) {
      getContactInfo();
      getIntentionList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id,intention_id]);


  const renderCheckboxLabel = (e)=>{
    return e.content ? `${e.title} @ ${e.content}` : `${e.title}`;
  }

  return (
    <View className={styles.visitDetail}>
      <View className={styles.container}>
        <View className={cns(styles.form, "form")}>
          <Form
            initialValues={{
              visit_time: moment().format("YYYY-MM-DD"),
              next_visit_time: moment().add(7, "days").format("YYYY-MM-DD"),
              remind_start_time: moment().add(6, "days").format("YYYY-MM-DD"),
              remind_interval: 0,
            }}
            form={formIt}
            onFinish={(errs, res) => console.info(errs, res)}
          >
            <View className="form-title">负责人信息</View>
            <View className="form-card">
              <FormItem
                label="客户单位"
                name="customer_name"
                className="form-item--disabled"
              >
                <Field disabled />
              </FormItem>
              <FormItem
                label="课题组"
                name="research_group"
                className="form-item--disabled"
              >
                <Field disabled />
              </FormItem>
              <FormItem
                label="负责人"
                name="name"
                className="form-item--disabled"
              >
                <Field disabled />
              </FormItem>
              <FormItem
                label="物种"
                name="kind"
                className="form-item--disabled"
              >
                <Field disabled />
              </FormItem>
            </View>
            <View className={cns("form-title")}>拜访信息</View>
            <View className={cns("form-card")}>
              <FormItem
                required
                label="最近拜访日期"
                name="visit_time"
                valueFormat={(e) => e.detail.value}
                onClick={() => {
                  const time = formIt?.getFieldValue("visit_time");
                  const timeStamp = moment(time, "YYYY-MM-DD").valueOf();
                  setDefaultValue(timeStamp);
                  setCurTimeType("visit_time");
                  setTimePickerVisible(true);
                }}
              >
                <FormSelect placeholder="请选择日期" />
              </FormItem>
              {/* 下次拜访日期应晚于最近拜访日期 */}
              <FormItem
                label="下次拜访日期"
                name="next_visit_time"
                required
                rules={{
                  rule: (value, call) => {
                    const visit_time = formIt.getFieldValue("visit_time");
                    if (moment(value).isBefore(visit_time)) {
                      return call(`下次拜访日期应晚于最近拜访日期`);
                    }
                    return call("");
                  },
                }}
                onClick={() => {
                  const time = formIt?.getFieldValue("next_visit_time");
                  const timeStamp = moment(time, "YYYY-MM-DD").valueOf();
                  setDefaultValue(timeStamp);
                  setCurTimeType("next_visit_time");
                  setTimePickerVisible(true);
                }}
              >
                <FormSelect placeholder="请选择日期" />
              </FormItem>
              {/* 提醒开始日期应晚于本次拜访时间，且应早于或等于下次拜访时间*/}
              <FormItem
                label="提醒开始日期"
                name="remind_start_time"
                required
                rules={{
                  rule: (value, call) => {
                    const visit_time = formIt.getFieldValue("visit_time");
                    const next_visit_time =
                      formIt.getFieldValue("next_visit_time");
                    if (moment(value).isBefore(visit_time)) {
                      return call(`提醒日期应晚于本次拜访时间`);
                    }
                    if (moment(next_visit_time).isBefore(value)) {
                      return call(`提醒日期应早于或等于下次拜访时间`);
                    }
                    return call("");
                  },
                }}
                onClick={() => {
                  const time = formIt?.getFieldValue("remind_start_time");
                  const timeStamp = moment(time, "YYYY-MM-DD").valueOf();
                  setDefaultValue(timeStamp);
                  setCurTimeType("remind_start_time");
                  setTimePickerVisible(true);
                }}
              >
                <FormSelect placeholder="请选择日期" />
              </FormItem>
              <FormItem
                label="提醒间隔"
                name="remind_interval"
                required
                className={styles["remind-interval"]}
              >
                <Stepper min={0} integer />
              </FormItem>
              {/* </View>
            <View className={cns("form-title")}>拜访信息</View>
            <View className={cns("form-card")}> */}
              <FormItem
                label="拜访内容"
                name="result"
                required
                valueFormat={(e) => e.detail}
              >
                <Field
                  className={styles.textarea}
                  placeholderClass={styles["textarea-placeholder"]}
                  type="textarea"
                  placeholder="请输入拜访内容"
                  autosize={{ minHeight: "30px" }}
                  border={false}
                  onInput={(e) => {
                    formIt?.setFieldsValue("result", (e?.detail ?? "").trim());
                  }}
                />
              </FormItem>
              {intentionList?.length === 0 ? (
                <FormItem label="意向" name="">
                  <View className={styles["intention-empty"]}>
                  该负责人暂无可关联意向
                  </View>
                </FormItem>
              ) : (
                <FormItem label="意向" name="intention_projects">
                  <CheckboxGroup>
                    {intentionList.map((e) => (
                      <Checkbox
                        key={e.id}
                        name={String(e.id)}
                        // shape="square"
                        checkedColor="#00bf7e"
                        iconSize="18px"
                      >
                        {renderCheckboxLabel(e)}-{e.id}
                      </Checkbox>
                    ))}
                  </CheckboxGroup>
                </FormItem>
              )}
            </View>
            <Button
              type="primary"
              className="van-button-submit"
              onClick={throttle(handleSubmit,2*1000)}
              loading={loading}
            >
              新增拜访 / 跟单
            </Button>
          </Form>
        </View>
      </View>

      <DateTimePicker
        visible={timePickerVisible}
        defaultValue={defaultValue}
        onConfirm={(val) => {
          const time = moment(val).format("YYYY-MM-DD");
          formIt?.setFieldsValue(curTimeType, time);
          setTimePickerVisible(false);
          setDefaultValue(null);
        }}
        onClose={() => {
          setTimePickerVisible(false);
          setDefaultValue(null);
        }}
      />
    </View>
  );
}
