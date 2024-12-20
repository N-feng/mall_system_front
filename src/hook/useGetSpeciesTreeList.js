/**
 *  物种
 **/

import { useCallback, useEffect, useState } from 'react';
import { fetchSpeciesTreeList } from "@/api/index";

const useGetSpeciesTreeList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const getList = useCallback(async () => {
    setLoading(true)
    const response = await fetchSpeciesTreeList({ not_page: true });
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

export default useGetSpeciesTreeList;
