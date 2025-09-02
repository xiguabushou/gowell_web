const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    allowedHosts: "all", // 禁用主机检查
    webSocketServer:false,
    proxy: {
      "/api": {
        target: "http://43.143.45.152:8888", // 目标服务器地址
        changeOrigin: true, // 是否允许跨域
        //pathRewrite: { "^/api": "" }, // 去掉路径前缀
      },
    },
  },
});
