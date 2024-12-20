import { View } from "@tarojs/components";
import classNames from "classnames";
import { navigateTo } from "@tarojs/taro";
import moment from 'moment';
import styles from "./index.module.less";

export default function Com(props) {
  const gotoAuditDetail = () => {
    navigateTo({
      url: `/pages/auditDetail/index?process_id=${props?.process_id}`,
    });
  };

  return (
    <View className={classNames(styles.audit, "card")} onClick={gotoAuditDetail}>
      <View className={styles["audit-info"]}>
        <View className={styles["audit-info--l"]}>
          <View className={styles["time"]}>{moment(props?.create_time).format("YYYY-MM-DD")}</View>
        </View>
        <View className={styles["audit-info--r"]}>
          <View className={styles["status"]}>{props?.state}</View>
        </View>
      </View>

      <View className={styles["info"]}>
        <View className={styles["info--l"]}>发起人：</View>
        <View className={styles["info--r"]}>
          {props?.creator?.nickname}</View>
      </View>
      <View className={styles["info"]}>
        <View className={styles["info--l"]}>流程号：</View>
        <View className={styles["info--r"]}>
          {props?.process_id}</View>
      </View>
      <View className={styles["info"]}>
        <View className={styles["info--l"]}>客户单位：</View>
        <View className={styles["info--r"]}>
          {props?.customer_unit}</View>
      </View>
      <View className={styles["type"]}>
        {props?.process_template?.process_template_name}</View>
    </View>
  );
}
