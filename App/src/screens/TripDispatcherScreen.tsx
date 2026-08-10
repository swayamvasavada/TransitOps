import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Modal,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import {
  Search,
  Plus,
  X,
  Check,
  AlertTriangle,
  ChevronDown,
  CircleCheck,
  Map,
} from 'lucide-react-native';
import { rf } from '../theme/responsive';
import { colors } from '../theme/colors';
import useTripStore from '../store/TripStore';
import useVehicleStore from '../store/VehicleStore';
import useDriverStore from '../store/DriverStore';

// --- CONSTANTS ---
const TRIP_STATUS: Record<string, any> = {
  DRAFT: { label: 'Draft', color: colors.textSecondary, bg: 'rgba(136,145,171,0.16)', border: 'rgba(136,145,171,0.4)' },
  DISPATCHED: { label: 'Dispatched', color: colors.blue, bg: 'rgba(56,189,248,0.16)', border: 'rgba(56,189,248,0.45)' },
  COMPLETED: { label: 'Completed', color: colors.green, bg: 'rgba(74,222,128,0.16)', border: 'rgba(74,222,128,0.45)' },
  CANCELLED: { label: 'Cancelled', color: colors.rose, bg: 'rgba(251,113,133,0.18)', border: 'rgba(251,113,133,0.45)' },
};

const MOCK_TRIPS = [
  {
    tripID: 'TRP-1001',
    source: 'Gandhinagar Depot',
    destination: 'Ahmedabad Hub',
    status: 'DISPATCHED',
    vehicleID: 'v2',
    driverID: 'd2',
    startingOdometer: 182000,
  },
  {
    tripID: 'TRP-1002',
    source: 'Surat Central',
    destination: 'Mumbai North',
    status: 'COMPLETED',
    vehicleID: 'v1',
    driverID: 'd1',
    startingOdometer: 73500,
    finalOdometer: 74000,
  },
  {
    tripID: 'TRP-1003',
    source: 'Pune Warehouse',
    destination: 'Navi Mumbai',
    status: 'CANCELLED',
    vehicleID: 'v3',
    driverID: 'd3',
    startingOdometer: 66000,
  },
];

// --- COMPONENTS ---
export default function TripDispatcherScreen() {
  const { trips, getTrips, registerTrip, completeTrip, cancelTrip } = useTripStore();
  const { vehicles, getVehicles } = useVehicleStore();
  const { drivers, getDrivers } = useDriverStore();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [source, setSource] = useState('Gandhinagar Depot');
  const [destination, setDestination] = useState('Ahmedabad Hub');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [cargoWeight, setCargoWeight] = useState('700');
  const [plannedDistance, setPlannedDistance] = useState('38');

  // Dropdown States
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);

  // Action Modal State (Complete / Cancel)
  const [actionModal, setActionModal] = useState<{ visible: boolean; type: 'COMPLETE' | 'CANCEL'; trip: any } | null>(null);
  const [actionOdo, setActionOdo] = useState('');
  const [actionFuel, setActionFuel] = useState('0');

  // useEffect(() => {
  //   getTrips();
  //   getVehicles();
  //   getDrivers();
  // }, [getTrips, getVehicles, getDrivers]);

  // Normalize backend data
  const normalizedVehicles = useMemo(() => {
    return (vehicles || []).map((v: any) => ({
      vehicleID: v.vehicleID ?? v.id ?? v.registrationNumber ?? '',
      name: v.name ?? v.registrationNumber ?? '',
      capacity: Number(v.capacity ?? v.maxLoadCapacity ?? 0),
      odometer: Number(v.odometer ?? v.currentOdometer ?? 0),
      status: String(v.status ?? v.state ?? (v.isAvailable ? 'AVAILABLE' : 'UNKNOWN')).toUpperCase(),
    }));
  }, [vehicles]);

  const normalizedDrivers = useMemo(() => {
    return (drivers || []).map((d: any, i: number) => ({
      driverID: d.driverID ?? d.id ?? `driver-${i}`,
      name: d.name ?? d.fullName ?? `Driver ${i + 1}`,
      status: String(d.status ?? d.state ?? (d.isAvailable ? 'AVAILABLE' : 'AVAILABLE')).toUpperCase(),
    }));
  }, [drivers]);

  const availableVehicles = useMemo(() => normalizedVehicles.filter((v: any) => v.status === 'AVAILABLE'), [normalizedVehicles]);
  const availableDrivers = useMemo(() => normalizedDrivers.filter((d: any) => d.status === 'AVAILABLE'), [normalizedDrivers]);

  // useEffect(() => {
  //   if (!vehicleId && availableVehicles.length > 0) setVehicleId(String(availableVehicles[0].vehicleID));
  // }, [availableVehicles, vehicleId]);

  // useEffect(() => {
  //   if (!driverId && availableDrivers.length > 0) setDriverId(String(availableDrivers[0].driverID));
  // }, [availableDrivers, driverId]);

  useEffect(()=>{},[])

  const selectedVehicle = availableVehicles.find((v: any) => String(v.vehicleID) === String(vehicleId));
  const selectedDriver = availableDrivers.find((d: any) => String(d.driverID) === String(driverId));

  const cargo = Number(cargoWeight) || 0;
  const overCapacity = selectedVehicle ? cargo > selectedVehicle.capacity : false;
  const overBy = selectedVehicle ? cargo - selectedVehicle.capacity : 0;

  const canDispatch = Boolean(
    source.trim() && destination.trim() && selectedVehicle && selectedDriver && cargo > 0 && !overCapacity && !submitting
  );

  const vehicleLabel = (vID: string) => normalizedVehicles.find((v: any) => String(v.vehicleID) === String(vID))?.name ?? null;
  const driverLabel = (dID: string) => normalizedDrivers.find((d: any) => String(d.driverID) === String(dID))?.name ?? null;

  const filteredTrips = useMemo(() => {
    const dataSource = trips.length > 0 ? trips : MOCK_TRIPS;
    const q = search.trim().toLowerCase();
    if (!q) return dataSource;
    return dataSource.filter((t: any) =>
      [t.tripID, t.source, t.destination, t.status, vehicleLabel(t.vehicleID), driverLabel(t.driverID)]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q))
    );
  }, [trips, search, normalizedVehicles, normalizedDrivers]);

  const resetForm = () => {
    setSource('');
    setDestination('');
    setVehicleId(availableVehicles[0] ? String(availableVehicles[0].vehicleID) : '');
    setDriverId(availableDrivers[0] ? String(availableDrivers[0].driverID) : '');
    setCargoWeight('');
    setPlannedDistance('');
  };

  const handleDispatch = async () => {
    if (!canDispatch) return;
    setSubmitting(true);

    const payload = {
      source,
      destination,
      vehicleID: selectedVehicle.vehicleID,
      driverID: selectedDriver.driverID,
      cargoWeight: cargo,
      plannedDistance: Number(plannedDistance) || 0,
      startingOdometer: selectedVehicle.odometer ?? 0,
      status: 'DISPATCHED',
    };

    const result = await registerTrip(payload);
    setSubmitting(false);

    if (result.success) {
      await Promise.all([getVehicles(), getDrivers()]);
      setShowAddModal(false);
      resetForm();
    } else {
      Alert.alert('Dispatch Failed', result.message || 'Could not dispatch trip');
    }
  };

  const handleActionConfirm = async () => {
    if (!actionModal) return;
    setSubmitting(true);
    let result;
    if (actionModal.type === 'COMPLETE') {
      result = await completeTrip(actionModal.trip.tripID, actionOdo || '0', actionFuel || '0');
    } else {
      result = await cancelTrip(actionModal.trip.tripID, actionOdo || '0', actionFuel || '0');
    }
    setSubmitting(false);

    if (result.success) {
      setActionModal(null);
      await Promise.all([getVehicles(), getDrivers()]);
    } else {
      Alert.alert('Action Failed', result.message || 'Could not update trip');
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Live Board</Text>
          <Pressable style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Plus size={16} color="#1a1200" strokeWidth={2.5} />
            <Text style={styles.addButtonText}>Dispatch</Text>
          </Pressable>
        </View>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search trip ID, source, destination..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* LIST */}
        <View style={styles.listContainer}>
          {filteredTrips.length > 0 ? (
            filteredTrips.map((t: any) => {
              const vLabel = vehicleLabel(t.vehicleID);
              const dLabel = driverLabel(t.driverID);
              const s = TRIP_STATUS[t.status] || TRIP_STATUS.DRAFT;
              
              let note = '';
              if (t.status === 'DRAFT') note = 'Awaiting dispatch';
              else if (t.status === 'DISPATCHED') note = 'In transit';
              else if (t.status === 'COMPLETED') note = t.finalOdometer ? `Delivered · Odo ${t.finalOdometer} km` : 'Delivered';
              else if (t.status === 'CANCELLED') note = 'Cancelled by dispatcher';

              return (
                <View key={t.tripID} style={styles.tripCard}>
                  <View style={styles.tripCardHeader}>
                    <Text style={styles.tripIDText}>{t.tripID}</Text>
                    <Text style={styles.tripAssignText}>{vLabel ? `${vLabel} / ${dLabel ?? '—'}` : 'Unassigned'}</Text>
                  </View>
                  <View style={styles.tripCardBody}>
                    <View style={styles.routeBox}>
                      <Text style={styles.routeLocation}>{t.source}</Text>
                      <Text style={styles.routeArrow}>→</Text>
                      <Text style={styles.routeLocation}>{t.destination}</Text>
                    </View>
                  </View>
                  <View style={styles.tripCardFooter}>
                    <View style={styles.statusRow}>
                      <View style={[styles.statusBadge, { backgroundColor: s.bg, borderColor: s.border }]}>
                        <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
                      </View>
                      <Text style={styles.noteText}>{note}</Text>
                    </View>
                    {(t.status === 'DRAFT' || t.status === 'DISPATCHED') && (
                      <View style={styles.actionsRow}>
                        <Pressable 
                          style={styles.actionBtnCheck} 
                          onPress={() => {
                            setActionOdo(String(t.startingOdometer ?? '0'));
                            setActionFuel('0');
                            setActionModal({ visible: true, type: 'COMPLETE', trip: t });
                          }}
                        >
                          <Check size={16} color={colors.green} />
                        </Pressable>
                        <Pressable 
                          style={styles.actionBtnCross}
                          onPress={() => {
                            setActionOdo(String(t.startingOdometer ?? '0'));
                            setActionFuel('0');
                            setActionModal({ visible: true, type: 'CANCEL', trip: t });
                          }}
                        >
                          <X size={16} color={colors.rose} />
                        </Pressable>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIconWrapper}>
                <Map size={32} color={colors.textMuted} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyStateTitle}>No trips found</Text>
              <Text style={styles.emptyStateText}>
                {search ? `We couldn't find any trips matching "${search}".` : "The board is clear."}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ACTION MODAL (Complete/Cancel) */}
      <Modal visible={!!actionModal} transparent={true} animationType="fade" onRequestClose={() => setActionModal(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.filterModalOverlay}>
          <View style={styles.actionModalContainer}>
            <Text style={styles.actionModalTitle}>{actionModal?.type === 'COMPLETE' ? 'Complete Trip' : 'Cancel Trip'}</Text>
            <Text style={styles.actionModalSubtitle}>{actionModal?.trip?.tripID}</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Final Odometer (km)</Text>
              <TextInput style={styles.formInput} value={actionOdo} onChangeText={setActionOdo} keyboardType="numeric" />
            </View>
            <View style={[styles.formGroup, { marginTop: rf(16) }]}>
              <Text style={styles.formLabel}>Fuel Consumed (L)</Text>
              <TextInput style={styles.formInput} value={actionFuel} onChangeText={setActionFuel} keyboardType="numeric" />
            </View>

            <View style={[styles.bottomSheetFooter, { marginTop: rf(24) }]}>
              <Pressable style={styles.cancelBtn} onPress={() => setActionModal(null)}>
                <Text style={styles.cancelBtnText}>Back</Text>
              </Pressable>
              <Pressable style={[styles.saveBtn, actionModal?.type === 'CANCEL' && { backgroundColor: colors.rose }]} onPress={handleActionConfirm}>
                <Text style={styles.saveBtnText}>{submitting ? '...' : 'Confirm'}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ADD TRIP MODAL */}
      <Modal visible={showAddModal} transparent={true} animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.bottomSheetOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowAddModal(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHeader}>
              <View>
                <Text style={styles.bottomSheetTitle}>Create Trip</Text>
                <Text style={styles.bottomSheetSubtitle}>Dispatch a new vehicle</Text>
              </View>
              <Pressable onPress={() => setShowAddModal(false)}>
                <X size={24} color={colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
              <View style={styles.formRow}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Source</Text>
                  <TextInput style={styles.formInput} value={source} onChangeText={setSource} placeholder="Depot" placeholderTextColor={colors.textMuted} />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Destination</Text>
                  <TextInput style={styles.formInput} value={destination} onChangeText={setDestination} placeholder="Hub" placeholderTextColor={colors.textMuted} />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Vehicle (Available Only)</Text>
                <Pressable style={styles.dropdownInput} onPress={() => setShowVehicleDropdown(true)}>
                  <Text style={styles.dropdownInputText} numberOfLines={1}>
                    {selectedVehicle ? `${selectedVehicle.name} (${selectedVehicle.capacity} kg)` : 'No vehicles'}
                  </Text>
                  <ChevronDown size={16} color={colors.textMuted} />
                </Pressable>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Driver (Available Only)</Text>
                <Pressable style={styles.dropdownInput} onPress={() => setShowDriverDropdown(true)}>
                  <Text style={styles.dropdownInputText} numberOfLines={1}>
                    {selectedDriver ? selectedDriver.name : 'No drivers'}
                  </Text>
                  <ChevronDown size={16} color={colors.textMuted} />
                </Pressable>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Cargo Weight (kg)</Text>
                  <TextInput style={[styles.formInput, overCapacity && { borderColor: colors.rose, borderWidth: 1 }]} value={cargoWeight} onChangeText={setCargoWeight} placeholder="0" placeholderTextColor={colors.textMuted} keyboardType="numeric" />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Distance (km)</Text>
                  <TextInput style={styles.formInput} value={plannedDistance} onChangeText={setPlannedDistance} placeholder="0" placeholderTextColor={colors.textMuted} keyboardType="numeric" />
                </View>
              </View>

              {/* Validation Alert */}
              {selectedVehicle && cargo > 0 && (
                overCapacity ? (
                  <View style={styles.capacityAlertError}>
                    <Text style={styles.capacityTextError}>Capacity: {selectedVehicle.capacity} kg</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: rf(6), marginTop: rf(4) }}>
                      <X size={14} color={colors.rose} strokeWidth={3} />
                      <Text style={styles.capacityTextErrorBold}>Exceeded by {overBy} kg</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.capacityAlertSuccess}>
                    <CircleCheck size={14} color={colors.green} />
                    <Text style={styles.capacityTextSuccess}>Within capacity ({selectedVehicle.capacity - cargo} kg spare)</Text>
                  </View>
                )
              )}
            </ScrollView>

            <View style={styles.bottomSheetFooter}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.saveBtn, !canDispatch && { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]} onPress={handleDispatch} disabled={!canDispatch}>
                <Text style={[styles.saveBtnText, !canDispatch && { color: colors.textMuted }]}>
                  {submitting ? '...' : 'Dispatch'}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* VEHICLE SELECTION MODAL */}
      <Modal visible={showVehicleDropdown} transparent={true} animationType="fade" onRequestClose={() => setShowVehicleDropdown(false)}>
        <Pressable style={styles.filterModalOverlay} onPress={() => setShowVehicleDropdown(false)}>
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownTitle}>Select Vehicle</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {availableVehicles.map((v: any) => (
                <Pressable key={v.vehicleID} style={styles.dropdownOption} onPress={() => { setVehicleId(String(v.vehicleID)); setShowVehicleDropdown(false); }}>
                  <Text style={[styles.dropdownOptionText, { color: String(v.vehicleID) === String(vehicleId) ? colors.amber : colors.textPrimary }]}>{v.name} ({v.capacity} kg)</Text>
                </Pressable>
              ))}
              {availableVehicles.length === 0 && <Text style={styles.dropdownOptionText}>No vehicles available</Text>}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* DRIVER SELECTION MODAL */}
      <Modal visible={showDriverDropdown} transparent={true} animationType="fade" onRequestClose={() => setShowDriverDropdown(false)}>
        <Pressable style={styles.filterModalOverlay} onPress={() => setShowDriverDropdown(false)}>
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownTitle}>Select Driver</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {availableDrivers.map((d: any) => (
                <Pressable key={d.driverID} style={styles.dropdownOption} onPress={() => { setDriverId(String(d.driverID)); setShowDriverDropdown(false); }}>
                  <Text style={[styles.dropdownOptionText, { color: String(d.driverID) === String(driverId) ? colors.amber : colors.textPrimary }]}>{d.name}</Text>
                </Pressable>
              ))}
              {availableDrivers.length === 0 && <Text style={styles.dropdownOptionText}>No drivers available</Text>}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { paddingHorizontal: rf(16), paddingVertical: rf(24), paddingBottom: rf(40), flexGrow: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rf(20) },
  pageTitle: { color: colors.textPrimary, fontSize: rf(28), fontWeight: '800', letterSpacing: -1 },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.amber, paddingHorizontal: rf(14), paddingVertical: rf(8), borderRadius: rf(8), gap: rf(6) },
  addButtonText: { color: '#1a1200', fontSize: rf(14), fontWeight: '700' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: rf(12), paddingHorizontal: rf(16), height: rf(52), marginBottom: rf(20), gap: rf(10) },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: rf(15), height: '100%' },
  
  listContainer: { gap: rf(12) },
  tripCard: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: rf(16), borderStyle: 'dashed', padding: rf(16) },
  tripCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: rf(12) },
  tripIDText: { color: colors.textPrimary, fontSize: rf(15), fontWeight: '700' },
  tripAssignText: { color: colors.textMuted, fontSize: rf(12), fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  tripCardBody: { marginBottom: rf(12) },
  routeBox: { flexDirection: 'row', alignItems: 'center', gap: rf(8) },
  routeLocation: { color: colors.textPrimary, fontSize: rf(14) },
  routeArrow: { color: colors.textMuted, fontSize: rf(14) },
  tripCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: rf(4) },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: rf(12) },
  statusBadge: { paddingHorizontal: rf(10), paddingVertical: rf(4), borderRadius: rf(20), borderWidth: 1 },
  statusText: { fontSize: rf(11), fontWeight: '700' },
  noteText: { color: colors.textMuted, fontSize: rf(12) },
  actionsRow: { flexDirection: 'row', gap: rf(8) },
  actionBtnCheck: { padding: rf(6), borderRadius: rf(6), backgroundColor: 'rgba(74,222,128,0.1)' },
  actionBtnCross: { padding: rf(6), borderRadius: rf(6), backgroundColor: 'rgba(251,113,133,0.1)' },
  
  emptyState: { padding: rf(40), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderRadius: rf(16), borderWidth: 1, borderColor: colors.borderSoft, borderStyle: 'dashed', marginTop: rf(8) },
  emptyStateIconWrapper: { width: rf(64), height: rf(64), borderRadius: rf(32), backgroundColor: colors.panel, alignItems: 'center', justifyContent: 'center', marginBottom: rf(16), borderWidth: 1, borderColor: colors.borderSoft },
  emptyStateTitle: { color: colors.textPrimary, fontSize: rf(16), fontWeight: '700', marginBottom: rf(8) },
  emptyStateText: { color: colors.textMuted, fontSize: rf(14), textAlign: 'center', lineHeight: rf(20) },
  
  bottomSheetOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: colors.surface, borderTopLeftRadius: rf(24), borderTopRightRadius: rf(24), padding: rf(15), paddingBottom: Platform.OS === 'android' ? rf(55) : rf(32), maxHeight: '90%' },
  bottomSheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: rf(24) },
  bottomSheetTitle: { color: colors.textPrimary, fontSize: rf(20), fontWeight: '700' },
  bottomSheetSubtitle: { color: colors.textMuted, fontSize: rf(13), marginTop: rf(4) },
  formContainer: { gap: rf(16), paddingBottom: rf(20) },
  formRow: { flexDirection: 'row', gap: rf(12) },
  formGroup: { flex: 1, gap: rf(6) },
  formLabel: { color: colors.textMuted, fontSize: rf(11), textTransform: 'uppercase', fontWeight: '700' },
  formInput: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: rf(8), paddingHorizontal: rf(12), height: rf(44), color: colors.textPrimary, fontSize: rf(14) },
  dropdownInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: rf(8), paddingHorizontal: rf(12), height: rf(44) },
  dropdownInputText: { color: colors.textPrimary, fontSize: rf(14) },
  
  bottomSheetFooter: { flexDirection: 'row', gap: rf(20), marginTop: rf(16) },
  cancelBtn: { flex: 1, height: rf(48), backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: rf(12), alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { color: colors.textSecondary, fontSize: rf(15), fontWeight: '600' },
  saveBtn: { flex: 1, height: rf(48), backgroundColor: colors.amber, borderRadius: rf(12), alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#1a1200', fontSize: rf(15), fontWeight: '700' },

  filterModalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', padding: rf(24) },
  dropdownContainer: { backgroundColor: colors.surface, borderRadius: rf(16), borderWidth: 1, borderColor: colors.border, maxHeight: '60%', overflow: 'hidden', paddingVertical: rf(8) },
  dropdownTitle: { color: colors.textMuted, fontSize: rf(12), fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: rf(20), paddingVertical: rf(12), borderBottomWidth: 1, borderBottomColor: colors.borderSoft, marginBottom: rf(8) },
  dropdownOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: rf(14), paddingHorizontal: rf(20) },
  dropdownOptionText: { color: colors.textPrimary, fontSize: rf(15), fontWeight: '600' },

  capacityAlertError: { backgroundColor: 'rgba(251,113,133,0.08)', borderWidth: 1, borderColor: colors.rose, borderRadius: rf(8), padding: rf(12), marginTop: rf(8) },
  capacityTextError: { color: colors.textSecondary, fontSize: rf(13) },
  capacityTextErrorBold: { color: colors.rose, fontSize: rf(13), fontWeight: '600' },
  capacityAlertSuccess: { flexDirection: 'row', alignItems: 'center', gap: rf(8), backgroundColor: 'rgba(74,222,128,0.08)', borderWidth: 1, borderColor: 'rgba(74,222,128,0.4)', borderRadius: rf(8), padding: rf(12), marginTop: rf(8) },
  capacityTextSuccess: { color: colors.green, fontSize: rf(13) },

  actionModalContainer: { backgroundColor: colors.surface, borderRadius: rf(16), padding: rf(24), width: '100%' },
  actionModalTitle: { color: colors.textPrimary, fontSize: rf(18), fontWeight: '700' },
  actionModalSubtitle: { color: colors.textMuted, fontSize: rf(13), marginBottom: rf(20) },
});
