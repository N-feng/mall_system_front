import apiRequest from '@/utils/request.js'

// 合同详细信息
export function fetchContractDetail(id, data) {
  return apiRequest({
    url: `/api/business/reimbursement_contract/${id}/`,
    method: 'GET',
    data: { ...data }
  });
}

