import { Text, View } from 'react-native';

type BadgeProps = {
  label: string;
};

export const Badge = ({ label }: BadgeProps) => (
  <View className="rounded-full bg-surface px-sm py-xs">
    <Text className="text-xs font-semibold text-text">{label}</Text>
  </View>
);
