import NetInfo from '@react-native-community/netinfo';
import { cssInterop } from 'nativewind';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Animated, { SlideInDown, SlideOutUp } from 'react-native-reanimated';

// Same reasoning as expo-image/Poster.tsx: Reanimated's Animated.View/Text
// aren't primitives NativeWind wraps automatically.
cssInterop(Animated.View, { className: 'style' });
cssInterop(Animated.Text, { className: 'style' });

// Mounted once near the root (see app/App.tsx) so it's visible regardless of
// which tab/screen the user is on, rather than duplicated per screen.
export const OfflineBanner = () => {
  const { t } = useTranslation();
  const [isConnected, setIsConnected] = useState(true);

  // react-doctor false positive: NetInfo.addEventListener returns an
  // unsubscribe function directly, and returning that call's result from
  // useEffect IS valid cleanup (React calls it on unmount) — equivalent to
  // `return () => unsubscribe()`, just without the extra wrapper. The rule's
  // pattern-matcher only recognizes the explicit-arrow-function form.
  // react-doctor-disable-next-line react-doctor/effect-needs-cleanup
  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
    });
  }, []);

  if (isConnected) {
    return null;
  }

  return (
    <Animated.View entering={SlideInDown} exiting={SlideOutUp} className="bg-danger px-md py-xs">
      <Animated.Text className="text-center text-xs font-semibold text-text">
        {t('offlineBanner.message')}
      </Animated.Text>
    </Animated.View>
  );
};
