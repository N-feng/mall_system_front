import { Text } from "@tarojs/components";
import { CustomerStatusEnums} from "@/utils/constant";

export default function Com(props) {
  const { value, children,fontSize } = props;
  const classMap = {
    [CustomerStatusEnums.Normal]: "text--green ",
    [CustomerStatusEnums.Disabled]: "text--grey ",
  };

  return (
    <Text className={classMap[value] ?? "text--grey "} style={{ fontSize: fontSize ?? 11 }}>
      {children}
    </Text>
  );
}
