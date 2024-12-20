/*
 * @Description: 新增 拜访/跟单
 */
import { useCallback, useState, useEffect } from "react";
import { View } from "@tarojs/components";
import {
  showToast,
} from "@tarojs/taro";

import {
  Form,
  FormItem,
  Button,
  Stepper,
  Field,
} from "@antmjs/vantui";
import moment from "moment";
import CustomPopup from "@/components/customPopup";
import cns from "classnames";
import { addVisit } from "@/api/visit";
import FormSelect from "@/components/formSelect";
import DateTimePicker from "@/components/dateTimePicker";
import styles from "./index.module.less";

export default function Index(props) {
  const { visible = false,data, intention_id, onClose ,onConfirm} = props;
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [curTimeType, setCurTimeType] = useState("");
  const [defaultValue, setDefaultValue] = useState(null);

  const formIt = Form.useForm();

  useEffect(() => {
    formIt.registerRequiredMessageCallback((label) => {
      return `${label}不能为空`;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = useCallback(() => {
    formIt.validateFields(async (errorMessage, fieldValues) => {
      console.log(fieldValues);
      if (errorMessage && errorMessage.length) {
        return console.info("errorMessage", errorMessage);
      }

      const {
        visit_time,
        next_visit_time,
        remind_start_time,
        remind_interval,
        content,
      } = fieldValues;



      let formData = new FormData();
      formData.append("visit_time",moment(visit_time).format("YYYY-MM-DD HH:mm:ss"));
      formData.append("next_visit_time", moment(next_visit_time).format("YYYY-MM-DD HH:mm:ss"));
      formData.append("remind_start_time", moment(remind_start_time).format("YYYY-MM-DD HH:mm:ss"));
      formData.append("remind_interval", remind_interval);
      formData.append("customer", data?.customer?.id);
      formData.append("connect_person", data?.connect_person?.id);
      formData.append("contents",JSON.stringify([
        {
          intention_project: data?.id,
          content: content,
        },
      ]));

      const { results } = await addVisit(formData);
      showToast({ title: "保存成功", icon: "success", duration: 2000 });
      onConfirm?.(results?.id);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);



  useEffect(()=>{
    if(visible){
      console.log("dara:",data)
    }
  },[visible])


  return (
    <CustomPopup
      visible={visible}
      title="新增拜访/跟单"
      closeable
      onClose={() => {
        onClose?.();
      }}
    >
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

              <FormItem
                label="拜访内容"
                name="content"
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
                    formIt?.setFieldsValue("content", (e?.detail ?? "").trim());
                  }}
                />
              </FormItem>
            </Form>
          </View>
          <Button
            type="primary"
            className="van-button-submit"
            onClick={handleSubmit}
          >
              保存
          </Button>
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
    </CustomPopup>
  );
}
