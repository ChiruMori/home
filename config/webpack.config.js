import { merge } from 'webpack-merge';
import commonConfig from './webpack.config.common.js';
import productionConfig from './webpack.config.prod.js';
import developmentConfig from './webpack.config.dev.js';

export default (env) => {
  switch (true) {
    case env.development:
      return merge(commonConfig, developmentConfig);

    case env.production:
      return merge(commonConfig, productionConfig);

    // return new Error('No matching configuration was found');
  }
};
