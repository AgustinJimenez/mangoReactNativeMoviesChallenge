module.exports = {
  preset: '@react-native/jest-preset',
  // Composes @react-native/jest-preset's own resolver with
  // react-native-worklets' (Reanimated 4's separate native-module package
  // needs its `.native.ts` variant NOT resolved in tests, or it tries to
  // load the real native module and crashes) — see jest/resolver.js for why
  // this can't just be react-native-worklets/jest/resolver.js directly.
  resolver: '<rootDir>/jest/resolver.js',
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
