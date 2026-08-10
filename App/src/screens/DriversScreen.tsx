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
  Users,
  X,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react-native';
import { rf } from '../theme/responsive';
import { colors } from '../theme/colors';
import useDriverStore from '../store/DriverStore';
import useAuthStore from '../store/AuthStore';

// --- CONSTANTS ---
const STATUS_STYLES: Record<string, any> = {
  Available: {
    bg: 'rgba(74,222,128,0.14)',
    text: '#8FA28A',
    border: 'rgba(74,222,128,0.4)',
  },
  'On Trip': {
    bg: 'rgba(56,189,248,0.14)',
    text: '#007DCC',
    border: 'rgba(56,189,248,0.4)',
  },
  'Off Duty': {
    bg: 'rgba(136,145,171,0.14)',
    text: colors.textSecondary,
    border: 'rgba(136,145,171,0.4)',
  },
  Suspended: {
    bg: 'rgba(251,146,60,0.14)',
    text: '#fb923c',
    border: 'rgba(251,146,60,0.4)',
  },
};

const STATUS_OPTIONS = ['Available', 'On Trip', 'Off Duty', 'Suspended'];

const MOCK_DRIVERS = [
  {
    driverID: 'd1',
    name: 'John Doe',
    licenseNo: 'DL-55291',
    licenseExpiryDate: '12/2028',
    phoneNo: '9876543210',
    trips: 85,
    safetyScore: 98,
    status: 'Available',
  },
  {
    driverID: 'd2',
    name: 'Jane Smith',
    licenseNo: 'DL-88402',
    licenseExpiryDate: '06/2025',
    phoneNo: '9876512345',
    trips: 42,
    safetyScore: 100,
    status: 'On Trip',
  },
  {
    driverID: 'd3',
    name: 'Robert Fox',
    licenseNo: 'DL-11029',
    licenseExpiryDate: '01/2024',
    phoneNo: '9876598765',
    trips: 112,
    safetyScore: 92,
    status: 'Off Duty',
  },
  {
    driverID: 'd4',
    name: 'Albert Flores',
    licenseNo: 'DL-99210',
    licenseExpiryDate: '09/2026',
    phoneNo: '9876500000',
    trips: 15,
    safetyScore: 65,
    status: 'Suspended',
  },
];

function isExpired(expiry: string) {
  if (!expiry || typeof expiry !== 'string') return false;
  const parts = expiry.split('/').map(Number);
  if (!parts || parts.length < 2) return false;
  const [mm, yyyy] = parts;
  if (!mm || !yyyy) return false;
  const endOfMonth = new Date(yyyy, mm, 0, 23, 59, 59);
  return endOfMonth < new Date();
}

// --- COMPONENTS ---
const DriverCard = ({ driver }: { driver: any }) => {
  const displayStatus = (driver.status || driver.driverStatus || 'Available')
    .replace(/_/g, ' ')
    .replace(/\w\S*/g, (w: string) => w.replace(/^\w/, (c) => c.toUpperCase()));

  const style = STATUS_STYLES[displayStatus] || STATUS_STYLES.Available;
  const expired = isExpired(driver.licenseExpiryDate);

  return (
    <View style={styles.driverCard}>
      {/* Header */}
      <View style={styles.driverCardHeader}>
        <View style={styles.driverCardLicenseBox}>
          <Text style={styles.driverCardLicense}>{driver.licenseNo || 'N/A'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: style.bg, borderColor: style.border }]}>
          <Text style={[styles.statusText, { color: style.text }]}>{displayStatus}</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.driverCardBody}>
        <View style={styles.driverMainInfo}>
          <Text style={styles.driverName}>{driver.name || 'Unnamed Driver'}</Text>
          <Text style={styles.driverContact}>{driver.phoneNo || 'No Contact'}</Text>
        </View>
        <View style={styles.driverExpiryWrapper}>
          <Text style={[styles.expiryText, { color: expired ? colors.rose : colors.textSecondary }]}>
            Exp: {driver.licenseExpiryDate || 'N/A'}
          </Text>
          {expired && (
            <View style={styles.expiredTag}>
              <AlertTriangle size={12} color={colors.rose} />
              <Text style={styles.expiredTagText}>Expired</Text>
            </View>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.driverCardFooter}>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Trips</Text>
          <Text style={styles.footerValue}>{driver.trips ?? '-'}</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>Safety</Text>
          <Text style={[styles.footerValue, { color: colors.teal }]}>{driver.safetyScore ?? 100}%</Text>
        </View>
      </View>
    </View>
  );
};

export default function DriversScreen() {
  const { drivers, fetchDrivers } = useDriverStore();
  const { signup } = useAuthStore();

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formLicense, setFormLicense] = useState('');
  const [formExpiry, setFormExpiry] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formTrips, setFormTrips] = useState('');
  const [formSafety, setFormSafety] = useState('100');
  const [formStatus, setFormStatus] = useState('Available');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // useEffect(() => {
  //   fetchDrivers();
  // }, [fetchDrivers]);

  useEffect(() => {
  }, []);

  const filteredDrivers = useMemo(() => {
    const dataSource = drivers.length > 0 ? drivers : MOCK_DRIVERS;
    return dataSource.filter((d: any) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      const nameVal = (d.name || '').toLowerCase();
      const licenseVal = (d.licenseNo || '').toLowerCase();
      const contactVal = (d.phoneNo || '').toLowerCase();

      return nameVal.includes(q) || licenseVal.includes(q) || contactVal.includes(q);
    });
  }, [drivers, search]);

  const openAddModal = () => {
    setFormName('');
    setFormLicense('');
    setFormExpiry('');
    setFormContact('');
    setFormTrips('');
    setFormSafety('100');
    setFormStatus('Available');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formName || !formLicense || !formExpiry) {
      Alert.alert('Validation Error', 'Name, License No., and Expiry are required.');
      return;
    }

    // Attempt to parse expiry date for the backend ISO format (if needed, mimicking web behavior)
    let licenseExpiryDate = formExpiry;
    try {
      const parts = formExpiry.split('/');
      if (parts.length === 2) {
        const month = Number(parts[0]);
        const year = Number(parts[1]);
        if (!isNaN(month) && !isNaN(year)) {
          licenseExpiryDate = new Date(year, month - 1, 1).toISOString();
        }
      }
    } catch (e) {
      // ignore parsing errors, use original string
    }

    const newDriver = {
      name: formName,
      email: `${formName.toLowerCase().replace(/\s+/g, '')}@fleet.com`,
      password: 'DriverPassword123!',
      phoneNo: formContact,
      licenseNo: formLicense,
      licenseExpiryDate,
      role: 'ROLE_DRIVER',
      driverStatus: formStatus.toUpperCase().replace(/\s+/g, '_'),
      safetyScore: Number(formSafety) || 100,
      trips: Number(formTrips) || 0,
      driverID: null,
    };

    const result = await signup(newDriver);

    if (result.success) {
      await fetchDrivers();
      setShowModal(false);
    } else {
      Alert.alert('Error', result.message || 'Failed to register driver');
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Drivers</Text>
          <Pressable style={styles.addButton} onPress={openAddModal}>
            <Plus size={16} color="#1a1200" strokeWidth={2.5} />
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        </View>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search name, license or contact..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* LIST */}
        <View style={styles.listContainer}>
          {filteredDrivers.length > 0 ? (
            filteredDrivers.map((driver: any) => (
              <DriverCard
                key={driver.driverID || driver.id || driver.name}
                driver={driver}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIconWrapper}>
                <Users size={32} color={colors.textMuted} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyStateTitle}>No drivers found</Text>
              <Text style={styles.emptyStateText}>
                {search ? `We couldn't find any drivers matching "${search}".` : "Your roster is empty."}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ADD DRIVER MODAL */}
      <Modal visible={showModal} transparent={true} animationType="slide" onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.bottomSheetOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowModal(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHeader}>
              <View>
                <Text style={styles.bottomSheetTitle}>New Driver</Text>
                <Text style={styles.bottomSheetSubtitle}>Fill in driver details below</Text>
              </View>
              <Pressable onPress={() => setShowModal(false)}>
                <X size={24} color={colors.textMuted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
              <View style={styles.formRow}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Name</Text>
                  <TextInput style={styles.formInput} value={formName} onChangeText={setFormName} placeholder="Driver name" placeholderTextColor={colors.textMuted} />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>License No.</Text>
                  <TextInput style={styles.formInput} value={formLicense} onChangeText={setFormLicense} placeholder="DL-00000" placeholderTextColor={colors.textMuted} />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Expiry (MM/YYYY)</Text>
                  <TextInput style={styles.formInput} value={formExpiry} onChangeText={setFormExpiry} placeholder="12/2028" placeholderTextColor={colors.textMuted} />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Contact</Text>
                  <TextInput style={styles.formInput} value={formContact} onChangeText={setFormContact} placeholder="98765xxxxx" placeholderTextColor={colors.textMuted} keyboardType="phone-pad" />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Trips Compl.</Text>
                  <TextInput style={styles.formInput} value={formTrips} onChangeText={setFormTrips} placeholder="0" placeholderTextColor={colors.textMuted} keyboardType="numeric" />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Safety (%)</Text>
                  <TextInput style={styles.formInput} value={formSafety} onChangeText={setFormSafety} placeholder="100" placeholderTextColor={colors.textMuted} keyboardType="numeric" />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Status</Text>
                  <Pressable style={styles.dropdownInput} onPress={() => setShowStatusDropdown(true)}>
                    <Text style={styles.dropdownInputText}>{formStatus}</Text>
                    <ChevronDown size={16} color={colors.textMuted} />
                  </Pressable>
                </View>
              </View>
            </ScrollView>

            <View style={styles.bottomSheetFooter}>
              <Pressable style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save Driver</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* STATUS SELECTION MODAL (For Add Driver Form) */}
      <Modal visible={showStatusDropdown} transparent={true} animationType="fade" onRequestClose={() => setShowStatusDropdown(false)}>
        <Pressable style={styles.filterModalOverlay} onPress={() => setShowStatusDropdown(false)}>
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownTitle}>Select Status</Text>
            {STATUS_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                style={styles.dropdownOption}
                onPress={() => {
                  setFormStatus(opt);
                  setShowStatusDropdown(false);
                }}
              >
                <Text style={[styles.dropdownOptionText, { color: opt === formStatus ? colors.amber : colors.textPrimary }]}>{opt}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingBottom: rf(90) },
  container: { paddingHorizontal: rf(16), paddingVertical: rf(24), paddingBottom: rf(40), flexGrow: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: rf(20) },
  pageTitle: { color: colors.textPrimary, fontSize: rf(28), fontWeight: '800', letterSpacing: -1 },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.amber, paddingHorizontal: rf(14), paddingVertical: rf(8), borderRadius: rf(8), gap: rf(6) },
  addButtonText: { color: '#1a1200', fontSize: rf(14), fontWeight: '700' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: rf(12), paddingHorizontal: rf(16), height: rf(52), marginBottom: rf(20), gap: rf(10) },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: rf(15), height: '100%' },

  listContainer: { gap: rf(12) },
  driverCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: rf(16), overflow: 'hidden' },
  driverCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: rf(16), paddingVertical: rf(12), backgroundColor: colors.panel, borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  driverCardLicenseBox: { backgroundColor: colors.bg, paddingHorizontal: rf(8), paddingVertical: rf(4), borderRadius: rf(6), borderWidth: 1, borderColor: colors.border },
  driverCardLicense: { color: colors.textMuted, fontSize: rf(12), fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: '700' },
  driverCardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: rf(16), borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  driverMainInfo: { gap: rf(4) },
  driverName: { color: colors.textPrimary, fontSize: rf(16), fontWeight: '700' },
  driverContact: { color: colors.textSecondary, fontSize: rf(13) },
  driverExpiryWrapper: { alignItems: 'flex-end', gap: rf(4) },
  expiryText: { fontSize: rf(13), fontWeight: '600' },
  expiredTag: { flexDirection: 'row', alignItems: 'center', gap: rf(4), backgroundColor: 'rgba(251,113,133,0.15)', paddingHorizontal: rf(6), paddingVertical: rf(2), borderRadius: rf(4) },
  expiredTagText: { color: colors.rose, fontSize: rf(10), fontWeight: '700', textTransform: 'uppercase' },

  statusBadge: { paddingHorizontal: rf(10), paddingVertical: rf(4), borderRadius: rf(20), borderWidth: 1 },
  statusText: { fontSize: rf(12), fontWeight: '700' },

  driverCardFooter: { flexDirection: 'row', justifyContent: 'space-between', padding: rf(16), backgroundColor: colors.panel },
  footerItem: { gap: rf(2) },
  footerLabel: { color: colors.textMuted, fontSize: rf(10), textTransform: 'uppercase', fontWeight: '700' },
  footerValue: { color: colors.textPrimary, fontSize: rf(13), fontWeight: '600' },

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
