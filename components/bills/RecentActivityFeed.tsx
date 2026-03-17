import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Pressable, Linking } from 'react-native';

import { fetchRecentBills } from '@/lib/services/congress';
import type { RecentBill } from '@/lib/types';

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function ChamberBadge({ chamber }: { chamber: 'House' | 'Senate' }) {
  const isHouse = chamber === 'House';
  return (
    <View
      style={{
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: isHouse ? '#dbeafe' : '#fce7f3',
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          fontSize: 10,
          fontWeight: '700',
          color: isHouse ? '#1d4ed8' : '#9d174d',
          letterSpacing: 0.4,
        }}
      >
        {isHouse ? 'HOUSE' : 'SENATE'}
      </Text>
    </View>
  );
}

function BillItem({ bill }: { bill: RecentBill }) {
  const billLabel = `${bill.type} ${bill.number}`;

  return (
    <Pressable
      onPress={() => bill.url && Linking.openURL(bill.url)}
      style={({ pressed }) => ({
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        backgroundColor: pressed ? '#f8fafc' : '#ffffff',
      })}
    >
      {/* Top row: chamber badge + bill number + date */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 }}>
        <ChamberBadge chamber={bill.originChamber} />
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151' }}>{billLabel}</Text>
        {bill.latestAction?.actionDate ? (
          <Text style={{ fontSize: 11, color: '#9ca3af', marginLeft: 'auto' }}>
            {formatDate(bill.latestAction.actionDate)}
          </Text>
        ) : null}
      </View>

      {/* Bill title */}
      <Text
        numberOfLines={2}
        style={{
          fontSize: 13,
          color: '#111827',
          fontWeight: '500',
          lineHeight: 19,
          marginBottom: 5,
        }}
      >
        {bill.title}
      </Text>

      {/* Latest action text */}
      {bill.latestAction?.text ? (
        <Text numberOfLines={1} style={{ fontSize: 11, color: '#6b7280', lineHeight: 16 }}>
          {bill.latestAction.text}
        </Text>
      ) : null}

      {/* Policy area tag */}
      {bill.policyArea ? (
        <View style={{ marginTop: 6 }}>
          <Text
            style={{
              fontSize: 10,
              color: '#6366f1',
              backgroundColor: '#eef2ff',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 3,
              alignSelf: 'flex-start',
              fontWeight: '600',
            }}
          >
            {bill.policyArea}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function RecentActivityFeed() {
  const [bills, setBills] = useState<RecentBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentBills(10)
      .then((data) => {
        setBills(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch recent bills:', err);
        setError('Could not load recent activity.');
        setLoading(false);
      });
  }, []);

  return (
    <View
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#1e3a5f',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      }}
    >
      {/* Section header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#f1f5f9',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <View
            style={{
              width: 4,
              height: 20,
              borderRadius: 2,
              backgroundColor: '#c53030',
              marginRight: 8,
            }}
          />
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#111827' }}>
            Recent Congressional Activity
          </Text>
        </View>
        <Text style={{ fontSize: 13, color: '#6b7280', marginLeft: 12 }}>
          Latest bills from the 119th Congress
        </Text>
      </View>

      {/* Content */}
      {loading ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#1e3a5f" />
          <Text style={{ marginTop: 10, fontSize: 13, color: '#9ca3af' }}>Loading bills...</Text>
        </View>
      ) : error ? (
        <View style={{ paddingVertical: 32, paddingHorizontal: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 14, color: '#ef4444', textAlign: 'center' }}>{error}</Text>
        </View>
      ) : (
        bills.map((bill, i) => <BillItem key={`${bill.type}-${bill.number}-${i}`} bill={bill} />)
      )}
    </View>
  );
}
