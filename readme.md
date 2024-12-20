# 恒冰商城小程序

基于 [Taro 框架](https://taro-docs.jd.com/docs/)，
使用 [VantUI 组件库](https://antmjs.github.io/vantui/main/#/home)

## 目录结构

- mall-miniapp
  - `dist` 打包产物
  - `config` 构建配置
  - `src`
    - `api` 请求函数封装
      - `index.js` 所有请求函数在此处导出
    - `assets` 静态资源目录，放置资源文件及组件&页面公共样式
      - `image`
      - `style`
        - `variables.less` 自定义样式变量，自动全局注入，无需手动引用
    - `components` 公共组件库
    - `hook` 自定义 hook
    - `pages` 页面目录
    - `store` 全局 Store
    - `utils`
      - `authority.js` 页面、按钮权限
      - `constant.js` 常量配置
      - `request.js` 网络请求封装
      - `util.js` 工具类方法
    - `app.config.js` 应用配置
    - `app.jsx` 应用入口文件，可在这做一些权限拦截和应用版本监测
    - `app.config.js` 配置页面路由、导航条、选项卡等页面类信息
  - `.env` 系统 request api,meta title 变量配置

## CSS 编写注意事项

1、weapp 不支持通配符\*

## TODO 优化

- 由于小程序单包的限制为 2M，后续可申请一个云静态文件池，存放 images 、地区 json 等大文件，如果是不同的业务可采取分包操作。
- 小程序持续集成
- stylelint 自动保存时会导致双斜杠注释触bug，暂未解决，先关闭自动保存，改为pnpm lint:css 一致格式化校验
- 自定义模板yuan
- 网络环境判断？
