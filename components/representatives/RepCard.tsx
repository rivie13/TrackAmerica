/**
 * RepCard Component
 *
 * Displays a single congressional representative (Senator or House member).
 * Tappable — navigates to the representative's detail screen.
 */

import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import type { CongressMember } from '@/lib/types';

interface RepCardProps {
  member: CongressMember;
}

const PARTY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  D: { bg: '#dbeafe', text: '#1d4ed8', label: 'Democrat' },
  R: { bg: '#fee2e2', text: '#b91c1c', label: 'Republican' },
  I: { bg: '#f3e8ff', text: '#7c3aed', label: 'Independent' },
};

function PartyBadge({ party }: { party: string }) {
  const colors = PARTY_COLORS[party] ?? { bg: '#f1f5f9', text: '#475569', label: party };
  return (
    <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.bg }}>
      <Text className="text-xs font-bold" style={{ color: colors.text }}>
        {colors.label}
      </Text>
    </View>
  );
}

/** Placeholder avatar when no photo is available */
function AvatarPlaceholder({ initials, party }: { initials: string; party: string }) {
  const colors = PARTY_COLORS[party] ?? { bg: '#e2e8f0', text: '#475569', label: party };
  return (
    <View
      className="w-16 h-16 rounded-full items-center justify-center"
      style={{ backgroundColor: colors.bg }}
    >
      <Text className="text-xl font-bold" style={{ color: colors.text }}>
        {initials}
      </Text>
    </View>
  );
}

export function RepCard({ member }: RepCardProps) {
  const router = useRouter();
  const initials = (member.firstName?.[0] ?? '') + (member.lastName?.[0] ?? '');

  const subtitle =
    member.chamber === 'Senate'
      ? `Senator · ${member.state}`
      : `District ${member.district ?? '?'} · ${member.state}`;

  function handlePress() {
    router.push(`/rep/${member.bioguideId}` as Parameters<typeof router.push>[0]);
  }

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row items-center bg-white rounded-2xl p-4 mb-3 border border-gray-100 active:opacity-70"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
      accessibilityRole="button"
      accessibilityLabel={`${member.firstName} ${member.lastName}, ${subtitle}`}
    >
      {/* Photo / Avatar */}
      <View className="mr-4">
        {member.photoUrl ? (
          <Image
            source={{ uri: member.photoUrl }}
            className="w-16 h-16 rounded-full bg-gray-100"
            resizeMode="cover"
          />
        ) : (
          <AvatarPlaceholder initials={initials} party={member.party} />
        )}
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
          {member.firstName} {member.lastName}
        </Text>
        <Text className="text-sm text-gray-500 mb-1.5" numberOfLines={1}>
          {subtitle}
        </Text>
        <PartyBadge party={member.party} />
      </View>

      {/* Chevron */}
      <Text className="text-gray-300 text-xl ml-2">›</Text>
    </Pressable>
  );
}
