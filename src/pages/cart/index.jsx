/*
 * @Description: 新增客户编辑页
 */
import {useCallback, useEffect, useRef, useState} from "react";
import {Text, View} from "@tarojs/components";
import {getCurrentPages, navigateBack, showToast, useLoad, getEnv, ENV_TYPE} from "@tarojs/taro";
import {
  Form,
  GoodsAction,
  GoodsActionButton,
  GoodsActionIcon,
  Image,
  Sku,
  Stepper,
  Swiper,
  SwiperItem,
  Toast,
  SubmitBar,
  Tag,
  Card,
  Button,
  WaterfallFlow,
  InfiniteScroll,
  RadioGroup,
  Radio,
  CheckboxGroup,
  Checkbox,
  Row,
  Col,
  SwipeCell, CellGroup, Cell, Ellipsis
} from "@antmjs/vantui";
import {getVisitRecords} from "@/api/visit";
import {addIntention} from "@/api/intention";
import KeySearch from "./components/keySearch";
import styles from "./index.less";
// eslint-disable-next-line import/first
import {goodsList, sku, resolveAfter2Seconds, mockImages} from "@/utils/utils";
// eslint-disable-next-line import/first
import Empty from "@/components/empty";
import {addOrRemoveCart, fetchCartsList} from "@/api/cart";
import {addOrder} from "@/api/order";

export default function Cart() {
  const [keySearchVisible, setKeySearchVisible] = useState(false);
  const [visitHidden, setVisitHidden] = useState(true); // 默认隐藏拜访
  const [searchData, setSearchData] = useState(null); // 拜访携带信息
  const [visitOptions, setVisitOptions] = useState([]); // 拜访记录
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [totalNum, setTotalNum] = useState(0);

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
  const InfiniteScrollInstance = useRef(null);

  const [initPage1] = useState(0)
  const [height] = useState(300)


  // 选中的商品，可以获取自定义属性如：商品图片、价格、数量
  const [currentGoods, setCurrent] = useState({})

  const itemDisable = (goodsItem) => {
    if (!goodsItem) return true
    // 商品表可设定count为库存数，或者通过其它条件判断
    if (goodsItem.count === 0) return true

    return false
  }

  const getList = useCallback(async (customPage, search) => {
    setLoading(true);
    const {
      data: {
        total_page,
        data = [],
        cur_page_num,
      }
    } = await fetchCartsList({
      page: customPage || currentPage + 1,
      page_size: 10,
      type: "pending",
    });
    const _isFinished = cur_page_num >= total_page;

    setLoading(false);
    setCurrentPage(cur_page_num);
    setList([...list, ...data].filter((item, index, self) =>
      self.findIndex(t => t.id === item.id) === index
    ));
    setIsFinished(_isFinished);

    return _isFinished;
  }, [currentPage, list]);
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
    console.log("Page loaded.");
  });
  const [values, setValues] = useState([])
  const clickDeleteBtn = (id) => {
    let tempArr = list.filter(a=>{
      return a.id === id
    })
    let tempArr2 = [...list].filter(a=>{
      return a.id !== id
    })
    console.log(tempArr2)
    setList(tempArr2);
    addOrRemoveCart({
      action: 'remove',
      product_id: tempArr[0].product?.id,
      quantity: tempArr[0].quantity,
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
    }).finally(()=>{
      getList(1)
    })
  }
  const clickSubmitBtn = () => {
    //values list
    console.log('values list', values,list)
    let tempArr = values.map(a => {
      return parseInt(a)
    })

    console.log('values', values)
    addOrder({
      items: list.filter((a)=>{
        console.log('values list a', a)
        console.log('values list a', tempArr.includes(parseInt(a.id)))
        return tempArr.includes(parseInt(a.id))
      }).map((a)=>{
        const {quantity,product}= a
        return {
          product_id: product?.id,
          quantity: quantity,
          price: product?.price,
          merchant_id: product?.merchant_id
        }
      })
    }).then((res)=>{
      if(res){
        const {message, status} = res
        if(status){
          showToast({
            title: message,
            icon: "none",
            duration: 1000,
          });
        }else{
          showToast({
            title: message,
            icon: "error",
            duration: 1000,
          });
        }
      }
    }).finally(() => {
      getList(1)
    })
  }
  const onStepperChange = (e, id) => {
    console.log(e,id)
    let tempArr = list.filter(a=>{
      return a.id === id
    })
    let tempNum = e.detail - tempArr[0].quantity
    console.log(tempNum)
    addOrRemoveCart({
      action: tempNum>0?'add':'remove',
      product_id: tempArr[0]?.product?.id,
      quantity: Math.abs(tempNum)
    }).then((res)=>{
      if(res){
        const {message, status} = res
        if(status){
          showToast({
            title: message,
            icon: "none",
            duration: 1000,
          });
        }else{
          showToast({
            title: message,
            icon: "error",
            duration: 1000,
          });
        }
      }
    }).finally(()=>{
      getList(1)
    })
  }
  return (
    <View className="cartPage">
      <View className="container">
        <View className="audit-header">
          <View className="audit-header--l">购物车</View>
        </View>

        <View className="audit-list">
          <CheckboxGroup
            value={values}
            onChange={(e) => {
              console.info(e)
              e.stopPropagation()

              let tempArr = e.detail.map(a => {
                return parseInt(a)
              })
              let tempNum = list
                .filter((a) => {
                  return tempArr.includes(parseInt(a.id))
                })
                .map((a) => {
                  const {quantity, product} = a
                  return {
                    product_id: product?.id,
                    quantity: quantity,
                    price: product?.price,
                    merchant_id: product?.merchant_id
                  }
                })
                .reduce((total, item) => total + item.quantity, 0)
              console.info(tempNum)
              setTotalNum(tempNum)
              setValues([...e.detail])
            }}
          >
            <View>
              {list.map((a) => {
                return <View key={a.id} className="list">
                  <SwipeCell
                    rightWidth={75}
                    leftWidth={0}
                    renderRight={<Button type="danger" style={{height: '100%'}} onClick={()=>clickDeleteBtn(a.id)}>删除</Button>}
                  >
                    <CellGroup>
                      <Cell
                        titleStyle={{width: '100%'}}
                        renderTitle={<View className="imageBtnWrapper">
                          <View className="left">
                            <View style={{position: 'relative', width: '32px', height: '100%'}} >
                              <Checkbox name={a.id.toString()} checkedColor="red" labelDisabled className="checkbox"
                                style={{
                                  position: 'absolute',
                                  left: '50%',
                                  top: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  padding: '24px 12px 24px 12px'
                                }}
                              />
                            </View>

                            <Image
                              className="image"
                              width="100px"
                              height="100px"
                              fit="contain"
                              src={a.product?.file_path}
                            />
                          </View>
                          <View className="right">
                            <View className="paragraph">
                              {a.product?.description}
                            </View>
                            <View className="bottom">
                              <View className="left">
                                <View className="price">¥{a.product?.price}</View>
                              </View>
                              <View className="right">
                                <Stepper value={a.quantity} style={{textAlign: 'right'}} buttonSize="24px" onChange={(e)=>onStepperChange(e, a.id)} />
                              </View>
                            </View>

                          </View>
                        </View>}
                      />
                    </CellGroup>
                  </SwipeCell>


                </View>
              })}
            </View>

          </CheckboxGroup>

          <InfiniteScroll
            loadMore={onLoadMore}
            ref={InfiniteScrollInstance}
            completeText={list?.length > 0 ? "没有更多了~" : ""}
          />
        </View>
        {!loading && list?.length === 0 && (
          <Empty description="全部处理完了，今天你也辛苦了~" />
        )}
      </View>
      <View>
        <SubmitBar
          price={totalNum*100}
          buttonText="提交订单"
          tip
          style={getEnv() === ENV_TYPE.WEAPP?{}:{ padding: '0 0 0 0'}}
          onClick={clickSubmitBtn}
          /*renderTip={
            <View>
              您的收货地址不支持同城送,
              <Text>修改地址</Text>
            </View>
          }*/
        >
          <Tag type="primary">标签</Tag>
        </SubmitBar>
      </View>
    </View>
  );
}
