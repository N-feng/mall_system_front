import apiRequest from '@/utils/request.js'

// 列表
export function fetchContactList(data) {
  return apiRequest({
    url: `/api/business/connect_person/`,
    method: 'GET',
    data: { ...data }
  });
}

// 获取负责人的单个拜访
export function fetchVisit(id, data) {
  return apiRequest({
    url: `/api/business/visit/${id}/`,
    method: 'GET',
    data: { ...data }
  });
}

// 新建拜访
export function addVisit(data) {
  return apiRequest({
    url: `/api/business/visit/`,
    method: 'POST',
    data: data,
  });
}

// 更新拜访
export function updateVisit(id, data) {
  return apiRequest({
    url: `/api/business/visit/${id}/`,
    method: 'PUT',
    data: data,
  });
}



// 获取负责人的拜访时间轴
export function getVisitRecords(id, data) {
  return apiRequest({
    url: `/api/business/connect_person/${id}/visit_records/`,
    method: 'GET',
    data: { ...data }
  });
}





