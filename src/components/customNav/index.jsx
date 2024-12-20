import Taro, { navigateBack } from "@tarojs/taro";
import { View } from "@tarojs/components";
import styles from "./index.module.less";

export default function Com(props) {
  const { children } = props;

  // 获取系统状态栏高度
  const { statusBarHeight } = Taro.getSystemInfoSync();
  // 获取小程序右上角胶囊的大小
  const { height, top } = Taro.getMenuButtonBoundingClientRect();
  /*
      计算出小程序导航栏的整体高度，这里要加上系统状态栏的高度，
      否则小程序顶部内容会顶到状态栏最顶部位置
    */
  const navBarHeight = height + (top - statusBarHeight) * 2 + statusBarHeight;

  console.log("navBarHeight:", navBarHeight);

  const handleNavBack = () => {
    navigateBack();
  };

  return (
    <View
      className={styles["custom-nav"]}
      style={{
        height: `${navBarHeight}px`,
        paddingTop: `${statusBarHeight}px`,
      }}
    >
      <View
        className={styles["back"]}
        onClick={handleNavBack}
        style={{
          marginTop: `${top - statusBarHeight}px`,
          height: `${height}px`,
        }}
      />
      {children}
    </View>
  );
}

// 10 - 12*20
