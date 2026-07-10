import { Text, View } from 'react-native';

type EmptyStateProps = {
  message: string;
};

export const EmptyState = ({ message }: EmptyStateProps) => (
  <View className="flex-1 items-center justify-center bg-background p-lg">
    <Text className="text-center text-base text-textMuted">{message}</Text>
  </View>
);
