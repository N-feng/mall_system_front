/*
 * @Description: 审核
 */
import { useCallback, useState, useRef, useEffect } from "react";
import cns from "classnames";
import {InfiniteScroll, Tabs, Tab, Image, Ellipsis, Button, Tag} from "@antmjs/vantui";
import {Text, View} from "@tarojs/components";
import {
  useLoad,
  useDidShow,
  getCurrentPages,
  usePullDownRefresh,
  stopPullDownRefresh, navigateTo,
} from "@tarojs/taro";
import { fetchAuditList } from "@/api/audit";
import Search from "@/components/search";
import {mockImages, resolveAfter2Seconds} from "@/utils/utils";
import {fetchOrdersList} from "@/api/order";
import userStore from "@/store/userStore";
import {fetchVerificationsList} from "@/api";
import styles from "./index.less";

export default function Verification() {
  var pages = getCurrentPages();

  const InfiniteScrollInstance = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [tab, setTab] = useState("all");

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
      } = await fetchVerificationsList({
        page: customPage || currentPage + 1,
        page_size: 10,
        search: search || searchVal,
        type: tab,
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
      url: `/pages/verificationAdd/index`,
    });
  }
  const clickItem = (id) => {
    navigateTo({
      url: `/pages/verificationDetail/index?id=${id}`,
    });
  }

  const baseURL = process.env.TARO_APP_BASE_API;

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
        <Tab title="全部" name="all"></Tab>
        <Tab title="待审核" name="processed"></Tab>
        <Tab title="已审核" name="complete"></Tab>
      </Tabs>
      <View className="searchWrapper" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Search onSearch={onSearch} placeholder="请输入搜索内容" />
        {
          userInfo.role_id>1&&<Button
            plain hairline
            onClick={clickAddBtn}
            size="small"
            round
            style={{marginRight: 0}}
          >
            新增
          </Button>
        }
      </View>
      <View className="container">
        <View>
          {list.map((a) => (
            <View key={a.id} className="list">
              <View className="top">
                <Image
                  className="image"
                  width="100px"
                  height="100px"
                  fit="contain"
                  src={baseURL+a.id_card_front}
                  style={{marginRight: '15px'}}
                />
                <Image
                  className="image"
                  width="100px"
                  height="100px"
                  fit="contain"
                  src={baseURL+a.id_card_back}
                  style={{marginRight: '15px'}}
                />
                <View className="paragraph">
                  {
                    a.contact_info.length>10?<Ellipsis rows={2} hiddenAction>
                      联系人信息：{a.contact_info}
                    </Ellipsis>:<Text>联系人信息：{a.contact_info}</Text>
                  }
                </View>
                {/*<View className="right">
                  <View className="price">¥188</View>
                  <View className="total">共1件</View>
                </View>*/}
              </View>
              <View className="bottom">
                <View className="left">

                </View>
                <View className="right">
                  <Button plain hairline round type="danger" size="mini" onClick={()=>clickItem(a.id)}>审核</Button>
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
