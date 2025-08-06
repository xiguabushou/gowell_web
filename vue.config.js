const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8888", // 目标服务器地址
        changeOrigin: true, // 是否允许跨域
        //pathRewrite: { "^/api": "" }, // 去掉路径前缀
      },
    },
  },
});
