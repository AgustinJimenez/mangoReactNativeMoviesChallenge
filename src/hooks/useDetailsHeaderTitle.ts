import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLayoutEffect } from 'react';

import type { RootStackParamList } from '@/navigation/types';

// Detail screens start with a blank header (see navigation/screenOptions.ts)
// since they don't know the movie/show title until their query resolves.
// This swaps it in once available, instead of leaving the technical route
// name ("MovieDetails") showing.
export const useDetailsHeaderTitle = (title: string | undefined): void => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useLayoutEffect(() => {
    if (title) {
      navigation.setOptions({ title });
    }
  }, [navigation, title]);
};
