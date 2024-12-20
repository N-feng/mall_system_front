import { useCallback, useState, useEffect, useMemo } from "react";
import { View } from "@tarojs/components";
import {
  FormItem,
  Field,
  Form,
  RadioGroup,
  Radio,
  Button,
  Skeleton
} from "@antmjs/vantui";
import { updateIntention, fetchIntention } from "@/api/intention";
import { nextTick, showToast } from "@tarojs/taro";
import { getVisitRecords } from "@/api/visit";
import { getBusinessIntentionsPermissions } from "@/utils/authority";
import { formatNumber } from "@/utils/utils";
import userStore from "@/store/userStore";
import CustomPopup from "@/components/customPopup";
import styles from "./index.module.less";

export default function GoodsManegeForm(props) {
  const { visible = false, id, connectPersonId, onConfirm, onClose } = props;
  const formIt = Form.useForm();
  const userInfo = userStore.getUserInfo();
  const [formData, setFormData] = useState(null);
  const [visitOptions, setVisitOptions] = useState([]); // 拜访记录
  const intentionPermissions = getBusinessIntentionsPermissions(userInfo);
  const [loading,setLoading] = useState(false)

  const handleGetVisitRecords = async () => {
    const { results = [] } = await getVisitRecords(connectPersonId, {
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

  const getIntention = useCallback(async () => {
    const { results = {} } = await fetchIntention(id);
    setLoading(false)
    setFormData(results);
    nextTick(() => {
      formIt.setFields({
        title: results?.title,
        classification: results?.classification,
        content: results?.content,
        estimated_sales: results?.estimated_sales,
        visit: results?.visit?.id,
      });
    });
  }, [formIt, id]);

  const handleSubmit = useCallback(() => {
    formIt.validateFields(async (errorMessage, fieldValues) => {
      console.log(fieldValues);
      if (errorMessage && errorMessage.length) {
        return console.info("errorMessage", errorMessage);
      }

      const _data = {
        ...fieldValues,
        estimated_sales: fieldValues?.estimated_sales || 0,
        connect_person: formData?.connect_person?.id,
        customer: formData?.customer?.id,
        kind: formData?.connect_person?.kind,
      };

      await updateIntention(id, _data);

      showToast({ title: "保存成功", icon: "success", duration: 2000 });
      onConfirm?.();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  useEffect(() => {
    if (visible) {
      setLoading(true)
      id && getIntention();
      connectPersonId && handleGetVisitRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, connectPersonId, visible]);

  const renderTitle = useMemo(() => {
    return intentionPermissions?.modify ? "编辑意向" : "意向详情";
  }, [intentionPermissions?.modify]);


  return (
    <CustomPopup
      visible={visible}
      title={renderTitle}
      closeable
      onClose={() => {
        onClose?.();
      }}
    >
      <Skeleton row="7" loading={loading}>

        {intentionPermissions?.modify ? (
          <View className={styles.content}>
            <Form
              initialValues={{}}
              form={formIt}
              onFinish={(errs, res) => console.info(errs, res)}
              className={styles.form}
            >
              <FormItem
                label="项目标题"
                name="title"
                required
                valueFormat={(e) => e.detail}
              >
                <Field
                  placeholderClass={styles["filed-placeholder"]}
                  placeholder="请输入项目标题"
                  border={false}
                  onInput={(e) => {
                    formIt?.setFieldsValue("title", (e?.detail ?? "").trim());
                  }}
                />
              </FormItem>
              <FormItem
                label="项目内容"
                name="content"
                valueFormat={(e) => e.detail}
              >
                <Field
                  className={styles.textarea}
                  placeholderClass={styles["textarea-placeholder"]}
                  type="textarea"
                  placeholder="请输入项目内容"
                  autosize={{ minHeight: "30px" }}
                  border={false}
                  onInput={(e) => {
                    formIt?.setFieldsValue("content", e?.detail);
                  }}
                />
              </FormItem>
              <FormItem
                label="预计销售额"
                name="estimated_sales"
                valueFormat={(e) => e.detail}
              >
                <Field
                  type="number"
                  placeholderClass={styles["filed-placeholder"]}
                  placeholder="请输入预计销售额"
                  border={false}
                  onInput={(e) => {
                    formIt?.setFieldsValue(
                      "estimated_sales",
                      (e?.detail ?? "").trim(),
                    );
                  }}
                  renderButton="¥"
                />
              </FormItem>
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
            </Form>

            <Button
              type="primary"
              className="van-button-submit"
              onClick={handleSubmit}
            >
            更新意向
            </Button>
          </View>
        ) : (
          <View className={styles.content}>
            <View className={styles.preview}>
              <View className={styles.item}>
                <View className={styles["item--l"]}>项目标题</View>
                <View className={styles["item--r"]}>
                  {formData?.title}
                </View>
              </View>
              <View className={styles.item}>
                <View className={styles["item--l"]}>项目内容</View>
                <View className={styles["item--r"]}>
                  {formData?.content}
                </View>
              </View>
              <View className={styles.item}>
                <View className={styles["item--l"]}>预计销售额(￥)</View>
                <View className={styles["item--r"]}>
                  {formData?.estimated_sales ? formatNumber(formData?.estimated_sales) : "-"}
                </View>
              </View>
              <View className={styles.item}>
                <View className={styles["item--l"]}>关联拜访记录</View>
                <View className={styles["item--r"]}>
                  {formData?.visit?.result ?? '-'}
                </View>
              </View>
            </View>
          </View>
        )}
      </Skeleton>
    </CustomPopup>
  );
}
