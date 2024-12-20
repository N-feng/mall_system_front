import { View } from "@tarojs/components";

export default function Com(props) {
  const { value, children } = props;
  const classMap = {
    S: "custom-tag custom-tag--yellow",
    A: "custom-tag custom-tag--yellow",
    B: "custom-tag custom-tag--green",
    C: "custom-tag custom-tag--green",
  };

  return (
    <View className={classMap[value] ?? "custom-tag custom-tag--grey"}>
      {children}
    </View>
  );
}
