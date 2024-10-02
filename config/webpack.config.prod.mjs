import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';

export default {
  output: {
    filename: 'scripts/[name].[contenthash].js',
  },
  module: {
    rules: [],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'styles/[name].[contenthash].css',
    }),
  ],
  optimization: {
    minimizer: [new CssMinimizerPlugin()],
  },
  mode: 'production',
};
