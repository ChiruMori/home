import HtmlWebpackPlugin from 'html-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import path from 'path';

const __dirname = path.resolve();

export default {
  entry: './src/index.tsx',
  output: {
    filename: 'bundle.[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // 打包前清理 dist 文件夹
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: 'source-map',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    // 清理上次打包的文件
    new CleanWebpackPlugin({
        path: path.join(__dirname, '../dist')
    }),
  ],

  module: {
    rules: [
        { test: /\.(js|jsx)$/, exclude: /node_modules/, use: { loader: 'babel-loader' } },
        { test: /\.(ts|tsx)$/, exclude: /node_modules/, use: { loader: 'ts-loader'} },
        // 注意顺序，先style-loader，再css-loader和其他loader
        { test: /\.(css|less)$/, exclude: /node_modules/, use: ['style-loader', 'css-loader', 'less-loader']}
    ],
  },
};
