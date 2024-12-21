import {
  Button,
} from "@antmjs/vantui";
import { View } from "@tarojs/components";
import userStore from "@/store/userStore";

export default function CustomTabBar() {
  console.log('CustomTabBar: ', CustomTabBar);
  const userInfo = userStore.getUserInfo();
  console.log('userInfo: ', userInfo);
  return (
    <View>
      <Button>122222</Button>
    </View>
  )
}