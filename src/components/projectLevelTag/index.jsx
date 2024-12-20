import { View } from "@tarojs/components";


export default function Com(props) {
  const { value, children } = props;
  const classMap = {
    'ZYJJ': "text--red",
    'ZYFJJ': "text--yellow",
    'ZYFJJ': "text--yellow",
    'FZYFJJ': "text--green",
    'QT': "text--grey",
    'STOP': "text--grey",
  };
  return (
    <View className={classMap[value] ?? "custom-tag custom-tag--grey"}>
      {children}
    </View>
  );
}

