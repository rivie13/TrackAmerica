import { View, ScrollView } from 'react-native';
import { PageTitle, Subtitle, USAMap, StateSearch, SmallStateButtons } from '@/components';

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-white" scrollEnabled={true} nestedScrollEnabled={true}>
      <View className="items-center px-4 py-6">
        <PageTitle>TrackAmerica</PageTitle>
        <Subtitle>Click a state to view representatives</Subtitle>

        {/* State Search Bar - higher z-index to appear above map */}
        <View className="w-full mt-6 z-50">
          <StateSearch />
        </View>

        {/* Small State Buttons - Quick access to hard-to-click states */}
        <View className="w-full mt-6">
          <SmallStateButtons />
        </View>

        {/* Interactive USA Map */}
        <View className="w-full mt-6 z-10">
          <USAMap width="100%" height={500} />
        </View>
      </View>
    </ScrollView>
  );
}
