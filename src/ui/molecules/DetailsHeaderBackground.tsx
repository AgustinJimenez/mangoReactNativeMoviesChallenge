import { View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

// How far the user needs to scroll (in px) before the header background
// reaches its fully-tinted state — roughly Backdrop's own height (see
// BACKDROP_HEIGHT in Backdrop.tsx) so the tint finishes solidifying right
// around when the backdrop image itself scrolls out from under the header,
// rather than lagging behind or finishing early.
const TINT_SCROLL_DISTANCE = 150;
const MAX_TINT_OPACITY = 0.75;

type DetailsHeaderBackgroundProps = {
  scrollY: SharedValue<number>;
  // Resolved via useHeaderHeight() one level up in useMediaDetailsScreen.ts
  // rather than read here directly — that hook only works inside a real
  // navigator context, and DetailsTemplate (this component's parent) is
  // tested without one by design, matching every other template in this
  // app. Taking it as a plain prop keeps this component (and
  // DetailsTemplate) testable in isolation.
  headerHeight: number;
};

// Rendered as an absolutely-positioned sibling inside DetailsTemplate's own
// content, NOT via navigation.setOptions' headerBackground — that was the
// first approach here, but native-stack's headerBackground renders through
// the navigator's own native header bridge rather than the screen's normal
// React tree, and Reanimated's UI-thread scroll-driven updates didn't
// propagate through it reliably (the tint applied correctly once scrolling
// settled, but never visibly animated during an active scroll gesture).
//
// Still reads as "the header's background" despite living in the content
// layer: headerTransparent: true (see screenOptions.tsx) means the real
// native header has no background of its own and floats above this
// screen's content, so this sits directly behind the back/share buttons —
// sized to headerHeight so it lines up exactly, and pointerEvents="none" so
// it never intercepts touches meant for whatever's underneath it.
//
// The animated opacity lives on the outer Animated.View with no className,
// and the actual bg-black color on a plain inner View — putting both
// style={animatedStyle} and className on the same element has silently
// dropped className-derived styles elsewhere in this app (see
// SkeletonBlock.tsx / FavoriteButton.tsx / docs/planning.md).
//
// Every style — including the static position/size ones, not just
// opacity — has to come out of the single object useAnimatedStyle
// returns, rather than a style={[staticStyle, animatedStyle]} array.
// Mixing a plain style object with an animated one in an array silently
// dropped the plain object's properties here: the overlay never painted
// at all (confirmed with an opaque debug color) until every property
// moved into the one animated style object. zIndex/elevation are for
// Android specifically — this sits after the ScrollView in the JSX tree,
// but RefreshControl wraps the ScrollView's real content in its own
// AndroidSwipeRefreshLayout, which appears to get implicit elevation
// above plain siblings regardless of JSX order.
export const DetailsHeaderBackground = ({
  scrollY,
  headerHeight,
}: DetailsHeaderBackgroundProps) => {
  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: headerHeight,
    zIndex: 10,
    elevation: 10,
    opacity: interpolate(scrollY.value, [0, TINT_SCROLL_DISTANCE], [0, MAX_TINT_OPACITY], 'clamp'),
  }));

  return (
    <Animated.View style={animatedStyle} pointerEvents="none">
      <View className="flex-1 bg-black" />
    </Animated.View>
  );
};
