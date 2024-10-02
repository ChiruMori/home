import { merge } from 'webpack-merge';
import commonConfig from './webpack.config.common.mjs';
import productionConfig from './webpack.config.prod.mjs';
import developmentConfig from './webpack.config.dev.mjs';

const getConfig = (env) => {
  if (env.development) {
    return merge(commonConfig, developmentConfig);
  }

  if (env.production) {
    return merge(commonConfig, productionConfig);
  }

  throw new Error('No matching configuration was found');
};

export default getConfig;