import { View } from "@tarojs/components";
import { Popup } from "@antmjs/vantui";

import styles from "./index.module.less";

export default function Com(props) {
  const { visible = false, closeable=true, onClose, title, children } = props;

  return (
    <Popup
      position="bottom"
      round
      show={visible}
      className={styles.popup}
      closeable={closeable}
      onClose={() => {
        onClose?.();
      }}
    >
      {title && <View className={styles.title}>{title}</View>}
      {children}
    </Popup>
  );
}
