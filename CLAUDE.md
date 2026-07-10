# MangoMovies — notes for working in this repo

Full architecture reasoning (state management, navigation, styling, caching,
testing strategy, and why each choice was made) lives in
[`docs/planning.md`](docs/planning.md). This file is the shorter, "don't
re-debug this" companion — gotchas that cost real time to track down once
already, plus the verification workflow this repo expects.

## Verification workflow

Every change gets: `tsc --noEmit`, `eslint .`, `prettier --check .`, `jest`,
**then a real `./gradlew assembleDebug`** (check the literal exit code —
never trust a piped command's exit code, e.g. `... | tail` reports `tail`'s
exit code, not the build's), installed on the emulator, and visually/
interactively verified via `adb`. Type-checking and lint pass on code that
crashes on-device; only a real build + launch catches that. Disk space on
this machine runs chronically low — if a build fails with "No space left on
device", clean up before assuming it's a code problem:
`rm -rf android/app/build android/build android/app/.cxx && npm cache clean
--force && rm -rf ~/.npm/_npx`.

## Gotchas already paid for once

- **`fetch()` throws `ReferenceError: Property 'ReadableStream' doesn't
exist`, every call, silently.** Cause: `expo-image` transitively loads
  Expo's Winter runtime (`Expo.fx`), which replaces global `fetch` assuming
  `ReadableStream` already exists globally — Hermes doesn't provide it.
  Fixed once, in `polyfills.ts` (imported first thing in `index.js`). If a
  new expo-\* package gets added and this reappears, it's the same cause.

- **Adding an animation makes an element's _color_ silently stop updating
  (but state/logic is correct).** Cause: putting `style={animatedStyle}`
  (Reanimated) and `className` (NativeWind) on the _same_ element can drop
  the className-derived style. Fix: split it — put the animated transform
  on a wrapping `Animated.View` with no `className`, keep the
  color/typography styling on a plain, non-animated child. See
  `FavoriteButton.tsx` for the pattern.

- **Any `expo-*` package (expo-image, expo-font/@expo/vector-icons, ...)
  crashes Jest with `Cannot read properties of undefined (reading
'EventEmitter')`.** Cause: `expo-modules-core` reaches for native
  bindings Jest's Node environment doesn't have; no official mock exists
  short of adopting the whole `jest-expo` preset. Fix: add a manual mock in
  `__mocks__/` resolving the package to a plain RN component that forwards
  props, and wire it into `jest.config.js`'s `moduleNameMapper`. See
  `__mocks__/expo-image.js` and `__mocks__/vector-icons.js` for the pattern
  — copy it for the next expo-\* package.

- **`jest.config.js`'s `resolver` field replaces, not merges with,**
  `@react-native/jest-preset`'s own resolver. Setting it directly to some
  other package's resolver (e.g. `react-native-worklets/jest/resolver.js`,
  needed so Reanimated 4's worklets package doesn't try to load its real
  native module in tests) silently breaks RN's own package.json `exports`
  handling in _every_ test, with no obvious error pointing at the cause.
  Fix: compose both resolvers in one file (`jest/resolver.js`) instead of
  pointing `resolver` at just one of them.

- **New `expo-*` peer deps aren't always installed by `npm install
<package>`.** `@expo/vector-icons` needed `expo-font`, which itself
  needed `expo-asset` — neither surfaced until a real device build failed
  to resolve the module at bundle time (`tsc`/`jest` didn't catch it, since
  nothing type-checks or mocks-out the missing module). When adding a new
  expo-\* package, do a real build before considering it done, and pin the
  peer to the same SDK line as the other expo-\* deps already in
  `package.json` (currently `~56.0.0`).

- **`maestro test .maestro/` (whole directory) is flaky, individual flow
  files are not.** All four flows share the same `appId`; pointing Maestro
  at the directory runs them concurrently against the one emulator, racing
  each other for the same app instance. Run flows one at a time (a shell
  loop), both locally and in CI — see the README's testing section.

## Environment specifics (this machine)

- Android SDK: `~/Library/Android/sdk` (not the Homebrew location — there
  was a duplicate install early on, since cleaned up). `adb`/emulator tools
  need `export PATH="$HOME/Library/Android/sdk/platform-tools:$PATH"` if
  not already on `PATH` in a given shell.
- No Xcode on this machine — iOS is unverified here (see README's known
  limitations). `npx react-native doctor` confirms current toolchain state
  if something seems off.
