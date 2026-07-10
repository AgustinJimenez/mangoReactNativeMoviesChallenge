module.exports = {
  preset: '@react-native/jest-preset',
  // react-native-worklets (Reanimated 4's separate native-module package)
  // ships a resolver that stops Jest from resolving its `.native.ts`
  // variant, which tries to load the real native module and crashes.
  resolver: 'react-native-worklets/jest/resolver.js',
  setupFiles: ['react-native-gesture-handler/jestSetup'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/node_modules/@react-native-async-storage/async-storage/lib/module/jest/AsyncStorageMock.js',
    '^react-native-localize$':
      '<rootDir>/node_modules/react-native-localize/dist/commonjs/extras/mock/jest.js',
    '^expo-image$': '<rootDir>/__mocks__/expo-image.js',
    '^@react-native-community/netinfo$':
      '<rootDir>/node_modules/@react-native-community/netinfo/jest/netinfo-mock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-.*)?|@react-navigation|react-native-.*|nativewind|react-native-css-interop|expo(-.*)?|@expo(-.*)?|react-redux|redux-persist|immer|@reduxjs)/)',
  ],
};
