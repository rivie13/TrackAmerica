import { Text, TextProps } from 'react-native';

type SubtitleProps = TextProps & {
  children: string;
};

export function Subtitle({ children, className = '', ...props }: SubtitleProps) {
  return (
    <Text className={`text-lg text-gray-600 mb-6 ${className}`} {...props}>
      {children}
    </Text>
  );
}
