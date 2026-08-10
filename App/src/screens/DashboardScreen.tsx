import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  Modal,
} from 'react-native';
import {
  Search,
  Truck,
  CheckCircle2,
  Wrench,
  Users,
  Gauge,
  ListChecks,
  History,
  ChevronDown,
  SearchX,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { rf } from '../theme/responsive';

// --- MOCK DATA ---
const MOCK_TRIPS = [
  { id: 'TR001', vehicle: 'VAN-05', driver: 'Alex', status: 'On Trip', eta: '45 min', region: 'West', type: 'Van' },
  { id: 'TR002', vehicle: 'TRK-12', driver: 'Jake', status: 'Completed', eta: '--', region: 'North', type: 'Truck' },
  { id: 'TR003', vehicle: 'MINI-09', driver: 'Priya', status: 'Dispatched', eta: '1h 10m', region: 'East', type: 'Mini' },
  { id: 'TR004', vehicle: '--', driver: '--', status: 'Draft', eta: 'Awaiting', region: 'South', type: '--' },
];

const STATS = {
  activeVehicles: 53,
  availableVehicles: 42,
  vehiclesInMaintenance: 5,
  activeTrips: 18,
  previousTrips: 9,
  driversOnDuty: 26,
  fleetUtilization: 81,
};

const VEHICLE_STATUS = [
  { label: 'Available', value: 42, max: 53, color: colors.success },
  { label: 'On Trip', value: 18, max: 53, color: colors.teal },
  { label: 'In Shop', value: 5, max: 53, color: colors.amber },
  { label: 'Not Avail', value: 2, max: 53, color: colors.rose },
];

const STATUS_META: Record<string, { color: string; icon: any }> = {
  'On Trip': { color: colors.teal, icon: Truck },
  Completed: { color: colors.success, icon: CheckCircle2 },
  Dispatched: { color: colors.amber, icon: ListChecks },
  Draft: { color: colors.textMuted, icon: History },
};

// --- COMPONENTS ---
const StatCard = ({ title, value, color, icon: Icon }: any) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={styles.statCardHeader}>
      <Text style={styles.statCardTitle} numberOfLines={2}>{title}</Text>
      <View style={[styles.statCardIconBox, { backgroundColor: `${color}1A`, borderColor: `${color}40` }]}>
        <Icon size={16} color={color} strokeWidth={2.5} />
      </View>
    </View>
    <Text style={styles.statCardValue}>{value}</Text>
  </View>
);

const FilterChip = ({ label, value, options, onChange }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View>
      <Pressable style={styles.filterChip} onPress={() => setIsOpen(true)}>
        {!!label && <Text style={styles.filterChipLabel}>{label}:</Text>}
        <Text style={styles.filterChipValue}>{value}</Text>
        <ChevronDown size={14} color={colors.textMuted} />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownTitle}>Select {label}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((opt: string) => {
                const isActive = opt === value;
                return (
                  <Pressable
                    key={opt}
                    style={[
                      styles.dropdownOption,
                      isActive && { backgroundColor: `${colors.teal}15` },
                    ]}
                    onPress={() => {
                      onChange(opt);
                      setIsOpen(false);
                    }}
                  >
                    <Text style={[styles.dropdownOptionText, isActive && { color: colors.teal }]}>
                      {opt}
                    </Text>
                    {isActive && <CheckCircle2 size={16} color={colors.teal} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const TripCard = ({ trip }: any) => {
  const meta = STATUS_META[trip.status] || STATUS_META['Draft'];
  const Icon = meta.icon;

  return (
    <View style={styles.tripCard}>
      <View style={styles.tripCardHeader}>
        <View style={styles.tripCardIdBox}>
          <Text style={styles.tripCardId}>{trip.id}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${meta.color}15`, borderColor: `${meta.color}40` }]}>
          <Icon size={12} color={meta.color} strokeWidth={2.5} />
          <Text style={[styles.statusText, { color: meta.color }]}>{trip.status}</Text>
        </View>
      </View>
      <View style={styles.tripCardBody}>
        <View style={styles.tripInfoItem}>
          <Text style={styles.tripInfoLabel}>Vehicle</Text>
          <Text style={styles.tripInfoValue}>{trip.vehicle}</Text>
        </View>
        <View style={styles.tripInfoItem}>
          <Text style={styles.tripInfoLabel}>Driver</Text>
          <Text style={styles.tripInfoValue}>{trip.driver}</Text>
        </View>
        <View style={styles.tripInfoItem}>
          <Text style={styles.tripInfoLabel}>ETA</Text>
          <Text style={styles.tripInfoValue}>{trip.eta}</Text>
        </View>
      </View>
    </View>
  );
};

export default function DashboardScreen() {
  const [search, setSearch] = useState('');
  const [vehicleType, setVehicleType] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [region, setRegion] = useState('All');

  // Filtering Logic (Ready for API integration when MOCK_TRIPS is replaced by store data)
  const filteredTrips = useMemo(() => {
    return MOCK_TRIPS.filter((trip) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        trip.id.toLowerCase().includes(searchLower) ||
        trip.vehicle.toLowerCase().includes(searchLower) ||
        trip.driver.toLowerCase().includes(searchLower) ||
        trip.status.toLowerCase().includes(searchLower);
      const matchesType = vehicleType === 'All' || trip.type === vehicleType;
      const matchesStatus = statusFilter === 'All' || trip.status === statusFilter;
      const matchesRegion = region === 'All' || trip.region === region;
      
      return matchesSearch && matchesType && matchesStatus && matchesRegion;
    });
  }, [search, vehicleType, statusFilter, region]);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* HEADER & SEARCH */}
        <Text style={styles.pageTitle}>Dashboard</Text>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search trips, drivers, vehicles..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* FILTERS */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Filters</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            <FilterChip 
              label="Type" 
              value={vehicleType} 
              onChange={setVehicleType} 
              options={['All', 'Van', 'Truck', 'Mini']} 
            />
            <FilterChip 
              label="Status" 
              value={statusFilter} 
              onChange={setStatusFilter} 
              options={['All', 'On Trip', 'Completed', 'Dispatched', 'Draft']} 
            />
            <FilterChip 
              label="Region" 
              value={region} 
              onChange={setRegion} 
              options={['All', 'North', 'South', 'East', 'West']} 
            />
          </ScrollView>
        </View>

        {/* STATS & VEHICLE STATUS (Hidden when searching) */}
        {!search && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>Overview</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
                <StatCard title="Active Vehicles" value={STATS.activeVehicles} color={colors.amber} icon={Truck} />
                <StatCard title="Available Vehicles" value={STATS.availableVehicles} color={colors.success} icon={CheckCircle2} />
                <StatCard title="In Maintenance" value={String(STATS.vehiclesInMaintenance).padStart(2, '0')} color={colors.rose} icon={Wrench} />
                <StatCard title="Active Trips" value={STATS.activeTrips} color={colors.teal} icon={ListChecks} />
                <StatCard title="Previous Trips" value={String(STATS.previousTrips).padStart(2, '0')} color={colors.violet} icon={History} />
                <StatCard title="Drivers on Duty" value={STATS.driversOnDuty} color={colors.amber} icon={Users} />
                <StatCard title="Fleet Util." value={`${STATS.fleetUtilization}%`} color={colors.success} icon={Gauge} />
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionHeader}>Vehicle Status</Text>
              <View style={styles.statusPanel}>
                {VEHICLE_STATUS.map((row) => (
                  <View key={row.label} style={styles.statusRow}>
                    <Text style={styles.statusLabel}>{row.label}</Text>
                    <View style={styles.progressBarBg}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { width: `${(row.value / row.max) * 100}%`, backgroundColor: row.color }
                        ]} 
                      />
                    </View>
                    <Text style={styles.statusValue}>{row.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* TRIPS LIST */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>
            {search ? `Search Results (${filteredTrips.length})` : 'Recent Trips'}
          </Text>
          
          <View style={styles.tripsContainer}>
            {filteredTrips.length > 0 ? (
              filteredTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyStateIconWrapper}>
                  <SearchX size={32} color={colors.textMuted} strokeWidth={1.5} />
                </View>
                <Text style={styles.emptyStateTitle}>No results found</Text>
                <Text style={styles.emptyStateText}>
                  {search ? `We couldn't find any trips matching "${search}".` : "No trips match your current filter settings."}
                </Text>
              </View>
            )}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    paddingHorizontal: rf(16),
    paddingVertical: rf(24),
    paddingBottom: rf(40),
    flexGrow: 1,
  },
  pageTitle: {
    color: colors.textPrimary, 
    fontSize: rf(28), 
    fontWeight: '800', 
    marginBottom: rf(20),
    letterSpacing: -1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: rf(12),
    paddingHorizontal: rf(16),
    height: rf(52),
    marginBottom: rf(24),
    gap: rf(10),
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: rf(15),
    height: '100%',
  },
  section: {
    marginBottom: rf(32),
  },
  sectionHeader: {
    color: colors.textMuted,
    fontSize: rf(12),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: rf(12),
  },
  filterScroll: {
    gap: rf(10),
    // paddingRight: rf(16),
    alignItems:'center',
    justifyContent:'center'
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: rf(8),
    paddingHorizontal: rf(12),
    paddingVertical: rf(10),
    gap: rf(6),
  },
  filterChipLabel: {
    color: colors.textMuted,
    fontSize: rf(13),
  },
  filterChipValue: {
    color: colors.textPrimary,
    fontSize: rf(13),
    fontWeight: '600',
  },
  statsScroll: {
    gap: rf(12),
    paddingRight: rf(16),
  },
  statCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderRadius: rf(12),
    padding: rf(16),
    width: rf(150),
    justifyContent: 'space-between',
    minHeight: rf(100),
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: rf(12),
  },
  statCardTitle: {
    color: colors.textSecondary,
    fontSize: rf(12),
    fontWeight: '600',
    flex: 1,
    marginRight: rf(8),
  },
  statCardIconBox: {
    width: rf(28),
    height: rf(28),
    borderRadius: rf(6),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCardValue: {
    color: colors.textPrimary,
    fontSize: rf(24),
    fontWeight: '800',
  },
  statusPanel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: rf(16),
    padding: rf(20),
    gap: rf(16),
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rf(12),
  },
  statusLabel: {
    color: colors.textSecondary,
    fontSize: rf(13),
    width: rf(75),
  },
  progressBarBg: {
    flex: 1,
    height: rf(10),
    backgroundColor: colors.panel,
    borderRadius: rf(5),
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: rf(5),
  },
  statusValue: {
    color: colors.textMuted,
    fontSize: rf(13),
    width: rf(24),
    textAlign: 'right',
  },
  tripsContainer: {
    gap: rf(12),
  },
  tripCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: rf(16),
    overflow: 'hidden',
  },
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: rf(16),
    paddingVertical: rf(12),
    backgroundColor: colors.panel,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  tripCardIdBox: {
    backgroundColor: colors.bg,
    paddingHorizontal: rf(8),
    paddingVertical: rf(4),
    borderRadius: rf(6),
    borderWidth: 1,
    borderColor: colors.border,
  },
  tripCardId: {
    color: colors.textMuted,
    fontSize: rf(11),
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rf(6),
    paddingHorizontal: rf(8),
    paddingVertical: rf(4),
    borderRadius: rf(20),
    borderWidth: 1,
  },
  statusText: {
    fontSize: rf(11),
    fontWeight: '700',
  },
  tripCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: rf(16),
  },
  tripInfoItem: {
    gap: rf(4),
  },
  tripInfoLabel: {
    color: colors.textMuted,
    fontSize: rf(11),
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  tripInfoValue: {
    color: colors.textPrimary,
    fontSize: rf(14),
    fontWeight: '600',
  },
  emptyState: {
    padding: rf(40),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: rf(16),
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderStyle: 'dashed',
    marginTop: rf(8),
  },
  emptyStateIconWrapper: {
    width: rf(64),
    height: rf(64),
    borderRadius: rf(32),
    backgroundColor: colors.panel,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rf(16),
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  emptyStateTitle: {
    color: colors.textPrimary,
    fontSize: rf(16),
    fontWeight: '700',
    marginBottom: rf(8),
  },
  emptyStateText: {
    color: colors.textMuted,
    fontSize: rf(14),
    textAlign: 'center',
    lineHeight: rf(20),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: rf(24),
  },
  dropdownContainer: {
    backgroundColor: colors.surface,
    borderRadius: rf(16),
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '60%',
    overflow: 'hidden',
    paddingVertical: rf(8),
  },
  dropdownTitle: {
    color: colors.textMuted,
    fontSize: rf(12),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: rf(20),
    paddingVertical: rf(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    marginBottom: rf(8),
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: rf(14),
    paddingHorizontal: rf(20),
  },
  dropdownOptionText: {
    color: colors.textPrimary,
    fontSize: rf(15),
    fontWeight: '600',
  },
});
