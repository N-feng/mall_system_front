import { View } from "@tarojs/components";
import { Popup } from "@antmjs/vantui";

import styles from "./index.module.less";

export default function Com(props) {
  const {
    visible = false,
    footer=true,
    closeable = true,
    cancleText = "取消",
    okText = "确定",
    onClose,
    title,
    children,
    ...opt
  } = props;

  return (
    <Popup
      position="center"
      round
      show={visible}
      className={styles.popup}
      closeable={closeable}
      onClose={() => {
        onClose?.();
      }}
      {...opt}
    >
      {title && <View className={styles.title}>{title}</View>}
      <View className={styles.content}>{children}</View>
      {footer  && (
        <View className={styles.footer}>
          <View
            className={styles.btn}
            onClick={() => {
              props?.onClose?.();
            }}
          >
            {cancleText}
          </View>
          <View
            className={styles.btn}
            onClick={() => {
              props?.onConfirm?.();
            }}
          >
            {okText}
          </View>
        </View>
      )}
    </Popup>
  );
}
