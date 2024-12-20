import { useState, useCallback , useEffect } from "react";
import { DatetimePicker } from "@antmjs/vantui";
import CustomPopup from "@/components/customPopup";
import { View } from "@tarojs/components";
import "./index.less";

export default function Com(props) {
  const { visible,defaultValue, onClose, onConfirm } = props;
  const [state, setState] = useState({
    minDate: new Date(2023, 0, 1).getTime(),
    currentDate: new Date().getTime(),
  });

  useEffect(()=>{
    if(visible){
      setState({
        ...state,
        currentDate: defaultValue,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[visible, defaultValue])


  const onInput = useCallback(
    function (event) {
      setState({
        ...state,
        currentDate: event.detail,
      });
    },
    [state]
  );

  const formatter = useCallback(function (type, value) {
    if (type === "year") {
      return `${value}年`;
    }

    if (type === "month") {
      return `${value}月`;
    }

    return value;
  }, []);

  return (
    <CustomPopup
      visible={visible}
      closeable={false}
      onClose={() => {
        onClose?.();
      }}
    >
      <View class="custom-time-picker">
        <DatetimePicker
          type="date"
          value={state.currentDate}
          minDate={state.minDate}
          onInput={onInput}
          formatter={formatter}
          onConfirm={(e) => {
            onConfirm?.(e?.detail?.value);
          }}
          onCancel={() => {
            onClose?.();
          }}
        />
      </View>
    </CustomPopup>
  );
}
