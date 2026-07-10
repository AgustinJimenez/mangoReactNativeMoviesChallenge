// @expo/vector-icons pulls in expo-font -> expo-modules-core, which needs
// native bindings Jest's Node environment doesn't have (same class of issue
// as expo-image, see __mocks__/expo-image.js). Every icon set resolves to a
// plain View rendering its props unmodified, so tests can still assert on
// the `name` prop (e.g. UNSAFE_getByProps({ name: 'star' })).
const React = require('react');
const { View } = require('react-native');

const MockIcon = (props) => React.createElement(View, props);

module.exports = new Proxy(
  {},
  {
    get: () => MockIcon,
  },
);
