/*
 * @Description: 审核
 */
import { useCallback, useState, useRef, useEffect } from "react";
import cns from "classnames";
import { InfiniteScroll, Tabs, Tab } from "@antmjs/vantui";
import { View } from "@tarojs/components";
import {
  useLoad,
  useDidShow,
  getCurrentPages,
  usePullDownRefresh,
  stopPullDownRefresh,
} from "@tarojs/taro";
import { fetchAuditList } from "@/api/audit";
import Search from "@/components/search";
import AuditItem from "./components/auditItem/index";
import styles from "./index.module.less";

export default function Audit() {
  var pages = getCurrentPages();

  const InfiniteScrollInstance = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [tab, setTab] = useState("pending");

  const [currentPage, setCurrentPage] = useState(0);
  const [list, setList] = useState([]);
  const [searchVal, setSearchVal] = useState("");

  const handleGetList = useCallback(
    async (customPage, search) => {
      setLoading(true);
      const {
        total_pages,
        results = [],
        current_page,
      } = await fetchAuditList({
        page: customPage || currentPage + 1,
        page_size: 10,
        search: search || searchVal,
        type: tab,
      });
      const _isFinished = current_page >= total_pages;

      setLoading(false);
      setCurrentPage(current_page);
      setList([...list, ...results]);
      setIsFinished(_isFinished);
      return _isFinished;
    },
    [currentPage, list, searchVal, tab],
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

  useDidShow(() => {
    var currPage = pages[pages.length - 1];
    let needRefresh = currPage?.data?.needRefresh;

    if (needRefresh) {
      onSearch("");
      // 应承编辑页的刷新操作 暂时weapp起效，h5不起效
      currPage?.setData({ needRefresh: false });
    }
  });

  useEffect(() => {
    onSearch("")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useLoad(() => {});

  // 刷新重置页面
  usePullDownRefresh(() => {
    onSearch("");
    stopPullDownRefresh();
  });

  return (
    <View className={styles.audit}>
      <Tabs
        sticky
        active={tab}
        ellipsis={false}
        onChange={(e) => {
          setTab(e.detail?.name);
        }}
      >
        <Tab title="待处理" name="pending"></Tab>
        <Tab title="我处理的" name="processed"></Tab>
        <Tab title="我发起的" name="create"></Tab>
      </Tabs>
      {/* <View className={styles.search}>
        <Search onSearch={onSearch} placeholder="请输入搜索内容" />
      </View> */}
      <View className={cns(styles.container, "container")}>
        <View className={styles.list}>
          {list.map((e) => (
            <AuditItem key={e.process_id} {...e} />
          ))}
        </View>
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
