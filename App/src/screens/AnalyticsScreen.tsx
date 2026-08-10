import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { rf } from '../theme/responsive';
import { colors } from '../theme/colors';

// --- CONSTANTS ---
const KPIS = [
  { label: 'Fuel Efficiency', value: '8.4 km/l', accent: colors.blue },
  { label: 'Fleet Utilization', value: '81%', accent: colors.green },
  { label: 'Operational Cost', value: '34,070', accent: colors.amber },
  { label: 'Vehicle ROI', value: '14.2%', accent: colors.green },
];

const MONTHLY_REVENUE = [
  { month: 'Jan', revenue: 14.2 },
  { month: 'Feb', revenue: 16.8 },
  { month: 'Mar', revenue: 13.5 },
  { month: 'Apr', revenue: 18.1 },
  { month: 'May', revenue: 15.9 },
  { month: 'Jun', revenue: 19.4 },
  { month: 'Jul', revenue: 17.6 },
];
const MAX_REVENUE = Math.max(...MONTHLY_REVENUE.map(m => m.revenue));

const COSTLIEST_VEHICLES = [
  { name: 'TRUCK-11', cost: 250000, color: colors.rose },
  { name: 'MINI-03', cost: 140000, color: colors.amber },
  { name: 'VAN-05', cost: 62000, color: colors.blue },
];
const MAX_COST = Math.max(...COSTLIEST_VEHICLES.map((v) => v.cost));

// --- COMPONENTS ---
const KpiCard = ({ label, value, accent }: { label: string, value: string, accent: string }) => (
  <View style={[styles.kpiCard, { borderLeftColor: accent }]}>
    <Text style={styles.kpiLabel}>{label}</Text>
    <Text style={styles.kpiValue}>{value}</Text>
  </View>
);

const CustomBarChart = () => {
  return (
    <View style={styles.chartContainer}>
      {/* Y-Axis labels and grid lines could go here, keeping it simple to match the sleek design */}
      <View style={styles.barsArea}>
        {MONTHLY_REVENUE.map((item, i) => {
          const heightPercent = (item.revenue / (MAX_REVENUE * 1.1)) * 100; // 10% headroom
          return (
            <View key={i} style={styles.barWrapper}>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { height: `${heightPercent}%` }]} />
              </View>
              <Text style={styles.barLabel}>{item.month}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default function AnalyticsScreen() {
  const [search, setSearch] = useState('');

  const filteredVehicles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COSTLIEST_VEHICLES;
    return COSTLIEST_VEHICLES.filter((v) => v.name.toLowerCase().includes(q));
  }, [search]);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Analytics</Text>
        </View>

        {/* KPIs */}
        <View style={styles.kpiGrid}>
          {KPIS.map((kpi, i) => (
            <View key={i} style={styles.kpiCol}>
              <KpiCard label={kpi.label} value={kpi.value} accent={kpi.accent} />
            </View>
          ))}
        </View>
        <Text style={styles.roiNote}>
          ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
        </Text>

        {/* CHARTS & LISTS */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Monthly Revenue (Lakhs)</Text>
          <CustomBarChart />
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Top Costliest Vehicles</Text>
          <View style={styles.costList}>
            {filteredVehicles.length === 0 ? (
              <Text style={styles.emptyText}>No vehicles match your search.</Text>
            ) : null}
            {filteredVehicles.map((v) => {
              const widthPercent = (v.cost / MAX_COST) * 100;
              return (
                <View key={v.name} style={styles.costItem}>
                  <View style={styles.costItemHeader}>
                    <Text style={styles.costItemName}>{v.name}</Text>
                    <Text style={styles.costItemValue}>₹{v.cost.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${widthPercent}%`, backgroundColor: v.color }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { paddingHorizontal: rf(16), paddingTop: rf(24), paddingBottom: rf(40), flexGrow: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rf(20) },
  pageTitle: { color: colors.textPrimary, fontSize: rf(28), fontWeight: '800', letterSpacing: -1 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: rf(12), paddingHorizontal: rf(16), height: rf(52), marginBottom: rf(24), gap: rf(10) },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: rf(15), height: '100%' },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: rf(12) },
  kpiCol: { width: '48%' }, // Fits 2 per row
  kpiCard: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4, borderRadius: rf(12), padding: rf(16) },
  kpiLabel: { color: colors.textMuted, fontSize: rf(11), textTransform: 'uppercase', fontWeight: '700' },
  kpiValue: { color: colors.textPrimary, fontSize: rf(24), fontWeight: '800', marginTop: rf(8), letterSpacing: -0.5 },
  roiNote: { color: colors.textMuted, fontSize: rf(12), marginTop: rf(12), marginBottom: rf(32), fontStyle: 'italic' },

  sectionBlock: { marginBottom: rf(32) },
  sectionTitle: { color: colors.textPrimary, fontSize: rf(14), fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: rf(16) },

  chartContainer: { height: rf(200), backgroundColor: colors.panel, borderRadius: rf(16), borderWidth: 1, borderColor: colors.borderSoft, paddingHorizontal: rf(16), paddingVertical: rf(20) },
  barsArea: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderBottomWidth: 1, borderBottomColor: colors.borderSoft, paddingBottom: rf(4) },
  barWrapper: { alignItems: 'center', flex: 1 },
  barTrack: { flex: 1, width: rf(24), justifyContent: 'flex-end', alignItems: 'center' },
  barFill: { width: '100%', backgroundColor: colors.blue, borderTopLeftRadius: rf(6), borderTopRightRadius: rf(6) },
  barLabel: { color: colors.textMuted, fontSize: rf(11), marginTop: rf(8) },

  costList: { backgroundColor: colors.panel, borderRadius: rf(16), borderWidth: 1, borderColor: colors.borderSoft, padding: rf(16), gap: rf(20) },
  costItem: { width: '100%' },
  costItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rf(8) },
  costItemName: { color: colors.textPrimary, fontSize: rf(15), fontWeight: '700' },
  costItemValue: { color: colors.textSecondary, fontSize: rf(13), fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: '600' },
  progressTrack: { height: rf(12), backgroundColor: colors.surface, borderRadius: rf(6), overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: rf(6) },
  emptyText: { color: colors.textMuted, fontSize: rf(14), textAlign: 'center' },
});
