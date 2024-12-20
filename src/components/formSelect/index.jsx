import { View } from "@tarojs/components";

import styles from "./index.module.less";

export default function Com(props) {
  const { placeholder = "", value } = props;
  return (
    <View className={styles.select}>
      {!value ? (
        <View className={styles.placeholder}>{placeholder}</View>
      ) : (
        value
      )}
    </View>
  );
}
