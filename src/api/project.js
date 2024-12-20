import apiRequest from '@/utils/request.js'

// 项目详细信息
export function fetchProjectDetail(id, data) {
  return apiRequest({
    url: `/api/projects/${id}/`,
    method: 'GET',
    data: { ...data }
  });
}

