module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['react-native-gesture-handler/jestSetup'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/node_modules/@react-native-async-storage/async-storage/lib/module/jest/AsyncStorageMock.js',
    '^react-native-localize$':
      '<rootDir>/node_modules/react-native-localize/dist/commonjs/extras/mock/jest.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-.*)?|@react-navigation|react-native-.*|nativewind|react-native-css-interop|expo(-.*)?|@expo(-.*)?|react-redux|redux-persist|immer|@reduxjs)/)',
  ],
};
