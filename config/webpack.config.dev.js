import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';

export default {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
        ],
      },
      {
        test: /\.less$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
          'less-loader',
        ],
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      async: false,
    }),
    new ESLintPlugin({
      extensions: ['js', 'jsx', 'ts', 'tsx'],
      files: './src/**/*', // 或者其他需要检查的目录
      overrideConfigFile: './eslint.config.mjs', // 显式指定 ESLint 配置文件
    }),
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
