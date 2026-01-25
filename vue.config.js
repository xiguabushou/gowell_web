const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    allowedHosts: "all",
    webSocketServer: false,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8888",
        changeOrigin: true,
      },
    },
  },
  // 👇 添加 configureWebpack 配置
  configureWebpack: {
    plugins: [
      new (require('webpack')).DefinePlugin({
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
      }),
    ],
  },
});