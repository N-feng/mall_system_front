import { useCallback, useState, useEffect, useMemo } from "react";
import { View } from "@tarojs/components";
import classNames from "classnames";
import { Skeleton, Icon } from "@antmjs/vantui";
import { navigateTo, makePhoneCall,showToast } from "@tarojs/taro";
import { formatNumber } from "@/utils/utils";
import { getContactList } from "@/api/customer";
import CustomerLevelTag from "@/components/customerLevelTag";
import userStore from "@/store/userStore";
import { getBusinessCustomerPermissions } from "@/utils/authority";
import NewContact from "../newContact";
import styles from "./index.module.less";

export default function Com(props) {
  const { isOpen } = props;
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [activeItem, setActiveItem] = useState({});
  const [newContactVisible, setNewContactVisible] = useState(false);
  const [newContactType, setNewContactType] = useState(); // updateContact
  const userInfo = userStore.getUserInfo();
  const customerPermissions = getBusinessCustomerPermissions(userInfo);

  const activeItemSpecies = useMemo(() => {
    const kind = activeItem?.kind
      ? [...(activeItem?.kind?.category ?? []), activeItem?.kind?.name]
      : [];
    return kind.join(" / ");
  }, [activeItem?.kind]);

  const showCustomerDetail = () => {
    if (!customerPermissions?.modify) {
      showToast({ title: "暂无权限", icon: "none", duration: 1000 });
      return;
    }
    props?.onPreviewCustomer?.();
  };

  const gotoCashFlow = () => {
    navigateTo({
      url: `/pages/cashFlow/index?principal=${activeItem?.id}`,
    });
  };

  const showContactDetail = () => {
    setNewContactType("updateContact");
    setNewContactVisible(true);
  };

  const showAddContact = () => {
    setNewContactType("newContact");
    setNewContactVisible(true);
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

  const toggleOpenStatus = () => {
    if (isOpen) {
      props?.onClose?.();
    } else {
      props?.onOpen?.();
    }
  };

  const handleGetContactList = useCallback(
    async (customOpenId) => {
      setLoading(true);
      const { results = [] } = await getContactList({
        customer: props?.id,
        not_page: true,
      });
      if (results?.length > 0) {
        const _item = results.find((e) => e.id === customOpenId);

        setActiveItem(_item ?? results?.[0]);
      }

      setList(results);
      setLoading(false);
    },
    [props?.id],
  );

  useEffect(() => {
    if (isOpen && props.id) {
      handleGetContactList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, props.id]);

  return (
    <View className={classNames(styles.customer, "card")}>
      <View className={styles["customer-info"]}>
        <View
          className={styles["customer-info--l"]}
          onClick={showCustomerDetail}
        >
          <View className={styles["customer-info--t"]}>
            <View className={styles["customer-name"]}>
              {props?.research_group ?? "-"}
            </View>
            <View className={classNames(styles["signory"])}>
              {props?.signory?.value} ｜ {props?.classification?.value}
            </View>
          </View>
          <View className={styles["customer-info--b"]}>
            <View className={styles["customer-company"]}>
              {props?.unit_name}
            </View>
          </View>
        </View>
        <View className={styles["customer-info--r"]} onClick={toggleOpenStatus}>
          <View className={styles["customer-info--t"]}>
            <View
              className={classNames(
                styles["customer-level"],
                isOpen && styles["open"],
              )}
            >
              <CustomerLevelTag value={props?.level?.key}>
                {props?.level?.value}
              </CustomerLevelTag>
            </View>
          </View>
        </View>
      </View>
      <Skeleton row="7" loading={loading}>
        <View className={styles["customer--line"]}></View>
        {list?.length > 0 ? (
          <View
            className={classNames(
              styles["contact-list"],
              isOpen && styles["open"],
            )}
          >
            <View className={styles["contact-list--l"]}>
              {list.map((e) => (
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
                    {e.name}
                  </View>
                  <View className={classNames(styles["contact-species"])}>
                    {e.kind?.name}
                  </View>
                </View>
              ))}

              {customerPermissions?.modify && (
                <View
                  className={classNames(styles["add-contact"])}
                  onClick={showAddContact}
                >
                  <Icon name="plus" size="14px" className={styles.icon} />
                  负责人
                </View>
              )}
            </View>
            <View className={styles["contact-list--r"]}>
              <View onClick={showContactDetail}>
                <View className={styles["contact-info"]}>
                  <View className={styles["contact-info--l"]}>物种</View>
                  <View className={styles["contact-info--r"]}>
                    {activeItemSpecies}
                  </View>
                </View>

                {activeItem?.email && (
                  <View className={styles["contact-info"]}>
                    <View className={styles["contact-info--l"]}>邮箱</View>
                    <View className={styles["contact-info--r"]}>
                      {activeItem?.email}
                    </View>
                  </View>
                )}

                {activeItem?.phone && (
                  <View className={styles["contact-info"]}>
                    <View className={styles["contact-info--l"]}>电话</View>
                    <View
                      className={classNames(
                        styles["contact-info--r"],
                        styles.phone,
                      )}
                      onClick={(e) => {
                        handleCall(activeItem?.phone);
                        e.stopPropagation();
                      }}
                    >
                      {activeItem?.phone}
                    </View>
                  </View>
                )}
              </View>
              <View className={styles["line"]}> </View>
              <View onClick={gotoCashFlow}>
                <View className={styles["contact-info"]}>
                  <View className={styles["contact-info--l"]}>已授权池</View>
                  <View
                    className={classNames(
                      styles["contact-info--r"],
                      "text--green",
                    )}
                  >
                    {formatNumber(activeItem?.cash_pool)}
                  </View>
                </View>
                <View className={styles["contact-info"]}>
                  <View className={styles["contact-info--l"]}>未授权池</View>
                  <View className={classNames(styles["contact-info--r"])}>
                    {formatNumber(activeItem?.unknown_cash_pool)}
                  </View>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <>
            <View
              className={classNames(styles.empty, isOpen && styles["open"])}
            >
              <View
                className={classNames(styles["add-contact"])}
                onClick={showAddContact}
              >
                <Icon name="plus" size="14px" className={styles.icon} />
                新增负责人
              </View>
            </View>
          </>
        )}
      </Skeleton>
      <NewContact
        {...activeItem}
        customerId={props?.id}
        type={newContactType}
        visible={newContactVisible}
        onClose={() => {
          setNewContactVisible(false);
        }}
        onConfirm={(newId) => {
          setNewContactVisible(false);
          handleGetContactList(newId ?? activeItem?.id);
        }}
      />
    </View>
  );
}
