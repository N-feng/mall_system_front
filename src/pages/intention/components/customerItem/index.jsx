import { useState } from "react";
import { View } from "@tarojs/components";
import classNames from "classnames";
import { Icon } from "@antmjs/vantui";
import {  makePhoneCall } from "@tarojs/taro";
import CustomerLevelTag from "@/components/customerLevelTag";
import UpdateIntention from "../updateIntention/index";
import styles from "./index.module.less";

export default function Com(props) {
  const [updateVisible, setUpdateVisible] = useState(false);

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


  return (
    <View className={classNames(styles.customer, "card")} style={updateVisible ? {overflow:'hidden'}:""}>
      <View className={styles["customer-info"]}>
        <View className={styles["customer-info--l"]}>
          <View
            className={styles["customer-info--t"]}
            onClick={(e) => {
              handleCall(props?.connect_person?.phone);
              e.stopPropagation();
            }}
          >
            <View className={styles["customer-name"]}>
              {props?.connect_person?.name}
            </View>
            <View className={classNames(styles["signory"])}>
              {props?.connect_person?.species}
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
          <View className={styles["customer-info--t"]}></View>
          <View className={classNames(styles["customer-info--b"])}>
            {props?.customer?.research_group} |
            <View className={classNames(styles["customer-level"])}>
              <CustomerLevelTag value={props?.customer?.level?.key}>
                {props?.customer?.level?.value}
              </CustomerLevelTag>
            </View>
          </View>
        </View>
      </View>
      <View onClick={() => {
        setUpdateVisible(true)
      }}
      >
        <View className={styles["line"]}></View>
        <View className={styles["project"]}>
          <View className={styles["project-name"]}>{props?.title}</View>
        </View>
        <View className={styles["project-content"]}>{props?.content}</View>
        <View className={styles["line"]}></View>
      </View>

      {/* 更新意向 */}
      <UpdateIntention
        visible={updateVisible}
        id={props?.id}
        connectPersonId={props?.connect_person?.id}
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
