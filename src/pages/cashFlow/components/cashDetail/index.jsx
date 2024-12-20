import { useMemo } from "react";
import classNames from "classnames";
import { View } from "@tarojs/components";
import { formatNumber } from "@/utils/utils";
import CustomPopup from "@/components/customPopup";
import styles from "../../../customer/components/customerInfo/index.module.less";

export default function Com(props) {
  const { visible = false, onClose } = props;
  const { money_type, transfer_type, amount } = props;

  const moneyTypeText = useMemo(() => {
    if (money_type === "income") {
      if (transfer_type.key === 70) {
        return <View className="custom-tag custom-tag--red">收入</View>;
      }
      return <View className="custom-tag custom-tag--green">收入</View>;
    }
    return <View className="custom-tag custom-tag--yellow">支出</View>;
  }, [money_type, transfer_type]);

  const amountText = useMemo(() => {
    const _amount = formatNumber(amount);
    if (money_type === "income") {
      if (transfer_type.key === 70) {
        return <View className="text--red">+{_amount}</View>;
      }
      return <View className="text--green">+{_amount}</View>;
    }
    return <View className="text--yellow">-{_amount}</View>;
  }, [amount, money_type, transfer_type]);

  return (
    <CustomPopup
      visible={visible}
      title="流水详情"
      onClose={() => {
        onClose?.();
      }}
    >
      <View className={classNames(styles.content)}>
        <View className={classNames(styles["item"])}>
          <View className={classNames(styles["item--l"])}>转款类型</View>
          <View className={classNames(styles["item--r"])}>
            {props?.transfer_type?.value ?? "-"} {moneyTypeText}
          </View>
        </View>
        <View className={classNames(styles["item"])}>
          <View className={classNames(styles["item--l"])}>转款金额</View>
          <View className={classNames(styles["item--r"])}>{amountText}</View>
        </View>
        <View className={classNames(styles["item"])}>
          <View className={classNames(styles["item--l"])}>发票号</View>
          <View className={classNames(styles["item--r"])}>
            {props?.receipt_number ?? "-"}
          </View>
        </View>
        <View className={classNames(styles["item"])}>
          <View className={classNames(styles["item--l"])}>购买方名称</View>
          <View className={classNames(styles["item--r"])}>
            {props?.buyer_name ?? "-"}
          </View>
        </View>
        <View className={classNames(styles["item"])}>
          <View className={classNames(styles["item--l"])}>申请人</View>
          <View className={classNames(styles["item--r"])}>
            {props?.applicant ?? "-"}
          </View>
        </View>
        <View className={classNames(styles["item"])}>
          <View className={classNames(styles["item--l"])}>合同编号</View>
          <View className={classNames(styles["item--r"])}>
            {props?.contract_serial_number ?? "-"}
          </View>
        </View>
        <View className={classNames(styles["item"])}>
          <View className={classNames(styles["item--l"])}>合同标题</View>
          <View className={classNames(styles["item--r"])}>
            {props?.contract_title}
          </View>
        </View>
        <View className={classNames(styles["item"])}>
          <View className={classNames(styles["item--l"])}>合同金额</View>
          <View className={classNames(styles["item--r"])}>
            {formatNumber(props?.total_price) ?? "-"}
          </View>
        </View>
        <View className={classNames(styles["item"])}>
          <View className={classNames(styles["item--l"])}>项目编号</View>
          <View className={classNames(styles["item--r"])}>
            {props?.project_serial_number ?? "-"}
          </View>
        </View>
        <View className={classNames(styles["item"])}>
          <View className={classNames(styles["item--l"])}>负责人</View>
          <View className={classNames(styles["item--r"])}>
            {props?.person_name ?? "-"}
          </View>
        </View>
      </View>
    </CustomPopup>
  );
}
