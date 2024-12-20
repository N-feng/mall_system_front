/*
 * @Description: 客户管理首页
 */
import { useCallback, useState, useRef } from "react";
import cns from "classnames";
import { InfiniteScroll, Icon } from "@antmjs/vantui";
import { View } from "@tarojs/components";
import {
  useLoad,
  useDidShow,
  navigateTo,
  getCurrentPages,
  usePullDownRefresh,
  stopPullDownRefresh,
} from "@tarojs/taro";
import { getCustomerList } from "@/api/customer";
import Search from "@/components/search";
import CustomToast from "@/components/customToast";
import {getBusinessCustomerPermissions} from "@/utils/authority"
import userStore from "@/store/userStore";
import CustomerItem from "./components/customerItem/index";
import Statistic from './components/statistic'
import CustomerInfo from "./components/customerInfo/index";
import styles from "./index.module.less";

export default function Index() {
  var pages = getCurrentPages();
  const userInfo = userStore.getUserInfo();
  const InfiniteScrollInstance = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [list, setList] = useState([]);
  const [searchVal, setSearchVal] = useState("");
  const [totalData, setTotalData] = useState({
    cash_pool: "",
    total_cash_pool: "",
  });
  const [openId, setOpenId] = useState("");  // 手风琴效果
  const [detailVisible, setDetailVisible] = useState(false); // 客户详情
  const [curCustomer, setCurCustomer] = useState(null);
  const customerPermissions = getBusinessCustomerPermissions(userInfo);


  const handleGetCustomerList = useCallback(
    async (customPage, search) => {
      setLoading(true);
      const {
        total,
        total_pages,
        results = [],
        current_page,
      } = await getCustomerList({
        page: customPage || currentPage + 1,
        page_size: 10,
        deleted: false,
        search: search || searchVal,
      });
      const _isFinished = current_page >= total_pages;

      setLoading(false);
      setTotalData(total);
      setCurrentPage(current_page);
      setList([...list, ...results]);
      setIsFinished(_isFinished);
      return _isFinished;
    },
    [currentPage, list, searchVal]
  );

  const onSearch = useCallback((search) => {
    setCurrentPage(0);
    setSearchVal(search);
    setIsFinished(false);
    setList([]);
    InfiniteScrollInstance.current?.reset({ loadMore: true });
  }, []);

  // 刷新重置页面
  usePullDownRefresh(() => {
    setIsFinished(false);
    setTotalData({});
    setCurrentPage(0);
    setList([]);
    InfiniteScrollInstance.current?.reset({ loadMore: true });
    stopPullDownRefresh();
  });


  const onLoadMore = async () => {
    return new Promise(async (resolve) => {
      if (loading) return resolve("loading");

      if (isFinished) {
        return resolve("complete");
      }

      const complete = await handleGetCustomerList();
      resolve(complete ? "complete" : "loading");
    });
  };


  const handleAddCustomer = () => {
    navigateTo({
      url: "/pages/customerDetail/index",
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

  useLoad(() => {});

  return (
    <View className={styles.customer} style={detailVisible ? {overflow: 'hidden'} : ''}>
      <View className={styles.search}>
        <Search onSearch={onSearch} placeholder="请输入客户信息" />
      </View>
      <View className={cns(styles.container, "container")}>
        {list?.length > 0 && (
          <Statistic totalData={totalData} />
        )}

        <View className={styles.list}>
          {list.map((e) => (
            <CustomerItem
              key={e.id}
              isOpen={openId === e.id}
              onOpen={() => setOpenId(e.id)}
              onClose={() => setOpenId("")}
              onPreviewCustomer={()=>{
                setCurCustomer(e)
                setDetailVisible(true)
              }}
              {...e}
            />
          ))}
        </View>
        <InfiniteScroll
          loadMore={onLoadMore}
          ref={InfiniteScrollInstance}
          completeText={
            searchVal && list?.length === 0
              ? "查询不到相关客户~"
              : "没有更多了~"
          }
        />
      </View>

      {customerPermissions?.add && <View className={styles["newCustomerBtn"]} onClick={handleAddCustomer}>
        <Icon color="#fff" name="plus" size="30px" className="icon"></Icon>
      </View>
      }
      <CustomToast
        visible={toastVisible}
        onClose={() => {
          setToastVisible(false);
        }}
      >
        <View className={styles["toast-msg"]}>{toastMsg}</View>
      </CustomToast>

      <CustomerInfo
        {...curCustomer}
        visible={detailVisible}
        onClose={() => {
          setDetailVisible(false);
          setCurCustomer(null)
        }}
      />
    </View>
  );
}
