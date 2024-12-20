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
  stopPullDownRefresh, navigateTo, showToast,
} from "@tarojs/taro";
import { fetchAuditList } from "@/api/audit";
import Search from "@/components/search";
import {mockImages, resolveAfter2Seconds} from "@/utils/utils";
import {deleteGoods, fetchGoodsList} from "@/api";
import userStore from "@/store/userStore";
import AuditItem from "./components/auditItem/index";
import styles from "./index.less";
import GoodsManagementForm from "./components/goodsManagementForm/index";

export default function GoodsManagement(props) {
  var pages = getCurrentPages();

  const InfiniteScrollInstance = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [tab, setTab] = useState("all");

  const [currentPage, setCurrentPage] = useState(0);
  const [list, setList] = useState([]);
  const [searchVal, setSearchVal] = useState("");
  const [currentId, setCurrentId] = useState();

  const getList = useCallback(
    async (customPage, search) => {
      setLoading(true);
      const {
        data: {
          total_page,
          data = [],
          cur_page_num,
        }
      } = await fetchGoodsList({
        page: customPage || currentPage + 1,
        page_size: 10,
        search: search || searchVal,
        type: tab,
      });
      const _isFinished = cur_page_num >= total_page;

      setLoading(false);
      setCurrentPage(cur_page_num);
      setList([...list, ...data]);
      // setList(mockImages);
      setIsFinished(_isFinished);
      // return _isFinished;
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
  const clickAddBtn = (process_id) => {
    console.log('process_id: ', process_id);
    navigateTo({
      url: `/pages/goodsManagementDetail/index?process_id=${props?.process_id || process_id}`,
    });
  }
  const clickEdiBtn = (process_id) => {
    console.log('process_id: ', process_id);
    navigateTo({
      url: `/pages/goodsManagementEdit/index?process_id=${props?.process_id || process_id}`,
    });
  }
  const clickDeleteBtn = (id) => {
    deleteGoods({
      product_id: id
    }).then((res) => {
      const { message, status } = res;
      if(status){
        showToast({
          title: `${message}`,
          icon: "none",
          duration: 2000,
        })
        setList(list.filter((a)=>{
          return a.id !== id;
        }))
      }else{
        showToast({
          title: `${message}`,
          icon: "error",
          duration: 2000,
        })
      }
    })
  }

  const userInfo = userStore.getUserInfo();
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
          {list.map((a) => {
            console.log(baseURL+a.file_path)
            return <View key={a.id} className="list">
              <View className="top">
                <Image
                  className="image"
                  width="100px"
                  height="100px"
                  fit="contain"
                  src={baseURL+a.file_path}
                  style={{marginRight: '15px'}}
                />
                <View className="paragraph">
                  {
                    a.description.length>10?<Ellipsis rows={2} hiddenAction>
                      {a.description}
                    </Ellipsis>:<Text>{a.description}</Text>
                  }

                </View>
                <View className="right">
                  <View className="price">¥{a.price}</View>
                  <View className="total">共{a.stock}件</View>
                </View>
              </View>
              <View className="bottom">
                <View className="left">
                </View>
                <View className="right">
                  <Button plain hairline round type="info" size="mini" onClick={()=>clickEdiBtn(a.id)}>编辑商品</Button>
                  <Button plain hairline round type="danger" size="mini" onClick={()=>clickDeleteBtn(a.id)}>删除商品</Button>
                </View>
              </View>
            </View>
          })}
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

        {/* 更新意向 */}
        <GoodsManagementForm />
      </View>
    </View>
  );
}
