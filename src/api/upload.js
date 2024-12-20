import apiRequest from '@/utils/request.js'
import Taro from "@tarojs/taro";

export function uploadImage(data) {
  return apiRequest({
    url: `/common/upload/create_file/`,
    method: 'POST',
    data,
    header: {
      // 'content-type': 'multipart/form-data; boundary=' + Math.random().toString().substring(2),
      'content-type': 'multipart/form-data',
    }
  });
  /*return Taro.uploadFile({
    url: '/common/upload/create_file/',
    filePath: file.path,
    name: 'file',
    timeout: 30000, // 增加超时时间到30秒
    success: (res) => {
      // 处理成功逻辑
    },
    fail: (err) => {
      console.error('上传失败', err)
    }
  })*/
}










