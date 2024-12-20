import React, { useState } from 'react'
import { Uploader, Toast, Image, } from '@antmjs/vantui'
import Taro from '@tarojs/taro'
import { uploadImage } from '@/api/upload'
import {View} from "@tarojs/components"; // 假设的上传API

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

  // 上传图片
  const uploadImg = async (e)=>{
    const self = this
    if (process.env.TARO_ENV === 'weapp'){
      Taro.chooseImage({
        count: 1,   // 可选图片数量, 这里限制为1张
        sizeType: ['original', 'compressed'], // 可以指定是原图还是缩图，默认二者都有
        sourceType: ['album', 'camera'],  // 可以指定来源是相机还是相册，默认二者
        success(res){
          const tempFilePaths = res.tempFilePaths
          self.upload(tempFilePaths)
        }
      })
    } else if (process.env.TARO_ENV === 'h5') {
      if (navigator.userAgent.indexOf("MicroMessenger") != -1){
        var wx = require('m-commonjs-jweixin');
        wx.ready(function() {
          wx.chooseImage({
            count: 1,   // 可选图片数量, 这里限制为1张
            sizeType: ['original', 'compressed'], // 可以指定是原图还是缩图，默认二者都有
            sourceType: ['album', 'camera'],  // 可以指定来源是相机还是相册，默认二者
            success(res){
              const localIds = res.localIds   // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
              self.upload(localIds)
            }
          })
        })
      } else {
        // 显示选择的图片
        let localIds = e.target.files[0]
        self.upload(localIds)
      }
    }
  }
  // 上传头像调用接口
  const upload = async (tempFilePaths)=> {
    await uploadImgOss(tempFilePaths).then(res => {
      this.setState({
        headImg: res,
        headUrl: shoppUrlImg + res
      })
    })
  }

  const uploadImg2 = (imgList = [])=> {
    Taro.showLoading({
      title: '上传中'
    })
    //小程序
    if (process.env.TARO_ENV === 'weapp') {
      let promiseList = imgList.map((item) => {
        let name = item.split('.')	// 处理后台接收参数
        name = name[name.length-2] + '.' + name[name.length-1]
        return new Promise(resolve => {
          Taro.uploadFile({
            url: shoppUrl + api.uploadImg,
            filePath: item,
            filePath: item,
            name: 'file',
            formData: {
              headImg: item,
              fileName: name,
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded',
              'cookie': Taro.getStorageSync('cookie')
            },
            success: (res) => {
              const data = JSON.parse(res.data).data;
              resolve(data);
            }
          });
        });
      });
      const result = Promise.all(promiseList).then((res) => {
        Taro.hideLoading()
        return res;
      }).catch((error) => {
      });
      return result;
    } else if (process.env.TARO_ENV === 'h5') {
      if (navigator.userAgent.indexOf("MicroMessenger") != -1) {
        var wx = require('m-commonjs-jweixin');
        //公众号
        return new Promise(resolve => {
          var imagesList = []
          var localIds = imgList
          function upload() {
            var localId = localIds.toString()
            wx.uploadImage({
              localId: localId,
              success: function (res) {
                var mediaId = res.serverId.substring(0, 6) + '.' + 'png';
                wx.getLocalImgData({
                  localId: localIds.toString(), // 图片的localID
                  success: function (respo) {
                    var localData = respo.localData; // localData是图片的base64数据，可以用img标签显
                    if (localData.indexOf('data:image') != 0) {
                      //判断是否有这样的头部
                      localData = 'data:image/jpeg;base64,' +  localData
                    }
                    shoppRequest.post(api.h5UploadImg, {
                      base64String: localData,
                      fileName: mediaId,
                    }).then(
                      res => {
                        const data = res.data.data
                        imagesList.push(data)
                        Taro.hideLoading()
                        resolve(imagesList)
                      }
                    )
                    // localData = localData.replace(/\r|\n/g, '').replace('data:image/jgp', 'data:image/jpeg')
                  },fail:function(respo){
                    alert("显示失败:"+JSON.stringify(respo))
                  }
                });
              },
              fail: function (error) {
                alert('errorerrorerror'+error)
              }
            })
          }
          upload()
        })
      } else {
        // 非微信浏览器打开
        return new Promise(resolve => {
          console.log('resolve222',resolve)
          shoppRequest.uploadImg(api.uploadImg, {
            file: imgList,
            fileName: imgList.name
          }).then(res => {
            Taro.hideLoading()
            console.log('res42423',res)
            resolve([res.data]);
          })
        });
      }
    }
  }


  return (
    <View className="userinfo-content-layout">
      {
        (process.env.TARO_ENV === 'h5' && navigator.userAgent.indexOf("MicroMessenger") == -1) ?
          <View className="userinfo-img-box">
            <View className="userinfo-img-view">
              <input className="userinfo_input" id="fileView" type="file" capture="camera"
                accept="image/gif,image/jpeg,image/jpg,image/png" onChange={this.uploadImg.bind(this)}
              ></input>
              <Image src={headUrl} className="userinfo-img" onClick={this.uploadImg.bind(this)} mode="aspectFill"></Image>
            </View>
          </View>
          : <View className="userinfo-img-box">
            <View className="userinfo-img-view">
              <Image src={headUrl} className="userinfo-img" onClick={this.uploadImg.bind(this)} mode="aspectFill"></Image>
            </View>
          </View>
      }
    </View>

  )
}
