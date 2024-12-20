/*
 * @Description: 审核详情-详情
 */
import { useCallback, useState, useEffect } from "react";
import cns from "classnames";
import { Tabs, Tab, Skeleton } from "@antmjs/vantui";
import { View, Text } from "@tarojs/components";
import { useLoad, useDidShow, getCurrentInstance } from "@tarojs/taro";
import { fetchProjectDetail } from "@/api/project";
import { fetchContractDetail } from "@/api/contract";
import { formatNumber } from "@/utils/utils";
import Empty from "@/components/empty";
import {
  fetchQuotationSheets,
  fetchProjectValidQuotationSheets,
} from "@/api/audit";
import { fetchInvoice } from "@/api/invoice";
import { auditTypeMap, ProjectTypeEnums } from "@/utils/constant";
import styles from "../auditDetail/index.module.less";

export default function Index() {
  const instance = getCurrentInstance();
  const { entity_id, entity_name } = instance.router.params;
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("msg");
  const [info, setInfo] = useState(null);
  const [dataSource, setDataSource] = useState([]);
  const [total, setTotal] = useState();

  const getData = useCallback(async () => {
    setLoading(true);
    let data = {};

    // 项目需要多请求一个接口补充数据
    if (entity_name === "lims.project") {
      const res = await fetchProjectDetail(entity_id);
      data["project"] = res?.results;

      fetchProjectValidQuotationSheets(entity_id).then(({ results }) => {
        setDataSource(results?.sheets ?? []);
        setTotal(results?.total ?? 0);
      });
    }

    // 合同需要多请求一个接口补充数据
    if (entity_name === "business.reimbursementcontract") {
      const res = await fetchContractDetail(entity_id);
      data["contract"] = res?.results;

      fetchQuotationSheets(entity_id).then(({ results }) => {
        setDataSource(results?.sheets ?? []);
        setTotal(results?.total ?? 0);
      });
    }

    if (entity_name === "business.invoice") {
      const res = await fetchInvoice(entity_id);
      data["invoice"] = res?.results;
      setDataSource(res?.results?.sub_projects ?? []);
      setTotal(res?.results?.total_price ?? 0);
    }

    setInfo({
      ...data,
    });

    setLoading(false);
  }, [entity_name, entity_id]);

  useDidShow(() => {});

  useEffect(() => {
    getData();
  }, []);

  useLoad(() => {});

  const renderItem = (key, value, suffix) => {
    if (!value) {
      return "";
    }
    return (
      <View className={styles["info"]}>
        <View className={styles["info--l"]}>{key}</View>
        <View className={styles["info--r"]}>
          {value} {suffix}
        </View>
      </View>
    );
  };

  const renderLimsProject = () => {
    return (
      <>
        <View className={cns(styles["audit-card"])}>
          <View className={styles["title"]}>运营信息</View>
          <View className={styles["audit-info"]}>
            <View className={styles["info"]}>
              <View className={styles["info--l"]}>运营负责人</View>
              <View className={styles["info--r"]}>
                {info?.project?.operator?.nickname}
              </View>
            </View>
            {renderItem(
              "技术负责人",
              info?.project?.technical_principal?.nickname,
            )}
            {renderItem("检测内容", info?.project?.detection_content)}
            {info?.project?.detection_type && (
              <View className={styles["info"]}>
                <View className={styles["info--l"]}>检测类型</View>
                <View className={styles["info--r"]}>
                  {info?.project?.detection_type}
                </View>
              </View>
            )}
            {/* {info?.project?.type === ProjectTypeEnums.NormalProject &&
              renderItem("物种", info?.project?.customer_species)} */}

            {info?.project?.product?.serial_number && (
              <View className={styles["info"]}>
                <View className={styles["info--l"]}>检测产品</View>
                <View className={styles["info--r"]}>
                  {info?.project?.product?.serial_number}@
                  {info?.project?.product?.name}
                </View>
              </View>
            )}
          </View>
        </View>
        <View className={cns(styles["audit-card"])}>
          <View className={styles["title"]}>商务信息</View>
          <View className={styles["audit-info"]}>
            <View className={styles["info"]}>
              <View className={styles["info--l"]}>项目名称</View>
              <View className={styles["info--r"]}>{info?.project?.name}</View>
            </View>
            {renderItem("产品名称（英）", info?.project?.product?.name)}
            {renderItem("产品名称（中）", info?.project?.product?.name_zh)}
            <View className={styles["info"]}>
              <View className={styles["info--l"]}>项目编号</View>
              <View className={styles["info--r"]}>
                {info?.project?.serial_number}
              </View>
            </View>
            <View className={styles["info"]}>
              <View className={styles["info--l"]}>销售负责人</View>
              <View className={styles["info--r"]}>
                {info?.project?.sale?.nickname}
              </View>
            </View>
            <View className={styles["info"]}>
              <View className={styles["info--l"]}>客户单位</View>
              <View className={styles["info--r"]}>
                {info?.project?.customer_unit}
              </View>
            </View>
            <View className={styles["info"]}>
              <View className={styles["info--l"]}>课题组</View>
              <View className={styles["info--r"]}>
                {info?.project?.customer_research_group}
              </View>
            </View>
            {/* {info?.project?.type === ProjectTypeEnums.CustomProject &&
              renderItem("物种", info?.project?.customer_species)
              } */}
            {renderItem("物种", info?.project?.customer_species)}
            <View className={styles["info"]}>
              <View className={styles["info--l"]}>客户分类</View>
              <View className={styles["info--r"]}>
                {info?.project?.customer_classification?.value}
              </View>
            </View>
            <View className={styles["info"]}>
              <View className={styles["info--l"]}>客户级别</View>
              <View className={styles["info--r"]}>
                {info?.project?.customer_level?.value}
              </View>
            </View>
            <View className={styles["info"]}>
              <View className={styles["info--l"]}>项目负责人</View>
              <View className={styles["info--r"]}>
                {info?.project?.customer_principal}
              </View>
            </View>
            <View className={styles["info"]}>
              <View className={styles["info--l"]}>负责人电话</View>
              <View className={styles["info--r"]}>
                {info?.project?.principal_phone}
              </View>
            </View>
            <View className={styles["info"]}>
              <View className={styles["info--l"]}>负责人邮箱</View>
              <View className={styles["info--r"]}>
                {info?.project?.principal_mail}
              </View>
            </View>
            <View className={styles["info"]}>
              <View className={styles["info--l"]}>项目执行人</View>
              <View className={styles["info--r"]}>
                {info?.project?.customer_executor}
              </View>
            </View>
            <View className={styles["info"]}>
              <View className={styles["info--l"]}>执行人电话</View>
              <View className={styles["info--r"]}>
                {info?.project?.executor_phone}
              </View>
            </View>
            <View className={styles["info"]}>
              <View className={styles["info--l"]}>执行人邮箱</View>
              <View className={styles["info--r"]}>
                {info?.project?.executor_mail}
              </View>
            </View>
          </View>
        </View>
        <View className={cns(styles["audit-card"])}>
          <View className={styles["title"]}>项目信息</View>
          <View className={styles["audit-info"]}>
            {renderItem("服务周期（天）", info?.project?.service_cycle)}
            {renderItem("测序平台", (info?.project?.sequencing_platform??[]).join("、"))}
            {renderItem("数据量说明", info?.project?.data_amount_description)}
            {renderItem("总样品数据量", +info?.project?.total_data_amount,'GB')}
            {renderItem("单样品数据量", +info?.project?.sample_data_amount,'GB')}
            {renderItem("亲本数据量", +info?.project?.parent_data_amount,'GB')}
            {renderItem("子代数据量", +info?.project?.children_data_amount,'GB')}
            {renderItem("优先级", info?.project?.priority)}
            {(info?.project?.common_application_solutions ?? []).map((e) => {
              return (
                <>
                  {renderItem(
                    "应用场景",
                    e?.application_type && e?.application_classification ?
                      `${e?.application_classification} / ${e?.application_type}` :"",
                  )}
                  {renderItem("技术方案", e?.technical_solutions)}
                </>
              );
            })}
            {renderItem("产品类型", info?.project?.product_type)}
            {renderItem("技术方案", info?.project?.technical_solutions)}
            {renderItem(
              "位点类型",
              (info?.project?.site_type ?? []).join("、"),
            )}
            {info?.project?.type === ProjectTypeEnums.CustomProject &&
              renderItem(
                "开发周期",
                info?.project?.development_cycle &&
                  info?.project?.development_cycle === "default"
                  ? "公司默认标准"
                  : "与客户协商标准",
              )}
            {renderItem("位点核对开发周期", info?.project?.site_check_cycle)}
            {renderItem("位点挑选开发周期", info?.project?.site_select_cycle)}
            {renderItem("位点评估开发周期", info?.project?.site_evaluate_cycle)}
            {renderItem("位点测试开发周期", info?.project?.site_test_cycle)}
            {renderItem(
              "参考基因组信息",
              info?.project?.reference_genomic_information,
            )}
            {renderItem("样品情况", info?.project?.sample_situation)}
            <View className={styles["info"]}>
              <View className={styles["info--l"]}>项目加急</View>
              <View className={styles["info--r"]}>
                {info?.project?.is_urgent ? "是" : "否"}
              </View>
            </View>
            {renderItem("QC标准", info?.project?.qc_standard_charges)}
            {renderItem("", info?.project?.qc_standard)}
            {renderItem(
              "结果交付形式",
              (info?.project?.delivery_form ?? []).join("、"),
            )}
            {renderItem(
              "结果交付媒介",
              (info?.project?.delivery_medium ?? []).join("、"),
            )}
            {renderItem("备注", info?.project?.remark)}
          </View>
        </View>
      </>
    );
  };
  const renderBusinessReimbursementcontract = () => {
    return (
      <>
        <View className={cns(styles["audit-card"])}>
          <View className={styles["title"]}>合同信息</View>
          <View className={styles["audit-info"]}>
            {renderItem("合同标题", info?.contract?.contract_title)}
            {renderItem("甲方", info?.contract?.party_A)}
            {renderItem("甲方居住地", info?.contract?.party_A_address)}
            {renderItem("甲方法定代表人", info?.contract?.party_A_legal_person)}
            {renderItem("物种", info?.contract?.species?.species)}
            {renderItem(
              "甲方项目联系人",
              info?.contract?.party_A_contact_person,
            )}
            {renderItem("甲方联系方式", info?.contract?.party_A_phone)}
            {renderItem("甲方通讯地址", info?.contract?.party_A_address)}
            {renderItem("甲方电话", info?.contract?.party_A_phone)}
            {renderItem("甲方电子邮箱", info?.contract?.party_A_email)}
            {renderItem("甲方传真", info?.contract?.party_A_fax)}
            {renderItem("乙方", info?.contract?.party_B)}
            {renderItem("乙方住所地", info?.contract?.party_B_address)}
            {renderItem("乙方法定代表人", info?.contract?.party_B_legal_person)}
            {renderItem(
              "乙方项目联系人",
              info?.contract?.party_B_contact_person,
            )}
            {renderItem(
              "乙方联系方式",
              info?.contract?.party_B_contact_details,
            )}
            {renderItem("乙方通讯地址", info?.contract?.party_B_address)}
            {renderItem("乙方电话", info?.contract?.party_B_phone)}
            {renderItem("乙方电子邮箱", info?.contract?.party_B_email)}
            {renderItem("乙方传真", info?.contract?.party_B_fax)}
            {renderItem("签订日期", info?.contract?.signing_time)}
            {renderItem("签订地点", info?.contract?.signing_place)}
            {renderItem("有效期", info?.contract?.valid_period)}
            {renderItem("技术服务点", info?.contract?.service_location)}
            {renderItem("合同金额￥", formatNumber(info?.contract?.total_price))}
            {renderItem(
              "服务周期（天）",
              info?.contract?.technical_service_progress_library_day,
            )}
            {renderItem("税点", info?.contract?.tax_point)}
            {renderItem(
              "是否为实际销售货物",
              info?.contract?.is_real_goods === "true" ? "是" : "否",
            )}
            {renderItem("销售第一负责人", info?.contract?.principal?.nickname)}
          </View>
        </View>
      </>
    );
  };
  const renderInvoice = () => {
    return (
      <>
        <View className={cns(styles["audit-card"])}>
          <View className={styles["title"]}>发票信息</View>
          <View className={styles["audit-info"]}>
            {renderItem("申请人", info?.invoice?.applicant)}
            {renderItem("合同编号", info?.invoice?.contract?.contract_id)}
            {renderItem("发票类型", info?.invoice?.invoice_type)}
            {renderItem("购买方名称", info?.invoice?.buyer_name)}
            {renderItem("纳税人识别号", info?.invoice?.taxpayer_id)}
            {renderItem("购买方地址", info?.invoice?.buyer_address)}
            {renderItem("购买方电话", info?.invoice?.phone)}
            {renderItem("开户行", info?.invoice?.opening_bank)}
            {renderItem("开户账号", info?.invoice?.opening_id)}
            {renderItem("合同乙方", info?.invoice?.party_B)}
            {renderItem(
              "抄送人电子邮箱",
              (info?.invoice?.cc_pdf_email ?? []).join("、"),
            )}
            {renderItem("发票金额", formatNumber(info?.invoice?.total_price))}
            {renderItem("开票日期", info?.invoice?.invoice_time)}
            {renderItem("税点", info?.invoice?.tax_point)}
            {renderItem("发票号", info?.invoice?.receipt_number)}
            {renderItem(
              "是否为实际销售货物",
              info?.invoice?.is_real_goods === "true" ? "是" : "否",
            )}
            {renderItem("备注", info?.invoice?.remark)}
          </View>
        </View>
      </>
    );
  };

  return (
    <View className={styles.detail}>
      <Tabs
        sticky
        active={tab}
        ellipsis={false}
        onChange={(e) => {
          setTab(e.detail?.name);
        }}
      >
        <Tab title={`${auditTypeMap[entity_name]}信息`} name="msg">
          <View className={cns(styles.container)}>
            <Skeleton row="10" loading={loading}>
              <>
                {entity_name === "lims.project" && renderLimsProject()}
                {entity_name === "business.reimbursementcontract" &&
                  renderBusinessReimbursementcontract()}
                {entity_name === "business.invoice" && renderInvoice()}
              </>
            </Skeleton>
          </View>
        </Tab>
        <Tab title={`${auditTypeMap[entity_name]}分项`} name="list">
          {dataSource?.length === 0 ? (
            <Empty description="暂无分项" />
          ) : (
            <View className={cns(styles["audit-card"])}>
              <View className={styles["title"]}>
                <View className={styles["title--l"]}>名称规格</View>
                <View className={styles["title--r"]}>数量单价</View>
              </View>
              <View className={styles["audit-info"]}>
                {dataSource.map((e, sheetIndex) => (
                  <View className={styles["sheet-item"]} key={e.id}>
                    {sheetIndex !== 0 && (
                      <View className={styles["divider-line"]} />
                    )}
                    <View className={styles["sheet"]}>
                      <View className={styles["sheet--l"]}>
                        <View className={styles["sheet-name"]}>{e?.name}</View>
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
                    <View className={styles["sheet"]}>
                      <View className={styles["sheet--l"]}>
                        <View className={styles["sheet-type"]}>
                          {(e?.category ?? [])
                            .map((i) => i.label)
                            .map((cate) => (
                              <Text className={styles["sheet-tag"]} key={cate}>
                                {cate}
                              </Text>
                            ))}
                        </View>
                      </View>
                      <View className={styles["sheet--r"]}>
                        <View className={styles["sheet-unit-price"]}>
                          ￥ {formatNumber(e?.transaction_price)}
                        </View>
                      </View>
                    </View>
                    <View className={styles["sheet-remark"]}>{e?.remark}</View>
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
          )}
        </Tab>
      </Tabs>
    </View>
  );
}
