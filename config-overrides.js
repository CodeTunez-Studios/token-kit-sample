/* config-overrides.js — Fixes HMR on Node 22 + react-scripts 5.0.1 */

const { HotModuleReplacementPlugin } = require('webpack');

module.exports = {
  webpack(config, env) {
    if (env === 'development') {
      const hasHMR = config.plugins.some(
        (p) => p instanceof HotModuleReplacementPlugin
      );
      if (!hasHMR) {
        config.plugins.push(new HotModuleReplacementPlugin());
      }
    }
    return config;
  },
  devServer(configFunction) {
    return function (proxy, allowedHost) {
      const config = configFunction(proxy, allowedHost);
      config.hot = true;
      return config;
    };
  },
};
