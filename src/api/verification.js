import apiRequest from '@/utils/request.js'

export function fetchVerificationsList(data) {
  return apiRequest({
    url: `/user/verification/list_applications/`,
    method: 'GET',
    data
  });
}
export function addVerification(data) {
  return apiRequest({
    url: `/user/verification/apply/`,
    method: 'POST',
    data
  });
}
export function examineVerification(data) {
  return apiRequest({
    url: `/user/verification/to_examine/`,
    method: 'POST',
    data
  });
}
export function fetchApplicationDetail(data) {
  return apiRequest({
    url: `/user/verification/get_application_detail/`,
    method: 'GET',
    data
  });
}










