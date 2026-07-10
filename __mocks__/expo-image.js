const { Image } = require('react-native');

// expo-modules-core (a transitive dependency of expo-image) reaches for
// native EventEmitter bindings that don't exist in the Jest/Node
// environment — there's no official mock for it short of adopting the whole
// jest-expo preset. Since component tests only need *something* renderable
// named `Image`, not real image loading, this substitutes RN's core Image.
module.exports = {
  Image,
};
