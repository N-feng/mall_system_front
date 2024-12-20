import { View } from "@tarojs/components";
import { Empty } from "@antmjs/vantui";
import emptyImg from "@/assets/image/empty.svg";

import "./index.less";

export default function Com(props) {
  const { description = "暂无数据～", image = "", ...rest } = props;
  return (
    <View className="empty">
      <Empty
        class="empty"
        image={image || emptyImg}
        description={description}
        {...rest}
      />
    </View>
  );
}
