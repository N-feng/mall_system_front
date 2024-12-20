import apiRequest from '@/utils/request.js'

// 列表
export function fetchIntentionList(data) {
  return apiRequest({
    url: `/api/business/intention_project/`,
    method: 'GET',
    data: { ...data }
  });
}

// 获取单个意向信息
export function fetchIntention(id, data) {
  return apiRequest({
    url: `/api/business/intention_project/${id}/`,
    method: 'GET',
    data: { ...data }
  });
}

// 更新单个意向信息
export function updateIntention(id, data) {
  return apiRequest({
    url: `/api/business/intention_project/${id}/`,
    method: 'PUT',
    data: { ...data }
  });
}

// 获取意向的拜访记录
export function fetchIntentionVisitRecords(id, data) {
  return apiRequest({
    url: `/api/business/intention_project/${id}/visit_records/`,
    method: 'GET',
    data: { ...data }
  });
}

// 新增意向
export function addIntention(data) {
  return apiRequest({
    url: `/api/business/intention_project/`,
    method: 'POST',
    data: { ...data }
  });
}
