import apiRequest from '@/utils/request.js'


// 获取客户列表
export const getCustomerList = (data) => {
  return apiRequest({
    url: '/api/business/customer/',
    method: 'GET',
    data: { ...data }
  })
}

// 负责人列表
export function getContactList(data) {
  return apiRequest({
    url: '/api/business/connect_person/',
    method: 'GET',
    data: { ...data }
  });
}

// 关联负责人
export function setContactList(data) {
  return apiRequest({
    url: '/api/business/connect_person/',
    method: 'POST',
    data: { ...data }
  });
}

// 获取负责人接口
export function getContact(id, data) {
  return apiRequest({
    url: `/api/business/connect_person/${id}/`,
    method: 'GET',
    data: { ...data }
  });
}

// 新增负责人
export function addContact(data) {
  return apiRequest({
    url: `/api/business/connect_person/`,
    method: 'POST',
    data: { ...data }
  });
}

// 更新负责人
export function updateContact(id, data) {
  return apiRequest({
    url: `/api/business/connect_person/${id}/`,
    method: 'PUT',
    data: { ...data }
  });
}

// 获取option
// khfl 客户分类
export const fetchConfigureList = (id, data) => {
  return apiRequest({
    url: `/api/business/configures/${id}/`,
    method: 'GET',
    data: {
      ...data
    }
  })
}

// 单位名称搜索
export function searchUnit(data) {
  return apiRequest({
    url: `/api/business/customer/field_values/`,
    method: 'GET',
    data: {
      ...data
    }
  });
}

// 查看【单位名称+课题组】是否已经存在
export function checkCustomerExist(data) {
  return apiRequest({
    url: `/api/business/customer/existed/`,
    method: 'GET',
    data: {
      ...data
    }
  });
}

export function fetchSpeciesTreeList(data) {
  return apiRequest({
    url: '/api/species/tree/',
    method: 'GET',
    data: {
      ...data
    }
  });
}

// 获取单个客户信息
export function getCustomer(id) {
  return apiRequest({
    url: `/api/business/customer/${id}/`,
    method: 'GET',
  });
}

// 新增客户
export function createCustomer(data) {
  return apiRequest({
    url: '/api/business/customer/',
    method: 'POST',
    data,
  });
}


// 更新客户
export function updateCustomer(id, data) {
  return apiRequest({
    url: `/api/business/customer/${id}/`,
    method: 'PUT',
    data,
  });
}

// 现金池明细
export function getCashflowDetail(data) {
  return apiRequest({
    url: `/api/business/cashflow_detail/`,
    method: 'GET',
    data,
  });
}


// 切换客户状态
export function activateCustomer(id, data) {
  return apiRequest({
    url: `/api/business/customer/${id}/activate/`,
    method: 'POST',
    data,
  });
}






