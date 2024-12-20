/*
 * @Description: 意向
 */
import { useCallback, useState, useRef } from "react";
import cns from "classnames";
import { InfiniteScroll, Icon } from "@antmjs/vantui";
import { View } from "@tarojs/components";
import {
  useLoad,
  useDidShow,
  getCurrentPages,
  navigateTo,
  usePullDownRefresh,
  stopPullDownRefresh,
} from "@tarojs/taro";
import { fetchIntentionList } from "@/api/intention";
import Search from "@/components/search";
import { getBusinessIntentionsPermissions } from "@/utils/authority";
import userStore from "@/store/userStore";
import CustomerItem from "./components/customerItem/index";
import styles from "./index.module.less";

export default function Index() {
  var pages = getCurrentPages();
  const InfiniteScrollInstance = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [list, setList] = useState([]);
  const [searchVal, setSearchVal] = useState("");
  const userInfo = userStore.getUserInfo();
  const intentionPermissions = getBusinessIntentionsPermissions(userInfo);

  const handleGetList = useCallback(
    async (customPage, search) => {
      setLoading(true);
      const {
        total_pages,
        results = [],
        current_page,
      } = await fetchIntentionList({
        page: customPage || currentPage + 1,
        page_size: 10,
        search: search || searchVal,
      });
      const _isFinished = current_page >= total_pages;

      setLoading(false);
      setCurrentPage(current_page);
      setList([...list, ...results]);
      setIsFinished(_isFinished);
      return _isFinished;
    },
    [currentPage, list, searchVal],
  );

  const onSearch = useCallback((search) => {
    setCurrentPage(0);
    setSearchVal(search);
    setIsFinished(false);
    setList([]);
    InfiniteScrollInstance.current?.reset({ loadMore: true });
  }, []);

  const onLoadMore = async () => {
    return new Promise(async (resolve) => {
      if (loading) return resolve("loading");

      if (isFinished) {
        return resolve("complete");
      }

      const complete = await handleGetList();
      resolve(complete ? "complete" : "loading");
    });
  };

  const handleAdd = () => {
    navigateTo({
      url: "/pages/intentionDetail/index",
    });
  };

  useDidShow(() => {
    var currPage = pages[pages.length - 1];
    let needRefresh = currPage?.data?.needRefresh;

    if (needRefresh) {
      onSearch("");
      // 应承编辑页的刷新操作 暂时weapp起效，h5不起效
      currPage?.setData({ needRefresh: false });
    }
  });

  // 刷新重置页面
  usePullDownRefresh(() => {
    onSearch("");
    stopPullDownRefresh();
  });

  useLoad(() => {});

  return (
    <View className={styles.visit}>
      <View className={styles.search}>
        <Search onSearch={onSearch} placeholder="请输入项目信息" />
      </View>
      <View className={cns(styles.container, "container")}>
        <View className={styles.list}>
          {list.map((e) => (
            <CustomerItem
              key={e.id}
              onRefresh={() => {
                onSearch(searchVal);
              }}
              {...e}
            />
          ))}
        </View>

        {intentionPermissions?.add && (
          <View className={styles["newCustomerBtn"]} onClick={handleAdd}>
            <Icon color="#fff" name="plus" size="30px" className="icon"></Icon>
          </View>
        )}

        <InfiniteScroll
          loadMore={onLoadMore}
          ref={InfiniteScrollInstance}
          completeText={
            searchVal && list?.length === 0
              ? "查询不到相关信息~"
              : "没有更多了~"
          }
        />
      </View>
    </View>
  );
}
