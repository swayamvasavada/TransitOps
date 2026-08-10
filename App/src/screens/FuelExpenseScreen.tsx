import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  Search,
  Plus,
  X,
  ChevronDown,
  Droplet,
  Banknote,
} from 'lucide-react-native';
import { rf } from '../theme/responsive';
import { colors } from '../theme/colors';

// --- CONSTANTS ---
const VEHICLES = ['VAN-05', 'TRUCK-11', 'MINI-03', 'TRK-12', 'VAN-09'];
const TRIPS = ['TR001', 'TR004', 'TR005', 'TR006'];

const INITIAL_FUEL_LOGS = [
  { id: 1, vehicle: 'VAN-05', date: '2026-07-05', liters: 42, cost: 3150 },
  { id: 2, vehicle: 'TRUCK-11', date: '2026-07-06', liters: 110, cost: 8400 },
  { id: 3, vehicle: 'MINI-03', date: '2026-07-06', liters: 28, cost: 2050 },
];

const INITIAL_EXPENSES = [
  { id: 1, trip: 'TR001', vehicle: 'VAN-05', toll: 120, other: 0, maint: 0 },
  { id: 2, trip: 'TR005', vehicle: 'TRK-12', toll: 340, other: 150, maint: 18000 },
];

const inr = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const totalOf = (e: any) => e.toll + e.other + e.maint;

const TotalPill = ({ amount }: { amount: number }) => {
  const color = amount === 0 ? colors.textMuted : amount < 1000 ? colors.green : amount < 10000 ? colors.amber : colors.rose;
  const bg = amount === 0 ? colors.surface : amount < 1000 ? 'rgba(74,222,128,0.14)' : amount < 10000 ? 'rgba(255,176,32,0.14)' : 'rgba(251,113,133,0.16)';
  const border = amount === 0 ? colors.border : `${color}55`;
  return (
    <View style={[styles.totalPill, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.totalPillText, { color }]}>{inr(amount)}</Text>
    </View>
  );
};

// --- COMPONENTS ---
export default function FuelExpenseScreen() {
  const [search, setSearch] = useState('');
  const [fuelLogs, setFuelLogs] = useState(INITIAL_FUEL_LOGS);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);

  // Modals
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState<{ visible: boolean; type: 'VEHICLE' | 'TRIP'; target: 'FUEL' | 'EXPENSE' } | null>(null);

  // Fuel Form
  const [fVehicle, setFVehicle] = useState(VEHICLES[0]);
  const [fDate, setFDate] = useState(new Date().toISOString().slice(0, 10));
  const [fLiters, setFLiters] = useState('');
  const [fCost, setFCost] = useState('');
  
  // Expense Form
  const [eTrip, setETrip] = useState(TRIPS[0]);
  const [eVehicle, setEVehicle] = useState(VEHICLES[0]);
  const [eToll, setEToll] = useState('');
  const [eOther, setEOther] = useState('');
  const [eMaint, setEMaint] = useState('');

  const q = search.trim().toLowerCase();
  
  const filteredFuel = useMemo(
    () => (q ? fuelLogs.filter((f) => f.vehicle.toLowerCase().includes(q)) : fuelLogs),
    [fuelLogs, q]
  );
  const filteredExpenses = useMemo(
    () => (q ? expenses.filter((e) => [e.trip, e.vehicle].some((f) => f.toLowerCase().includes(q))) : expenses),
    [expenses, q]
  );

  const fuelTotal = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
  const maintTotal = expenses.reduce((sum, e) => sum + e.maint, 0);
  const operationalTotal = fuelTotal + maintTotal;

  const saveFuel = () => {
    if (!fLiters || !fCost) return;
    setFuelLogs((prev) => [{ id: prev.length ? Math.max(...prev.map((f) => f.id)) + 1 : 1, vehicle: fVehicle, date: fDate, liters: Number(fLiters), cost: Number(fCost) }, ...prev]);
    setShowFuelModal(false);
    setFLiters('');
    setFCost('');
  };

  const saveExpense = () => {
    setExpenses((prev) => [{ id: prev.length ? Math.max(...prev.map((e) => e.id)) + 1 : 1, trip: eTrip, vehicle: eVehicle, toll: Number(eToll) || 0, other: Number(eOther) || 0, maint: Number(eMaint) || 0 }, ...prev]);
    setShowExpenseModal(false);
    setEToll('');
    setEOther('');
    setEMaint('');
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Fuel & Expenses</Text>
        </View>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vehicle or trip..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* BUTTON ROW */}
        <View style={styles.actionRow}>
          <Pressable style={styles.actionBtn} onPress={() => setShowFuelModal(true)}>
            <Plus size={16} color="#1a1200" strokeWidth={2.5} />
            <Text style={styles.actionBtnText}>Log Fuel</Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={() => setShowExpenseModal(true)}>
            <Plus size={16} color="#1a1200" strokeWidth={2.5} />
            <Text style={styles.actionBtnText}>Add Expense</Text>
          </Pressable>
        </View>

        {/* FUEL LOGS LIST */}
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Fuel Logs</Text>
          {filteredFuel.length > 0 ? (
            filteredFuel.map((f) => (
              <View key={`fuel-${f.id}`} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardVehicle}>{f.vehicle}</Text>
                  <Text style={styles.cardDate}>{formatDate(f.date)}</Text>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.metricCol}>
                    <Text style={styles.metricLabel}>Liters</Text>
                    <Text style={styles.metricValue}>{f.liters} L</Text>
                  </View>
                  <View style={[styles.metricCol, { alignItems: 'flex-end' }]}>
                    <Text style={styles.metricLabel}>Cost</Text>
                    <Text style={styles.metricValue}>{inr(f.cost)}</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Droplet size={32} color={colors.textMuted} strokeWidth={1.5} style={{ marginBottom: rf(12) }} />
              <Text style={styles.emptyStateText}>No fuel logs found.</Text>
            </View>
          )}
        </View>

        {/* EXPENSES LIST */}
        <View style={[styles.listContainer, { marginTop: rf(24) }]}>
          <Text style={styles.sectionTitle}>Other Expenses</Text>
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map((e) => (
              <View key={`exp-${e.id}`} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardVehicle}>{e.trip}</Text>
                  <Text style={styles.cardDate}>{e.vehicle}</Text>
                </View>
                <View style={styles.expenseBody}>
                  <View style={styles.expenseRow}>
                    <Text style={styles.expenseLabel}>Toll:</Text>
                    <Text style={styles.expenseValue}>{inr(e.toll)}</Text>
                  </View>
                  <View style={styles.expenseRow}>
                    <Text style={styles.expenseLabel}>Other:</Text>
                    <Text style={styles.expenseValue}>{inr(e.other)}</Text>
                  </View>
                  <View style={styles.expenseRow}>
                    <Text style={styles.expenseLabel}>Maint:</Text>
                    <Text style={styles.expenseValue}>{inr(e.maint)}</Text>
                  </View>
                  <View style={[styles.expenseRow, { borderTopWidth: 1, borderTopColor: colors.borderSoft, paddingTop: rf(12), marginTop: rf(12) }]}>
                    <Text style={[styles.expenseLabel, { fontWeight: '700', color: colors.textPrimary }]}>Total:</Text>
                    <TotalPill amount={totalOf(e)} />
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Banknote size={32} color={colors.textMuted} strokeWidth={1.5} style={{ marginBottom: rf(12) }} />
              <Text style={styles.emptyStateText}>No expenses found.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FIXED FOOTER TOTAL */}
      <View style={styles.footerTotal}>
        <View>
          <Text style={styles.footerTotalLabel}>Total Operational Cost</Text>
          <Text style={styles.footerTotalSub}>(Fuel + Maint)</Text>
        </View>
        <Text style={styles.footerTotalValue}>{inr(operationalTotal)}</Text>
      </View>

      {/* FUEL MODAL */}
      <Modal visible={showFuelModal} transparent={true} animationType="slide" onRequestClose={() => setShowFuelModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.bottomSheetOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowFuelModal(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHeader}>
              <View>
                <Text style={styles.bottomSheetTitle}>Log Fuel</Text>
                <Text style={styles.bottomSheetSubtitle}>Record a refuelling entry</Text>
              </View>
              <Pressable onPress={() => setShowFuelModal(false)}>
                <X size={24} color={colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Vehicle</Text>
                <Pressable style={styles.dropdownInput} onPress={() => setShowDropdown({ visible: true, type: 'VEHICLE', target: 'FUEL' })}>
                  <Text style={styles.dropdownInputText}>{fVehicle}</Text>
                  <ChevronDown size={16} color={colors.textMuted} />
                </Pressable>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date</Text>
                <TextInput style={styles.formInput} value={fDate} onChangeText={setFDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} />
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Liters</Text>
                  <TextInput style={styles.formInput} value={fLiters} onChangeText={setFLiters} placeholder="0" placeholderTextColor={colors.textMuted} keyboardType="numeric" />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Cost (₹)</Text>
                  <TextInput style={styles.formInput} value={fCost} onChangeText={setFCost} placeholder="0" placeholderTextColor={colors.textMuted} keyboardType="numeric" />
                </View>
              </View>
            </ScrollView>

            <View style={styles.bottomSheetFooter}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowFuelModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={saveFuel}>
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* EXPENSE MODAL */}
      <Modal visible={showExpenseModal} transparent={true} animationType="slide" onRequestClose={() => setShowExpenseModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.bottomSheetOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowExpenseModal(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHeader}>
              <View>
                <Text style={styles.bottomSheetTitle}>Add Expense</Text>
                <Text style={styles.bottomSheetSubtitle}>Toll, misc, or linked maintenance</Text>
              </View>
              <Pressable onPress={() => setShowExpenseModal(false)}>
                <X size={24} color={colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
              <View style={styles.formRow}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Trip</Text>
                  <Pressable style={styles.dropdownInput} onPress={() => setShowDropdown({ visible: true, type: 'TRIP', target: 'EXPENSE' })}>
                    <Text style={styles.dropdownInputText}>{eTrip}</Text>
                    <ChevronDown size={16} color={colors.textMuted} />
                  </Pressable>
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Vehicle</Text>
                  <Pressable style={styles.dropdownInput} onPress={() => setShowDropdown({ visible: true, type: 'VEHICLE', target: 'EXPENSE' })}>
                    <Text style={styles.dropdownInputText}>{eVehicle}</Text>
                    <ChevronDown size={16} color={colors.textMuted} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Toll (₹)</Text>
                  <TextInput style={styles.formInput} value={eToll} onChangeText={setEToll} placeholder="0" placeholderTextColor={colors.textMuted} keyboardType="numeric" />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Other (₹)</Text>
                  <TextInput style={styles.formInput} value={eOther} onChangeText={setEOther} placeholder="0" placeholderTextColor={colors.textMuted} keyboardType="numeric" />
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Maint. (₹)</Text>
                <TextInput style={styles.formInput} value={eMaint} onChangeText={setEMaint} placeholder="0" placeholderTextColor={colors.textMuted} keyboardType="numeric" />
              </View>
            </ScrollView>

            <View style={styles.bottomSheetFooter}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowExpenseModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={saveExpense}>
                <Text style={styles.saveBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* SHARED DROPDOWN MODAL */}
      <Modal visible={!!showDropdown} transparent={true} animationType="fade" onRequestClose={() => setShowDropdown(null)}>
        <Pressable style={styles.filterModalOverlay} onPress={() => setShowDropdown(null)}>
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownTitle}>Select {showDropdown?.type === 'VEHICLE' ? 'Vehicle' : 'Trip'}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {(showDropdown?.type === 'VEHICLE' ? VEHICLES : TRIPS).map((opt) => (
                <Pressable key={opt} style={styles.dropdownOption} onPress={() => {
                  if (showDropdown?.type === 'VEHICLE') {
                    if (showDropdown.target === 'FUEL') setFVehicle(opt);
                    else setEVehicle(opt);
                  } else {
                    setETrip(opt);
                  }
                  setShowDropdown(null);
                }}>
                  <Text style={[styles.dropdownOptionText, { color: colors.textPrimary }]}>{opt}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingBottom: rf(40) },
  container: { paddingHorizontal: rf(16), paddingTop: rf(24), paddingBottom: rf(100), flexGrow: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rf(20) },
  pageTitle: { color: colors.textPrimary, fontSize: rf(28), fontWeight: '800', letterSpacing: -1 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: rf(12), paddingHorizontal: rf(16), height: rf(52), marginBottom: rf(16), gap: rf(10) },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: rf(15), height: '100%' },
  
  actionRow: { flexDirection: 'row', gap: rf(12), marginBottom: rf(24) },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.amber, paddingVertical: rf(12), borderRadius: rf(10), gap: rf(6) },
  actionBtnText: { color: '#1a1200', fontSize: rf(14), fontWeight: '700' },

  sectionTitle: { color: colors.textPrimary, fontSize: rf(14), fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: rf(12) },
  listContainer: { gap: rf(12) },
  
  card: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.borderSoft, borderRadius: rf(16), padding: rf(16) },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rf(12), paddingBottom: rf(12), borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  cardVehicle: { color: colors.textPrimary, fontSize: rf(16), fontWeight: '700' },
  cardDate: { color: colors.textSecondary, fontSize: rf(13) },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricCol: { gap: rf(4) },
  metricLabel: { color: colors.textMuted, fontSize: rf(11), textTransform: 'uppercase', fontWeight: '700' },
  metricValue: { color: colors.textPrimary, fontSize: rf(15), fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: '600' },
  
  expenseBody: { gap: rf(8) },
  expenseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  expenseLabel: { color: colors.textMuted, fontSize: rf(13) },
  expenseValue: { color: colors.textSecondary, fontSize: rf(13), fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  
  totalPill: { paddingHorizontal: rf(10), paddingVertical: rf(4), borderRadius: rf(20), borderWidth: 1 },
  totalPillText: { fontSize: rf(12), fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

  emptyState: { padding: rf(32), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderRadius: rf(16), borderWidth: 1, borderColor: colors.borderSoft, borderStyle: 'dashed' },
  emptyStateText: { color: colors.textMuted, fontSize: rf(14), textAlign: 'center' },

  footerTotal: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.panel, borderTopWidth: 1, borderTopColor: colors.borderStrong, paddingHorizontal: rf(20), paddingBottom: Platform.OS === 'ios' ? rf(34) : rf(20), paddingTop: rf(16), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerTotalLabel: { color: colors.textPrimary, fontSize: rf(12), fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  footerTotalSub: { color: colors.textMuted, fontSize: rf(11) },
  footerTotalValue: { color: colors.amber, fontSize: rf(22), fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

  bottomSheetOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.2)', justifyContent: 'flex-end' },
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

  filterModalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.2)', justifyContent: 'center', padding: rf(24) },
  dropdownContainer: { backgroundColor: colors.surface, borderRadius: rf(16), borderWidth: 1, borderColor: colors.border, maxHeight: '60%', overflow: 'hidden', paddingVertical: rf(8) },
  dropdownTitle: { color: colors.textMuted, fontSize: rf(12), fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: rf(20), paddingVertical: rf(12), borderBottomWidth: 1, borderBottomColor: colors.borderSoft, marginBottom: rf(8) },
  dropdownOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: rf(14), paddingHorizontal: rf(20) },
  dropdownOptionText: { color: colors.textPrimary, fontSize: rf(15), fontWeight: '600' },
});
