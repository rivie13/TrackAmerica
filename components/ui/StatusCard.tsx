import { View, Text } from 'react-native';

type StatusCardProps = {
  message: string;
  variant?: 'success' | 'info' | 'warning' | 'error';
};

export function StatusCard({ message, variant = 'info' }: StatusCardProps) {
  const variantStyles = {
    success: 'bg-green-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  const bgColor = variantStyles[variant];

  return (
    <View className={`mt-6 p-4 ${bgColor} rounded-lg`}>
      <Text className="text-white font-bold text-lg text-center">{message}</Text>
    </View>
  );
}
