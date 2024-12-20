/*
 * @Description: 审核详情
 */
import { useCallback, useState, useEffect, useMemo } from "react";
import { View, Text } from "@tarojs/components";
import {
  navigateBack,
  useLoad,
  useDidShow,
  showToast,
  getCurrentInstance,
  navigateTo,
  nextTick,
  getCurrentPages,
} from "@tarojs/taro";
import moment from "moment";
import cns from "classnames";
import { Field, Skeleton, toast } from "@antmjs/vantui";
import {
  fetchAuditList,
  fetchAuditItem,
  updateAudit,
  fetchProjectValidQuotationSheets,
  fetchQuotationSheets,
} from "@/api/audit";
import { fetchProjectDetail } from "@/api/project";
import { fetchContractDetail } from "@/api/contract";
import { auditTypeMap } from "@/utils/constant";
import { getBusinessAuditPermissions } from "@/utils/authority";
import userStore from "@/store/userStore";
import CustomPopupCenter from "@/components/customPopupCenter";
import { formatNumber } from "@/utils/utils";

import styles from "./index.module.less";

export default function Index() {
  const instance = getCurrentInstance();
  const { process_id } = instance.router.params;
  const userInfo = userStore.getUserInfo();
  const permissions = getBusinessAuditPermissions(userInfo);

  const [info, setInfo] = useState(null);
  const [visible, setVisible] = useState(false);
  const [resultModalvisible, setResultModalvisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [type, setType] = useState("");
  const [remarkValue, setRemarkValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [allAuditList, setAllAuditList] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [total, setTotal] = useState();

  useLoad(() => {
    console.log("useLoad");
  });

  const getAuditItem = useCallback(
    async (next_process_id) => {
      setDataSource([]);
      setLoading(true);
      const { results = {} } = await fetchAuditItem(
        next_process_id || process_id,
      );

      setLoading(false);
      setInfo({
        ...results,
      });

      // 项目需要多请求一个接口补充数据
      if (results?.entity_name === "lims.project") {
        const res = await fetchProjectDetail(results?.entity?.id);
        results["project"] = res?.results;

        fetchProjectValidQuotationSheets(results?.entity?.id).then(
          ({ results: _results }) => {
            setDataSource(_results?.sheets ?? []);
            setTotal(_results?.total ?? 0);
          },
        );
      }

      // 合同需要多请求一个接口补充数据
      if (results?.entity_name === "business.reimbursementcontract") {
        const res = await fetchContractDetail(results?.entity?.id);
        results["contract"] = res?.results;

        // fetchQuotationSheets(results?.entity?.id).then(({ results:_results }) => {
        //   setDataSource(_results?.sheets ?? []);
        //   setTotal(_results?.total ?? 0);
        // });
      }

      setInfo({
        ...results,
      });
    },
    [process_id],
  );

  const gotoAuditContractDetail = () => {
    navigateTo({
      url: `/pages/auditContractDetail/index?entity_id=${info?.entity?.id}&entity_name=${info?.entity_name}`,
    });
  };

  useDidShow(() => {
    console.log("useDidShow");
  });

  useEffect(() => {
    getAuditItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [process_id]);

  // 如果是第一个未审核
  let restList = useMemo(() => {
    return (info?.tasks ?? []).filter((e) => !e.completed);
  }, [info?.tasks]);

  const renderIcon = useCallback(
    (item) => {
      if (item?.completed) {
        if (item?.task_data?.choose === "approve") {
          return (
            <View className={cns(styles["icon"], styles["icon--resolved"])} />
          );
        }
        return (
          <View className={cns(styles["icon"], styles["icon--rejected"])} />
        );
      }

      let isFirst = restList?.[0]?.task_id === item?.task_id;
      if (isFirst && !info?.completed) {
        return (
          <View className={cns(styles["icon"], styles["icon--current"])} />
        );
      }
      return <View className={cns(styles["icon"])} />;
    },
    [info?.completed, restList],
  );

  const renderItem = (key, value) => {
    if (!value) {
      return "";
    }
    return (
      <View className={styles["info"]}>
        <View className={styles["info--l"]}>{key}</View>
        <View className={styles["info--r"]}>{value}</View>
      </View>
    );
  };

  const handleUpdateAudit = () => {
    updateAudit(info?.process_id, {
      task_id: restList?.[0]?.task_id,
      task_data: { choose: type, remark: remarkValue },
    })
      .then(() => {
        setVisible(false);
        setType(null);
        setRemarkValue("");
        getAllUnAuditList();
      })
      .catch((err) => {
        showToast({
          title: err?.data?.messages,
          icon: "error",
          duration: 1000,
        });
        setVisible(false);
        setType(null);
        setRemarkValue("");
      });
  };

  const handleBack = () => {
    var pages = getCurrentPages();
    //上一个页面
    var prevPage = pages[pages.length - 2];
    //直接调用上一个页面的setState()方法，把数据存到上一个页面中去
    prevPage?.setData({ needRefresh: true });
    // 返回上一页
    navigateBack({
      delta: 1,
    });
    setLoading(false);
  };

  const getAllUnAuditList = async () => {
    const { results = [] } = await fetchAuditList({
      not_page: true,
      type: "pending",
    });
    // 有未处理审核列表-弹框询问是否继续
    // 无-返回上一页
    setAllAuditList(results);
    if (results?.length === 0) {
      setSuccessModalVisible(true);
      setTimeout(() => {
        setSuccessModalVisible(false);
        handleBack();
      }, 500);
    } else {
      setResultModalvisible(true);
    }
  };

  return (
    <View className={styles.auditDetail}>
      <View className={styles.container}>
        <Skeleton row="7" loading={loading}>
          <View className={styles["basic-info"]}>
            <View className={styles.nickname}>{info?.creator?.nickname}</View>
            <View className={styles["info"]}>
              <View className={styles["info--l"]}>申请时间:</View>
              <View className={styles["info--r"]}>
                {moment(info?.created_time).format("YYYY-MM-DD HH:mm:ss")}
              </View>
            </View>
            <View className={styles["info"]}>
              <View className={styles["info--l"]}>流程号:</View>
              <View className={styles["info--r"]}>{info?.process_id}</View>
            </View>
            <View className={styles["info"]}>
              <View className={styles["info--l"]}>流程名称:</View>
              <View className={styles["info--r"]}>
                {info?.process_template?.process_template_name}
              </View>
            </View>
          </View>
          <View
            className={cns(styles["audit-card"], styles["audit-card--margin"])}
          >
            <View className={styles["title"]}>审批内容</View>
            <View className={styles["content"]}>
              <View className={styles["content-title"]}>
                <View className={styles["content-title--l"]}>
                  {auditTypeMap[info?.entity_name]}概况
                </View>
                <View
                  className={styles["goto-detail-btn"]}
                  onClick={gotoAuditContractDetail}
                >
                  详情
                </View>
              </View>
              <View className={styles["audit-info"]}>
                {/* 合同审核流程 business.reimbursementcontract */}
                {info?.entity_name === "business.reimbursementcontract" && (
                  <>
                    <View className={styles["info"]}>
                      <View className={styles["info--l"]}>合同编号</View>
                      <View className={styles["info--r"]}>
                        {info?.entity?.contract_id}
                      </View>
                    </View>
                    <View className={styles["info"]}>
                      <View className={styles["info--l"]}>合同名称</View>
                      <View className={styles["info--r"]}>
                        {info?.entity?.contract_title}
                      </View>
                    </View>
                    {renderItem("甲方", info?.contract?.party_A)}
                    <View className={styles["info"]}>
                      <View className={styles["info--l"]}>课题组</View>
                      <View className={styles["info--r"]}>
                        {info?.entity?.customer_research_group}
                      </View>
                    </View>
                    <View className={styles["info"]}>
                      <View className={styles["info--l"]}>负责人</View>
                      <View className={styles["info--r"]}>
                        {info?.entity?.customer_principal}
                      </View>
                    </View>
                    {renderItem("物种", info?.contract?.species?.species)}
                    <View className={styles["divider-line"]} />
                    {renderItem("乙方", info?.contract?.party_B)}
                    {renderItem("签订日期", info?.contract?.signing_time)}
                    <View className={styles["info"]}>
                      <View className={styles["info--l"]}>合同金额 ￥</View>
                      <View className={styles["info--r"]}>
                        {formatNumber(info?.contract?.total_price)}
                      </View>
                    </View>
                    {renderItem("审批备注", info?.addition?.remark)}
                  </>
                )}
                {/* 项目审核流程 lims.project */}
                {info?.entity_name === "lims.project" && (
                  <>
                    <View className={styles["info"]}>
                      <View className={styles["info--l"]}>项目类型</View>
                      <View className={styles["info--r"]}>
                        {info?.entity_label}
                      </View>
                    </View>
                    <View className={styles["info"]}>
                      <View className={styles["info--l"]}>项目编号</View>
                      <View className={styles["info--r"]}>
                        {info?.entity?.serial_number}
                      </View>
                    </View>
                    <View className={styles["info"]}>
                      <View className={styles["info--l"]}>项目名称</View>
                      <View className={styles["info--r"]}>
                        {info?.entity?.name}
                      </View>
                    </View>
                    {renderItem("产品名称（英）", info?.entity?.product_name)}
                    {renderItem(
                      "产品名称（中）",
                      info?.entity?.product_name_zh,
                    )}
                    <View className={styles["info"]}>
                      <View className={styles["info--l"]}>客户单位</View>
                      <View className={styles["info--r"]}>
                        {info?.entity?.customer_unit}
                      </View>
                    </View>
                    <View className={styles["info"]}>
                      <View className={styles["info--l"]}>课题组</View>
                      <View className={styles["info--r"]}>
                        {info?.entity?.customer_research_group}
                      </View>
                    </View>
                    <View className={styles["info"]}>
                      <View className={styles["info--l"]}>客户级别</View>
                      <View className={styles["info--r"]}>
                        {info?.project?.customer_level?.value}
                      </View>
                    </View>
                    <View className={styles["info"]}>
                      <View className={styles["info--l"]}>负责人</View>
                      <View className={styles["info--r"]}>
                        {info?.entity?.customer_principal}
                      </View>
                    </View>
                    <View className={styles["info"]}>
                      <View className={styles["info--l"]}>物种</View>
                      <View className={styles["info--r"]}>
                        {info?.project?.customer_species}
                      </View>
                    </View>
                    <View className={styles["divider-line"]} />
                    {renderItem("检测类型", info?.project?.detection_type)}
                    {renderItem("服务周期（天）", info?.project?.service_cycle)}
                    <View className={styles["info"]}>
                      <View className={styles["info--l"]}>项目加急</View>
                      <View className={styles["info--r"]}>
                        {info?.project?.is_urgent ? "是" : "否"}
                      </View>
                    </View>
                    {renderItem("QC标准", info?.project?.qc_standard_charges)}
                    {renderItem("审批备注", info?.addition?.remark)}
                  </>
                )}
                {/* 发票审核流程 business.invoice */}
                {info?.entity_name === "business.invoice" && (
                  <>
                    <View className={styles["info"]}>
                      <View className={styles["info--l"]}>合同编号</View>
                      <View className={styles["info--r"]}>
                        {info?.entity?.contract?.contract_id}
                      </View>
                    </View>
                    <View className={styles["info"]}>
                      <View className={styles["info--l"]}>合同名称</View>
                      <View className={styles["info--r"]}>
                        {info?.entity?.contract?.contract_title}
                      </View>
                    </View>
                    <View className={styles["info"]}>
                      <View className={styles["info--l"]}>发票类型</View>
                      <View className={styles["info--r"]}>
                        {info?.entity?.invoice_type}
                      </View>
                    </View>
                    <View className={styles["info"]}>
                      <View className={styles["info--l"]}>购买方名称</View>
                      <View className={styles["info--r"]}>
                        {info?.entity?.buyer_name}
                      </View>
                    </View>
                    <View className={styles["info"]}>
                      <View className={styles["info--l"]}>纳税人识别号</View>
                      <View className={styles["info--r"]}>
                        {info?.entity?.taxpayer_id}
                      </View>
                    </View>
                    <View className={styles["divider-line"]} />
                    <View className={styles["info"]}>
                      <View className={styles["info--l"]}>乙方</View>
                      <View className={styles["info--r"]}>
                        {info?.entity?.party_B}
                      </View>
                    </View>
                    <View className={styles["info"]}>
                      <View className={styles["info--l"]}>开票日期</View>
                      <View className={styles["info--r"]}>
                        {info?.entity?.invoice_time}
                      </View>
                    </View>
                    <View className={styles["info"]}>
                      <View className={styles["info--l"]}>发票金额 ￥</View>
                      <View className={styles["info--r"]}>
                        {formatNumber(info?.entity?.total_price)}
                      </View>
                    </View>
                    <View className={styles["info"]}>
                      <View className={styles["info--l"]}>税点</View>
                      <View className={styles["info--r"]}>
                        {" "}
                        {info?.entity?.tax_point}
                      </View>
                    </View>
                    <View className={styles["info"]}>
                      <View className={styles["info--l"]}>
                        是否为实际销售货物
                      </View>
                      <View className={styles["info--r"]}>
                        {info?.entity?.is_real_goods ? "是" : "否"}
                      </View>
                    </View>
                    {/* 发票作废 */}
                    {info?.addition && info?.addition.remark && (
                      <View className={styles["info"]}>
                        <View className={styles["info--l"]}>
                          {info?.process_template?.id === 5 ||
                          info?.process_template?.id === 6
                            ? "作废说明"
                            : "审核备注"}
                        </View>
                        <View className={cns(styles["info--r"], "text--red")}>
                          {info?.addition?.remark}
                        </View>
                      </View>
                    )}
                    {/* 发票-重新开具 */}
                    {info?.addition.reopen !== undefined && (
                      <View className={styles["info"]}>
                        <View className={styles["info--l"]}>重新开具</View>
                        <View className={styles["info--r"]}>
                          {info?.addition.reopen ? (
                            <View className="custom-tag custom-tag--green">
                              是
                            </View>
                          ) : (
                            <View className="custom-tag custom-tag--grey">
                              否
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                  </>
                )}
              </View>
              {dataSource?.length > 0 && (
                <View className={styles["inner-sheet"]}>
                  <View className={styles["content-title"]}>
                    <View className={styles["content-title--l"]}>
                      {auditTypeMap[info?.entity_name]}分项
                    </View>
                  </View>
                  <View className={styles["inner-sheet-info"]}>
                    <View className={styles["title"]}>
                      <View className={styles["title--l"]}>名称规格</View>
                      <View className={styles["title--r"]}>数量单价</View>
                    </View>
                    <View className={styles["audit-info"]}>
                      {dataSource.map((e, sheetIndex) => (
                        <View className={styles["sheet-item"]} key={sheetIndex}>
                          {sheetIndex !== 0 && (
                            <View className={styles["divider-line"]} />
                          )}
                          <View className={styles["sheet"]}>
                            <View className={styles["sheet--l"]}>
                              <View className={styles["sheet-name"]}>
                                {e?.name}
                              </View>
                            </View>
                            <View className={styles["sheet--r"]}>
                              <View className={styles["sheet-price"]}>
                                ￥ {formatNumber(e.total_price)}
                              </View>
                            </View>
                          </View>
                          {(e.specs ?? []).map((spe, index) => (
                            <View className={styles["sheet"]} key={index}>
                              <View className={styles["sheet--l"]}>
                                <View className={styles["sheet-unit"]}>
                                  {spe?.value}
                                </View>
                              </View>
                              <View className={styles["sheet--r"]}>
                                <View className={styles["sheet-unit-price"]}>
                                  × {+e?.quantity}
                                </View>
                              </View>
                            </View>
                          ))}
                        </View>
                      ))}
                    </View>
                    <View className={styles["footer"]}>
                      <View className={styles["footer--l"]}>合计</View>
                      <View className={styles["footer--r"]}>
                        <View className={styles["sheet-total"]}>
                          ￥ {formatNumber(total)}
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
          <View className={cns(styles["audit-card"])}>
            <View className={styles["title"]}>审核节点</View>
            <View className={styles["content"]}>
              <View className={styles["custom-timeline"]}>
                {(info?.tasks ?? []).map((e) => {
                  return (
                    <View className={styles["item"]} key={e.task_id}>
                      {renderIcon(e)}
                      {e?.finish_time && (
                        <View className={styles.time}>
                          {moment(e?.finish_time).format("YYYY-MM-DD HH:mm:ss")}
                        </View>
                      )}
                      <View className={styles["name"]}>
                        {e?.processors?.[0]?.nickname && (
                          <Text className={styles["nick-name"]}>
                            {e?.processors?.[0]?.nickname}
                          </Text>
                        )}
                        <Text className={styles["task-name"]}>
                          {e.task_name}
                        </Text>
                      </View>
                      {e?.task_data?.remark && (
                        <View className={styles["task-remark"]}>
                          备注：{e?.task_data?.remark}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </Skeleton>
      </View>
      {!loading && !info?.completed && permissions?.modify && (
        <View className={styles["audit-btns"]}>
          <View
            className={styles["audit-btn"]}
            onClick={() => {
              setType("reject");
              setVisible(true);
            }}
          >
            驳回
          </View>
          <View
            className={styles["audit-btn"]}
            onClick={() => {
              setType("approve");
              setVisible(true);
            }}
          >
            通过
          </View>
        </View>
      )}
      <CustomPopupCenter
        visible={visible}
        onClose={() => {
          setVisible(false);
          nextTick(() => {
            setType(null);
            setRemarkValue("");
          });
        }}
        onConfirm={() => {
          handleUpdateAudit();
        }}
        title={type === "approve" ? "审批通过" : "审批驳回"}
      >
        <Field
          className={styles["audit-remark"]}
          value={remarkValue}
          placeholder="请输入审核备注"
          border={false}
          type="textarea"
          onChange={(e) => setRemarkValue(e.detail)}
        />
      </CustomPopupCenter>

      <CustomPopupCenter
        visible={resultModalvisible}
        cancleText="暂不处理"
        okText="继续"
        onClose={() => {
          // 返回列表页
          handleBack();
          setResultModalvisible(false);
        }}
        onConfirm={() => {
          // 获取下一条审批
          setResultModalvisible(false);
          const next_process_id = allAuditList?.[0]?.process_id;
          getAuditItem(next_process_id);
        }}
        title="操作成功"
      >
        您还有{" "}
        <Text className="text--green font--500">{allAuditList?.length}</Text>{" "}
        条审批事项，是否继续？
      </CustomPopupCenter>

      <CustomPopupCenter visible={successModalVisible} closeable={false} footer={null}>
        <View className={styles["finished-tasks"]}>
          <View className={styles["finished-tasks-text-1"]}>操作成功</View>
          <View className={styles["finished-tasks-text-2"]}>
            全部处理完了，今天你也辛苦了~
          </View>
        </View>
      </CustomPopupCenter>
    </View>
  );
}
