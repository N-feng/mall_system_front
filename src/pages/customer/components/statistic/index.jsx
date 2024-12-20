import { useState } from "react";
import { View, Text } from "@tarojs/components";
import cns from "classnames";

import { formatNumber } from "@/utils/utils";
import CustomToast from "@/components/customToast";

import styles from "./index.module.less";

export default function Com(props) {
  const {totalData} = props;

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");


  return (
    <View className={styles.statistic}>
      <View className={styles["statistic-content"]}>
        <View
          className={cns(styles.card, styles["card--orange"])}
          onClick={() => {
            setToastVisible(true);
            setToastMsg(
              <View>
                <View>特殊池金额来源： </View>
                <View>从“到款池”关联“负责人特殊池”后转入的款项；</View>
                <View className="text--yellow">1. 当前余额仅可用于特殊结款</View>
                <View className="text--yellow">2. 关联发票后自动转入“已授权池”</View>
              </View>
            );
          }}
        >
          <View className={styles["title"]}>特殊池</View>
          <View className={styles["num"]}>
            {formatNumber(totalData?.special_pool)}
          </View>
        </View>
        <View
          className={cns(styles.card, styles["card--red"])}
          onClick={() => {
            setToastVisible(true);
            setToastMsg(
              <View>
                <View>未授权金额来源： </View>
                <View>从“到款池”关联“负责人未授权池”后转入的款项；</View>
                <View className="text--red">1. 当前余额不可用于结款、转款</View>
                <View className="text--red">2. 关联发票后自动转入“已授权池”</View>
              </View>
            );
          }}
        >
          <View className={styles["title"]}>未授权</View>
          <View className={styles["num"]}>
            {formatNumber(totalData?.unknown_cash_pool)}
          </View>
        </View>
        <View
          className={cns(styles.card, styles["card--green"])}
          onClick={() => {
            setToastVisible(true);
            setToastMsg(
              <View>
                <View>已授权金额来源： </View>
                <View> 1. 从“到款池”关联“发票”后转入的款项；</View>
                <View> 2. 从其他负责人“已授权池”转入的款项；</View>
                <View className="text--green"> 当前余额可用于结款、转款</View>
              </View>
            );
          }}
        >
          <View className={styles["title"]}>
          已授权
          </View>
          <View className={styles["num"]}>
            {formatNumber(totalData?.cash_pool)}
          </View>
        </View>
      </View>
      <CustomToast
        visible={toastVisible}
        onClose={() => {
          setToastVisible(false);
        }}
      >
        <View className={styles["toast-msg"]}>{toastMsg}</View>
      </CustomToast>
    </View>
  );
}
