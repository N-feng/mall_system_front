import { useCallback, useState,useRef, useEffect } from "react";
import { showToast } from "@tarojs/taro";
import { View } from "@tarojs/components";
import { Skeleton } from "@antmjs/vantui";
import { searchUnit } from "@/api/customer";
import Search from "@/components/search";
import Empty from "@/components/empty";
import CustomPopup from "@/components/customPopup";
import styles from "./index.module.less";

export default function Com(props) {
  const { visible = false, onConfirm, onClose } = props;
  const searchRef =  useRef(null)
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [searchVal, setSearchVal] = useState("");

  const handleGetUnitNameList = useCallback(async (search) => {
    setLoading(true);
    const { results = [] } = await searchUnit({
      field: "unit_name",
      search: search,
    });
    setLoading(false);
    setList(results);
  }, []);

  const onSearch = useCallback((search) => {
    setSearchVal(search);
    if (!search) {
      return;
    }
    handleGetUnitNameList(search);
  }, []);

  useEffect(()=>{
    if(visible){
      setTimeout(()=>{
        searchRef?.current?.focus();
      },250)
      // 经过测试得出大约>250ms，才不会导致搜索框被底部键盘顶出可视区域
    }
  },[visible])

  return (
    <CustomPopup
      visible={visible}
      title="选择拜访记录"
      onClose={() => {
        onClose?.();
      }}
    >
      <View className={styles["nav"]}>
        <View className={styles.search}>
          <Search onSearch={onSearch} placeholder="请输入" ref={searchRef} />
        </View>
        <View
          className={styles["add-btn"]}
          onClick={() => {
            if (!searchVal) {
              showToast({
                title: "请输入客户单位",
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
            <Empty
              description={
                searchVal
                  ? "暂无相关拜访，请选择新增操作"
                  : "请输入拜访信息进行搜索"
              }
            />
          ) : (
            list.map((e) => (
              <View
                className={styles.item}
                key={e}
                onClick={() => {
                  onConfirm?.(e);
                }}
              >
                {e}
              </View>
            ))
          )}
        </View>
      </Skeleton>
    </CustomPopup>
  );
}
