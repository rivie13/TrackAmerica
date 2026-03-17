/**
 * Representative Detail Screen
 * Route: /(states)/rep/[bioguideId]
 * Accessible via /rep/A000374 etc.
 *
 * Shows bio, contact info, and sponsored legislation for a single member.
 */

import React from 'react';
import { ScrollView, View, Text, Image, Pressable, Linking, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';

import { useMemberDetails, useSponsoredLegislation } from '@/lib/hooks/useCongress';
import type { SponsoredBill, CongressMemberDetail } from '@/lib/types';

// ── Party colours ────────────────────────────────────────────────
const PARTY_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  D: { bg: '#dbeafe', border: '#3b82f6', text: '#1d4ed8', label: 'Democrat' },
  R: { bg: '#fee2e2', border: '#ef4444', text: '#b91c1c', label: 'Republican' },
  I: { bg: '#f3e8ff', border: '#a855f7', text: '#7c3aed', label: 'Independent' },
};

function partyColors(party: string) {
  return PARTY_COLORS[party] ?? { bg: '#f1f5f9', border: '#94a3b8', text: '#475569', label: party };
}

// ── Sub-components ───────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row py-2.5 border-b border-gray-100">
      <Text className="text-sm text-gray-500 w-28 shrink-0">{label}</Text>
      <Text className="text-sm text-gray-800 flex-1">{value}</Text>
    </View>
  );
}

function BillItem({ bill }: { bill: SponsoredBill }) {
  const typeLabel = bill.type.toUpperCase();
  const billLabel = `${typeLabel} ${bill.number}`;
  const date = bill.introducedDate
    ? new Date(bill.introducedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <View className="mb-3 bg-gray-50 rounded-xl p-4">
      <View className="flex-row items-center mb-1.5">
        <View className="bg-blue-100 rounded px-2 py-0.5 mr-2">
          <Text className="text-xs font-bold text-blue-700">{billLabel}</Text>
        </View>
        {date ? <Text className="text-xs text-gray-400">{date}</Text> : null}
      </View>
      <Text className="text-sm text-gray-800 font-medium" numberOfLines={3}>
        {bill.title}
      </Text>
      {bill.latestAction?.text ? (
        <Text className="text-xs text-gray-500 mt-1.5" numberOfLines={2}>
          Latest: {bill.latestAction.text}
        </Text>
      ) : null}
      {bill.policyArea ? (
        <View className="mt-1.5 self-start bg-slate-100 rounded px-2 py-0.5">
          <Text className="text-xs text-slate-600">{bill.policyArea}</Text>
        </View>
      ) : null}
    </View>
  );
}

function MemberHeader({ member }: { member: CongressMemberDetail }) {
  const pc = partyColors(member.party);
  const subtitle =
    member.chamber === 'Senate'
      ? `US Senator · ${member.state}`
      : `House District ${member.district ?? '?'} · ${member.state}`;

  // Find the most recent term dates
  const lastTerm = member.terms[member.terms.length - 1];
  const since = lastTerm?.startYear ? `Since ${lastTerm.startYear}` : null;

  return (
    <View className="items-center px-6 pb-6 pt-4">
      {member.photoUrl ? (
        <Image
          source={{ uri: member.photoUrl }}
          className="w-28 h-28 rounded-full bg-gray-100 mb-4"
          resizeMode="cover"
        />
      ) : (
        <View
          className="w-28 h-28 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: pc.bg, borderWidth: 3, borderColor: pc.border }}
        >
          <Text className="text-4xl font-bold" style={{ color: pc.text }}>
            {(member.firstName?.[0] ?? '') + (member.lastName?.[0] ?? '')}
          </Text>
        </View>
      )}

      <Text className="text-2xl font-bold text-gray-900 text-center">
        {member.honorificName ? `${member.honorificName} ` : ''}
        {member.firstName} {member.lastName}
      </Text>
      <Text className="text-base text-gray-500 mt-1 text-center">{subtitle}</Text>
      <View className="flex-row items-center gap-2 mt-3">
        <View className="px-3 py-1 rounded-full" style={{ backgroundColor: pc.bg }}>
          <Text className="text-sm font-bold" style={{ color: pc.text }}>
            {pc.label}
          </Text>
        </View>
        {since && (
          <View className="px-3 py-1 rounded-full bg-gray-100">
            <Text className="text-sm text-gray-600">{since}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ── Main screen ──────────────────────────────────────────────────

export default function RepDetailScreen() {
  const { bioguideId } = useLocalSearchParams<{ bioguideId: string }>();

  const {
    data: member,
    isLoading: memberLoading,
    isError: memberError,
    error: memberErr,
  } = useMemberDetails(bioguideId);

  const { data: bills, isLoading: billsLoading } = useSponsoredLegislation(bioguideId, 20);

  const screenTitle = member
    ? `${member.firstName} ${member.lastName}`
    : memberLoading
      ? 'Loading…'
      : 'Representative';

  return (
    <>
      <Stack.Screen options={{ title: screenTitle }} />

      {/* Loading state */}
      {memberLoading && (
        <View className="flex-1 bg-white items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-gray-400 text-sm mt-3">Loading representative…</Text>
        </View>
      )}

      {/* Error state */}
      {memberError && (
        <View className="flex-1 bg-white items-center justify-center px-6">
          <Text className="text-red-600 font-semibold text-lg mb-2">Failed to load</Text>
          <Text className="text-gray-500 text-sm text-center">
            {memberErr instanceof Error ? memberErr.message : 'Unknown error'}
          </Text>
          <Text className="text-gray-400 text-xs mt-2 text-center">
            Check that EXPO_PUBLIC_CONGRESS_API_KEY is set in your .env
          </Text>
        </View>
      )}

      {/* Loaded */}
      {member && (
        <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Photo + name + party header */}
          <View
            className="border-b border-gray-100"
            style={{ backgroundColor: partyColors(member.party).bg + '40' }}
          >
            <MemberHeader member={member} />
          </View>

          <View className="px-4 pt-5">
            {/* Contact & Info */}
            <Text className="text-base font-bold text-gray-800 mb-2">Contact & Info</Text>
            <View className="bg-white rounded-2xl border border-gray-100 px-4 mb-6">
              {member.officeAddress && <InfoRow label="Office" value={member.officeAddress} />}
              {member.phoneNumber && <InfoRow label="Phone" value={member.phoneNumber} />}
              <InfoRow
                label="Chamber"
                value={member.chamber === 'Senate' ? 'US Senate' : 'US House of Representatives'}
              />
              {member.district !== undefined && (
                <InfoRow label="District" value={String(member.district)} />
              )}
              <InfoRow label="State" value={member.state} />
              {member.terms.length > 0 && (
                <InfoRow label="First elected" value={String(member.terms[0].startYear)} />
              )}
            </View>

            {/* Official website */}
            {member.officialWebsiteUrl && (
              <Pressable
                onPress={() => Linking.openURL(member.officialWebsiteUrl!)}
                className="bg-blue-600 rounded-2xl py-3.5 items-center mb-6 active:opacity-80"
                accessibilityRole="link"
                accessibilityLabel="Visit official website"
              >
                <Text className="text-white font-semibold text-base">Official Website ↗</Text>
              </Pressable>
            )}

            {/* Sponsored Legislation */}
            <Text className="text-base font-bold text-gray-800 mb-2">Sponsored Legislation</Text>
            <Text className="text-sm text-gray-500 mb-4">
              Most recent bills introduced by this member
            </Text>

            {billsLoading && (
              <View className="items-center py-8">
                <ActivityIndicator size="small" color="#3b82f6" />
                <Text className="text-gray-400 text-xs mt-2">Loading bills…</Text>
              </View>
            )}

            {bills &&
              bills.length > 0 &&
              bills.map((bill, index) => (
                <BillItem key={bill.url || `bill-${index}`} bill={bill} />
              ))}

            {bills && bills.length === 0 && (
              <Text className="text-gray-400 text-sm text-center py-4">
                No sponsored legislation found
              </Text>
            )}

            {/* Attribution */}
            <Text className="text-xs text-gray-400 text-center mt-6">
              Data from Congress.gov API
            </Text>
          </View>
        </ScrollView>
      )}
    </>
  );
}
