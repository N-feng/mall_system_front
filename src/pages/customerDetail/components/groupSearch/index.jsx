import { useCallback, useState, useEffect } from "react";
import { View } from "@tarojs/components";
import { showToast } from "@tarojs/taro";
import { Skeleton } from "@antmjs/vantui";
import { getCustomerList } from "@/api/customer";
import CustomPopup from "@/components/customPopup";
import Empty from "@/components/empty";
import Search from "@/components/search";
import styles from "./index.module.less";

export default function Com(props) {
  const { visible = false, unitName, onConfirm, onClose } = props;
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  const handleGetCustomerList = useCallback(async () => {
    setLoading(true);
    const { results = [] } = await getCustomerList({
      not_page: true,
      unit_name: unitName,
    });
    setLoading(false);
    setList(results);
  }, [unitName]);

  const onSearch = useCallback((search) => {
    if (!search) {
      return;
    }
    setSearchVal(search);
  }, []);

  useEffect(() => {
    if (visible) {
      handleGetCustomerList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitName, visible]);
  return (
    <CustomPopup
      visible={visible}
      title="选择课题组"
      onClose={() => {
        onClose?.();
      }}
    >
      <View className={styles["nav"]}>
        <View className={styles.search}>
          <Search onSearch={onSearch} placeholder="请输入课题组"  confirmType="done" />
        </View>
        <View
          className={styles["add-btn"]}
          onClick={() => {
            if (!searchVal) {
              showToast({
                title: "请输入课题组",
                icon: "none",
                duration: 2000,
              });
              return;
            }
            onConfirm?.(searchVal);
          }}
        >
          新增
        </View>
      </View>
      <Skeleton row="7" loading={loading}>
        <View className={styles.list}>
          {list?.length === 0 ? (
            <Empty description="暂无相关课题组，请选择新增操作" />
          ) : (
            list.map((e) => (
              <View
                className={styles.item}
                key={e.id}
                onClick={() => {
                  onConfirm?.(e.research_group);
                }}
              >
                {e.research_group}
              </View>
            ))
          )}
        </View>
      </Skeleton>
    </CustomPopup>
  );
}
