import { View } from "@tarojs/components";
import { Popup } from "@antmjs/vantui";

import styles from "./index.module.less";

export default function Com(props) {
  const { visible = false, width, onClose, title, children } = props;

  return (
    <Popup
      show={visible}
      className={styles.toast}
      style={{
        width: width || "300px",
      }}
      closeOnClickOverlay
      onClose={() => {
        onClose?.();
      }}
    >
      {title && <View className={styles.title}>{title}</View>}
      <View className={styles.content}>{children}</View>
      <View className={styles.footer} onClick={() => onClose?.()}>
        知道了
      </View>
    </Popup>
  );
}
