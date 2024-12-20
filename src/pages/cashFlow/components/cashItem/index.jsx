import { useMemo } from "react";
import { View } from "@tarojs/components";
import classNames from "classnames";
import { formatNumber } from "@/utils/utils";
import styles from "./index.module.less";

export default function Com(props) {
  const { money_type, transfer_type, amount } = props;

  const moneyTypeText = useMemo(() => {
    if (money_type === "income") {
      return <View className="custom-tag custom-tag--green">收入</View>;
    }
    return <View className="custom-tag custom-tag--red">支出</View>;
  }, [money_type]);

  const amountText = useMemo(() => {
    const _amount = formatNumber(amount);
    if (money_type === "income") {
      return <View className="text--green">+{_amount}</View>;
    }
    return <View className="text--red">-{_amount}</View>;
  }, [amount, money_type]);

  const renderItem = (title,value)=> {
    if(!value){
      return null;
    }
    return  <View className={classNames(styles["item"])}>
      <View className={classNames(styles["item--l"])}>{title}</View>
      <View className={classNames(styles["item--r"])}>{value}</View>
    </View>
  }

  return (
    <View className={classNames(styles.cashItem, "card")}>
      <View className={classNames(styles.header)}>
        <View className={classNames(styles["header--l"])}>
          {props?.created_time}
        </View>
        <View className={classNames(styles["header--r"])}>{moneyTypeText}</View>
      </View>
      <View className={classNames(styles.content)}>
        <View className={classNames(styles["item"])}>
          <View className={classNames(styles["item--l"])}>转款类型</View>
          <View className={classNames(styles["item--r"])}>
            {props?.transfer_type?.value ?? "-"}
          </View>
        </View>
        <View className={classNames(styles["item"])}>
          <View className={classNames(styles["item--l"])}>转款金额</View>
          <View className={classNames(styles["item--r"])}>{amountText}</View>
        </View>
        {renderItem('购买方名称',props?.buyer_name)}
        {renderItem('发票号',props?.receipt_number)}
        {renderItem('申请人',props?.applicant)}
        {renderItem('合同编号',props?.contract_serial_number)}
        {renderItem('合同标题',props?.contract_title)}
        {renderItem('项目编号',props?.project_serial_number)}
        {renderItem('负责人',props?.person_name)}
      </View>

    </View>
  );
}
