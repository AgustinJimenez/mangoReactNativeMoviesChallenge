module.exports = {
  presets: [
    ['module:@react-native/babel-preset', { jsxImportSource: 'nativewind' }],
    'nativewind/babel',
  ],
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
  ],
};
