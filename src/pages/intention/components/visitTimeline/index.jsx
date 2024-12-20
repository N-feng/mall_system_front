import {  useState , useEffect } from "react";
import { View, Text } from "@tarojs/components";
import {
  Icon,
} from "@antmjs/vantui";
import CustomPopup from "@/components/customPopup";
import {fetchIntentionVisitRecords} from '@/api/intention';
import moment from "moment";
import Empty from "@/components/empty";
import styles from "./index.module.less";

export default function Com(props) {
  const { visible = false,id,  onClose } = props;
  const [list,setList] = useState([])


  useEffect(()=>{
    const handleGetVisitRecords = async()=>{
      const {results = []} = await fetchIntentionVisitRecords(id,{
        not_page:true
      })
      setList(results);
      console.log("results:",results);
    }
    if(visible && id){
      handleGetVisitRecords();
    }
  },[visible,id])

  return (
    <CustomPopup
      visible={visible}
      title="全部记录"
      closeable
      onClose={() => {
        onClose?.();
      }}
    >
      <View className={styles.content}>
        <View className={styles["custom-timeline"]}>
          {list?.length === 0 && <Empty description="暂无关联拜访记录" />}
          {list.map((e, index) => {
            return (
              <View className={styles["item"]} key={e.id}>
                <View className={styles["time"]}>
                  {e.visit_day}
                </View>
                <View className={styles["visit-content"]}>
                  {e?.contents?.[0]?.content}
                </View>

                {index === 0 &&
                <>
                  <View className={styles["time-info"]}>
                    <View className={styles["time-info--l"]}>下次拜访时间</View>
                    <View className={styles["time-info--r"]}>
                      {e?.next_visit_day}
                    </View>
                  </View>
                  <View className={styles["time-info"]}>
                    <View className={styles["time-info--l"]}>提醒开始时间</View>
                    <View className={styles["time-info--r"]}>
                      {moment(e?.remind_start_time).format('YYYY-MM-DD')}
                    </View>
                  </View>
                  <View className={styles["time-info"]}>
                    <View className={styles["time-info--l"]}>
                    提醒间隔
                      <Icon
                        color="#999"
                        name="clock-o"
                        size="14px"
                        className={styles.icon}
                      ></Icon>
                    </View>

                    {e.remind_interval ?
                      <View className={styles["time-info--r"]}>
                    每<Text className={styles.num}>{e.remind_interval}</Text>天
                        <Text className={styles.num}>1</Text>次
                      </View>
                      :'暂未设置'
                    }
                  </View>
                </>}
              </View>
            );
          })}
        </View>
      </View>
    </CustomPopup>
  );
}
