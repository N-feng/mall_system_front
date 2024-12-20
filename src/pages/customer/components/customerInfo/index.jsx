import { useCallback, useState, useEffect } from "react";
import { navigateTo } from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import { Button, Switch, Skeleton } from "@antmjs/vantui";
import cns from "classnames";
import CustomPopup from "@/components/customPopup";
import CustomerLevelTag from "@/components/customerLevelTag";
import { CustomerStatusEnums } from "@/utils/constant";
import { formatNumber } from "@/utils/utils";
import userStore from "@/store/userStore";
import { getBusinessCustomerPermissions } from "@/utils/authority";
import CustomerStatusTag from "@/components/customerStatusTag";
import { activateCustomer, getCustomer } from "@/api/customer";
import CustomPopupCenter from "@/components/customPopupCenter";
import styles from "./index.module.less";

export default function Com(props) {
  const { visible = false, onClose } = props;
  const [value, setValue] = useState(false);

  const [switchModalVisible, setSwitchModalVisible] = useState(false);
  const [status, setStatus] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});

  const userInfo = userStore.getUserInfo();

  const gotoEdit = useCallback(() => {
    navigateTo({
      url: `/pages/customerDetail/index?id=${props?.id}&type=customer`,
    });
  }, [props?.id]);

  const customerPermissions = getBusinessCustomerPermissions(userInfo);

  useEffect(() => {
    const handleGetCustomer = async () => {
      setLoading(true);
      const { results } = await getCustomer(props?.id);
      setLoading(false);
      setData(results ?? {});
      setValue(results?.status?.key === CustomerStatusEnums.Normal);
    };
    visible && props?.id && handleGetCustomer();
  }, [props?.id, visible]);

  return (
    <>
      <CustomPopup
        visible={visible}
        title={
          <>
            <Text style={{ marginRight: 8 }}>客户详情</Text>
            <CustomerLevelTag value={data?.level?.key}>
              {data?.level?.value}
            </CustomerLevelTag>
          </>
        }
        onClose={() => {
          onClose?.();
        }}
      >
        <Skeleton row="7" loading={loading}>
          <View className={styles.content}>
            <View className={styles.item}>
              <View className={styles["item--l"]}>客户状态</View>
              <View className={styles["item--r"]}>
                {customerPermissions?.activate ? (
                  <Switch
                    loading={statusLoading}
                    size="10px"
                    checked={value}
                    onChange={(e) => {
                      setSwitchModalVisible(true);
                      setStatus(e.detail);
                    }}
                  />
                ) : (
                  <CustomerStatusTag value={data?.status?.key} fontSize="14px">
                    {data?.status?.value}
                  </CustomerStatusTag>
                )}
              </View>
            </View>
            <View className={styles.item}>
              <View className={styles["item--l"]}>单位名称</View>
              <View className={styles["item--r"]}>{data?.unit_name}</View>
            </View>

            <View className={styles.item}>
              <View className={styles["item--l"]}>课题组</View>
              <View className={styles["item--r"]}>{data?.research_group}</View>
            </View>
            <View className={styles.item}>
              <View className={styles["item--l"]}>客户分类</View>
              <View className={styles["item--r"]}>
                {data?.classification?.value}
              </View>
            </View>
            <View className={styles.item}>
              <View className={styles["item--l"]}>客户类别</View>
              <View className={styles["item--r"]}>{data?.category?.value}</View>
            </View>
            <View className={styles.item}>
              <View className={styles["item--l"]}>领域</View>
              <View className={styles["item--r"]}>{data?.signory?.value}</View>
            </View>

            <View className={styles.item}>
              <View className={styles["item--l"]}>客户来源</View>
              <View className={styles["item--r"]}>
                {data?.source_from?.value}
              </View>
            </View>
            <View className={styles.item}>
              <View className={styles["item--l"]}>授权信用额度 ¥</View>
              <View className={cns(styles["item--r"])}>
                {formatNumber(data?.available_credit)}
              </View>
            </View>
            <View className={styles.item}>
              <View className={styles["item--l"]}>已用信用额度 ¥</View>
              <View className={styles["item--r"]}>
                {formatNumber(data?.used_credit)}
              </View>
            </View>
            <View className={styles.item}>
              <View className={styles["item--l"]}>特殊池 ¥</View>
              <View className={cns(styles["item--r"], "text--orange")}>
                {formatNumber(data?.special_pool)}
              </View>
            </View>
            <View className={styles.item}>
              <View className={styles["item--l"]}>未授权池 ¥</View>
              <View className={styles["item--r"]}>
                {formatNumber(data?.unknown_cash_pool)}
              </View>
            </View>
            <View className={styles.item}>
              <View className={styles["item--l"]}>已授权池 ¥</View>
              <View className={cns(styles["item--r"], "text--green")}>
                {formatNumber(data?.cash_pool)}
              </View>
            </View>

            <View className={styles.item}>
              <View className={styles["item--l"]}>所在区域</View>
              <View className={styles["item--r"]}>
                {data?.countries} / {data?.provinces} / {data?.cities}
              </View>
            </View>
          </View>

          {!value &&
            customerPermissions?.modify && (
            <View className={styles.footer}>
              <Button
                block
                type="primary"
                className="van-button-submit"
                onClick={gotoEdit}
              >
                  去编辑
              </Button>
            </View>
          )}
        </Skeleton>
      </CustomPopup>
      <CustomPopupCenter
        zIndex={9999}
        visible={switchModalVisible}
        onClose={() => {
          setSwitchModalVisible(false);
        }}
        onConfirm={() => {
          setSwitchModalVisible(false);
          setStatusLoading(true);
          activateCustomer(data?.id, { activate: status })
            .then(() => {
              setValue(status);
            })
            .finally(() => {
              setStatusLoading(false);
            });
        }}
        title="提示"
      >
        <View className={styles["status-text"]}>
          {status
            ? `您确认启用【${data?.research_group}】吗？`
            : `您确认禁用【${data?.research_group}】吗？`}
        </View>
      </CustomPopupCenter>
    </>
  );
}
