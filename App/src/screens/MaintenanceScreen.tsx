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
  Info,
  Wrench,
} from 'lucide-react-native';
import { rf } from '../theme/responsive';
import { colors } from '../theme/colors';

// --- CONSTANTS ---
const STATUS_STYLES: Record<string, any> = {
  Active: {
    label: 'In Shop',
    bg: 'rgba(255,176,32,0.16)',
    text: colors.amber,
    border: 'rgba(255,176,32,0.45)',
  },
  Completed: {
    label: 'Completed',
    bg: 'rgba(74,222,128,0.16)',
    text: colors.green,
    border: 'rgba(74,222,128,0.45)',
  },
};

const VEHICLES = ['VAN-05', 'TRUCK-11', 'MINI-03', 'VAN-09'];
const STATUS_OPTIONS = ['Active', 'Completed'];

const INITIAL_LOGS = [
  { id: 1, vehicle: 'VAN-05', service: 'Oil Change', cost: 2500, status: 'Active' },
  { id: 2, vehicle: 'TRUCK-11', service: 'Engine Repair', cost: 18000, status: 'Completed' },
  { id: 3, vehicle: 'MINI-03', service: 'Tyre Replace', cost: 6200, status: 'Active' },
];

const inr = (n: number) => `₹${Number(n).toLocaleString('en-IN')}`;

// --- COMPONENTS ---
export default function MaintenanceScreen() {
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState(INITIAL_LOGS);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Form State
  const [formVehicle, setFormVehicle] = useState(VEHICLES[0]);
  const [formService, setFormService] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formDate, setFormDate] = useState('2026-07-07');
  const [formStatus, setFormStatus] = useState('Active');

  const filteredLogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((l) =>
      [l.vehicle, l.service, l.status].some((f) => f.toLowerCase().includes(q))
    );
  }, [logs, search]);

  const canSave = Boolean(formVehicle && formService.trim() && Number(formCost) >= 0 && formDate);

  const resetForm = () => {
    setFormVehicle(VEHICLES[0]);
    setFormService('');
    setFormCost('');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormStatus('Active');
  };

  const handleSave = () => {
    if (!canSave) return;
    setLogs((prev) => [
      {
        id: prev.length ? Math.max(...prev.map((l) => l.id)) + 1 : 1,
        vehicle: formVehicle,
        service: formService,
        cost: Number(formCost) || 0,
        status: formStatus,
      },
      ...prev,
    ]);
    setShowAddModal(false);
    resetForm();
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Maintenance</Text>
          <Pressable style={styles.addButton} onPress={() => { resetForm(); setShowAddModal(true); }}>
            <Plus size={16} color="#1a1200" strokeWidth={2.5} />
            <Text style={styles.addButtonText}>Log Service</Text>
          </Pressable>
        </View>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vehicle or service..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* LIST */}
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Service Log</Text>
          {filteredLogs.length > 0 ? (
            filteredLogs.map((l) => {
              const s = STATUS_STYLES[l.status] || STATUS_STYLES.Active;
              return (
                <View key={l.id} style={styles.logCard}>
                  <View style={styles.logHeader}>
                    <Text style={styles.logVehicle}>{l.vehicle}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: s.bg, borderColor: s.border }]}>
                      <Text style={[styles.statusText, { color: s.text }]}>{s.label}</Text>
                    </View>
                  </View>
                  <View style={styles.logBody}>
                    <View>
                      <Text style={styles.logLabel}>Service Type</Text>
                      <Text style={styles.logValue}>{l.service}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.logLabel}>Cost</Text>
                      <Text style={[styles.logValue, { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>{inr(l.cost)}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIconWrapper}>
                <Wrench size={32} color={colors.textMuted} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyStateTitle}>No records found</Text>
              <Text style={styles.emptyStateText}>
                {search ? `No matches for "${search}".` : "Fleet is fully operational."}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ADD LOG MODAL */}
      <Modal visible={showAddModal} transparent={true} animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.bottomSheetOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowAddModal(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHeader}>
              <View>
                <Text style={styles.bottomSheetTitle}>Log Service</Text>
                <Text style={styles.bottomSheetSubtitle}>Record vehicle maintenance</Text>
              </View>
              <Pressable onPress={() => setShowAddModal(false)}>
                <X size={24} color={colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
              <View style={styles.formRow}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Vehicle</Text>
                  <Pressable style={styles.dropdownInput} onPress={() => setShowVehicleDropdown(true)}>
                    <Text style={styles.dropdownInputText}>{formVehicle}</Text>
                    <ChevronDown size={16} color={colors.textMuted} />
                  </Pressable>
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Status</Text>
                  <Pressable style={styles.dropdownInput} onPress={() => setShowStatusDropdown(true)}>
                    <Text style={styles.dropdownInputText}>{formStatus}</Text>
                    <ChevronDown size={16} color={colors.textMuted} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Service Type</Text>
                <TextInput style={styles.formInput} value={formService} onChangeText={setFormService} placeholder="Oil Change" placeholderTextColor={colors.textMuted} />
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Cost (₹)</Text>
                  <TextInput style={styles.formInput} value={formCost} onChangeText={setFormCost} placeholder="0" placeholderTextColor={colors.textMuted} keyboardType="numeric" />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Date</Text>
                  <TextInput style={styles.formInput} value={formDate} onChangeText={setFormDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} />
                </View>
              </View>
            </ScrollView>

            <View style={styles.bottomSheetFooter}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowAddModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.saveBtn, !canSave && { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]} onPress={handleSave} disabled={!canSave}>
                <Text style={[styles.saveBtnText, !canSave && { color: colors.textMuted }]}>Save Record</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* DROPDOWNS */}
      <Modal visible={showVehicleDropdown} transparent={true} animationType="fade" onRequestClose={() => setShowVehicleDropdown(false)}>
        <Pressable style={styles.filterModalOverlay} onPress={() => setShowVehicleDropdown(false)}>
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownTitle}>Select Vehicle</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {VEHICLES.map((v) => (
                <Pressable key={v} style={styles.dropdownOption} onPress={() => { setFormVehicle(v); setShowVehicleDropdown(false); }}>
                  <Text style={[styles.dropdownOptionText, { color: v === formVehicle ? colors.amber : colors.textPrimary }]}>{v}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={showStatusDropdown} transparent={true} animationType="fade" onRequestClose={() => setShowStatusDropdown(false)}>
        <Pressable style={styles.filterModalOverlay} onPress={() => setShowStatusDropdown(false)}>
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownTitle}>Select Status</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {STATUS_OPTIONS.map((s) => (
                <Pressable key={s} style={styles.dropdownOption} onPress={() => { setFormStatus(s); setShowStatusDropdown(false); }}>
                  <Text style={[styles.dropdownOptionText, { color: s === formStatus ? colors.amber : colors.textPrimary }]}>{s}</Text>
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
  screen: { flex: 1, backgroundColor: colors.bg },
  container: { paddingHorizontal: rf(16), paddingVertical: rf(24), paddingBottom: rf(40), flexGrow: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rf(20) },
  pageTitle: { color: colors.textPrimary, fontSize: rf(28), fontWeight: '800', letterSpacing: -1 },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.amber, paddingHorizontal: rf(14), paddingVertical: rf(8), borderRadius: rf(8), gap: rf(6) },
  addButtonText: { color: '#1a1200', fontSize: rf(14), fontWeight: '700' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: rf(12), paddingHorizontal: rf(16), height: rf(52), marginBottom: rf(16), gap: rf(10) },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: rf(15), height: '100%' },
  
  infoBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: rf(10), backgroundColor: 'rgba(255,176,32,0.08)', padding: rf(14), borderRadius: rf(10), borderWidth: 1, borderColor: 'rgba(255,176,32,0.3)', marginBottom: rf(24) },
  infoBannerText: { flex: 1, color: colors.textSecondary, fontSize: rf(13), lineHeight: rf(18) },

  sectionTitle: { color: colors.textPrimary, fontSize: rf(14), fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: rf(12) },
  listContainer: { gap: rf(12) },
  logCard: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: rf(16), padding: rf(16) },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rf(12) },
  logVehicle: { color: colors.textPrimary, fontSize: rf(16), fontWeight: '700' },
  statusBadge: { paddingHorizontal: rf(10), paddingVertical: rf(4), borderRadius: rf(20), borderWidth: 1 },
  statusText: { fontSize: rf(11), fontWeight: '700' },
  logBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, padding: rf(12), borderRadius: rf(8) },
  logLabel: { color: colors.textMuted, fontSize: rf(11), textTransform: 'uppercase', fontWeight: '700', marginBottom: rf(2) },
  logValue: { color: colors.textPrimary, fontSize: rf(14), fontWeight: '600' },
  
  emptyState: { padding: rf(40), alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderRadius: rf(16), borderWidth: 1, borderColor: colors.borderSoft, borderStyle: 'dashed', marginTop: rf(8) },
  emptyStateIconWrapper: { width: rf(64), height: rf(64), borderRadius: rf(32), backgroundColor: colors.panel, alignItems: 'center', justifyContent: 'center', marginBottom: rf(16), borderWidth: 1, borderColor: colors.borderSoft },
  emptyStateTitle: { color: colors.textPrimary, fontSize: rf(16), fontWeight: '700', marginBottom: rf(8) },
  emptyStateText: { color: colors.textMuted, fontSize: rf(14), textAlign: 'center', lineHeight: rf(20) },

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
