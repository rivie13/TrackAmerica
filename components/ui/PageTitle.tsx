import { Text, TextProps } from 'react-native';

type PageTitleProps = TextProps & {
  children: string;
};

export function PageTitle({ children, className = '', ...props }: PageTitleProps) {
  return (
    <Text className={`text-3xl font-bold mb-2 ${className}`} {...props}>
      {children}
    </Text>
  );
}
