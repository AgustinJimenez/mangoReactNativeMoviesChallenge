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
--force && rm -rf ~/.npm/_npx`. Don't also clear `~/.gradle/caches` (6-7GB) —
it's Gradle's own dependency/build cache, not project-local; wiping it makes
every subsequent build dramatically slower (full re-download/re-process)
instead of the few hundred MB the command above actually frees.

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

- **A flow's first `assertVisible` right after `launchApp` needs
  `extendedWaitUntil`, not a plain `assertVisible`, once list screens hide
  the native-stack header.** MoviesListScreen/TvListScreen/FavoritesScreen
  set `headerShown: false` and render their own title inside `ListTemplate`
  (see "Iconografía"/list-header section in `docs/planning.md`) — that text
  only exists after the JS bundle evaluates and React renders a frame,
  unlike a native header title which can paint before JS finishes loading.
  A bare `assertVisible: 'Movies'` right after `launchApp` is a real race on
  a cold Metro cache. Beyond that fix, a single flow run in isolation can
  still occasionally fail this same assertion even though the very next
  retry (and a screenshot taken at the failure instant) shows the text
  fully rendered — that's emulator/Maestro flakiness, not app state; retry
  once before treating it as a regression.

- **A `horizontal` `FlatList` with no bounded height silently stretches to
  fill whatever vertical space its flex ancestors leave available,** and
  neither `className="h-10"` nor a plain `style={{ height: 40 }}` directly
  on `<FlatList>` fixes it — confirmed with a debug `backgroundColor` in
  that same style object: the color applied, the height didn't. Whatever
  FlatList/VirtualizedList does internally with its own `style` resolution
  for the scroll container ignores height specifically. Fix: wrap it in a
  plain `<View style={{ height: N, overflow: 'hidden' }}>` — View reliably
  respects height, FlatList's own style prop doesn't. Also set
  `alignItems: 'center'` on `contentContainerStyle` for a horizontal
  chip/pill row like this — without it, each row item stretches to the
  row's cross-axis size by default, so `rounded-full` renders as a tall
  stadium shape instead of a pill once the row itself is
  however-many-hundred pixels tall from the bug above. (This particular
  row got redesigned into a dropdown — see `Select.tsx` — but the
  underlying FlatList-height gotcha is still real and will resurface
  wherever else a horizontal FlatList shows up.)

- **React "Encountered two children with the same key" warning in a
  paginated `FlatList`, intermittent, only after scrolling a few pages
  deep.** Cause: TMDB's `/discover` ranking can shift slightly between
  page fetches (worse once `sort_by`/`with_genres` are in play — plain
  `popularity.desc` on page 1 is more stable than e.g. `vote_average.desc`
  where many items tie), so the same item can land on two different pages
  of the same paginated request. `tmdbApi.ts`'s `merge` functions
  concatenated pages with a plain `.push(...newResponse.results)`, so a
  repeated id became a repeated React key. Fixed by `mergePaginatedResults`
  (shared by all four list/search endpoints), which drops any incoming
  item whose id is already in the cache before pushing.

- **Testing "offline" behavior by cutting network before `launchApp`/cold
  start doesn't work on a debug build.** A debug build's JS bundle loads
  from the Metro dev server over the network on launch — no network means
  no bundle, not "app launches and then hits the offline-cache path." To
  actually exercise offline UI (`OfflineBanner`, stale-data notices, cached
  reads), the app has to already be running with the bundle loaded, _then_
  cut network (wifi/data off, or `adb shell svc wifi disable` +
  `svc data disable`) while it's alive. `assembleRelease` (bundled JS,
  no Metro dependency) would sidestep this, but see the next entry.

- **`./gradlew assembleRelease` currently fails** with a Gradle
  task-graph/implicit-dependency validation error around
  `:app:createBundleReleaseJsAndAssets` — not an app-code issue, a build
  config gap. Don't reach for a release build as a workaround for
  something else (e.g. offline testing above) expecting it to just work;
  it needs its own fix first.

- **ESLint's `no-restricted-syntax` ternary ban covers _every_ ternary
  inside a JSX expression container (`{cond ? a : b}`), including ones
  where both branches are plain strings** — not just ones choosing between
  two JSX elements. Confirmed by lint output on `{hasOverview ? overview :
t('...')}` (both string-typed branches). Fix is the same either way:
  pull it out to a `const` above the `return` and reference the variable
  in JSX — a ternary in ordinary assignment position isn't inside a JSX
  expression container, so it's untouched by the rule.

- **`useAnimatedStyle`'s result mixed into a `style={[staticStyle, animatedStyle]}`
  array can silently drop the static object's properties** — confirmed on
  this Reanimated version: an `Animated.View` positioned/sized via a plain
  style object earlier in the array, with only `opacity` coming from
  `useAnimatedStyle`, rendered nothing at all (invisible — not dim, not
  mispositioned, genuinely absent) until every property, including the
  static position/size ones, moved into the single object
  `useAnimatedStyle` returns. Cost real time to isolate: opacity/color/
  z-index were all correct in inspection, the element just never painted.
  If an `Animated.View` isn't showing up and its animated style only sets
  one property, suspect this before anything else — merge everything into
  one `useAnimatedStyle` call rather than an array.

- **`headerBackground` (native-stack's `screenOptions`) doesn't propagate
  Reanimated UI-thread updates reliably.** A shared-value-driven tint set
  via `navigation.setOptions({ headerBackground: () => <AnimatedThing /> })`
  applied correctly once scrolling settled, but never visibly animated
  during an active scroll gesture — `headerBackground` renders through the
  navigator's own native header bridge, not the screen's normal React
  tree. Fix: render the animated piece as a plain absolutely-positioned
  sibling inside the screen's own content instead (sized via
  `useHeaderHeight()` from `@react-navigation/elements`, passed down as a
  prop rather than called from inside the animated component itself, so
  that component stays testable without a real navigator context). See
  `DetailsHeaderBackground.tsx` for the pattern.

- **A `RefreshControl`-wrapped `ScrollView`/`FlatList` can render above
  plain sibling views on Android regardless of JSX order.** On Android,
  `refreshControl` makes `ScrollView.js` clone the `RefreshControl` element
  as the actual root, wrapping the real scroll content — that wrapper
  (`AndroidSwipeRefreshLayout`) appears to carry implicit elevation above
  later plain siblings. A sibling meant to render on top of such a
  ScrollView needs explicit `zIndex`/`elevation` to be sure, even though
  normal RN sibling order would otherwise make that unnecessary.

- **Metro doesn't pick up `.env` changes on a plain app reload — it needs
  its own restart.** Force-stopping and relaunching the app (or a JS
  reload) keeps serving whatever `react-native-dotenv` baked in at the
  _first_ transform of `env.ts`/`@env`, even after the `.env` file's
  content genuinely changed on disk. Confirmed by fetching Metro's served
  bundle directly (`curl localhost:8081/index.bundle?platform=android...`)
  and grepping for `tmdbAccessToken` — it kept showing the old value
  through several force-stop+relaunch cycles. Fix: kill and restart the
  `react-native start` process itself (`--reset-cache` to be extra sure)
  whenever testing a `.env` value change, not just reload the app. Missing
  `TMDB_ACCESS_TOKEN` entirely (or an empty `.env`) is otherwise handled
  gracefully — `react-native-dotenv`'s `allowUndefined: true` default
  means no build error, requests just go out as `Bearer undefined`, TMDB
  replies 401, and the app already shows "Check your TMDB API key in the
  .env file" for exactly this case (verified live, not just from
  `errorState.unauthorized`'s code path).

## Environment specifics (this machine)

- Android SDK: `~/Library/Android/sdk` (not the Homebrew location — there
  was a duplicate install early on, since cleaned up). `adb`/emulator tools
  need `export PATH="$HOME/Library/Android/sdk/platform-tools:$PATH"` if
  not already on `PATH` in a given shell.
- No Xcode on this machine — iOS is unverified here (see README's known
  limitations). `npx react-native doctor` confirms current toolchain state
  if something seems off.
