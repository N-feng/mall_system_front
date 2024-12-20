/*
 * @Description: 现金池明细
 */
import { useCallback, useState, useRef, useEffect } from "react";
import { InfiniteScroll, Tabs, Tab } from "@antmjs/vantui";
import { View } from "@tarojs/components";
import { useLoad, useDidShow, getCurrentInstance } from "@tarojs/taro";
import { getCashflowDetail } from "@/api/customer";
import classnames from "classnames";
import CashItem from "./components/cashItem";
import CashDetail from "./components/cashDetail";

import styles from "./index.module.less";

export default function Index() {
  const instance = getCurrentInstance();
  const { principal } = instance.router.params;
  const [tab, setTab] = useState("");
  const InfiniteScrollInstance = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [list, setList] = useState([]);
  const [visible, setVisible] = useState(false);
  const [curItem, setCurItem] = useState({});

  const handleGetCashflowDetail = useCallback(async () => {
    setLoading(true);
    const {
      total_pages,
      results = [],
      current_page,
    } = await getCashflowDetail({
      principal: principal,
      page: currentPage + 1,
      page_size: 10,
      money_type: tab ? tab : "",
    });
    const _isFinished = current_page >= total_pages;

    setLoading(false);
    setCurrentPage(current_page);
    setList([...list, ...results]);
    setIsFinished(_isFinished);
    return _isFinished;
  }, [currentPage, list, principal, tab]);

  const onLoadMore = async () => {
    return new Promise(async (resolve) => {
      if (loading) return resolve("loading");

      if (isFinished) {
        return resolve("complete");
      }

      const complete = await handleGetCashflowDetail();
      resolve(complete ? "complete" : "loading");
    });
  };

  useEffect(() => {
    setCurrentPage(0);
    setIsFinished(false);
    setList([]);
    InfiniteScrollInstance.current?.reset({ loadMore: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useDidShow(() => {});
  useLoad(() => {});

  return (
    <View className={styles.cashFlow}>
      <Tabs
        sticky
        active={tab}
        ellipsis={false}
        onChange={(e) => {
          setTab(e.detail?.name);
        }}
      >
        <Tab title="全部" name=""></Tab>
        <Tab title="收入" name="income"></Tab>
        <Tab title="支出" name="expenses"></Tab>
      </Tabs>
      <View className={classnames(styles.container, "container")}>
        <View className="cash-flow-total">

        </View>
        <View className={styles.list}>
          {list.map((e) => (
            <View
              key={e.id}
              // onClick={() => {
              //   setVisible(true);
              //   setCurItem(e);
              // }}
            >
              <CashItem {...e} />
            </View>
          ))}
        </View>
        <InfiniteScroll
          loadMore={onLoadMore}
          ref={InfiniteScrollInstance}
          completeText="没有更多了~"
        />
      </View>

      {/* <CashDetail
        {...curItem}
        visible={visible}
        onClose={() => {
          setVisible(false);
          setCurItem(null);
        }}
      /> */}
    </View>
  );
}
