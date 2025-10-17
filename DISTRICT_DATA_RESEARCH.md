# Congressional District & County Data - Implementation Plan

**Date:** October 5, 2025  
**Purpose:** Plan for state detail page with three view modes: Districts (House Reps), Senators (statewide), and Counties (future state/local reps)

---

## ✅ What We Already Have

**Counties Data:** `assets/maps/counties-albers-10m.json` ✅
- TopoJSON format with all US counties
- Properties: `id` (FIPS code), `name` (county name)
- Ready to use with our existing map infrastructure

**States Data:** `assets/maps/states-albers-10m.json` ✅
- Already using this for USAMap component
- Need to extend for state senator view

---

## 🎯 User Experience Design

### State Detail Page Flow
When user clicks a state (e.g., Pennsylvania):

```
┌─────────────────────────────────┐
│     Pennsylvania Header          │
│     (with back button)           │
├─────────────────────────────────┤
│  View Selector (Tabs/Buttons):  │
│  [ Districts ] [ Senators ] [ Counties ] │
├─────────────────────────────────┤
│                                 │
│     Map View (changes based     │
│     on selected tab)            │
│                                 │
│  - Districts: Show 17 districts │
│  - Senators: Show whole state   │
│  - Counties: Show 67 counties   │
│                                 │
└─────────────────────────────────┘
```

### Three View Modes:

1. **Districts View (House Representatives)** - Default
   - Show congressional districts for the state
   - Color by party (R/D/I)
   - Click district → representative detail page
   
2. **Senators View (Statewide)**
   - Show entire state shape
   - Display both senators' info
   - Color by majority party or split color if different parties
   
3. **Counties View** - Future feature
   - Show all counties in state
   - Color by presidential election results (2020/2024)
   - Click county → local representatives (future)

---

## Summary of Data Sources & Strategy

After extensive research, here's the **recommended approach** based on user requirements:

### 1. **Congressional Districts** (House Reps)
- **Source:** [unitedstates/districts](https://github.com/unitedstates/districts) (public domain, CC0)
- **Format:** GeoJSON → Convert to TopoJSON for smaller size
- **Coverage:** Current districts (2012-present, covers 118th-119th Congress)
- **URL Pattern:** `https://theunitedstates.io/districts/cds/2012/{STATE}-{DISTRICT}/shape.geojson`
  - Example: `https://theunitedstates.io/districts/cds/2012/PA-1/shape.geojson`
  - At-large districts use `0`: `WY-0`, `AK-0`
- **Political Data:** Congress.gov API (future implementation)
  - `/member` endpoint for current House members
  - Match by state + district number
  - Auto-updates (no manual maintenance)

### 2. **Counties** (Local Reps - Future)
- **Geographic Data:** ✅ **ALREADY HAVE IT!** `assets/maps/counties-albers-10m.json`
  - TopoJSON format with all US counties
  - Properties: FIPS code (`id`), county name (`name`)
- **Political Data:** [tonmcg/US_County_Level_Election_Results_08-20](https://github.com/tonmcg/US_County_Level_Election_Results_08-20)
  - Presidential election results by county (2008-2020, will need 2024 update)
  - Use to color counties by winning party
  - Download and process into `lib/data/county-results.ts`

### 3. **Senators** (Statewide)
- **Geographic Data:** ✅ **ALREADY HAVE IT!** `assets/maps/states-albers-10m.json`
  - Just need to render single state shape
- **Political Data:** Congress.gov API (future implementation)
  - `/member` endpoint filtered by Senate + state
  - Each state has 2 senators
  - Color state by majority party or split indicator

---

## 📋 Implementation Phases

### **Phase 1: Foundation & Data Preparation** (Do Now)

#### 1.1 Download District GeoJSON Files
```bash
# Create directory structure
mkdir -p assets/maps/districts

# Script to download all states' districts
# Example: Pennsylvania has 17 districts (PA-1 through PA-17)
for i in {1..17}; do
  curl "https://theunitedstates.io/districts/cds/2012/PA-$i/shape.geojson" \
    -o "assets/maps/districts/PA-$i.geojson"
done

# Do this for all 50 states (we can automate this)
```

#### 1.2 Convert Districts to TopoJSON (Smaller Size)
```bash
# Install topojson CLI tools (if not already)
npm install -g topojson

# Convert all PA districts to single TopoJSON file
npx geo2topo \
  assets/maps/districts/PA-*.geojson \
  > assets/maps/districts/PA-districts.topojson

# Result: One file per state with all districts
# - PA-districts.topojson (Pennsylvania)
# - CA-districts.topojson (California)
# - TX-districts.topojson (Texas)
# etc.
```

#### 1.3 Download County Election Results
```bash
# Clone or download tonmcg repo data
# https://github.com/tonmcg/US_County_Level_Election_Results_08-20

# Create lib/data/county-election-results.ts
# Process CSV/JSON into TypeScript format:
interface CountyElectionResult {
  fips: string;          // "42003" (Allegheny County, PA)
  state: string;         // "PA"
  county: string;        // "Allegheny"
  year: number;          // 2020
  winner: 'R' | 'D' | 'O';
  demVotes: number;
  repVotes: number;
  otherVotes: number;
  margin: number;        // Percentage point difference
}
```

#### 1.4 Create Data Modules (Placeholder for Future API)

**`lib/data/districts.ts`** - District metadata
```typescript
export interface DistrictInfo {
  state: string;      // "PA"
  district: number;   // 1
  fips: string;       // State FIPS + district (for matching)
  // Political data (will come from Congress.gov API later):
  representative?: string;
  party?: 'R' | 'D' | 'I';
  lastUpdated?: string;
}

// Helper to get district count per state
export const STATE_DISTRICT_COUNTS: Record<string, number> = {
  al: 7, ak: 1, az: 9, ar: 4, ca: 52, co: 8, ct: 5,
  de: 1, fl: 28, ga: 14, hi: 2, id: 2, il: 17, in: 9,
  // ... all 50 states
  pa: 17, // Pennsylvania has 17 districts
  // ...
};

export function getDistrictsForState(stateCode: string): number[] {
  const count = STATE_DISTRICT_COUNTS[stateCode.toLowerCase()];
  return Array.from({ length: count }, (_, i) => i + 1);
}

// TODO: Future - fetch from Congress.gov API
export async function getDistrictPoliticalData(state: string, district: number) {
  // Placeholder - will call Congress.gov API
  // For now, return null (render without party colors)
  return null;
}
```

**`lib/data/county-results.ts`** - County election data
```typescript
import type { CountyElectionResult } from './types';

// Processed from tonmcg repo
export const COUNTY_RESULTS_2020: Record<string, CountyElectionResult> = {
  '42003': { // Allegheny County, PA (Pittsburgh)
    fips: '42003',
    state: 'PA',
    county: 'Allegheny',
    year: 2020,
    winner: 'D',
    demVotes: 596805,
    repVotes: 336350,
    otherVotes: 15234,
    margin: 19.4, // D+19.4
  },
  // ... 3000+ counties
};

export function getCountyResult(fips: string): CountyElectionResult | null {
  return COUNTY_RESULTS_2020[fips] || null;
}

export function getCountyColor(fips: string): { fill: string; stroke: string } {
  const result = getCountyResult(fips);
  if (!result) return { fill: '#e5e7eb', stroke: '#d1d5db' }; // Gray (no data)
  
  if (result.winner === 'D') return { fill: '#2563eb', stroke: '#1e40af' }; // Blue
  if (result.winner === 'R') return { fill: '#dc2626', stroke: '#991b1b' }; // Red
  return { fill: '#9333ea', stroke: '#6b21a8' }; // Purple (other/close)
}
```

---

### **Phase 2: Build View Components** (UI Implementation)

#### 2.1 Create Tab Selector Component
**`components/ui/ViewSelector.tsx`**
```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type ViewMode = 'districts' | 'senators' | 'counties';

interface ViewSelectorProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewSelector({ activeView, onViewChange }: ViewSelectorProps) {
  return (
    <View className="flex-row justify-around bg-white border-b border-gray-200 py-3">
      <ViewButton 
        label="Districts" 
        active={activeView === 'districts'} 
        onPress={() => onViewChange('districts')}
      />
      <ViewButton 
        label="Senators" 
        active={activeView === 'senators'} 
        onPress={() => onViewChange('senators')}
      />
      <ViewButton 
        label="Counties" 
        active={activeView === 'counties'} 
        onPress={() => onViewChange('counties')}
        disabled={true} // Future feature
      />
    </View>
  );
}

function ViewButton({ label, active, onPress, disabled }: {
  label: string;
  active: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`px-6 py-2 rounded-lg ${
        active ? 'bg-blue-600' : 'bg-gray-100'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <Text className={`font-semibold ${active ? 'text-white' : 'text-gray-700'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
```

#### 2.2 Create District Map Component
**`components/map/DistrictMap.tsx`**
```typescript
import React, { useState } from 'react';
import { View, Dimensions } from 'react-native';
import { Svg, Path, G } from 'react-native-svg';
import { feature } from 'topojson-client';
import { getDistrictsForState } from '@/lib/data/districts';
import { geoPath, createViewBox } from '@/lib/utils/map-geometry';

interface DistrictMapProps {
  stateCode: string; // "pa", "ca", etc.
  onDistrictPress: (districtNumber: number) => void;
}

export function DistrictMap({ stateCode, onDistrictPress }: DistrictMapProps) {
  const [hoveredDistrict, setHoveredDistrict] = useState<number | null>(null);
  const { width } = Dimensions.get('window');

  // Load districts TopoJSON for this state
  const districtsData = require(`@/assets/maps/districts/${stateCode.toUpperCase()}-districts.topojson`);
  const districts = feature(districtsData, districtsData.objects.districts);

  return (
    <View className="flex-1 items-center justify-center bg-gray-50">
      <Svg width={width} height={width * 0.8} viewBox={createViewBox(/* ... */)}>
        <G>
          {districts.features.map((district, index) => {
            const districtNum = district.properties.DISTRICT; // From GeoJSON
            const isHovered = hoveredDistrict === districtNum;
            
            // TODO: Get party color from Congress.gov API (future)
            const colors = { fill: '#d1d5db', stroke: '#9ca3af' }; // Gray for now

            return (
              <Path
                key={districtNum}
                d={geoPath(district.geometry)}
                fill={isHovered ? '#60a5fa' : colors.fill}
                stroke={colors.stroke}
                strokeWidth={1}
                onPressIn={() => onDistrictPress(districtNum)}
                onMouseEnter={() => setHoveredDistrict(districtNum)}
                onMouseLeave={() => setHoveredDistrict(null)}
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
}
```

#### 2.3 Create County Map Component
**`components/map/CountyMap.tsx`**
```typescript
import React, { useState } from 'react';
import { View, Dimensions } from 'react-native';
import { Svg, Path, G } from 'react-native-svg';
import { feature } from 'topojson-client';
import { getCountyColor } from '@/lib/data/county-results';
import { geoPath } from '@/lib/utils/map-geometry';

interface CountyMapProps {
  stateCode: string;
  onCountyPress?: (fips: string) => void;
}

export function CountyMap({ stateCode, onCountyPress }: CountyMapProps) {
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
  const { width } = Dimensions.get('window');

  // Load counties from existing TopoJSON
  const countiesData = require('@/assets/maps/counties-albers-10m.json');
  const allCounties = feature(countiesData, countiesData.objects.counties);
  
  // Filter to just this state's counties (FIPS code starts with state FIPS)
  const stateFips = getStateFipsCode(stateCode); // "42" for PA
  const stateCounties = allCounties.features.filter(county =>
    county.id.startsWith(stateFips)
  );

  return (
    <View className="flex-1 items-center justify-center bg-gray-50">
      <Svg width={width} height={width * 0.8}>
        <G>
          {stateCounties.map((county) => {
            const fips = county.id;
            const isHovered = hoveredCounty === fips;
            const colors = getCountyColor(fips); // Red/Blue by election results

            return (
              <Path
                key={fips}
                d={geoPath(county.geometry)}
                fill={isHovered ? '#60a5fa' : colors.fill}
                stroke={colors.stroke}
                strokeWidth={0.5}
                onPressIn={() => onCountyPress?.(fips)}
                onMouseEnter={() => setHoveredCounty(fips)}
                onMouseLeave={() => setHoveredCounty(null)}
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
}
```

#### 2.4 Update State Detail Page
**`app/(states)/[code].tsx`**
```typescript
import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { ViewSelector } from '@/components/ui/ViewSelector';
import { DistrictMap } from '@/components/map/DistrictMap';
import { CountyMap } from '@/components/map/CountyMap';
import { getStateInfo } from '@/lib/data/states';

type ViewMode = 'districts' | 'senators' | 'counties';

export default function StateDetailPage() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const [viewMode, setViewMode] = useState<ViewMode>('districts');
  
  const stateInfo = getStateInfo(code);
  if (!stateInfo) return <Text>State not found</Text>;

  const handleDistrictPress = (districtNum: number) => {
    router.push(`/${code}/district/${districtNum}`);
  };

  return (
    <>
      <Stack.Screen options={{ title: stateInfo.displayName }} />
      <ScrollView className="flex-1 bg-white">
        {/* View Mode Selector */}
        <ViewSelector activeView={viewMode} onViewChange={setViewMode} />

        {/* Conditional Map Rendering */}
        {viewMode === 'districts' && (
          <DistrictMap stateCode={code} onDistrictPress={handleDistrictPress} />
        )}

        {viewMode === 'senators' && (
          <View className="p-4">
            {/* TODO: Show state map + senator info cards */}
            <Text>Senators view - Coming soon</Text>
          </View>
        )}

        {viewMode === 'counties' && (
          <CountyMap stateCode={code} />
        )}

        {/* State Info Section (below map) */}
        <View className="p-4">
          <Text className="text-lg font-semibold">
            {stateInfo.displayName} Information
          </Text>
          {/* TODO: Add state statistics, links, etc. */}
        </View>
      </ScrollView>
    </>
  );
}
```

---

### **Phase 3: API Integration (Future)** - Prepare but Don't Implement Yet

#### 3.1 Backend API Endpoints (Planned)
```typescript
// api/routes/members.ts
import express from 'express';
import { CongressService } from '../services/congress';

const router = express.Router();
const congressService = new CongressService();

// Get all House members for a state
router.get('/house/:state', async (req, res) => {
  const { state } = req.params;
  const members = await congressService.getHouseMembers(state);
  res.json(members);
});

// Get senators for a state
router.get('/senate/:state', async (req, res) => {
  const { state } = req.params;
  const senators = await congressService.getSenators(state);
  res.json(senators);
});

export default router;
```

#### 3.2 Congress.gov Service (Planned)
```typescript
// api/services/congress.ts
import { PrismaClient } from '@prisma/client';

interface CongressMember {
  bioguideId: string;
  name: string;
  party: 'R' | 'D' | 'I';
  state: string;
  district?: number; // For House members
  chamber: 'House' | 'Senate';
  imageUrl?: string;
}

export class CongressService {
  private prisma = new PrismaClient();
  private apiKey = process.env.CONGRESS_API_KEY!;

  async getHouseMembers(state: string): Promise<CongressMember[]> {
    // 1. Check cache (database)
    const cached = await this.prisma.representative.findMany({
      where: { state, chamber: 'House' }
    });

    if (cached.length > 0 && this.isCacheFresh(cached[0].updatedAt)) {
      return cached.map(this.mapToCongressMember);
    }

    // 2. Fetch from Congress.gov API
    const response = await fetch(
      `https://api.congress.gov/v3/member?currentMember=true&limit=250`,
      { headers: { 'X-API-Key': this.apiKey } }
    );
    const data = await response.json();

    // 3. Filter to House members for this state
    const members = data.members
      .filter((m: any) => m.state === state && m.chamber === 'House')
      .map(this.mapApiResponse);

    // 4. Update cache
    await this.updateCache(members);

    return members;
  }

  // Similar for getSenators()
  async getSenators(state: string): Promise<CongressMember[]> {
    // ... (similar pattern)
  }

  private isCacheFresh(updatedAt: Date): boolean {
    // Consider cache fresh if updated within last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return updatedAt > weekAgo;
  }
}
```

#### 3.3 Database Schema Addition (Planned)
```prisma
// prisma/schema.prisma

model Representative {
  id          String   @id @default(cuid())
  bioguideId  String   @unique
  name        String
  party       String   // 'R', 'D', 'I'
  state       String   // Two-letter code
  district    Int?     // Null for senators
  chamber     String   // 'House' or 'Senate'
  imageUrl    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([state, chamber])
  @@index([state, district])
}
```

---

## 🗂️ Final File Structure

```
TrackAmerica/
├── assets/
│   └── maps/
│       ├── states-albers-10m.json          ✅ (already have)
│       ├── counties-albers-10m.json        ✅ (already have)
│       └── districts/                       🆕 (need to download)
│           ├── AL-districts.topojson
│           ├── AK-districts.topojson
│           ├── ...
│           ├── PA-districts.topojson       (Pennsylvania - 17 districts)
│           └── WY-districts.topojson       (Wyoming - 1 at-large)
│
├── lib/
│   ├── data/
│   │   ├── states.ts                       ✅ (already have)
│   │   ├── districts.ts                    🆕 (create - district counts & helpers)
│   │   └── county-results.ts               🆕 (create - election results from tonmcg)
│   └── utils/
│       └── map-geometry.ts                 ✅ (already have)
│
├── components/
│   ├── map/
│   │   ├── USAMap.tsx                      ✅ (already have)
│   │   ├── DistrictMap.tsx                 🆕 (create)
│   │   └── CountyMap.tsx                   🆕 (create)
│   └── ui/
│       ├── PageTitle.tsx                   ✅ (already have)
│       ├── ViewSelector.tsx                🆕 (create - tabs for Districts/Senators/Counties)
│       └── ...
│
├── app/
│   └── (states)/
│       ├── [code].tsx                      🔄 (update - add view selector & conditional maps)
│       └── [code]/
│           └── district/
│               └── [number].tsx            🆕 (create - district detail page)
│
└── api/  (future - Congress.gov integration)
    ├── routes/
    │   └── members.ts                      🔮 (planned)
    └── services/
        └── congress.ts                     🔮 (planned)

```

---

## ⏱️ Timeline & Priorities

### **Week 1: Data Preparation** (Do Now)
- [ ] Download all congressional district GeoJSON files
- [ ] Convert to TopoJSON (one file per state)
- [ ] Download county election results from tonmcg repo
- [ ] Create `lib/data/districts.ts` with district counts
- [ ] Create `lib/data/county-results.ts` with 2020 results
- [ ] Test loading district TopoJSON in component

### **Week 2: UI Components** (Next Sprint)
- [ ] Create `ViewSelector` component (tabs)
- [ ] Create `DistrictMap` component
- [ ] Create `CountyMap` component
- [ ] Update state detail page with view selector
- [ ] Add district click navigation
- [ ] Test all three view modes

### **Week 3: Refinement** (Polish)
- [ ] Add senator info cards for Senators view
- [ ] Improve map styling and hover effects
- [ ] Add loading states and error handling
- [ ] Performance optimization (lazy loading)
- [ ] Responsive design tweaks

### **Future: API Integration** (After MVP)
- [ ] Build Congress.gov API service
- [ ] Add Representative database schema
- [ ] Create backend API endpoints
- [ ] Replace placeholder data with live API calls
- [ ] Add auto-refresh logic (weekly updates)

---

## 📦 Data Download Scripts

### Script 1: Download All District GeoJSON Files
```bash
#!/bin/bash
# download-districts.sh

# Create directory
mkdir -p assets/maps/districts/geojson

# State district counts (abbreviated for example)
declare -A DISTRICTS=(
  ["AL"]=7 ["AK"]=1 ["AZ"]=9 ["AR"]=4 ["CA"]=52
  ["PA"]=17 ["TX"]=38 ["NY"]=26
  # ... add all 50 states
)

for STATE in "${!DISTRICTS[@]}"; do
  COUNT=${DISTRICTS[$STATE]}
  echo "Downloading $STATE districts ($COUNT)..."
  
  for ((i=1; i<=COUNT; i++)); do
    URL="https://theunitedstates.io/districts/cds/2012/${STATE}-${i}/shape.geojson"
    OUTPUT="assets/maps/districts/geojson/${STATE}-${i}.geojson"
    
    curl -s "$URL" -o "$OUTPUT"
    echo "  ✓ ${STATE}-${i}"
  done
done

echo "All districts downloaded!"
```

### Script 2: Convert to TopoJSON
```bash
#!/bin/bash
# convert-to-topojson.sh

for STATE_DIR in assets/maps/districts/geojson/*-1.geojson; do
  STATE=$(basename "$STATE_DIR" | cut -d'-' -f1)
  echo "Converting $STATE to TopoJSON..."
  
  npx geo2topo \
    assets/maps/districts/geojson/${STATE}-*.geojson \
    > assets/maps/districts/${STATE}-districts.topojson
  
  echo "  ✓ ${STATE}-districts.topojson created"
done

echo "All states converted to TopoJSON!"
```

### Script 3: Process County Election Data
```typescript
// scripts/process-county-data.ts
import fs from 'fs';
import csv from 'csv-parser';

interface CountyElectionResult {
  fips: string;
  state: string;
  county: string;
  year: number;
  winner: 'R' | 'D' | 'O';
  demVotes: number;
  repVotes: number;
  otherVotes: number;
  margin: number;
}

const results: Record<string, CountyElectionResult> = {};

// Read CSV from tonmcg repo
fs.createReadStream('data/2020_US_County_Level_Presidential_Results.csv')
  .pipe(csv())
  .on('data', (row) => {
    const fips = row.county_fips;
    const demVotes = parseInt(row.votes_dem);
    const repVotes = parseInt(row.votes_gop);
    const totalVotes = demVotes + repVotes + parseInt(row.votes_other || 0);
    
    results[fips] = {
      fips,
      state: row.state_abbr,
      county: row.county_name,
      year: 2020,
      winner: demVotes > repVotes ? 'D' : 'R',
      demVotes,
      repVotes,
      otherVotes: totalVotes - demVotes - repVotes,
      margin: ((demVotes - repVotes) / totalVotes) * 100,
    };
  })
  .on('end', () => {
    // Write to TypeScript file
    const output = `// Auto-generated from 2020 presidential election results
export const COUNTY_RESULTS_2020 = ${JSON.stringify(results, null, 2)};
`;
    
    fs.writeFileSync('lib/data/county-results.ts', output);
    console.log('✓ County election data processed!');
  });
```

---

## 🎨 Color Scheme (Consistent)

Reuse existing color system from `lib/data/states.ts`:

```typescript
// Already defined in getStateColor()
const COLORS = {
  republican: { fill: '#dc2626', stroke: '#991b1b', textColor: '#dc2626' },
  democratic: { fill: '#2563eb', stroke: '#1e40af', textColor: '#2563eb' },
  independent: { fill: '#9333ea', stroke: '#6b21a8', textColor: '#9333ea' },
  neutral: { fill: '#6b7280', stroke: '#374151', textColor: '#6b7280' },
  hover: { fill: '#60a5fa' }, // Light blue for all hover states
  noData: { fill: '#e5e7eb', stroke: '#d1d5db' }, // Gray when no data
};
```

---

## 🔗 Key Resources

- **Congressional Districts:** https://github.com/unitedstates/districts
- **District CDN:** https://theunitedstates.io/districts/
- **County Election Results:** https://github.com/tonmcg/US_County_Level_Election_Results_08-20
- **Congress.gov API Docs:** https://api.congress.gov/
- **Our Existing TopoJSON Files:** `assets/maps/counties-albers-10m.json`, `assets/maps/states-albers-10m.json`

---

## ✅ Immediate Next Steps

1. **Run Script 1** - Download all district GeoJSON files (~435 files)
2. **Run Script 2** - Convert to TopoJSON (50 state files)
3. **Run Script 3** - Process county election data
4. **Create** `lib/data/districts.ts` with state district counts
5. **Create** `lib/data/county-results.ts` with election results
6. **Test** loading one state's districts in a component

**Then** move to UI implementation (Phase 2).

Let me know when you're ready to start downloading the data! 🚀
- **Repository:** https://github.com/unitedstates/districts
- **Live CDN:** https://theunitedstates.io/districts/
- **License:** Public Domain (CC0)
- **Formats:** GeoJSON, KML
- **Congress:** 2012 districts (118th-119th Congress era)

**Pros:**
- ✅ Public domain, no attribution required
- ✅ GeoJSON format (easy to parse and use with our existing TopoJSON pipeline)
- ✅ Hosted CDN (no need to download/store locally initially)
- ✅ Active maintenance
- ✅ Simple URL structure for programmatic access

**Example URLs:**
```
Pennsylvania District 1:  https://theunitedstates.io/districts/cds/2012/PA-1/shape.geojson
California District 12:   https://theunitedstates.io/districts/cds/2012/CA-12/shape.geojson
New York District 15:     https://theunitedstates.io/districts/cds/2012/NY-15/shape.geojson
Indiana District 9:       https://theunitedstates.io/districts/cds/2012/IN-9/shape.geojson
```

**API for Discovery:**
```
List all 2012 districts: https://api.github.com/repos/unitedstates/districts/contents/cds/2012?ref=gh-pages
List all states:         https://api.github.com/repos/unitedstates/districts/contents/states?ref=gh-pages
```

#### **Alternative: Jeffrey B. Lewis Historical Boundaries**
- **Repository:** https://github.com/JeffreyBLewis/congressional-district-boundaries
- **Website:** https://cdmaps.polisci.ucla.edu/
- **Coverage:** 1789-2012 (every congressional district in US history!)
- **License:** MIT
- **Format:** GeoJSON (on GitHub), Shapefiles (on website)

**Use Case:** Historical data if you want to show how districts changed over time.

---

### 2. Counties

#### **Primary Source: US Census TIGER/Line (Pre-converted)**
- **Original:** https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html
- **Pre-converted GeoJSON:** https://eric.clst.org/tech/usgeojson/
- **License:** US Government work (public domain with citation request)
- **Formats:** GeoJSON, KML, Shapefile
- **Resolutions:**
  - **500k** = Most detailed (largest file size)
  - **5m** = Medium detail (balanced)
  - **20m** = Simplified (smallest, good for mobile)

**Direct Download Links:**
```
US Counties (5m resolution):
GeoJSON: https://eric.clst.org/assets/wiki/uploads/Stuff/gz_2010_us_050_00_5m.json
KML:     https://eric.clst.org/assets/wiki/uploads/Stuff/gz_2010_us_050_00_5m.kml

US Counties (20m resolution):
GeoJSON: https://eric.clst.org/assets/wiki/uploads/Stuff/gz_2010_us_050_00_20m.json
```

**Pros:**
- ✅ Official US Census data
- ✅ Free, public domain
- ✅ Multiple resolutions (optimize for mobile)
- ✅ GeoJSON format (easy integration)

**Note:** Based on 2010 Census; some county names have changed (e.g., Shannon County, SD → Oglala Lakota County)

---

## Political Party Affiliation Data

### Challenge:
Geographic data (districts/counties) **does not include** political affiliation. We need to:
1. **Fetch geographic shapes** (from sources above)
2. **Fetch political data separately** (from Congress.gov API or other sources)
3. **Match and merge** the two datasets

### Recommended Approach for Political Data:

#### **Option 1: Congress.gov API** (Most Accurate)
- Use our existing `CONGRESS_API_KEY`
- Endpoint: `/member` to get current representatives
- Match representatives to districts using state + district number
- Determine party from representative data

**Example Flow:**
```typescript
// 1. Fetch all current House members from Congress.gov
const members = await fetch('https://api.congress.gov/v3/member?limit=435&currentMember=true');

// 2. Build map: { 'PA-1': 'Democrat', 'PA-2': 'Republican', ... }
const districtParties = members.reduce((map, member) => {
  const key = `${member.state}-${member.district}`;
  map[key] = member.party; // 'D', 'R', or 'I'
  return map;
}, {});

// 3. Download district GeoJSON and add party data
const paDistrict1 = await fetch('https://theunitedstates.io/districts/cds/2012/PA-1/shape.geojson');
const enrichedData = {
  ...paDistrict1,
  properties: {
    ...paDistrict1.properties,
    party: districtParties['PA-1']
  }
};
```

#### **Option 2: Ballotpedia / OpenElections**
- **Ballotpedia:** Comprehensive political data, but requires scraping (no official API)
- **OpenElections:** https://github.com/openelections - election results data
- More historical data, but requires more processing

#### **Option 3: Manual Curated Dataset** (Quickest for MVP)
Similar to how we created `lib/data/states.ts`, create a **district lookup**:

```typescript
// lib/data/districts.ts
interface DistrictInfo {
  state: string;
  district: number;
  party: 'R' | 'D' | 'I';
  representative: string;
  lastElection: string;
}

const DISTRICT_PARTIES: Record<string, DistrictInfo> = {
  'PA-1': { state: 'PA', district: 1, party: 'D', representative: 'Brian Fitzpatrick', lastElection: '2024' },
  'PA-2': { state: 'PA', district: 2, party: 'D', representative: 'Brendan Boyle', lastElection: '2024' },
  // ... 435 districts total
};
```

**Pros:** Fast, simple, no API calls  
**Cons:** Manual updates after each election

---

### For Counties:
County-level political data is **harder** because counties don't have official party affiliations. Options:

1. **Presidential Election Results by County**
   - Source: https://github.com/tonmcg/US_County_Level_Election_Results_08-20
   - Shows which party won each county in presidential elections
   - Can color counties by 2020/2024 results

2. **Voter Registration Data**
   - Some states publish voter registration by party
   - Not available in all states

3. **Cook Political Report / Sabato's Crystal Ball**
   - Political analysis sites classify counties
   - Would require scraping or manual entry

**Recommendation for Counties:** Use presidential election results as proxy for political leaning.

---

## Implementation Plan

### Phase 1: Congressional Districts (Recommended First)

1. **Create District Data Module** (`lib/data/districts.ts`)
   ```typescript
   - Fetch all district GeoJSON from theunitedstates.io
   - Store locally in assets/geodata/districts/
   - Create index mapping state+district to party
   ```

2. **Fetch Political Data**
   ```typescript
   - Use Congress.gov API to get current House members
   - Build district → party mapping
   - Cache results (update quarterly or after elections)
   ```

3. **Create District Map Component** (`components/map/DistrictMap.tsx`)
   ```typescript
   - Similar to USAMap.tsx
   - Render districts within a state
   - Color by party: Red (R), Blue (D), Purple (I/Other)
   ```

4. **Integrate into State Detail Page**
   ```typescript
   - Add "View Congressional Districts" button on state page
   - Navigate to /[state]/districts route
   - Show clickable district map
   ```

### Phase 2: Counties

1. **Download County GeoJSON**
   ```typescript
   - Get 5m or 20m resolution file from eric.clst.org
   - Convert to TopoJSON for smaller size
   - Store in assets/geodata/counties.topojson
   ```

2. **Add Political Data**
   ```typescript
   - Fetch 2024 presidential results by county
   - Color counties by winning party
   - Add vote percentage in tooltip/detail view
   ```

3. **Create County Map Component**
   ```typescript
   - Filter counties by state
   - Render with political colors
   - Click → county detail page (future feature)
   ```

---

## Technical Recommendations

### File Organization
```
assets/
  geodata/
    states.topojson          (existing - USA map)
    districts/
      2012/
        PA.geojson           (Pennsylvania districts)
        CA.geojson           (California districts)
        ...
    counties.topojson        (all US counties)

lib/
  data/
    states.ts                (existing - state political data)
    districts.ts             (new - district political data)
    counties.ts              (new - county election results)
```

### Caching Strategy
```typescript
// Backend API endpoints:
GET /api/districts/:state          // Get districts for a state
GET /api/districts/:state/:number  // Get specific district
GET /api/counties/:state           // Get counties for a state

// Cache in database:
- District geometries (update yearly after redistricting)
- Political affiliations (update after elections)
- Representative info (update quarterly)
```

### Color Scheme (Consistent with Existing)
```typescript
// Reuse from lib/data/states.ts getStateColor()
Republican:   #dc2626 (red-600)
Democratic:   #2563eb (blue-600)
Independent:  #9333ea (purple-600)
Toss-up:      #6b7280 (gray-500)
Vacant:       #d1d5db (gray-300)
```

---

## Data Update Frequency

| Data Type | Update Frequency | Trigger Event |
|-----------|------------------|---------------|
| **District Boundaries** | Every 10 years | Census redistricting |
| **Political Affiliation** | Every 2 years | House elections |
| **Representative Names** | As needed | Special elections, resignations |
| **County Boundaries** | Rarely | County creation/merger |
| **County Election Results** | Every 4 years | Presidential elections |

---

## Example API Integration

### Backend Service (`api/services/districts.ts`)
```typescript
import { PrismaClient } from '@prisma/client';

export class DistrictService {
  async getDistrictsForState(stateCode: string) {
    // 1. Check cache (Prisma DB)
    const cached = await prisma.district.findMany({
      where: { state: stateCode.toUpperCase() }
    });
    
    if (cached.length > 0) return cached;
    
    // 2. Fetch from theunitedstates.io
    const response = await fetch(
      `https://api.github.com/repos/unitedstates/districts/contents/cds/2012?ref=gh-pages`
    );
    const files = await response.json();
    
    // 3. Download district GeoJSON for this state
    const stateDistricts = files.filter(f => 
      f.name.startsWith(stateCode.toUpperCase())
    );
    
    // 4. Fetch political data from Congress.gov
    const members = await this.getHouseMembers();
    
    // 5. Merge and cache
    // ... (implementation)
    
    return enrichedDistricts;
  }
}
```

---

## Next Steps

1. **Decide on MVP Scope:**
   - Start with **districts only** or include counties?
   - Use Congress.gov API or manual curated data?
   - Show on state page or separate route?

2. **Download Sample Data:**
   ```bash
   # Test Pennsylvania districts
   curl https://theunitedstates.io/districts/cds/2012/PA-1/shape.geojson > pa-district-1.geojson
   
   # Test all PA districts
   curl https://api.github.com/repos/unitedstates/districts/contents/cds/2012?ref=gh-pages | grep "PA-"
   ```

3. **Create Proof of Concept:**
   - Build simple district map for one state (Pennsylvania)
   - Test GeoJSON parsing with react-native-svg
   - Validate color coding works

4. **Integrate Congress.gov API:**
   - Add `/api/members` endpoint
   - Fetch current House members
   - Build district → party mapping

---

## Resources

- **unitedstates/districts:** https://github.com/unitedstates/districts
- **Congress.gov API:** https://api.congress.gov/
- **Census TIGER/Line:** https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html
- **Pre-converted GeoJSON:** https://eric.clst.org/tech/usgeojson/
- **Historical Districts:** https://cdmaps.polisci.ucla.edu/
- **Election Results:** https://github.com/tonmcg/US_County_Level_Election_Results_08-20

---

## Questions for User

1. **Priority:** Districts first, or districts + counties together?
2. **Data Source:** Congress.gov API (dynamic) or manual dataset (static but faster)?
3. **UI Location:** Show districts on state detail page, or separate `/[state]/districts` route?
4. **Update Strategy:** Manual updates after elections, or automated API refresh?

Let me know your preferences and I'll create a detailed implementation plan!
