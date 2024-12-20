import { useState, useEffect, useMemo } from "react";
import { View, Text } from "@tarojs/components";
import classNames from "classnames";
import { Icon } from "@antmjs/vantui";
import moment from "moment";
import { navigateTo, makePhoneCall, showToast } from "@tarojs/taro";
import CustomerLevelTag from "@/components/customerLevelTag";
import { getBusinessVisitPermissions } from "@/utils/authority";
import userStore from "@/store/userStore";
import VisitTimeline from "../visitTimeline";
import UpdateVisit from "../updateVisit/index";
import styles from "./index.module.less";

export default function Com(props) {
  const { visit_records = [], customer } = props;
  const [visible, setVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  const [activeItem, setActiveItem] = useState({});
  const userInfo = userStore.getUserInfo();
  const visitPermissions = getBusinessVisitPermissions(userInfo);

  const showContactList = useMemo(() => {
    return visit_records?.length > 0;
  }, [visit_records]);

  const customerDisabled = useMemo(() => {
    return customer?.status?.key !== 20;
  }, [customer]);

  const editable = useMemo(() => {
    return activeItem?.id === visit_records?.[0]?.id && visitPermissions?.modify;
  }, [activeItem?.id, visitPermissions?.modify, visit_records]);


  // 新增拜访
  const gotoDetail = ({ id }) => {
    if (customerDisabled) {
      showToast({
        title: "该客户暂未启用",
        icon: "none",
        duration: 2000,
      });
      return;
    }

    if (id) {
      navigateTo({
        url: `/pages/visitDetail/index?id=${props?.id}&intention_id=${id}`,
      });
      return;
    }
    navigateTo({
      url: `/pages/visitDetail/index?id=${props?.id}`,
    });
  };

  const handleCall = (phone) => {
    makePhoneCall({
      phoneNumber: phone,
      success: (res) => {
        console.log("call success:", res);
      },
      fail: (res) => {
        console.log("call fail:", res);
      },
      complete: (res) => {
        console.log("call complete:", res);
      },
    });
  };

  useEffect(() => {
    setActiveItem(visit_records?.[0]);
  }, [visit_records]);

  return (
    <View className={classNames(styles.customer, "card")}>
      <View className={styles["customer-info"]}>
        <View className={styles["customer-info--l"]}>
          <View
            className={styles["customer-info--t"]}
            onClick={(e) => {
              handleCall(props?.phone);
              e.stopPropagation();
            }}
          >
            <View className={styles["customer-name"]}>{props?.name}</View>
            <View className={classNames(styles["signory"])}>
              {props?.kind?.name}
            </View>
            <Icon
              name="phone-circle-o"
              size="14px"
              className={styles["phone-icon"]}
            />
          </View>
          <View className={styles["customer-info--b"]}>
            <View className={styles["customer-company"]}>
              {props?.customer?.unit_name}
            </View>
          </View>
        </View>
        <View className={styles["customer-info--r"]}>
          <View className={styles["customer-info--t"]}>
            {visitPermissions?.add && (
              <View
                className={classNames(
                  styles["add-contact"],
                  customerDisabled && styles["add-contact--disabled"],
                )}
                onClick={gotoDetail}
              >
                <Icon name="plus" size="14px" className={styles.icon} />
                拜访
              </View>
            )}
          </View>
          <View className={classNames(styles["customer-info--b"])}>
            {props?.customer?.research_group ?? "-"} |
            <View className={classNames(styles["customer-level"])}>
              <CustomerLevelTag value={props?.customer?.level?.key}>
                {props?.customer?.level?.value ?? "-"}
              </CustomerLevelTag>
            </View>
          </View>
        </View>
      </View>
      {showContactList && (
        <>
          <View className={styles["customer--line"]}></View>
          <View className={classNames(styles["contact-list"])}>
            <View className={styles["contact-list--l"]}>
              {visit_records.map((e, index) => (
                <View
                  key={e.id}
                  className={classNames(
                    styles["contact"],
                    activeItem?.id === e.id && styles["contact--active"],
                  )}
                  onClick={() => {
                    setActiveItem(e);
                  }}
                >
                  <View className={classNames(styles["contact-name"])}>
                    {moment(e.visit_time).format("YYYY-MM-DD")}
                  </View>
                </View>
              ))}
              {/* 超过三条才展示全部记录 */}
              {visit_records?.length >= 3 && (
                <View
                  className={classNames(styles["all-visit"])}
                  onClick={() => {
                    setVisible(true);
                  }}
                >
                  全部记录
                </View>
              )}
            </View>
            <View
              className={styles["contact-list--r"]}
              onClick={() => {
                setUpdateVisible(true);
              }}
            >
              <View className={styles["contact-info"]}>
                {activeItem?.result}
              </View>
              <View className={styles["contact-info"]}>
                <View className={styles["contact-info--l"]}>下次拜访时间</View>
                <View className={styles["contact-info--r"]}>
                  {moment(activeItem?.next_visit_day).format("YYYY-MM-DD")}
                </View>
              </View>
              <View className={styles["contact-info"]}>
                <View className={styles["contact-info--l"]}>提醒开始时间</View>
                <View className={styles["contact-info--r"]}>
                  {moment(activeItem?.remind_start_time).format("YYYY-MM-DD")}
                </View>
              </View>
              <View className={styles["contact-info"]}>
                <View className={styles["contact-info--l"]}>
                  提醒间隔
                  <Icon
                    color="#999"
                    name="clock-o"
                    size="14px"
                    className={styles.icon}
                  ></Icon>
                </View>

                {activeItem.remind_interval ? (
                  <View className={styles["contact-info--r"]}>
                    每
                    <Text className={styles.num}>
                      {activeItem.remind_interval}
                    </Text>
                    天<Text className={styles.num}>1</Text>次
                  </View>
                ) : (
                  <View className={styles["contact-info--r"]}>暂未设置</View>
                )}
              </View>
            </View>
          </View>
        </>
      )}
      <VisitTimeline
        visible={visible}
        id={props?.id}
        onClose={() => {
          setVisible(false);
        }}
      />

      <UpdateVisit
        visible={updateVisible}
        id={props?.id}
        editable={editable}
        visit_id={activeItem?.id}
        customer_id={props?.customer?.id}
        onClose={() => {
          setUpdateVisible(false);
        }}
        onConfirm={() => {
          setUpdateVisible(false);
          props?.onRefresh?.();
        }}
      />
    </View>
  );
}
