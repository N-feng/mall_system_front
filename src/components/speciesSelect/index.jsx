import { useEffect, useState, useCallback, useMemo } from "react";
import { Icon,Skeleton } from "@antmjs/vantui";
import { View } from "@tarojs/components";
import CustomPopup from "@/components/customPopup";
import { fetchSpeciesTreeList } from "@/api/customer";
import Search from "@/components/search";
import cns from "classnames";

import styles from "./index.module.less";

function extractPaths(tree, parent) {
  const parentPath = parent?.path ?? "";
  const paths = [];
  // 如果存在子结点
  if (tree.children) {
    // 对每个子结点调用函数进行提取路径
    for (const child of tree.children) {
      paths.push(...extractPaths(child, {
        path:`${parentPath}${tree.label} / `
      }));
    }
  } else {
    // 没有子结点时，返回该节点的路径
    paths.push({
      path:`${parentPath}${tree.label}`,
      value:tree.value
    });
  }
  return paths;
}

export default function Com(props) {
  const { defaultValue, visible = false, onConfirm, onClose } = props;
  const [curSelectedTree,setCurSelectedTree] = useState([]);
  const [activeIndex,setActiveIndex] = useState(0)
  const [flattenData,setFlattenData] = useState([])
  const [search,setSearch] = useState('')
  const [loading,setLoading] = useState(false)

  const _getSpeciesTreeList = useCallback(async () => {
    setLoading(true)
    const {results=[]} = await fetchSpeciesTreeList({ not_page: true });
    setLoading(false)

    setCurSelectedTree([{
      label:"",
      options:results ?? []
    }])
    // 为方便后续检索在此直接铺平数据缓存
    const _flattenData = results.reduce((acc,item)=>{
      return [...acc,...extractPaths(item)]
    },[])
    setFlattenData(_flattenData)
  }, []);

  const onSearch = (val="") => {
    setSearch(val)
  };

  const searchResult = useMemo(()=>{
    if(!(search??'').trim()){
      return [];
    }
    return flattenData.filter(e => (e.path??'').includes(search))
  },[search,flattenData])



  useEffect(()=>{
    if(!visible){
      // popup 组件暂未找到 destroyOnClose 属性，所以数据要手动回置
      setCurSelectedTree([])
      setActiveIndex(0)
      setFlattenData([])
      setSearch('')
    }else{
      _getSpeciesTreeList();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[visible])

  return (
    <CustomPopup
      visible={visible}
      title="物种选择"
      closeable
      onClose={() => {
        onClose?.();
      }}
    >
      <Skeleton row="7" loading={loading}>
        <View className={styles.speciesSelect}>
          <View className={styles.search}>
            <Search onSearch={onSearch} placeholder="请输入物种信息" />
          </View>
          {searchResult?.length > 0 && (<View className={styles.found}>
            {searchResult.map(e => (
              <View className={styles['found-item']} key={e.value} onClick={()=>{
                const pathArr =  e.path.split(" / ") ?? []
                const _data = pathArr.map((path,i) => {
                  return {
                    label:path,
                    value: i === pathArr.length-1 ? e.value : path
                  }
                })

                onConfirm?.(_data);
              }}
              >
                {e.path}
              </View>
            ))}
          </View>)}
          <View className={styles.select}>
            <View className={styles.header}>
              {curSelectedTree.map((e,index) =>
                (
                  <View className={cns(styles["header-item"],activeIndex === index && styles["header-item--active"])} key={e.value}
                    onClick={()=>{
                      setActiveIndex(index)
                    }}
                  >
                    {e?.label || "请选择"}
                  </View>
                ))
              }
            </View>
            <View className={styles["content"]}>
              {curSelectedTree.map((e,index) => (
                <View className={cns(styles["content-card"],activeIndex === index && styles["content-card--active"])} key={index}>
                  {(e.options??[]).map(option => (
                    <View
                      className={cns(
                        styles["content-item"],
                        e?.value === option.value &&
                      styles["content-item--active"],
                        option.disabled &&
                      styles["content-item--disabled"],
                      )}
                      key={option.value}
                      onClick={() => {

                        if(e?.value === option.value || option.disabled){
                          return;
                        }

                        const _curSelectedTree = curSelectedTree.slice(0,index+1);
                        const item = _curSelectedTree[index];

                        // 修改本条数据
                        _curSelectedTree.splice(index,1,{
                          ...item,
                          label:option?.label,
                          value:option?.value,
                        })

                        // 如果下级还有children
                        if(option?.children?.length>0){
                          _curSelectedTree.splice(index+1,1,{
                            label:"",
                            options:option?.children ?? []
                          })
                          setActiveIndex(index+1)
                        }else{
                        // 无则可以关闭弹框
                          const _data = _curSelectedTree?.map(i => {
                            return {
                              label:i.label,
                              value:i.value
                            }
                          })
                          onConfirm?.(_data);
                        }
                        setCurSelectedTree(_curSelectedTree);
                      }}
                    >
                      {option.label}
                      {e.value  === option.value && (
                        <Icon
                          name="success"
                          size="20px"
                          className={styles.icon}
                          color="#00bf7e"
                        />
                      )}
                    </View>
                  ))}
                </View>)
              )}
            </View>
          </View>
        </View>
      </Skeleton>
    </CustomPopup>
  );
}
