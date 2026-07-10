import { memo } from 'react';
import { Text, View } from 'react-native';

type BadgeProps = {
  label: string;
};

// Memoized: rendered once per genre in MediaDetailsHeader's horizontal FlatList.
export const Badge = memo(({ label }: BadgeProps) => (
  <View className="rounded-full bg-surface px-sm py-xs">
    <Text className="text-xs font-semibold text-text">{label}</Text>
  </View>
));
