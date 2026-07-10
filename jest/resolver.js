'use strict';

// Composes two resolvers that both need to run, since Jest only accepts one
// `resolver` and setting jest.config.js's `resolver` field replaces (not
// merges with) @react-native/jest-preset's own resolver:
//
// 1. @react-native/jest-preset's resolver.js: strips react-native's
//    package.json `exports` field so Jest can still resolve/mock its
//    internal subpaths (RFC0894 backwards compatibility).
// 2. react-native-worklets/jest/resolver.js: strips `.native` from the
//    extension list for worklets requests, so Jest doesn't try to load its
//    real native module (see jest.config.js's comment on `resolver`).
module.exports = (request, options) => {
  const isWorkletsRequest =
    options.basedir.includes('react-native-worklets') || request.includes('react-native-worklets');

  const resolverOptions = isWorkletsRequest
    ? {
        ...options,
        extensions: options.extensions?.filter((extension) => !extension.includes('native')),
      }
    : options;

  const originalPackageFilter = resolverOptions.packageFilter;

  return resolverOptions.defaultResolver(request, {
    ...resolverOptions,
    packageFilter: (pkg) => {
      const filteredPkg = originalPackageFilter ? originalPackageFilter(pkg) : pkg;
      if (filteredPkg.name === 'react-native') {
        delete filteredPkg.exports;
      }
      return filteredPkg;
    },
  });
};
