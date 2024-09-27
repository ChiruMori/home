const Package = require("../package.json");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");

const proxy = Package.proxy ?? {}; // 获取 package.json 中的 代理配置

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: true,
            },
          },
        ],
      },
      {
        test: /\.less$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: true,
            },
          },
          "less-loader",
        ],
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      async: false,
    }),
    new ESLintPlugin({
      extensions: ["js", "jsx", "ts", "tsx"],
    }),
  ],
  devtool: "eval-cheap-module-source-map",
  mode: "development",
  devServer: {
    static: "../dist", // 将 ../dist 目录下的文件作为 web 服务的根目录。
    compress: true,
    port: 3000, // 设置端口号
    open: true, // 自动打开本地默认浏览器
    hot: true, // 开启热更新
    proxy,
    historyApiFallback: true,
  },
};
