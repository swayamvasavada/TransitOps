import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import useAuthStore from "../store/AuthStore";
import { authColors } from "../colors/colors";

const { width } = Dimensions.get("window");

// Safely load react-native-maps if native module is linked in binary
let MapViewComponent: any = null;
let MarkerComponent: any = null;
let PolylineComponent: any = null;
let PROVIDER_DEFAULT_VAL: any = null;
let isNativeMapLinked = false;

try {
  const MapsModule = require("react-native-maps");
  MapViewComponent = MapsModule.default;
  MarkerComponent = MapsModule.Marker;
  PolylineComponent = MapsModule.Polyline;
  PROVIDER_DEFAULT_VAL = MapsModule.PROVIDER_DEFAULT;
  isNativeMapLinked = !!MapViewComponent;
} catch (e) {
  isNativeMapLinked = false;
}

// Location Preset Data
export interface LocationPreset {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

const PRESET_LOCATIONS: LocationPreset[] = [
  {
    id: "loc-1",
    name: "Central Logistics Depot - Bay 4",
    address: "100 Fleet Ave, Industrial Hub",
    latitude: 37.7749,
    longitude: -122.4194,
  },
  {
    id: "loc-2",
    name: "Port Container Terminal B",
    address: "550 Pier Gateway, Maritime Zone",
    latitude: 37.7883,
    longitude: -122.4017,
  },
  {
    id: "loc-3",
    name: "North Express Distribution Yard",
    address: "2400 Freeway Way, Suburb North",
    latitude: 37.7950,
    longitude: -122.4280,
  },
  {
    id: "loc-4",
    name: "Downtown Transit Hub",
    address: "78 Market Plaza, Center City",
    latitude: 37.7650,
    longitude: -122.4120,
  },
  {
    id: "loc-5",
    name: "Westside Cargo & Freight Yard",
    address: "890 Freight St, Westside",
    latitude: 37.7520,
    longitude: -122.4350,
  },
];

export default function DriverNavigationScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const mapRef = useRef<any>(null);

  // Authorization check (Facility only for Drivers)
  const [demoDriverAccess, setDemoDriverAccess] = useState<boolean>(false);
  const isDriver = user?.role === "ROLE_DRIVER" || demoDriverAccess;

  // Selected Pickup & Destination
  const [pickup, setPickup] = useState<LocationPreset>(PRESET_LOCATIONS[0]);
  const [destination, setDestination] = useState<LocationPreset>(PRESET_LOCATIONS[1]);

  const [pickupInput, setPickupInput] = useState(PRESET_LOCATIONS[0].name);
  const [destInput, setDestInput] = useState(PRESET_LOCATIONS[1].name);

  const [showPickupPresets, setShowPickupPresets] = useState(false);
  const [showDestPresets, setShowDestPresets] = useState(false);

  // Navigation Status State
  const [navState, setNavState] = useState<"IDLE" | "EN_ROUTE_PICKUP" | "EN_ROUTE_DEST" | "COMPLETED">("IDLE");

  // Calculate Region & Distance
  const region = {
    latitude: (pickup.latitude + destination.latitude) / 2,
    longitude: (pickup.longitude + destination.longitude) / 2,
    latitudeDelta: Math.max(Math.abs(pickup.latitude - destination.latitude) * 1.6, 0.05),
    longitudeDelta: Math.max(Math.abs(pickup.longitude - destination.longitude) * 1.6, 0.05),
  };

  // Generate intermediate route coordinates for smooth polyline display
  const routeCoordinates = [
    { latitude: pickup.latitude, longitude: pickup.longitude },
    {
      latitude: pickup.latitude + (destination.latitude - pickup.latitude) * 0.3 + 0.003,
      longitude: pickup.longitude + (destination.longitude - pickup.longitude) * 0.2 - 0.002,
    },
    {
      latitude: pickup.latitude + (destination.latitude - pickup.latitude) * 0.7 - 0.002,
      longitude: pickup.longitude + (destination.longitude - pickup.longitude) * 0.8 + 0.003,
    },
    { latitude: destination.latitude, longitude: destination.longitude },
  ];

  // Calculated distance & ETA mock logic based on coordinates
  const latDiff = Math.abs(pickup.latitude - destination.latitude);
  const lngDiff = Math.abs(pickup.longitude - destination.longitude);
  const estimatedKm = (Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111).toFixed(1);
  const estimatedTimeMins = Math.round(parseFloat(estimatedKm) * 2.2 + 5);

  const handleSelectPickup = (loc: LocationPreset) => {
    setPickup(loc);
    setPickupInput(loc.name);
    setShowPickupPresets(false);
  };

  const handleSelectDestination = (loc: LocationPreset) => {
    setDestination(loc);
    setDestInput(loc.name);
    setShowDestPresets(false);
  };

  const handleSwapLocations = () => {
    const tempLoc = pickup;
    const tempInput = pickupInput;

    setPickup(destination);
    setPickupInput(destInput);

    setDestination(tempLoc);
    setDestInput(tempInput);
  };

  const handleFitRoute = () => {
    if (isNativeMapLinked && mapRef.current?.fitToCoordinates) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: pickup.latitude, longitude: pickup.longitude },
          { latitude: destination.latitude, longitude: destination.longitude },
        ],
        {
          edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
          animated: true,
        }
      );
    } else {
      Alert.alert("Route Recentered", `Centered route from ${pickup.name} to ${destination.name}`);
    }
  };

  const handleStartTrip = () => {
    if (navState === "IDLE") {
      setNavState("EN_ROUTE_PICKUP");
      Alert.alert("Navigation Started", `En route to pickup location:\n${pickup.name}`);
    } else if (navState === "EN_ROUTE_PICKUP") {
      setNavState("EN_ROUTE_DEST");
      Alert.alert("Arrived at Pickup", `Cargo loaded. Now navigating to destination:\n${destination.name}`);
    } else if (navState === "EN_ROUTE_DEST") {
      setNavState("COMPLETED");
      Alert.alert("Trip Completed", `Delivery completed at ${destination.name}!`);
    } else {
      setNavState("IDLE");
    }
  };

  // If NOT a driver, render access restriction screen
  if (!isDriver) {
    return (
      <ScreenWrapper title="Driver Navigation">
        <View style={styles.accessDeniedContainer}>
          <View style={styles.accessDeniedCard}>
            <View style={styles.accessIconContainer}>
              <Text style={styles.accessIcon}>🛡️</Text>
            </View>
            <Text style={styles.accessDeniedTitle}>Driver Only Facility</Text>
            <Text style={styles.accessDeniedBadge}>RESTRICTED MODULE</Text>
            <Text style={styles.accessDeniedBody}>
              The interactive Navigation and Pickup/Destination dispatch tool is restricted exclusively to{" "}
              <Text style={styles.boldText}>Drivers (ROLE_DRIVER)</Text>.
            </Text>
            <Text style={styles.accessRoleSubtext}>
              Your active role: <Text style={styles.userRoleTag}>{user?.role || "UNKNOWN_ROLE"}</Text>
            </Text>

            <View style={styles.accessActionRow}>
              <TouchableOpacity
                style={styles.demoOverrideButton}
                onPress={() => setDemoDriverAccess(true)}
              >
                <Text style={styles.demoOverrideText}>🔓 Enable Driver Preview Mode</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backDashboardButton}
                onPress={() => navigation.navigate("Dashboard")}
              >
                <Text style={styles.backDashboardText}>Return to Dashboard</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper title="Driver Navigation">
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {/* Top Header Card with Driver Role Indicator */}
        <View style={styles.headerBanner}>
          <View style={styles.driverBadgeRow}>
            <Text style={styles.driverBadgeIcon}>🚛</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.driverBadgeTitle}>Driver Navigation Console</Text>
              <Text style={styles.driverBadgeSubtitle}>Driver Authorized Access • Active Session</Text>
            </View>
          </View>
          {demoDriverAccess && (
            <View style={styles.demoBannerTag}>
              <Text style={styles.demoBannerText}>PREVIEW MODE ACTIVE</Text>
            </View>
          )}
        </View>

        {/* Pickup & Destination Controls */}
        <View style={styles.inputsCard}>
          <Text style={styles.sectionHeading}>Route Setup</Text>

          {/* Pickup Input Row */}
          <View style={styles.inputGroup}>
            <View style={styles.locationLabelRow}>
              <Text style={[styles.locationDot, { color: "#10B981" }]}>🟢</Text>
              <Text style={styles.inputLabel}>Pickup Location</Text>
            </View>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => {
                setShowPickupPresets(!showPickupPresets);
                setShowDestPresets(false);
              }}
            >
              <TextInput
                style={styles.textInput}
                value={pickupInput}
                onChangeText={setPickupInput}
                placeholder="Enter pickup address or choose preset..."
                placeholderTextColor={authColors.neutral400}
                editable={true}
              />
              <Text style={styles.chevron}>▼</Text>
            </TouchableOpacity>

            {/* Pickup Presets Dropdown */}
            {showPickupPresets && (
              <View style={styles.presetDropdown}>
                <Text style={styles.presetHeader}>Select Preset Pickup Location:</Text>
                {PRESET_LOCATIONS.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.presetItem}
                    onPress={() => handleSelectPickup(item)}
                  >
                    <Text style={styles.presetName}>{item.name}</Text>
                    <Text style={styles.presetAddress}>{item.address}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Swap Button */}
          <TouchableOpacity style={styles.swapButton} onPress={handleSwapLocations}>
            <Text style={styles.swapIcon}>⇅</Text>
            <Text style={styles.swapText}>Swap Pickup & Destination</Text>
          </TouchableOpacity>

          {/* Destination Input Row */}
          <View style={styles.inputGroup}>
            <View style={styles.locationLabelRow}>
              <Text style={[styles.locationDot, { color: "#EF4444" }]}>🔴</Text>
              <Text style={styles.inputLabel}>Destination Location</Text>
            </View>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => {
                setShowDestPresets(!showDestPresets);
                setShowPickupPresets(false);
              }}
            >
              <TextInput
                style={styles.textInput}
                value={destInput}
                onChangeText={setDestInput}
                placeholder="Enter destination address or choose preset..."
                placeholderTextColor={authColors.neutral400}
                editable={true}
              />
              <Text style={styles.chevron}>▼</Text>
            </TouchableOpacity>

            {/* Destination Presets Dropdown */}
            {showDestPresets && (
              <View style={styles.presetDropdown}>
                <Text style={styles.presetHeader}>Select Preset Destination Location:</Text>
                {PRESET_LOCATIONS.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.presetItem}
                    onPress={() => handleSelectDestination(item)}
                  >
                    <Text style={styles.presetName}>{item.name}</Text>
                    <Text style={styles.presetAddress}>{item.address}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Map Container View */}
        <View style={styles.mapCard}>
          <View style={styles.mapHeaderRow}>
            <Text style={styles.mapTitle}>Live Navigation Map</Text>
            <TouchableOpacity style={styles.recenterButton} onPress={handleFitRoute}>
              <Text style={styles.recenterText}>🎯 Fit Route</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mapWrapper}>
            {isNativeMapLinked && MapViewComponent ? (
              <MapViewComponent
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_DEFAULT_VAL}
                initialRegion={region}
                showsUserLocation={true}
                showsCompass={true}
              >
                <MarkerComponent
                  coordinate={{ latitude: pickup.latitude, longitude: pickup.longitude }}
                  title="PICKUP POINT"
                  description={pickup.name}
                  pinColor="green"
                />
                <MarkerComponent
                  coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
                  title="DESTINATION"
                  description={destination.name}
                  pinColor="red"
                />
                <PolylineComponent
                  coordinates={routeCoordinates}
                  strokeColor="#2563EB"
                  strokeWidth={4}
                />
              </MapViewComponent>
            ) : (
              /* Fallback Interactive Route Grid Canvas when Native Map binary is rebuilding */
              <View style={styles.vectorMapCanvas}>
                <View style={styles.gridOverlay}>
                  {/* Route Connection Vector Line */}
                  <View style={styles.vectorLineContainer}>
                    <View style={styles.vectorDashedLine} />
                  </View>

                  {/* Pickup Pin */}
                  <View style={styles.vectorPinPickup}>
                    <View style={styles.pinBadgePickup}>
                      <Text style={styles.pinText}>🟢 PICKUP</Text>
                    </View>
                    <Text style={styles.pinName} numberOfLines={1}>{pickup.name}</Text>
                    <Text style={styles.pinCoords}>{pickup.latitude.toFixed(4)}, {pickup.longitude.toFixed(4)}</Text>
                  </View>

                  {/* Destination Pin */}
                  <View style={styles.vectorPinDest}>
                    <View style={styles.pinBadgeDest}>
                      <Text style={styles.pinText}>🔴 DESTINATION</Text>
                    </View>
                    <Text style={styles.pinName} numberOfLines={1}>{destination.name}</Text>
                    <Text style={styles.pinCoords}>{destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}</Text>
                  </View>
                </View>

                <View style={styles.nativeMapNotice}>
                  <Text style={styles.nativeMapNoticeText}>
                    💡 Interactive Dynamic Route Mode • React-Native-Maps module added to package.json
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Route Details Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryStatsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Est. Distance</Text>
              <Text style={styles.statValue}>{estimatedKm} km</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Est. Travel Time</Text>
              <Text style={styles.statValue}>{estimatedTimeMins} mins</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Traffic Status</Text>
              <Text style={[styles.statValue, { color: "#10B981" }]}>Clear 🟢</Text>
            </View>
          </View>

          {/* Navigation Action CTA */}
          <TouchableOpacity
            style={[
              styles.navActionButton,
              navState === "EN_ROUTE_PICKUP" && { backgroundColor: "#D97706" },
              navState === "EN_ROUTE_DEST" && { backgroundColor: "#10B981" },
              navState === "COMPLETED" && { backgroundColor: "#475569" },
            ]}
            onPress={handleStartTrip}
          >
            <Text style={styles.navActionText}>
              {navState === "IDLE" && "🚀 Start Route Navigation"}
              {navState === "EN_ROUTE_PICKUP" && "📍 Arrived at Pickup Point"}
              {navState === "EN_ROUTE_DEST" && "🏁 Complete Delivery"}
              {navState === "COMPLETED" && "🔄 Reset Trip Status"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Turn-by-Turn Guidance Steps */}
        <View style={styles.directionsCard}>
          <Text style={styles.sectionHeading}>Turn-by-Turn Instructions</Text>
          <View style={styles.stepRow}>
            <Text style={styles.stepNum}>1</Text>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>Depart from {pickup.name}</Text>
              <Text style={styles.stepDetail}>Head North toward Main Express Route (0.4 km)</Text>
            </View>
          </View>
          <View style={styles.stepRow}>
            <Text style={styles.stepNum}>2</Text>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>Merge onto Transit Expressway</Text>
              <Text style={styles.stepDetail}>Continue straight for {Math.round(parseFloat(estimatedKm) * 0.7)} km</Text>
            </View>
          </View>
          <View style={styles.stepRow}>
            <Text style={styles.stepNum}>3</Text>
            <View style={styles.stepBody}>
              <Text style={styles.stepTitle}>Take Exit 14 toward {destination.name}</Text>
              <Text style={styles.stepDetail}>Arrive at destination gate (0.8 km)</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: authColors.pageBg,
  },
  headerBanner: {
    backgroundColor: authColors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: authColors.cardBorder,
  },
  driverBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverBadgeIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  driverBadgeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: authColors.textPrimary,
  },
  driverBadgeSubtitle: {
    fontSize: 12,
    color: authColors.textMuted,
    marginTop: 2,
  },
  demoBannerTag: {
    marginTop: 10,
    backgroundColor: "#FEF3C7",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  demoBannerText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#D97706",
  },
  inputsCard: {
    backgroundColor: authColors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: authColors.cardBorder,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: authColors.textPrimary,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  locationLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  locationDot: {
    fontSize: 12,
    marginRight: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: authColors.textSecondary,
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: authColors.inputBg,
    borderWidth: 1,
    borderColor: authColors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 46,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: authColors.textPrimary,
  },
  chevron: {
    fontSize: 10,
    color: authColors.neutral500,
    marginLeft: 8,
  },
  presetDropdown: {
    marginTop: 6,
    backgroundColor: authColors.cardBg,
    borderWidth: 1,
    borderColor: authColors.cardBorder,
    borderRadius: 8,
    padding: 8,
    elevation: 4,
    zIndex: 10,
  },
  presetHeader: {
    fontSize: 11,
    fontWeight: "600",
    color: authColors.neutral500,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  presetItem: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: authColors.cardBorder,
  },
  presetName: {
    fontSize: 13,
    fontWeight: "600",
    color: authColors.textPrimary,
  },
  presetAddress: {
    fontSize: 11,
    color: authColors.textMuted,
    marginTop: 2,
  },
  swapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    marginBottom: 12,
    backgroundColor: authColors.roleActiveBg,
    borderRadius: 6,
  },
  swapIcon: {
    fontSize: 14,
    fontWeight: "700",
    color: authColors.roleAccent,
    marginRight: 6,
  },
  swapText: {
    fontSize: 12,
    fontWeight: "600",
    color: authColors.roleAccent,
  },
  mapCard: {
    backgroundColor: authColors.cardBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: authColors.cardBorder,
  },
  mapHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: authColors.textPrimary,
  },
  recenterButton: {
    backgroundColor: authColors.roleActiveBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  recenterText: {
    fontSize: 12,
    fontWeight: "600",
    color: authColors.roleAccent,
  },
  mapWrapper: {
    height: 250,
    borderRadius: 8,
    overflow: "hidden",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  vectorMapCanvas: {
    width: "100%",
    height: "100%",
    backgroundColor: "#0F172A",
    borderRadius: 8,
    padding: 16,
    justifyContent: "space-between",
  },
  gridOverlay: {
    flex: 1,
    position: "relative",
    justifyContent: "space-between",
  },
  vectorLineContainer: {
    position: "absolute",
    top: 30,
    bottom: 30,
    left: 40,
    width: 2,
    backgroundColor: "rgba(37, 99, 235, 0.4)",
    justifyContent: "center",
  },
  vectorDashedLine: {
    height: "100%",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#2563EB",
  },
  vectorPinPickup: {
    backgroundColor: "rgba(30, 41, 59, 0.9)",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#10B981",
    maxWidth: "85%",
    alignSelf: "flex-start",
  },
  vectorPinDest: {
    backgroundColor: "rgba(30, 41, 59, 0.9)",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#EF4444",
    maxWidth: "85%",
    alignSelf: "flex-end",
  },
  pinBadgePickup: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  pinBadgeDest: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  pinText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  pinName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  pinCoords: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
  },
  nativeMapNotice: {
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  nativeMapNoticeText: {
    fontSize: 10,
    color: "#CBD5E1",
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: authColors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: authColors.cardBorder,
  },
  summaryStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: authColors.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
    color: authColors.textPrimary,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: authColors.cardBorder,
  },
  navActionButton: {
    backgroundColor: authColors.roleAccent,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  navActionText: {
    color: authColors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  directionsCard: {
    backgroundColor: authColors.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: authColors.cardBorder,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: authColors.roleActiveBg,
    color: authColors.roleAccent,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 24,
    fontSize: 12,
    marginRight: 10,
  },
  stepBody: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: authColors.textPrimary,
  },
  stepDetail: {
    fontSize: 12,
    color: authColors.textMuted,
    marginTop: 2,
  },

  // Access Denied styles
  accessDeniedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: authColors.pageBg,
  },
  accessDeniedCard: {
    width: "100%",
    backgroundColor: authColors.cardBg,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: authColors.cardBorder,
  },
  accessIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: authColors.errorBg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  accessIcon: {
    fontSize: 32,
  },
  accessDeniedTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: authColors.textPrimary,
    marginBottom: 4,
  },
  accessDeniedBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: authColors.error,
    backgroundColor: authColors.errorBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 16,
    letterSpacing: 1,
  },
  accessDeniedBody: {
    fontSize: 14,
    color: authColors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 12,
  },
  boldText: {
    fontWeight: "700",
    color: authColors.textPrimary,
  },
  accessRoleSubtext: {
    fontSize: 12,
    color: authColors.textMuted,
    marginBottom: 24,
  },
  userRoleTag: {
    fontWeight: "700",
    color: authColors.roleAccent,
  },
  accessActionRow: {
    width: "100%",
    gap: 10,
  },
  demoOverrideButton: {
    backgroundColor: authColors.roleActiveBg,
    borderWidth: 1,
    borderColor: authColors.roleActiveBorder,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  demoOverrideText: {
    color: authColors.roleAccent,
    fontSize: 14,
    fontWeight: "700",
  },
  backDashboardButton: {
    backgroundColor: authColors.inputBg,
    borderWidth: 1,
    borderColor: authColors.cardBorder,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  backDashboardText: {
    color: authColors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
});
