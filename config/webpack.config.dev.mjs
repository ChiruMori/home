export default {
  module: {
    rules: [
    ],
  },
  plugins: [
  ],
  devtool: 'eval-cheap-module-source-map',
  mode: 'development',
  devServer: {
    static: '../dist', // 将 ../dist 目录下的文件作为 web 服务的根目录。
    compress: true,
    port: 3000, // 设置端口号
    open: true, // 自动打开本地默认浏览器
    hot: true, // 开启热更新
    historyApiFallback: true,
  },
};
