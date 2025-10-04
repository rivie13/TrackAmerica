import { View } from 'react-native';
import { PageTitle, Subtitle, StatusCard } from '@/components';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-white items-center justify-center px-4">
      <PageTitle>TrackAmerica</PageTitle>
      <Subtitle>Interactive USA Map Coming Soon</Subtitle>
      <StatusCard message="Setup Complete - Ready to Code" variant="success" />
    </View>
  );
}
