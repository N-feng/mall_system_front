import { useCallback, useState, useMemo } from "react";
import { View, Text, Input } from "@tarojs/components";
import CustomPopup from "@/components/customPopup";
import { Form, FormItem, Button,Field } from "@antmjs/vantui";
import { showToast } from "@tarojs/taro";
import cns from "classnames";
import { addContact, updateContact } from "@/api/customer";
import FormSelect from "@/components/formSelect";
import SpeciesSelect from "@/components/speciesSelect";
import userStore from "@/store/userStore";
import styles from "../../../customerDetail/index.module.less";
import selfStyles from "./index.module.less";

export default function Com(props) {
  const { visible = false, customerId, type, onClose, onConfirm } = props;
  const formIt = Form.useForm();
  const userInfo = userStore.getUserInfo();

  const [speciesVisible, setSpeciesVisible] = useState(false);
  const [speciesValue, setSpeciesValue] = useState([]);


  const title = useMemo(() => {
    if (type === "newContact") {
      return "新增负责人";
    }
    if (type === "updateContact") {
      return "更新负责人信息";
    }
  }, [type]);


  const handleBack = (newId) => {
    onConfirm?.(newId);
  };

  const handleSubmit = useCallback(() => {
    formIt.validateFields(async (errorMessage, fieldValues) => {
      if (errorMessage && errorMessage.length) {
        return console.info("errorMessage", errorMessage);
      }

      // eslint-disable-next-line no-shadow
      const { kind, id, ...rest } = fieldValues;

      // 新增负责人
      if (type === "newContact") {
        // 这里的kind传的是last id,所以特殊处理
        const _kind =
          speciesValue?.length > 0
            ? speciesValue[speciesValue?.length - 1]?.value
            : "";

        const { results } = await addContact({
          ...rest,
          customer: customerId,
          kind: _kind,
        });

        showToast({ title: "保存成功", icon: "success", duration: 2000 });
        handleBack(results?.id);
        return;
      }

      // 编辑负责人
      if (type === "updateContact") {
        // 这里的kind传的是last id,所以特殊处理
        const _kind =
          speciesValue?.length > 0
            ? speciesValue[speciesValue?.length - 1]?.value
            : props?.kind?.id;

        await updateContact(props?.id, {
          customer: customerId,
          name: fieldValues?.name,
          email: fieldValues?.email,
          kind: _kind,
          phone: fieldValues?.phone,
          principal: userInfo?.id,
        });
        showToast({ title: "保存成功", icon: "success", duration: 2000 });
        handleBack();
        return;
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formIt, type, speciesValue, customerId, props?.kind?.id, props?.id, userInfo?.id]);

  const initialValues = useMemo(() => {
    if (type === "updateContact") {
      return {
        name: props?.name,
        phone: props?.phone,
        email: props?.email,
        kind:
          (props?.kind?.category ?? []).join(" / ") + " / " + props?.kind?.name,
      };
    }
    return {};
  }, [props, type]);


  return (
    <CustomPopup
      visible={visible}
      title={<Text style={{ marginRight: 8 }}>{title}</Text>}
      closeable
      onClose={() => {
        onClose?.();
      }}
    >
      <View className={cns(selfStyles.content, styles.form, "form")} style={{
        marginBottom:250,
      }}
      >
        <Form
          form={formIt}
          onFinish={(errs, res) => console.info(errs, res)}
          initialValues={initialValues}
        >
          <FormItem
            label="负责人"
            name="name"
            required
            valueFormat={(e) => e.detail}
          >
            <Field
              placeholderClass={styles['filed-placeholder']}
              placeholder="请输入负责人"
              border={false}
              onInput={e => {
                formIt?.setFieldsValue("name", (e?.detail??'').trim());
              }}
            />
          </FormItem>
          <FormItem
            label="负责人电话"
            name="phone"
            required
            rules={{
              rule: /^1[34578]\zd{9}$|^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/,
              message: "请输入正确的电话或手机号",
            }}
            valueFormat={(e) => e.detail}
          >
            <Field
              placeholderClass={styles['filed-placeholder']}
              placeholder="请输入负责人电话"
              border={false}
              onInput={e => {
                formIt?.setFieldsValue("phone", (e?.detail??'').trim());
              }}
            />
          </FormItem>

          <FormItem
            label="负责人邮箱"
            name="email"
            required
            rules={{
              rule: /^\S+?@\S+?\.\S+?$/,
              message: "请输入正确的邮箱地址",
            }}
            valueFormat={(e) => e.detail}
          >
            <Field
              placeholderClass={styles['filed-placeholder']}
              placeholder="请输入负责人邮箱"
              border={false}
              onInput={e => {
                formIt?.setFieldsValue("email", (e?.detail??'').trim());
              }}
            />
          </FormItem>

          <FormItem
            label="物种"
            name="kind"
            required
            onClick={() => {
              setSpeciesVisible(true);
            }}
          >
            <FormSelect placeholder="请选择物种" />
          </FormItem>

          <Button
            type="primary"
            className="van-button-submit"
            onClick={handleSubmit}
          >
            保存
          </Button>
        </Form>
      </View>

      {/* 物种选择 */}
      <SpeciesSelect
        visible={speciesVisible}
        defaultValue={[]}
        onConfirm={(val) => {
          setSpeciesVisible(false);
          const format = val.map((e) => e.label).join(" / ");
          setSpeciesValue(val);
          formIt.setFieldsValue("kind", format);
        }}
        onClose={() => {
          setSpeciesVisible(false);
        }}
      />
    </CustomPopup>
  );
}
