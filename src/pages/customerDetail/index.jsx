/*
 * @Description: 新增客户编辑页
 */
import { useCallback, useState, useEffect, useMemo } from "react";
import {
  nextTick,
  useLoad,
  useDidShow,
  showToast,
  getCurrentInstance,
  navigateBack,
  getCurrentPages,
} from "@tarojs/taro";
import { View, Input } from "@tarojs/components";
import {
  Form,
  FormItem,
  RadioGroup,
  Radio,
  Button,
  Field,
  Skeleton,
} from "@antmjs/vantui";
import cns from "classnames";
import {
  checkCustomerExist,
  setContactList,
  createCustomer,
  updateCustomer,
  getCustomer,
} from "@/api/customer";
import { throttle } from "lodash";
import {
  useGetCustomerTypeList,
  useGetCustomerStagesList,
  useGetCustomerLevelsList,
  useGetCustomerFromList,
  useGetCustomerMajorList,
} from "@/hook/index"


import SpeciesSelect from "@/components/speciesSelect";
import AreaSelect from "@/components/areaSelect";
import FormSelect from "@/components/formSelect";
import userStore from "@/store/userStore";

import UnitSearch from "./components/unitSearch";
import GroupSearch from "./components/groupSearch";
import styles from "./index.module.less";

export default function Index() {
  const instance = getCurrentInstance();
  const { id, type } = instance.router.params;

  const userInfo = userStore.getUserInfo();

  const [customerInfoHidden, setCustomerInfoHidden] = useState(true);
  const [contactInfoHidden, setContactInfoHidden] = useState(true);

  const [unitSearchVisible, setUnitSearchVisible] = useState(false);
  const [groupSearchVisible, setGroupSearchVisible] = useState(false);
  const [areaSelectVisible, setAreaSelectVisible] = useState(false);
  const [speciesVisible, setSpeciesVisible] = useState(false);
  const [speciesValue, setSpeciesValue] = useState([]);
  const [areaValue, setAreaValue] = useState([]);

  const [groupDisabled, setGroupDisabled] = useState(true); // 为保证用户填写顺序，默认禁用课题组
  const [exist, setExist] = useState(false); // 单位+课题组是否已经存在

  const [loading, setLoading] = useState(false);
  const [infoLoading, setInfoLoading] = useState(false);

  const {list:customerTypeList} = useGetCustomerTypeList();
  const {list:customerStagesList} = useGetCustomerStagesList();
  const {list:customerFromList} = useGetCustomerFromList();
  const {list:customerLevelsList} = useGetCustomerLevelsList();
  const {list:customerMajorList} = useGetCustomerMajorList();

  const formIt = Form.useForm();

  // 编辑客户
  const isEditCustomer = useMemo(() => {
    return id && type === "customer";
  }, [id, type]);
  const submitBtnText = useMemo(() => {
    if (isEditCustomer) {
      return "修改客户信息";
    }
    return "新增客户信息";
  }, [isEditCustomer]);

  useEffect(() => {
    formIt.registerRequiredMessageCallback((label) => {
      return `${label}不能为空`;
    });
    // setTimeout(() => {
    // formIt.setErrorMessage("userName", "这是自定义错误xxxxx");
    // }, 1000)
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
      setLoading(false);
    }, 1000);
  };

  const handleSubmit = useCallback(() => {
    formIt.validateFields(async (errorMessage, fieldValues) => {
      if (errorMessage && errorMessage.length) {
        return console.info("errorMessage", errorMessage);
      }

      setLoading(true);

      // eslint-disable-next-line no-shadow
      const { fullDistrict = "", kind, id, ...rest } = fieldValues;

      const _area =
        areaValue?.length > 0
          ? areaValue.map((e) => e.value)
          : fullDistrict.split(" / ");

      // 编辑客户信息
      if (isEditCustomer) {
        await updateCustomer(id, {
          ...rest,
          countries: _area?.[0],
          provinces: _area?.[1],
          cities: _area?.[2],
        });
        showToast({ title: "保存成功", icon: "success", duration: 2000 });
        handleBack();
        return;
      }

      const _speciesValue =
        speciesValue?.length > 0
          ? speciesValue[speciesValue?.length - 1]?.value
          : kind.split(" / ");

      // 如果是已存在的负责人，直接关联
      if (exist) {
        await setContactList({
          customer: id,
          name: fieldValues?.name,
          email: fieldValues?.email,
          kind: _speciesValue,
          phone: fieldValues?.phone,
          principal: fieldValues?.principal,
        });
        showToast({ title: "保存成功", icon: "success", duration: 2000 });
        handleBack();
        return;
      }

      // 新增操作
      await createCustomer({
        ...rest,
        kind: _speciesValue,
        countries: _area?.[0],
        provinces: _area?.[1],
        cities: _area?.[2],
      });

      showToast({ title: "保存成功", icon: "success", duration: 2000 });
      handleBack();
    });
  }, [areaValue, exist, formIt, isEditCustomer, speciesValue]);


  const _getCustomerDetail = useCallback(async () => {
    if (!isEditCustomer) {
      return;
    }

    setInfoLoading(true);
    // 如果是编辑客户信息，则显示客户信息相关数据
    const { results } = await getCustomer(id);
    const detail = results;

    console.log(detail);
    setInfoLoading(false);

    // 取消禁用
    setGroupDisabled(false);
    setCustomerInfoHidden(false);
    setContactInfoHidden(true);

    nextTick(() => {
      formIt.setFields({
        unit_name: detail?.unit_name,
        research_group: detail?.research_group,
        id: detail?.id,
        classification: detail?.classification?.key,
        signory: detail?.signory?.key,
        category: detail?.category?.key,
        source_from: detail?.source_from?.key,
        level: detail?.level?.key,
        unit_short_name: detail?.unit_short_name,
        fullDistrict: [
          detail?.countries,
          detail?.provinces,
          detail?.cities,
        ].join(" / "),
      });
    });
  }, [formIt, id, isEditCustomer]);

  const _checkCustomerExist = useCallback(async () => {
    // 如果是编辑的话，就不要去check拉默认数据
    if (isEditCustomer) {
      return;
    }
    const unit_name = formIt.getFieldValue("unit_name");
    const research_group = formIt.getFieldValue("research_group");

    if (!unit_name || !research_group) {
      return;
    }

    setCustomerInfoHidden(false);
    setContactInfoHidden(false);

    const { results } = await checkCustomerExist({
      unit_name: unit_name,
      research_group: research_group,
    });

    const { existed, detail } = results;

    setExist(existed);

    if (existed) {
      formIt.setFields({
        id: detail?.id,
        classification: detail?.classification?.key,
        signory: detail?.signory?.key,
        category: detail?.category?.key,
        source_from: detail?.source_from?.key,
        level: detail?.level?.key,
        unit_short_name: detail?.unit_short_name,
        fullDistrict: [
          detail?.countries,
          detail?.provinces,
          detail?.cities,
        ].join(" / "),
      });
    }
  }, [formIt, isEditCustomer]);

  const filterCustomerTypeList = useMemo(() => {
    const classification = formIt.getFieldValue("classification");
    if (!exist) {
      return customerTypeList;
    }
    return (customerTypeList ?? []).filter((e) => e.value === classification);
  }, [exist, customerTypeList, formIt]);
  const filterCustomerMajorList = useMemo(() => {
    const signory = formIt.getFieldValue("signory");
    if (!exist) {
      return customerMajorList;
    }
    return (customerMajorList ?? []).filter((e) => e.value === signory);
  }, [exist, customerMajorList, formIt]);
  const filterCustomerStagesList = useMemo(() => {
    const category = formIt.getFieldValue("category");
    if (!exist) {
      return customerStagesList;
    }
    return (customerStagesList ?? []).filter((e) => e.value === category);
  }, [exist, customerStagesList, formIt]);
  const filterCustomerFromList = useMemo(() => {
    const source_from = formIt.getFieldValue("source_from");
    if (!exist) {
      return customerFromList;
    }
    return (customerFromList ?? []).filter((e) => e.value === source_from);
  }, [exist, customerFromList, formIt]);

  const filterCustomerLevelsList = useMemo(() => {
    const level = formIt.getFieldValue("level");
    if (!exist) {
      return customerLevelsList;
    }
    return (customerLevelsList ?? []).filter((e) => e.value === level);
  }, [exist, customerLevelsList, formIt]);

  // 单位名称+课题组有内容的时候 check 一遍数据是否存在，存在则回填
  useEffect(() => {
    _checkCustomerExist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    formIt.getFieldValue("unit_name"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    formIt.getFieldValue("research_group"),
  ]);

  useDidShow(() => {
    console.log("useDidShow");
  });

  useLoad(() => {
    console.log("useLoad");
    _getCustomerDetail();
  });

  return (
    <View className={styles.customerDetail}>
      <Skeleton row="12" loading={infoLoading}>
        <View className={styles.container}>
          <View className={cns(styles.form, "form")}>
            <Form
              initialValues={{
                principal: userInfo?.id,
              }}
              form={formIt}
              onFinish={(errs, res) => console.info(errs, res)}
            >
              <FormItem name="id" className="hidden"></FormItem>
              <FormItem name="principal" className="hidden"></FormItem>

              <View className="form-title">课题组信息</View>
              <View className="form-card">
                <FormItem
                  required
                  label="单位名称"
                  name="unit_name"
                  valueFormat={(e) => e.detail.value}
                  onClick={() => {
                    setUnitSearchVisible(true);
                  }}
                >
                  <FormSelect placeholder="请选择客户单位" />
                </FormItem>
                <FormItem
                  required
                  label="课题组"
                  name="research_group"
                  valueFormat={(e) => e.detail.value}
                  className={cns(
                    groupDisabled ? "form-item--disabled" : "form-item",
                  )}
                  onClick={() => {
                    if (groupDisabled) {
                      showToast({ title: "请先选择单位", icon: "none" });
                      return;
                    }
                    setGroupSearchVisible(true);
                  }}
                >
                  <FormSelect placeholder="请选择课题组" />
                </FormItem>
              </View>
              {!customerInfoHidden && (
                <View className={cns("form-card", exist && "exist")}>
                  <FormItem label="客户分类" name="classification" required>
                    <RadioGroup direction="horizontal">
                      {filterCustomerTypeList.map((e) => (
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
                  <FormItem label="领域" name="signory" required>
                    <RadioGroup direction="horizontal">
                      {filterCustomerMajorList.map((e) => (
                        <Radio
                          name={e.value}
                          checkedColor="#07c160"
                          key={e.value}
                          iconSize="18px"
                        >
                          {e.label}
                        </Radio>
                      ))}
                    </RadioGroup>
                  </FormItem>

                  <FormItem label="客户类别" name="category" required>
                    <RadioGroup direction="horizontal">
                      {filterCustomerStagesList.map((e) => (
                        <Radio
                          name={e.value}
                          checkedColor="#07c160"
                          key={e.value}
                          iconSize="18px"
                        >
                          {e.label}
                        </Radio>
                      ))}
                    </RadioGroup>
                  </FormItem>
                  <FormItem label="客户来源" name="source_from" required>
                    <RadioGroup direction="horizontal">
                      {filterCustomerFromList.map((e) => (
                        <Radio
                          name={e.value}
                          checkedColor="#07c160"
                          key={e.value}
                          iconSize="18px"
                        >
                          {e.label}
                        </Radio>
                      ))}
                    </RadioGroup>
                  </FormItem>

                  <FormItem label="客户级别" name="level" required>
                    <RadioGroup direction="horizontal">
                      {filterCustomerLevelsList.map((e) => (
                        <Radio
                          name={e.value}
                          checkedColor="#07c160"
                          key={e.value}
                          iconSize="18px"
                        >
                          {e.label}
                        </Radio>
                      ))}
                    </RadioGroup>
                  </FormItem>
                  <FormItem
                    label="所在区域"
                    name="fullDistrict"
                    required
                    onClick={() => {
                      setAreaSelectVisible(true);
                    }}
                  >
                    <FormSelect placeholder="请选择所在区域" />
                  </FormItem>
                  <FormItem
                    label="客户单位（简称）"
                    name="unit_short_name"
                    valueFormat={(e) => e.detail.value}
                  >
                    <Input
                      className={styles.input}
                      placeholder="请输入"
                      onInput={(e) => {
                        // 为了fix webapp 重置的bug
                        formIt.setFieldsValue(
                          "unit_short_name",
                          e?.detail?.value,
                        );
                      }}
                    />
                  </FormItem>
                </View>
              )}

              {!contactInfoHidden && (
                <>
                  <View className={cns("form-title")}>负责人信息</View>
                  <View className={cns("form-card")}>
                    <FormItem
                      label="负责人"
                      name="name"
                      required
                      valueFormat={(e) => e.detail}
                    >
                      <Field
                        placeholderClass={styles["filed-placeholder"]}
                        placeholder="请输入负责人"
                        border={false}
                        onInput={(e) => {
                          formIt?.setFieldsValue(
                            "name",
                            (e?.detail ?? "").trim(),
                          );
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
                        placeholderClass={styles["filed-placeholder"]}
                        placeholder="请输入负责人电话"
                        border={false}
                        onInput={(e) => {
                          formIt?.setFieldsValue(
                            "phone",
                            (e?.detail ?? "").trim(),
                          );
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
                        placeholderClass={styles["filed-placeholder"]}
                        placeholder="请输入负责人邮箱"
                        border={false}
                        onInput={(e) => {
                          formIt?.setFieldsValue(
                            "email",
                            (e?.detail ?? "").trim(),
                          );
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
                    {/* <FormItem label="销售负责人" name="classification"></FormItem> */}
                    {/* <FormItem label="负责人研究方向" name="classification"></FormItem> */}
                    {/* <FormItem label="负责人职位" name="classification"></FormItem> */}
                  </View>
                </>
              )}

              <Button
                type="primary"
                className="van-button-submit"
                onClick={throttle(handleSubmit, 2 * 1000)}
                loading={loading}
              >
                {submitBtnText}
              </Button>
            </Form>
          </View>
        </View>
      </Skeleton>
      {/* 单位搜索 */}
      <UnitSearch
        visible={unitSearchVisible}
        onClose={() => {
          setUnitSearchVisible(false);
        }}
        onConfirm={(val) => {
          setUnitSearchVisible(false);
          formIt.setFieldsValue("unit_name", val);
          // 取消课题组禁用
          setGroupDisabled(false);
        }}
      />
      {/* 课题组搜索 */}
      <GroupSearch
        visible={groupSearchVisible}
        unitName={formIt.getFieldValue("unit_name")}
        onClose={() => {
          setGroupSearchVisible(false);
        }}
        onConfirm={(val) => {
          setGroupSearchVisible(false);
          formIt.setFieldsValue("research_group", val);
        }}
      />

      {/* 地区选择 */}
      <AreaSelect
        visible={areaSelectVisible}
        defaultValue={[]}
        onConfirm={(val) => {
          const format = val.map((e) => e.text).join(" / ");
          setAreaValue(val);
          formIt.setFieldsValue("fullDistrict", format);
        }}
        onClose={() => {
          setAreaSelectVisible(false);
        }}
      />

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
    </View>
  );
}
