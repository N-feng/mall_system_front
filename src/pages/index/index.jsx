/*
 * @Description: 首页
 */
import { useCallback, useState, useRef } from "react";
import { View, Text, Image as TaroImage } from "@tarojs/components";
import {
  useLoad,
  useDidShow,
  navigateTo,
  redirectTo,
  showToast,
  usePullDownRefresh,
  stopPullDownRefresh,
  getCurrentPages, getEnv, ENV_TYPE,
  useShareAppMessage
} from "@tarojs/taro";
import userStore from "@/store/userStore";
import {Image, Row, Col, InfiniteScroll, WaterfallFlow, Button, Icon, Toast, Ellipsis} from "@antmjs/vantui";
import { handleRedirectToLogin, genTextData, mockGoods, resolveAfter2Seconds } from "@/utils/utils";
import indexIcon1 from "@/assets/image/index-icon-1.svg";
import indexIcon2 from "@/assets/image/index-icon-2.svg";
import indexIcon3 from "@/assets/image/index-icon-3.svg";
import Empty from "@/components/empty";
import {fetchAuditList, fetchGoodsList} from "@/api/index";
import Search from "@/components/search";
import {fetchHomePageList} from "@/api/homePage";
import {addOrRemoveCart} from "@/api/cart";
import AuditItem from "../audit/components/auditItem";

import "./index.less";


const MenuList = [
  {
    icon: indexIcon1,
    title: "客户管理",
    url: "/pages/customer/index",
    authority: ["admin", "301"],
  },
  {
    icon: indexIcon2,
    title: "拜访管理",
    url: "/pages/visit/index",
    authority: ["admin", "303"],
  },
  {
    icon: indexIcon3,
    title: "意向管理",
    url: "/pages/intention/index",
    authority: ["admin", "302"],
  },
];

export default function Index() {
  var pages = getCurrentPages();
  const userInfo = userStore.getUserInfo();
  const [permissionMenu, setPermissionMenu] = useState([]);
  const InfiniteScrollInstance = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [list, setList] = useState([]);
  const [searchVal, setSearchVal] = useState("");

  const handleNavigateTo = (url) => {
    if (!url) {
      showToast({
        title: "开发中...",
        icon: "none",
        duration: 2000,
      });
      return;
    }
    navigateTo({
      url: url,
    });
  };

  const resolvedMenu = () => {
    let _menu = [];

    if (userInfo?.is_admin) {
      _menu = MenuList ?? [];
    }

    _menu = MenuList.filter((e) => {
      return (userInfo?.authority_module??[]).find((menu) =>
        e.authority.includes(menu),
      );
    });
    setPermissionMenu(_menu);
  };

  /*const getList = useCallback(async () => {
    setLoading(true);
    const {
      total_page,
      data = [],
      cur_page_num,
    } = await fetchAuditList({
      page: currentPage + 1,
      page_size: 10,
      type: "pending",
    });
    const _isFinished = cur_page_num >= total_page;

    setLoading(false);
    setCurrentPage(cur_page_num);
    setList([...list, ...data]);
    setIsFinished(_isFinished);

    return _isFinished;
  }, [currentPage, list]);*/

  const getList = useCallback(async () => {
    setLoading(true);
    const {
      data: {
        total_page,
        data = [],
        cur_page_num,
      }
    } = await fetchGoodsList({
      page: currentPage + 1,
      page_size: 10,
      name: searchVal
    });
    const _isFinished = cur_page_num >= total_page;

    setLoading(false);
    setCurrentPage(cur_page_num);
    setList([...list, ...data]);
    setIsFinished(_isFinished);

    return _isFinished;
  }, [currentPage, list]);

  const [productList] = useState(mockGoods())

  const clickDetailBtn = () => {
    navigateTo({
      url: "/pages/productDetail/index",
    });
  };
  const clickAddCartBtn = (e,id) => {
    e.stopPropagation();
    console.log("clickAddCartBtn",id);
    addOrRemoveCart({
      action: 'add',
      product_id: id,
      quantity: 1
    }).then((res)=>{
      const {message, status} = res
      if(status){
        showToast({
          title: message,
          icon: "none",
          duration: 2000,
        });
      }else{
        showToast({
          title: message,
          icon: "error",
          duration: 2000,
        });
      }
    })

  };
  const baseURL = process.env.TARO_APP_BASE_API;
  const renderItem = (item, forceResize) => {
    return (
      <View className="van-demo-goods-item-wrapper">
        <View className="van-demo-goods-item" onClick={clickDetailBtn}>
          {/* <Image
            src={baseURL+item?.file_path}
            className="img"
            // mode={getEnv() === ENV_TYPE.WEAPP?"aspectFill":'widthFix'}
            // onLoad={forceResize} // 当图片加载完成时触发forceResize
          /> */}
          <View style={{ backgroundImage: `url(${baseURL+item?.file_path})` }} className="img"></View>
          <View className="title">
            {
              item.name.length>10?<Ellipsis rows={2} hiddenAction>
                {item.name}
              </Ellipsis>:<Text>{item.name}</Text>
            }
          </View>
          {item.isCutPrice && <Text className="cutPrice">最近大降价</Text>}
          <View className="priceWrapper">
            <View className="price">{item.price}</View>
            {/*{
              item.stock>0 && <View className="btn" onClick={(e)=>clickAddCartBtn(e,item.id)}>
                <Icon name="cart-o" size="18px" />
              </View>
            }*/}
            {
              userInfo?.role_id === 1 && 
                <View className="btn" onClick={(e)=>clickAddCartBtn(e,item.id)}>
                  <Icon name="cart-o" size="18px" />
                </View>
            }
          </View>
        </View>
      </View>
    )
  }

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

  useLoad(() => {
  });

  const initPage = () => {
    if (!userInfo) {
      handleRedirectToLogin();
    }
    resolvedMenu();
  };

  const handleRefresh = ()=>{
    initPage();
    setCurrentPage(0);
    setList([]);
    setIsFinished(false);
    InfiniteScrollInstance.current?.reset({ loadMore: true });
    stopPullDownRefresh();
  }

  useDidShow(() => {
    var currPage = pages[pages.length - 1];
    let needRefresh = currPage?.data?.needRefresh;
    initPage();

    if (needRefresh) {
      // 应承编辑页的刷新操作 暂时weapp起效，h5不起效
      currPage?.setData({ needRefresh: false });
      handleRefresh();
    }
  });

  usePullDownRefresh(() => {
    handleRefresh();
  });

  const onSearch = useCallback((search) => {
    setCurrentPage(0);
    setSearchVal(search);
    setIsFinished(false);
    setList([]);
    InfiniteScrollInstance.current?.reset({ loadMore: true });
  }, []);

  useShareAppMessage((res) => {
    if (res.from === 'button') {
      // 来自页面内分享按钮
    } else {
      // 右上角分享好友
    }

    return {
      title: '来自星星的分享', // 分享卡片的title
      path: '', // 分享卡片的小程序路径
      imageUrl: '' // 分享卡片的图片链接
    };
  });
  return (
    <View className="index">
      <View className="container">
        <View className="welcome-text">
          <View className="text-1">Hi, {userInfo?.nickname}</View>
          <View className="text-2">欢迎使用{process.env.TARO_APP_NAME}</View>
        </View>
        {/*<View className="menu">
          <Row gutter={[24, 24]}>
            {permissionMenu.map((e, index) => (
              <Col span="8" key={index} onClick={() => handleNavigateTo(e.url)}>
                <View className="menu-item">
                  <Image width="32px" height="32px" src={e.icon} />
                  <View className="menu-item-title">{e.title}</View>
                </View>
              </Col>
            ))}
          </Row>
        </View>*/}
        <View className="audit">
          <View className="audit-header">
            <View className="audit-header--l">商品列表</View>
            {/*<View
              className="audit-header--r"
              onClick={() => {
                navigateTo({
                  url: "/pages/audit/index",
                });
              }}
            >
              全部列表
            </View>*/}
          </View>
          <View className="searchWrapper">
            <Search onSearch={onSearch} placeholder="请输入搜索内容" />
          </View>

          <View className="audit-list">
            <WaterfallFlow
              dataSource={list.map(a=>{
                return {
                  key: a.id,
                  ...a
                }
              })}
              columnNum={1}
              gutter={8}
              renderItem={renderItem}
              calculationDelay={1000}
            />
            {/*{list.map((e) => (
              <AuditItem key={e.process_id} {...e} />
            ))}*/}
            <InfiniteScroll
              loadMore={onLoadMore}
              ref={InfiniteScrollInstance}
              completeText={list?.length > 0 ? "没有更多了~" : ""}
            />
          </View>
          {!loading && list?.length === 0 && (
            <Empty description="列表是空的～" />
          )}
        </View>
      </View>
    </View>
  );
}
