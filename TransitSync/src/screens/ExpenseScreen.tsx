import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import { authColors } from "../colors/colors";

const VEHICLES = ["VAN-05", "TRUCK-11", "MINI-03", "TRK-12", "VAN-09"];
const TRIPS = ["TR001", "TR004", "TR005", "TR006"];

export default function ExpenseScreen() {
  const [activeTab, setActiveTab] = useState<"FUEL" | "EXPENSE">("FUEL");
  const [fuelModalVisible, setFuelModalVisible] = useState(false);
  const [expModalVisible, setExpModalVisible] = useState(false);

  // Lists State
  const [fuelLogs, setFuelLogs] = useState([
    { id: 1, vehicle: "VAN-05", date: "2026-07-05", liters: 42, cost: 3150 },
    { id: 2, vehicle: "TRUCK-11", date: "2026-07-06", liters: 110, cost: 8400 },
    { id: 3, vehicle: "MINI-03", date: "2026-07-06", liters: 28, cost: 2050 },
  ]);

  const [expenses, setExpenses] = useState([
    { id: 1, trip: "TR001", vehicle: "VAN-05", toll: 120, other: 0, maint: 0 },
    { id: 2, trip: "TR005", vehicle: "TRK-12", toll: 340, other: 150, maint: 18000 },
  ]);

  // Form State - Fuel
  const [fuelVehicle, setFuelVehicle] = useState(VEHICLES[0]);
  const [fuelLiters, setFuelLiters] = useState("");
  const [fuelCost, setFuelCost] = useState("");

  // Form State - Expenses
  const [expTrip, setExpTrip] = useState(TRIPS[0]);
  const [expVehicle, setExpVehicle] = useState(VEHICLES[0]);
  const [expToll, setExpToll] = useState("");
  const [expOther, setExpOther] = useState("");
  const [expMaint, setExpMaint] = useState("");

  const inr = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

  const handleSaveFuel = () => {
    if (!fuelLiters || !fuelCost) {
      Alert.alert("Error", "Please fill in liters and cost fields");
      return;
    }
    const newLog = {
      id: Date.now(),
      vehicle: fuelVehicle,
      date: new Date().toISOString().split("T")[0],
      liters: Number(fuelLiters),
      cost: Number(fuelCost),
    };
    setFuelLogs((prev) => [newLog, ...prev]);
    setFuelLiters("");
    setFuelCost("");
    setFuelModalVisible(false);
    Alert.alert("Success", "Refueling log saved successfully");
  };

  const handleSaveExpense = () => {
    if (!expToll && !expOther && !expMaint) {
      Alert.alert("Error", "Please enter at least one expense amount");
      return;
    }
    const newExp = {
      id: Date.now(),
      trip: expTrip,
      vehicle: expVehicle,
      toll: Number(expToll) || 0,
      other: Number(expOther) || 0,
      maint: Number(expMaint) || 0,
    };
    setExpenses((prev) => [newExp, ...prev]);
    setExpToll("");
    setExpOther("");
    setExpMaint("");
    setExpModalVisible(false);
    Alert.alert("Success", "Transit expenses logged");
  };

  const getCostPillColor = (amount: number) => {
    if (amount === 0) return { text: authColors.textMuted, bg: authColors.inputBg, border: authColors.cardBorder };
    if (amount < 1000) return { text: authColors.success, bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)" };
    if (amount < 10000) return { text: authColors.roleAccent, bg: "rgba(255,176,32,0.12)", border: "rgba(255,176,32,0.25)" };
    return { text: authColors.error, bg: "rgba(244,63,94,0.12)", border: "rgba(244,63,94,0.25)" };
  };

  return (
    <ScreenWrapper title="Transit Expenses">
      <View style={styles.container}>
        {/* Switch Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "FUEL" && styles.tabButtonActive]}
            onPress={() => setActiveTab("FUEL")}
          >
            <Text style={[styles.tabButtonText, activeTab === "FUEL" && styles.tabButtonTextActive]}>
              ⛽ Fuel Log
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "EXPENSE" && styles.tabButtonActive]}
            onPress={() => setActiveTab("EXPENSE")}
          >
            <Text style={[styles.tabButtonText, activeTab === "EXPENSE" && styles.tabButtonTextActive]}>
              💰 Trip Expenses
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "FUEL" ? (
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Fuel Register</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setFuelModalVisible(true)}>
                <Text style={styles.addButtonText}>+ Log Fuel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollList}>
              {fuelLogs.map((log) => {
                const colors = getCostPillColor(log.cost);
                return (
                  <View key={log.id} style={styles.logCard}>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>{log.vehicle}</Text>
                      <Text style={styles.cardSubtitle}>Date: {log.date} | Vol: {log.liters} L</Text>
                    </View>
                    <View style={[styles.pill, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                      <Text style={[styles.pillText, { color: colors.text }]}>{inr(log.cost)}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Operational Expenses</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setExpModalVisible(true)}>
                <Text style={styles.addButtonText}>+ Add Expense</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollList}>
              {expenses.map((exp) => {
                const total = exp.toll + exp.other + exp.maint;
                const colors = getCostPillColor(total);
                return (
                  <View key={exp.id} style={styles.logCard}>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>{exp.vehicle} ({exp.trip})</Text>
                      <Text style={styles.cardSubtitle}>
                        Toll: {inr(exp.toll)} | Misc: {inr(exp.other)} | Maint: {inr(exp.maint)}
                      </Text>
                    </View>
                    <View style={[styles.pill, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                      <Text style={[styles.pillText, { color: colors.text }]}>{inr(total)}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Add Fuel Log Modal */}
        <Modal
          visible={fuelModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setFuelModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Refueling Log Entry</Text>
                <TouchableOpacity onPress={() => setFuelModalVisible(false)}>
                  <Text style={styles.modalCloseIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formPadding}>
                <Text style={styles.formLabel}>Select Vehicle *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizList}>
                  {VEHICLES.map((v) => (
                    <TouchableOpacity
                      key={v}
                      style={[styles.selectChip, fuelVehicle === v && styles.selectChipActive]}
                      onPress={() => setFuelVehicle(v)}
                    >
                      <Text style={[styles.chipText, fuelVehicle === v && styles.chipTextActive]}>{v}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.formLabel}>Fuel Volume (Liters) *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. 45"
                  placeholderTextColor={authColors.textMuted}
                  keyboardType="numeric"
                  value={fuelLiters}
                  onChangeText={setFuelLiters}
                />

                <Text style={styles.formLabel}>Fuel Cost (₹) *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. 3500"
                  placeholderTextColor={authColors.textMuted}
                  keyboardType="numeric"
                  value={fuelCost}
                  onChangeText={setFuelCost}
                />

                <View style={styles.formActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setFuelModalVisible(false)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSaveFuel}>
                    <Text style={styles.saveBtnText}>Save Entry</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Add Expenses Modal */}
        <Modal
          visible={expModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setExpModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Trip Operations Expense</Text>
                <TouchableOpacity onPress={() => setExpModalVisible(false)}>
                  <Text style={styles.modalCloseIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formPadding}>
                <Text style={styles.formLabel}>Linked Trip ID *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizList}>
                  {TRIPS.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.selectChip, expTrip === t && styles.selectChipActive]}
                      onPress={() => setExpTrip(t)}
                    >
                      <Text style={[styles.chipText, expTrip === t && styles.chipTextActive]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.formLabel}>Vehicle *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizList}>
                  {VEHICLES.map((v) => (
                    <TouchableOpacity
                      key={v}
                      style={[styles.selectChip, expVehicle === v && styles.selectChipActive]}
                      onPress={() => setExpVehicle(v)}
                    >
                      <Text style={[styles.chipText, expVehicle === v && styles.chipTextActive]}>{v}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.formLabel}>Toll Plaza Charges (₹)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. 150"
                  placeholderTextColor={authColors.textMuted}
                  keyboardType="numeric"
                  value={expToll}
                  onChangeText={setExpToll}
                />

                <Text style={styles.formLabel}>Maintenance Cost (₹)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. 15000"
                  placeholderTextColor={authColors.textMuted}
                  keyboardType="numeric"
                  value={expMaint}
                  onChangeText={setExpMaint}
                />

                <Text style={styles.formLabel}>Other / Misc Charges (₹)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. 100"
                  placeholderTextColor={authColors.textMuted}
                  keyboardType="numeric"
                  value={expOther}
                  onChangeText={setExpOther}
                />

                <View style={styles.formActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setExpModalVisible(false)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSaveExpense}>
                    <Text style={styles.saveBtnText}>Save Entry</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: authColors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: authColors.cardBorder,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: authColors.cardBg,
    borderWidth: 1,
    borderColor: authColors.cardBorder,
  },
  tabButtonText: {
    fontSize: 13,
    color: authColors.textSecondary,
    fontWeight: "500",
  },
  tabButtonTextActive: {
    color: authColors.roleAccent,
    fontWeight: "600",
  },
  panel: {
    flex: 1,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: authColors.textPrimary,
  },
  addButton: {
    backgroundColor: authColors.roleAccent,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addButtonText: {
    color: "#1a1200",
    fontSize: 13,
    fontWeight: "700",
  },
  scrollList: {
    gap: 12,
    paddingBottom: 24,
  },
  logCard: {
    backgroundColor: authColors.cardBg,
    borderWidth: 1,
    borderColor: authColors.cardBorder,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: authColors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: authColors.textMuted,
    marginTop: 4,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: authColors.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    borderWidth: 1,
    borderColor: authColors.cardBorder,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: authColors.cardBorder,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: authColors.textPrimary,
  },
  modalCloseIcon: {
    fontSize: 20,
    color: authColors.textMuted,
  },
  formPadding: {
    padding: 20,
    paddingBottom: 40,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: authColors.textMuted,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  formInput: {
    backgroundColor: authColors.inputBg,
    borderWidth: 1,
    borderColor: authColors.inputBorder,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    color: authColors.textPrimary,
    fontSize: 14,
    marginBottom: 16,
  },
  horizList: {
    flexGrow: 0,
    marginBottom: 16,
  },
  selectChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: authColors.inputBg,
    borderWidth: 1,
    borderColor: authColors.cardBorder,
    marginRight: 8,
  },
  selectChipActive: {
    borderColor: authColors.roleAccent,
    backgroundColor: authColors.roleActiveBg,
  },
  chipText: {
    fontSize: 12,
    color: authColors.textSecondary,
  },
  chipTextActive: {
    color: authColors.roleAccent,
    fontWeight: "600",
  },
  formActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: authColors.inputBg,
    borderWidth: 1,
    borderColor: authColors.cardBorder,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelBtnText: {
    color: authColors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  saveBtn: {
    flex: 2,
    backgroundColor: authColors.roleAccent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#1a1200",
    fontSize: 14,
    fontWeight: "700",
  },
});
