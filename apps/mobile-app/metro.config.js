const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const extraAssetExts = ['glb', 'gltf', 'bin'];
for (const ext of extraAssetExts) {
  if (!config.resolver.assetExts.includes(ext)) {
    config.resolver.assetExts.push(ext);
  }
}

module.exports = config;

