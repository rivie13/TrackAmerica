import React, { useState, useMemo } from 'react';
import { View, TextInput, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { STATE_INFO } from '@/lib/data/states';

interface StateSearchProps {
  /** Optional CSS class name for styling the container */
  className?: string;
}

interface SearchResult {
  code: string;
  name: string;
  displayName: string;
}

/**
 * StateSearch Component
 *
 * Provides an autocomplete search input to find and navigate to states.
 * Filters states by name or abbreviation in real-time.
 *
 * Features:
 * - Real-time filtering of states
 * - Search by state name or abbreviation
 * - Autocomplete suggestions dropdown
 * - Quick navigation to state detail page
 * - Works on web and mobile
 * - NativeWind/Tailwind styling
 */
export function StateSearch({ className }: StateSearchProps) {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Filter states based on search text
  const filteredStates = useMemo(() => {
    if (!searchText.trim()) return [];

    const query = searchText.toLowerCase().trim();
    const results: SearchResult[] = Object.values(STATE_INFO)
      .filter((state) => {
        const matchesName = state.displayName.toLowerCase().includes(query);
        const matchesCode = state.code.includes(query);
        return matchesName || matchesCode;
      })
      .map((state) => ({
        code: state.code,
        name: state.name,
        displayName: state.displayName,
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    return results;
  }, [searchText]);

  const handleSelectState = (stateCode: string) => {
    setSearchText('');
    setShowDropdown(false);
    router.push(`/${stateCode}` as any);
  };

  const handleClearSearch = () => {
    setSearchText('');
    setShowDropdown(false);
  };

  return (
    <Pressable onPress={() => setShowDropdown(false)} style={{ flex: 1 }}>
      <View className={`relative w-full ${className || ''}`}>
        {/* Search Input */}
        <View className="flex-row items-center bg-white rounded-lg border border-gray-300 px-4 py-3 shadow-sm">
          <Text className="text-gray-400 mr-2">🔍</Text>
          <TextInput
            placeholder="Search for a state..."
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              setShowDropdown(text.length > 0);
            }}
            onFocus={() => {
              if (searchText.length > 0) {
                setShowDropdown(true);
              }
            }}
            onBlur={() => {
              // Dont immediately close dropdown on blur - let Pressable handle selection
              // Dropdown will close after selection via handleSelectState
            }}
            className="flex-1 text-base text-gray-900"
            editable={true}
          />
          {searchText.length > 0 && (
            <Pressable onPress={handleClearSearch} hitSlop={10} className="ml-2">
              <Text className="text-gray-400 text-lg">✕</Text>
            </Pressable>
          )}
        </View>

        {/* Dropdown Results */}
        {showDropdown && filteredStates.length > 0 && (
          <View
            className="absolute top-14 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
            style={{ maxHeight: 300, overflow: 'hidden' }}
            pointerEvents="box-none"
          >
            {filteredStates.map((item) => (
              <Pressable
                key={item.code}
                onPress={() => handleSelectState(item.code)}
                hitSlop={10}
                pressRetentionOffset={20}
                className="px-4 py-4 border-b border-gray-100"
              >
                {({ pressed }) => (
                  <View style={{ backgroundColor: pressed ? '#f3f4f6' : 'transparent' }}>
                    <Text className="text-base text-gray-900">{item.displayName}</Text>
                    <Text className="text-sm text-gray-500 mt-1">{item.code.toUpperCase()}</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        )}

        {/* No Results Message */}
        {showDropdown && searchText.trim() && filteredStates.length === 0 && (
          <View className="absolute top-14 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg px-4 py-3">
            <Text className="text-gray-500">No states found</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
