require('./shim');

const {getDefaultConfig} = require('@react-native/metro-config');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts }
  } = await getDefaultConfig();
  return {
    resolver: {
      assetExts: assetExts.filter(ext => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
      extraNodeModules: {
        crypto: require.resolve('crypto'),
      },
    }
  };
})();
