/*
 * @Description: 新增客户编辑页
 */
import {useCallback, useEffect, useRef, useState} from "react";
import {View} from "@tarojs/components";
import {getCurrentPages, navigateBack, navigateTo, showToast} from "@tarojs/taro";
import {
  Form,
  GoodsAction,
  GoodsActionButton,
  GoodsActionIcon,
  Image, InfiniteScroll,
  Sku,
  Stepper,
  Swiper,
  SwiperItem,
  Toast
} from "@antmjs/vantui";
import {getVisitRecords} from "@/api/visit";
import {addIntention} from "@/api/intention";
import KeySearch from "./components/keySearch";
import styles from "./index.module.less";
// eslint-disable-next-line import/first
import {goodsList, mockImages, resolveAfter2Seconds, sku} from "@/utils/utils";

export default function Index() {
  const [keySearchVisible, setKeySearchVisible] = useState(false);
  const [visitHidden, setVisitHidden] = useState(true); // 默认隐藏拜访
  const [searchData, setSearchData] = useState(null); // 拜访携带信息
  const [visitOptions, setVisitOptions] = useState([]); // 拜访记录
  const [loading, setLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const InfiniteScrollInstance = useRef(null);
  const formIt = Form.useForm();

  useEffect(() => {
    formIt.registerRequiredMessageCallback((label) => {
      return `${label}不能为空`;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = useCallback(() => {
    formIt.validateFields(async (errorMessage, fieldValues) => {
      console.log(fieldValues);
      if (errorMessage && errorMessage.length) {
        return console.info("errorMessage", errorMessage);
      }

      setLoading(true);

      const {unit_name, ...opt} = fieldValues;

      const _data = {
        ...opt,
        customer: searchData?.customer?.id,
        connect_person: searchData?.id,
        kind: searchData?.kind?.id,
      };

      const {results} = await addIntention({
        ..._data,
      });
      showToast({title: "保存成功", icon: "success", duration: 2000});
      handleBack(results?.id);
    });
  }, [searchData, formIt]);

  const handleGetVisitRecords = async (_id) => {
    const {results = []} = await getVisitRecords(_id, {
      not_page: true,
    });
    const _options = results.map((e) => {
      return {
        label: e?.result,
        value: e?.id,
      };
    });
    setVisitOptions(_options);
  };

  const handleBack = () => {
    setTimeout(() => {
      var pages = getCurrentPages();
      //上一个页面
      var prevPage = pages[pages.length - 2];
      //直接调用上一个页面的setState()方法，把数据存到上一个页面中去
      prevPage?.setData({needRefresh: true});
      // 返回上一页
      navigateBack({
        delta: 1,
      });
      setLoading(false);
    }, 2000);
  };

  const [initPage1] = useState(0)
  const [height] = useState(200)


  // 选中的商品，可以获取自定义属性如：商品图片、价格、数量
  const [currentGoods, setCurrent] = useState({})

  const itemDisable = (goodsItem) => {
    if (!goodsItem) return true
    // 商品表可设定count为库存数，或者通过其它条件判断
    if (goodsItem.count === 0) return true

    return false
  }
  const clickCartBtn = () => {
    navigateTo({
      url: "/pages/cart/index",
    });
  };
  const handleGetAuditList = useCallback(async () => {
    setLoading(true);
    const {
      total_pages,
      results = [],
      current_page,
    } = await resolveAfter2Seconds();
    const _isFinished = current_page >= total_pages;

    setLoading(false);
    setIsFinished(_isFinished);

    return true;
  }, []);
  const onLoadMore = async () => {
    return new Promise(async (resolve) => {
      if (loading) return resolve("loading");

      if (isFinished) {
        return resolve("complete");
      }

      const complete = await handleGetAuditList();
      resolve(complete ? "complete" : "loading");
    });
  };
  return (
    <View className={styles.intentionDetail}>
      <View className="demo-box">
        <Swiper
          height={height}
          paginationColor="#426543"
          autoPlay="3000"
          initPage={initPage1}
          paginationVisible
          // style={{ borderRadius: 12 }}
        >
          {mockImages.map((item, index) => (
            <SwiperItem key={`swiper#demo1${index}`}>
              <Image src={item} fit="cover" width="100%" height={`${height}px`} />
            </SwiperItem>
          ))}
        </Swiper>
      </View>
      <View style={{padding: '10px 15px'}}>
        <Toast />
        {/*<View>当前选择商品：</View>
        <View style={{ paddingBottom: 10 }}>
          HUAWEI手机【{currentGoods?.skuName || '--'}】
        </View>*/}
        <Sku
          autoChoice
          sku={sku}
          goodsList={goodsList}
          onChange={(e) => setCurrent(e)}
          clickAttrDisable={() => Toast.show(`暂无库存`)}
          itemDisable={itemDisable}
          itemRender={(it) => {
            if (it['color']) {
              return (
                <View className="sku-color-item">
                  <View
                    className="color-item"
                    style={{background: it['color']}}
                  ></View>
                  <View>{it.name}</View>
                </View>
              )
            }

            return it.name
          }}
        />
        <View className="number" style={{
          height: '0.65rem',
          fontWeight: 'bold',
          fontSize: '0.65rem',
          color: '#000000',
          marginBottom: '0.9rem'
        }}
        >数量</View>
        <Stepper value={1} />
      </View>

      <GoodsAction>
        <GoodsActionIcon icon="chat-o" text="客服" dot />
        <GoodsActionIcon icon="cart-o" text="购物车" info="5" onClick={clickCartBtn} />
        <GoodsActionIcon icon="shop-o" text="店铺" />
        <GoodsActionButton text="加入购物车" type="warning" />
        <GoodsActionButton text="立即购买" />
      </GoodsAction>
      {/*<InfiniteScroll
        loadMore={onLoadMore}
        ref={InfiniteScrollInstance}
        completeText={goodsList?.length > 0 ? "没有更多了~" : ""}
      />*/}
    </View>
  );
}
