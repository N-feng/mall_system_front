import { useState } from "react";
import { IndexBar, IndexAnchor,Cell} from "@antmjs/vantui";
import { View,Block } from "@tarojs/components";
import CustomPopup from "@/components/customPopup";
import Search from "@/components/search";
import { countryCode, queryData } from '@/utils/countryCode'
import { cloneDeep } from "lodash";
import styles from "./index.module.less";


export default function Com(props) {
  const {onConfirm,onCancle} = props;
  const [prefixList,setPrefixList]= useState(countryCode)
  const [prefix,setPrefix]= useState('')


  const onSearch = (val)=>{
    let res = []
    if(!val) {
      //当清空输入值时，重置options
      res = cloneDeep(countryCode)
    } else {
      res = queryData(val)
    }
    setPrefixList(res)
  }

  return (
    <CustomPopup
      visible
      title="选择手机号前缀"
      closeable
      onClose={() => {

      }}
    >
      <View className={styles.phoneSelect}>
        <View className={styles.search}>
          <Search onSearch={onSearch} placeholder="请输入地区进行搜索" />
        </View>
        <View className={styles.select}>
          <IndexBar>
            {prefixList.map((item) => (
              <Block key={item.key}>
                <IndexAnchor index={item.key}></IndexAnchor>
                {item?.value.map(i => <Cell title={i.name} key={i.code} onClick={
                  onConfirm?.(i.code)
                }
                >{i.code}</Cell>)}
              </Block>
            ))}
          </IndexBar>
        </View>
      </View>

    </CustomPopup>
  );
}
