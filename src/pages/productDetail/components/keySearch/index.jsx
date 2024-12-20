import { useCallback, useState, useRef, useEffect } from "react";
import { View } from "@tarojs/components";
import { Skeleton } from "@antmjs/vantui";
import Search from "@/components/search";
import Empty from "@/components/empty";
import { fetchContactList } from "@/api/visit";
import CustomPopup from "@/components/customPopup";
import styles from "../../../customerDetail/components/groupSearch/index.module.less";

export default function Com(props) {
  const { visible = false, onConfirm, onClose } = props;
  const searchRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [searchVal, setSearchVal] = useState("");

  const onSearch = useCallback((search) => {
    setSearchVal(search);
    if (!search) {
      return;
    }
    handleGetList(search);
  }, []);

  const handleGetList = useCallback(
    async (search) => {
      setLoading(true);
      const {
        results = [],
      } = await fetchContactList({
        search: search || searchVal,
        exclude_blank_phone: true,
      });
      setLoading(false);
      setList(results);
    },
    [searchVal]
  );

  const getName = (e)=>{
    return `${e?.customer?.unit_name} / ${e?.customer?.research_group} / ${e?.name}`
  }

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        searchRef?.current?.focus();
      }, 250);
      // 经过测试得出大约>250ms，才不会导致搜索框被底部键盘顶出可视区域
    }
  }, [visible]);

  return (
    <CustomPopup
      visible={visible}
      title="选择负责人"
      onClose={() => {
        onClose?.();
      }}
    >
      <View className={styles["nav"]}>
        <View className={styles.search}>
          <Search
            onSearch={onSearch}
            placeholder="请输入所属客户/课题组/负责人"
            ref={searchRef}
          />
        </View>

      </View>
      <Skeleton row="7" loading={loading}>
        <View className={styles.list}>
          {list?.length === 0 ? (
            <Empty
              description="请输入相关信息进行搜索"
            />
          ) : (
            list.map((e) => (
              <View
                className={styles.item}
                key={e.id}
                onClick={() => {
                  onConfirm?.(e,getName(e));
                }}
              >
                {getName(e)}
              </View>
            ))
          )}
        </View>
      </Skeleton>
    </CustomPopup>
  );
}
