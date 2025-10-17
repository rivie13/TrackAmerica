import { View, ScrollView } from 'react-native';
import { PageTitle, Subtitle, USAMap } from '@/components';

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="items-center px-4 py-6">
        <PageTitle>TrackAmerica</PageTitle>
        <Subtitle>Click a state to view representatives</Subtitle>

        {/* Interactive USA Map */}
        <View className="w-full mt-6">
          <USAMap width="100%" height={500} />
        </View>
      </View>
    </ScrollView>
  );
}
