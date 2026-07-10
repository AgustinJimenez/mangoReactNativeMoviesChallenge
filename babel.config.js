module.exports = {
  presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        alias: { '@': './src' },
        extensions: ['.tsx', '.ts', '.js', '.json'],
      },
    ],
    ['module:react-native-dotenv', { moduleName: '@env', path: '.env' }],
    // Must stay last in the list — see https://docs.swmansion.com/react-native-reanimated
    'react-native-worklets/plugin',
  ],
};
