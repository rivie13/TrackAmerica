const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add support for .topojson files as assets (not source code)
config.resolver.assetExts.push('topojson');

module.exports = withNativeWind(config, { input: './global.css' });
