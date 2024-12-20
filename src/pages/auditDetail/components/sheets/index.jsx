import { useEffect, useState } from "react";
import classNames from "classnames";
import { View, Text } from "@tarojs/components";
import { fetchQuotationSheets,fetchProjectValidQuotationSheets } from "@/api/audit";
import { formatNumber } from "@/utils/utils";
import { Table } from "@antmjs/vantui";
import styles from "../../index.module.less";

export default function Com(props) {
  const [dataSource, setDataSource] = useState([]);
  const [total, setTotal] = useState();

  const columns = [
    {
      title: "分类",
      dataIndex: "category",
      fixed: "left",
      render: (text, record) => {
        return record.category
          .map((a) => {
            return a.label;
          })
          .toString();
      },
    },
    {
      title: "名称",
      dataIndex: "name",
      render: (text, record) => {
        return text ? `${text}` : "-";
      },
    },
    {
      title: "单位",
      dataIndex: "unit",
      render: (text, record) => {
        return text ? `${text}` : "-";
      },
    },
    {
      title: "规格",
      dataIndex: "specs",
      render: (text, record) => {
        return record.specs.map((a, index, arr) => {
          return `${a.value}${index === arr.length - 1 ? "" : ","}`;
        });
      },
    },
    {
      title: "建议单价 ¥",
      dataIndex: "price",
      render: (text, record) => {
        return formatNumber(text);
      },
    },
    {
      title: "折扣系数",
      dataIndex: "discount_coefficient",
      render: (text, record) => {
        return (
          <Text
            className={record.discount_coefficient !== 1 ? "text--red" : ""}
          >
            {formatNumber(text)}
          </Text>
        );
      },
    },
    {
      title: "成交单价 ¥",
      dataIndex: "transaction_price",
      render: (text, record) => {
        return formatNumber(text);
      },
    },
    {
      title: "数量",
      dataIndex: "quantity",
      render: (text, record) => {
        return formatNumber(text);
      },
    },
    {
      title: "备注",
      dataIndex: "remark",
      render: (text, record) => {
        return formatNumber(text);
      },
    },
    {
      title: "小计 ¥",
      dataIndex: "amount",
      width: 150,
      render: (text, record) => {
        return formatNumber(
          Number(record.transaction_price) * Number(record.quantity),
        );
      },
    },
  ];

  useEffect(() => {
    if (props?.entity?.id) {
      if(props?.entity_name === 'business.reimbursementcontract'){
        fetchQuotationSheets(props?.entity?.id).then(({ results }) => {
          setDataSource(results?.sheets ?? []);
          setTotal(results?.total ?? 0);
        });
      }
      if (props?.entity?.id) {
        if(props?.entity_name === 'lims.project'){
          fetchProjectValidQuotationSheets(props?.entity?.id).then(({ results }) => {
            setDataSource(results?.sheets ?? []);
            setTotal(results?.total ?? 0);
          })
        }
      }
    }
  }, [props]);

  return (
    <>
      <View className={styles["info"]}>
        <View className={styles["info--l"]}>分项表</View>
        <View className={styles["info--r"]}>
          总计
          <Text className="text--red" style={{marginLeft:10,fontWeight:500}}>{total}</Text>
        </View>
      </View>
      <View className={classNames(styles.sheet)}>
        <Table
          columns={columns}
          dataSource={dataSource}
          // sortChange={sortAction}
          // loading={state.loading}
          scroll={{ x: 300 }}
          rowKey="id"
        />
      </View>
    </>
  );
}
