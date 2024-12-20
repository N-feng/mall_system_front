/**
 *  获取客户级别
 **/

import { useCallback, useEffect, useState } from 'react';
import { fetchConfigureList } from "@/api/index";

const useGetCustomerTypeList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const getList = useCallback(async () => {
    setLoading(true)
    const response = await fetchConfigureList("khjb");
    setLoading(false)

    const _data = Object.entries(response.results ?? {}).map((a) => ({
      label: a[1],
      value: a[0],
    }));

    setData(_data);
  }, [])

  useEffect(() => {
    getList();
  }, [])

  return {
    list: data,
    loading: loading,
  };
};

export default useGetCustomerTypeList;
