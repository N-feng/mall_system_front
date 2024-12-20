import { defineConfig } from "@tarojs/cli";
import { resolve } from "path";
import devConfig from "./dev";
import prodConfig from "./prod";


// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig(async (merge, { command, mode }) => {

  const chainConfig = {
    module: {
      rule: {
        themeLoader: {
          test: /\.less$/,
          use: [
            {
              loader: "less-loader",
              options: {
                lessOptions: {
                  modifyVars: {
                    hack: `true; @import "${resolve(__dirname, "../src/assets/style/variables.less")}";`,
                  },
                },
              },
            },
          ]
        }
      }
    },
    plugin: {
      install: {
        plugin: require("terser-webpack-plugin"),
        args: [
          {
            terserOptions: {
              compress: true, // 默认使用terser压缩
              keep_classnames: true, // 不改变class名称
              keep_fnames: true, // 不改变函数名称
            },
          },
        ],
      },
    },
  }


  const baseConfig = {
    projectName: "mall-miniapp",
    date: "2024-1-10",
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2,
    },
    sourceRoot: "src",
    outputRoot: "dist",

    plugins: [],
    defineConstants: {
      // 根据环境设置 API 基础地址
      TARO_APP_BASE_API: process.env.NODE_ENV === 'development'
        ? '"/api"'
        : '"https://production.com"'
    },
    // 开发服务器代理配置
    devServer: {
      proxy: {
        '/api': {
          target: 'http://47.112.100.255',
          changeOrigin: true,
          pathRewrite: {
            '^/api': '' // 重写路径
          }
        }
      }
    },
    copy: {
      patterns: [],
      options: {},
    },
    framework: "react",
    compiler: "webpack5",
    cache: {
      enable: false, // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
    },
    alias: {
      "@": resolve(__dirname, "../src"),
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {},
        },
        url: {
          enable: true,
          config: {
            limit: 1024, // 设定转换尺寸上限
          },
        },
        cssModules: {
          enable: true,
          config: {
            namingPattern: "module", // 转换模式，取值为 global/module
            generateScopedName: "[name]__[local]___[hash:base64:5]",
          },
        },
        miniCssExtractPluginOption: {
          ignoreOrder: true,
        },
      },
      webpackChain: (chain, webpack) => {
        chain.merge({
          ...chainConfig,
        });
      },
    },
    h5: {
      publicPath: "/",
      staticDirectory: "static",
      output: {
        filename: "js/[name].[hash:8].js",
        chunkFilename: "js/[name].[chunkhash:8].js",
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: "css/[name].[hash].css",
        chunkFilename: "css/[name].[chunkhash].css",
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: true,
          config: {
            namingPattern: "module", // 转换模式，取值为 global/module
            generateScopedName: "[name]__[local]___[hash:base64:5]",
          },
        },
      },
      esnextModules: [/@antmjs[\/]vantui/],
      webpackChain: (chain, webpack) => {
        chain.merge({
          ...chainConfig,
        });
      },
    },
  };

  console.log(
    "process.env.NODE_ENV::::::::::::",
    process.env.NODE_ENV,
    process.env.TARO_APP_BASE_API,
  );

  if (process.env.NODE_ENV === "development") {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig);
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig);
});
