/*
 * @Description: 编辑 拜访/跟单
 */
import { useCallback, useState, useEffect } from "react";
import { View } from "@tarojs/components";
import { showToast, nextTick } from "@tarojs/taro";

import {
  Form,
  FormItem,
  Button,
  Stepper,
  Field,
  CheckboxGroup,
  Checkbox,
  Skeleton
} from "@antmjs/vantui";
import moment from "moment";
import CustomPopup from "@/components/customPopup";
import cns from "classnames";
import { updateVisit, fetchVisit } from "@/api/visit";
import { fetchIntentionList } from "@/api/intention";
import FormSelect from "@/components/formSelect";
import DateTimePicker from "@/components/dateTimePicker";
import styles from "./index.module.less";

export default function Index(props) {
  const {
    visible = false,
    editable = false,
    id,
    customer_id,
    visit_id,
    onClose,
    onConfirm,
  } = props;
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [curTimeType, setCurTimeType] = useState("");
  const [defaultValue, setDefaultValue] = useState(null);
  const [intentionList, setIntentionList] = useState([]);
  const [formInitData, setFormInitData] = useState({});
  const [loading,setLoading] = useState(false)

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
        result,
        intention_projects,
      } = fieldValues;

      let data = {
        visit_time: moment(visit_time).format("YYYY-MM-DD HH:mm:ss"),
        next_visit_time: moment(next_visit_time).format("YYYY-MM-DD HH:mm:ss"),
        remind_start_time: moment(remind_start_time).format(
          "YYYY-MM-DD HH:mm:ss",
        ),
        remind_interval: remind_interval,
        customer: customer_id,
        connect_person: id,
        result: result,
        intention_projects: intention_projects,
      };

      const { results } = await updateVisit(visit_id, data);
      showToast({ title: "保存成功", icon: "success", duration: 2000 });
      onConfirm?.(results?.id);
    });
  }, [customer_id, formIt, id, onConfirm, visit_id]);

  const handleGetVisit = useCallback(async () => {
    const { results = {} } = await fetchVisit(visit_id);
    setLoading(false)

    const ids = (results?.intention_projects ?? []).map((e) => String(e.id));

    const data = {
      ...results,
      visit_time: moment(results?.visit_time).format("YYYY-MM-DD"),
      next_visit_time: moment(results?.next_visit_time).format("YYYY-MM-DD"),
      remind_start_time: moment(results?.remind_start_time).format(
        "YYYY-MM-DD",
      ),
      remind_interval: results?.remind_interval,
    };

    nextTick(() => {
      formIt.setFields(data);
      // 多此一举，真的是因为checkbox有bug
      formIt.setFieldsValue("intention_projects", ids);
      setFormInitData({
        ...data,
      });
    });
  }, [formIt, visit_id]);

  const getIntentionList = useCallback(async () => {
    const { results = [] } = await fetchIntentionList({
      connect_person: id,
      not_page: true,
    });

    // 这里需要排除已被其它拜访关联的意向
    let _filter = results?.filter((e) => {
      return !(e.visit && e.visit?.id !== visit_id);
    });

    setIntentionList(_filter);
    handleGetVisit();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, visit_id]);

  useEffect(() => {
    if (visible) {
      setLoading(true)
      id && getIntentionList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, id]);

  const renderCheckboxLabel = (e) => {
    return e.content ? `${e.title} @ ${e.content}` : `${e.title}`;
  };

  const renderPreviewIntention = () => {
    if (formInitData?.intention_projects?.length === 0) {
      return <View className={styles["intention-empty"]}>暂无关联意向</View>;
    }
    return (formInitData?.intention_projects ?? []).map((e) => (
      <View key={e.id} className={styles.intention}>
        {renderCheckboxLabel(e)}
      </View>
    ));
  };

  return (
    <CustomPopup
      visible={visible}
      title={editable ? "编辑拜访/跟单" : "拜访/跟单详情"}
      closeable
      onClose={() => {
        onClose?.();
      }}
    >
      <Skeleton row="7" loading={loading}>
        <View className={styles.visitDetail}>
          <View className={styles.container}>
            {editable ? (
              <>
                <View className={cns(styles.form, "form")}>
                  <Form
                    initialValues={{
                      visit_time: moment().format("YYYY-MM-DD"),
                      next_visit_time: moment()
                        .add(7, "days")
                        .format("YYYY-MM-DD"),
                      remind_start_time: moment()
                        .add(6, "days")
                        .format("YYYY-MM-DD"),
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
                          formIt?.setFieldsValue(
                            "result",
                            (e?.detail ?? "").trim(),
                          );
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
                              {renderCheckboxLabel(e)}
                            </Checkbox>
                          ))}
                        </CheckboxGroup>
                      </FormItem>
                    )}
                  </Form>
                </View>
                <Button
                  type="primary"
                  className="van-button-submit"
                  onClick={handleSubmit}
                >
                保存
                </Button>
              </>
            ) : (
              <View className={styles.preview}>
                <View className={styles.item}>
                  <View className={styles["item--l"]}>最近拜访日期</View>
                  <View className={styles["item--r"]}>
                    {formInitData?.visit_time}
                  </View>
                </View>
                <View className={styles.item}>
                  <View className={styles["item--l"]}>下次拜访日期</View>
                  <View className={styles["item--r"]}>
                    {formInitData?.next_visit_time}
                  </View>
                </View>
                <View className={styles.item}>
                  <View className={styles["item--l"]}>提醒开始日期</View>
                  <View className={styles["item--r"]}>
                    {formInitData?.remind_start_time}
                  </View>
                </View>
                <View className={styles.item}>
                  <View className={styles["item--l"]}>提醒间隔</View>
                  <View className={styles["item--r"]}>
                    {formInitData?.remind_interval}
                  </View>
                </View>
                <View className={styles.item}>
                  <View className={styles["item--l"]}>拜访内容</View>
                  <View className={styles["item--r"]}>
                    {formInitData?.result}
                  </View>
                </View>
                <View className={styles.item}>
                  <View className={styles["item--l"]}>关联意向</View>
                  <View className={styles["item--r"]}>
                    {renderPreviewIntention()}
                  </View>
                </View>
              </View>
            )}
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
      </Skeleton>
    </CustomPopup>
  );
}
