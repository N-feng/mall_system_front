export const APP_NAME = `MIMS_MINIAPP`;
export const APP_AUTH_KEY = `MIMS_MINIAPP_AUTH`;
export const APP_TAB_BAR_KEY = `tabParams`;
export const APP_API_KEY_PREFIX = `Bearer`;

export const CUSTOMER_KHFL = `customer_khfl`;

// 项目类型枚举
export const ProjectTypeEnums = {
  "NormalProject": 10,
  "CustomProject": 20
}

// 客户状态枚举
export const CustomerStatusEnums = {
  "Normal": 20,
  "Disabled": 10
}

// 项目层级
export const ProjectLevelStatus = {
  ZYJJ: { text: '重要且紧急', tag: 'warning' },
  ZYFJJ: { text: '重要非紧急', tag: 'warning' },
  FZYJJ: { text: '不重要但紧急', tag: 'warning' },
  FZYFJJ: { text: '不重要不紧急', tag: 'info' },
  QT: { text: '其它', tag: 'info' },
  STOP: { text: '停止', tag: 'info' },
};

// 审核 map
export const auditTypeMap = {
  'lims.project': "项目",
  'business.reimbursementcontract': "合同",
  'business.invoice': "发票",
}

