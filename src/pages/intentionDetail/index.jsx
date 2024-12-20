/*
 * @Description: 新增客户编辑页
 */
import { useCallback, useState, useEffect } from "react";
import { View } from "@tarojs/components";
import { navigateBack, getCurrentPages, showToast } from "@tarojs/taro";
import {
  Form,
  FormItem,
  Button,
  Field,
  RadioGroup,
  Radio,
} from "@antmjs/vantui";
import cns from "classnames";
import { throttle } from "lodash";
import { getVisitRecords } from "@/api/visit";
import { addIntention } from "@/api/intention";
import FormSelect from "@/components/formSelect";
import KeySearch from "./components/keySearch";
import styles from "./index.module.less";

export default function Index() {
  const [keySearchVisible, setKeySearchVisible] = useState(false);
  const [visitHidden, setVisitHidden] = useState(true); // 默认隐藏拜访
  const [searchData, setSearchData] = useState(null); // 拜访携带信息
  const [visitOptions, setVisitOptions] = useState([]); // 拜访记录
  const [loading, setLoading] = useState(false);
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

      setLoading(true);

      const { unit_name, ...opt } = fieldValues;

      const _data = {
        ...opt,
        customer: searchData?.customer?.id,
        connect_person: searchData?.id,
        kind: searchData?.kind?.id,
      };

      const { results } = await addIntention({
        ..._data,
      });
      showToast({ title: "保存成功", icon: "success", duration: 2000 });
      handleBack(results?.id);
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
  return (
    <View className={styles.intentionDetail}>
      <View className={styles.container}>
        <View className={cns(styles.form, "form")}>
          <Form
            initialValues={{}}
            form={formIt}
            onFinish={(errs, res) => console.info(errs, res)}
            className={styles.form}
          >
            <View className="form-title">关联拜访</View>
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
            <View className="form-title">意向信息</View>
            <View className="form-card">
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
            </View>
            <Button
              type="primary"
              className="van-button-submit"
              onClick={throttle(handleSubmit, 2 * 1000)}
              loading={loading}
            >
              创建意向
            </Button>
          </Form>
        </View>
      </View>

      {/* 客户+课题组+负责人 搜索 */}
      <KeySearch
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
      />
    </View>
  );
}
