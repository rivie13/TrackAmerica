import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type ViewMode = 'districts' | 'senators';

interface ViewSelectorProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewSelector({ activeView, onViewChange }: ViewSelectorProps) {
  return (
    <View className="flex-row justify-around bg-white border-b border-gray-200 py-3">
      <ViewButton
        label="Representatives"
        active={activeView === 'districts'}
        onPress={() => onViewChange('districts')}
      />
      <ViewButton
        label="Senators"
        active={activeView === 'senators'}
        onPress={() => onViewChange('senators')}
      />
    </View>
  );
}

interface ViewButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function ViewButton({ label, active, onPress }: ViewButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-6 py-2 rounded-lg ${active ? 'bg-blue-600' : 'bg-gray-100'}`}
    >
      <Text className={`font-semibold ${active ? 'text-white' : 'text-gray-700'}`}>{label}</Text>
    </TouchableOpacity>
  );
}
