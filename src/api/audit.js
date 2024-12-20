import apiRequest from '@/utils/request.js'

// 获取审核列表
export const fetchAuditList = (data) => {
  return apiRequest({
    url: '/api/business/process/',
    method: 'GET',
    data: { ...data }
  })
}

// 获取单个审核
export const fetchAuditItem = (id, data) => {
  return apiRequest({
    url: `/api/business/process/${id}/`,
    method: 'GET',
    data: { ...data }
  })
}

// 获取审核明细表
export const fetchQuotationSheets = (id, data) => {
  return apiRequest({
    url: `/api/business/reimbursement_contract/${id}/valid_quotation_sheets/`,
    method: 'GET',
    data: { ...data }
  })
}

// 获取审核明细表0
export const fetchProjectValidQuotationSheets = (id, data) => {
  return apiRequest({
    url: `/api/projects/${id}/valid_quotation_sheets/`,
    method: 'GET',
    data: { ...data }
  })
}

// 更新
export function updateAudit(id, data) {
  return apiRequest({
    url: `/api/business/process/${id}/`,
    method: 'PUT',
    data: { ...data }
  });
}



