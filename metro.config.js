const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Exclude directories with special characters from Metro bundler
config.resolver.blockList = [
  /20:80_research\/.*/,
];

module.exports = config;
