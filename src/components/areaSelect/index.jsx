import { useEffect, useState, useCallback } from "react";
import Taro from '@tarojs/taro';
import { Cascader } from "@antmjs/vantui";

export default function Com(props) {
  const { defaultValue, visible = false, onConfirm, onClose } = props;

  const [areaList, setAreaList] = useState([]);

  const _getCustomerAreas = useCallback(async () => {
    Taro.request({
      url: 'https://mims-prod.oss-cn-beijing.aliyuncs.com/static/world_area.json',
      method: 'GET',
      dataType: 'json',
    }).then(res => {
      setAreaList(res?.data??[])
    }).catch(err => {
      console.error('请求发生错误', err);
    });

  }, []);

  useEffect(() => {
    _getCustomerAreas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Cascader
      className="cascader"
      visible={visible}
      value={defaultValue}
      title="区域选择"
      options={areaList}
      textKey="label"
      valueKey="value"
      closeIcon="cross"
      closeable
      onClose={() => {
        onClose?.();
      }}
      onChange={(val, params) => {
        const res = params.map((e) => {
          return {
            value: e.value,
            text: e.text,
          };
        });
        onConfirm?.(res);
      }}
    />
  );
}
