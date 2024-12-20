import { useCallback, useState,useRef, useEffect } from "react";
import { showToast } from "@tarojs/taro";
import { View } from "@tarojs/components";
import { Skeleton } from "@antmjs/vantui";
import styles from "./index.module.less";

export default function CopyRight(props) {
  return (
    <View className={styles.copyRight}>Copyright © {new Date().getFullYear()} </View>
  );
}
