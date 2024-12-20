import React, { useState } from 'react'
import { Uploader, Toast } from '@antmjs/vantui'
import Taro from '@tarojs/taro'
import { uploadImage } from '@/api/upload' // 假设的上传API

export default function CustomUploader(props) {
  // 文件列表状态
  const [fileList, setFileList] = useState([])

  // 上传前校验
  const beforeRead = (event) => {
    const { file } = event.detail
    console.log('beforeRead', file)
    const isLt2M = file.size / 1024 / 1024 < 2 // 限制2M以内

    if (!isLt2M) {
      Toast.fail('文件大小不能超过2M')
      return false
    }
    return true
  }

  // 文件上传
  const afterRead = async (event) => {
    const { file } = event.detail

    console.log('afterRead', file)
    // 构建formData
    const formData = new FormData()
    formData.append('file', file)

    try {
      // 显示上传中提示
      Taro.showLoading({ title: '上传中...' })

      // 调用上传API
      const uploadResponse = await uploadImage(formData)

      if (uploadResponse.code === 200) {
        // 更新文件列表
        setFileList([
          ...fileList,
          {
            url: uploadResponse.data.fileUrl,
            name: file.name
          }
        ])

        Toast.success('上传成功')
      } else {
        Toast.fail(uploadResponse.message || '上传失败')
      }
    } catch (error) {
      console.error('上传错误', error)
      Toast.fail('上传失败')
    } finally {
      Taro.hideLoading()
    }
  }

  // 删除文件
  const deleteFile = (event) => {
    const { index } = event.detail
    const newFileList = [...fileList]
    newFileList.splice(index, 1)
    setFileList(newFileList)
  }

  return (
    <Uploader
      fileList={fileList}
      maxCount={9}
      multiple
      uploadIcon="plus"
      beforeRead={beforeRead}
      afterRead={afterRead}
      onDelete={deleteFile}
    />
  )
}
