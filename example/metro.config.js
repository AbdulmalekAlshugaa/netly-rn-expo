const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Resolve "netly-rn-expo" to the local source so the example app always
// exercises the code in this repo, not the published package.
config.watchFolders = [path.resolve(workspaceRoot, 'src')];
config.resolver.extraNodeModules = {
  'netly-rn-expo': path.resolve(workspaceRoot, 'src'),
  // Force singletons from the example's node_modules so the library source
  // never pulls a second copy of react from the workspace root.
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
  '@react-native-community/netinfo': path.resolve(
    projectRoot,
    'node_modules/@react-native-community/netinfo'
  ),
};

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
config.resolver.blockList = [
  new RegExp(`${escapeRegExp(workspaceRoot)}/node_modules/react/.*`),
  new RegExp(`${escapeRegExp(workspaceRoot)}/node_modules/react-native/.*`),
  new RegExp(
    `${escapeRegExp(workspaceRoot)}/node_modules/@react-native-community/netinfo/.*`
  ),
];

module.exports = config;
