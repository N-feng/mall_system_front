import Taro, { useLaunch,useDidShow } from "@tarojs/taro";
import "@antmjs/vantui/lib/index.less";
import "./app.less";

const App = ({ children }) => {
  const checkVersionUpdate = ()=>{

    console.log(" ---- check version ---- ");
    if(process.env.TARO_ENV === 'weapp'){
      // eslint-disable-next-line no-undef
      const update = wx.getUpdateManager()
      update.onCheckForUpdate((res)=>{
      //检测是否有新版本
        console.log("hasUpdate:",res.hasUpdate);
        if(res.hasUpdate){
          update.onUpdateReady(()=>{
          //如果有新版本，给用户提示确认更新即可
            Taro.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (_res) {
                console.log("onUpdateReady:",_res);
                if (_res.confirm) {
                  update.applyUpdate();
                }
              }
            })
          })

          //如果自动更新失败，给用户提示手动更新（有些小程序涉及到多ID使用，不更新会出现莫名的缓存bug，大部分小程序不用执行这一步）
          update.onUpdateFailed(()=>{
            console.log("onUpdateFailed");
            Taro.showModal({
              title: '已经有新版本了',
              content: '新版本已经上线，请您删除当前小程序，重新打开。'
            })
          })

        }
      })
    }
  }

  useLaunch(() => {
    console.log("App launched.");
  });

  useDidShow(() => {
    console.log("App show.",process.env.TARO_ENV);
    checkVersionUpdate()
  });


  return children;
};

export default App;
