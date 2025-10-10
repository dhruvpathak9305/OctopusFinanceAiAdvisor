const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Remap Node.js protocol imports like 'node:fs' to 'fs' for Metro
config.resolver = config.resolver || {};
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (typeof moduleName === 'string' && moduleName.startsWith('node:')) {
    moduleName = moduleName.slice(5);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config; 