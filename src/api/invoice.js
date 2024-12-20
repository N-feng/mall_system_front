import apiRequest from '@/utils/request.js'

// 发票
export function fetchInvoice(id, data) {
  return apiRequest({
    url: `/api/business/invoice/${id}/`,
    method: 'GET',
    data: { ...data }
  });
}










