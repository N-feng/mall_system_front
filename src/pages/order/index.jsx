/*
 * @Description: 审核
 */
import { useCallback, useState, useRef, useEffect } from "react";
import cns from "classnames";
import {InfiniteScroll, Tabs, Tab, Image, Ellipsis, Button} from "@antmjs/vantui";
import {Text, View} from "@tarojs/components";
import {
  useLoad,
  useDidShow,
  getCurrentPages,
  usePullDownRefresh,
  stopPullDownRefresh, navigateTo, getCurrentInstance,getStorageSync,removeStorageSync
} from "@tarojs/taro";
import { fetchAuditList } from "@/api/audit";
import Search from "@/components/search";
import {mockImages, resolveAfter2Seconds, sellerTabList, userTabList} from "@/utils/utils";
import {fetchOrdersList} from "@/api/order";
import userStore from "@/store/userStore";
import styles from "./index.less";

export default function Order() {
  const instance = getCurrentInstance();

  var pages = getCurrentPages();
  const tempTab = getStorageSync('tabParams');
  console.log("params",tempTab);
  // 处理参数
  // removeStorageSync('tabParams'); // 可选：使用后清除

  const InfiniteScrollInstance = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [tab, setTab] = useState(tempTab?tempTab.key:'pending');

  const [currentPage, setCurrentPage] = useState(0);
  const [list, setList] = useState([]);
  const [searchVal, setSearchVal] = useState("");

  const getList = useCallback(
    async (customPage, search) => {
      setLoading(true);
      const {
        data: {
          total_page,
          data = [],
          cur_page_num,
        }
      } = await fetchOrdersList({
        page: customPage || currentPage + 1,
        page_size: 10,
        search: search || searchVal,
        status: tab==='all'?'':tab,
      });

      const _isFinished = cur_page_num >= total_page;

      setLoading(false);
      setCurrentPage(cur_page_num);
      setList([...list, ...data]);
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

      const complete = await getList();
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

  const userInfo = userStore.getUserInfo();

  const clickAddBtn = () => {
    navigateTo({
      url: `/pages/orderDetail/index`,
    });
  }

  console.log("userInfo", userInfo);

  return (
    <View className="orderPage">
      <Tabs
        sticky
        active={tab}
        ellipsis={false}
        onChange={(e) => {
          setTab(e.detail?.name);
        }}
      >
        {
          userInfo?.role_id === 1 && <>
            {
              userTabList.map((a, index) => {
                return <Tab title={a.title} name={a.name} key={a.name}></Tab>
              })
            }
          </>
        }
        {
          userInfo?.role_id === 2 && <>
            {sellerTabList.map((a, index) => {
              return <Tab title={a.title} name={a.name} key={a.name}></Tab>
            })}
          </>
        }
      </Tabs>
      <View className="searchWrapper">
        <Search onSearch={onSearch} placeholder="请输入搜索内容" />
        {/*{
          userInfo.role_id>1&&<Button
            plain hairline
            onClick={clickAddBtn}
            size="small"
            round
            style={{marginRight: 0}}
          >
            新增
          </Button>
        }*/}
      </View>
      <View className="container">
        <View>
          {list.map((a) => (
            <View key={Math.random().toString()} className="list">
              <View className="top">
                <Image
                  className="image"
                  width="100px"
                  height="100px"
                  fit="contain"
                  src={a}
                />
                <View className="paragraph">
                  {
                    a.order_number.length>20?<Ellipsis rows={1} hiddenAction>
                      订单编号：{a.order_number}
                    </Ellipsis>:<Text>订单编号：{a.order_number}</Text>
                  }
                </View>
                <View className="right">
                  <View className="price">¥{a.total_amount}</View>
                  <View className="total">共1件</View>
                </View>
              </View>
              <View className="bottom">
                <View className="left">

                </View>
                <View className="right">
                  {/*<Button plain hairline round type="danger" size="mini">再次购买</Button>*/}
                </View>
              </View>
            </View>
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
