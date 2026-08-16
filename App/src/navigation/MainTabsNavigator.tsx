import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import DashboardScreen from '../screens/DashboardScreen';
import DriversScreen from '../screens/DriversScreen';
import FuelExpenseScreen from '../screens/FuelExpenseScreen';
import MaintenanceScreen from '../screens/MaintenanceScreen';
import TripDispatcherScreen from '../screens/TripDispatcherScreen';
import VehicleRegistryScreen from '../screens/VehicleRegistryScreen';
import CustomTabBar from './CustomTabBar';
import ChatScreen from '../screens/ChatScreen';
import LiveTrackingScreen from '../screens/LiveTrackingScreen';

const Tab = createBottomTabNavigator();

export default function MainTabsNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      {/* Primary Screens (Indices 0-3) */}
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="VehicleRegistry" component={VehicleRegistryScreen} />
      <Tab.Screen name="Drivers" component={DriversScreen} />
      <Tab.Screen name="TripDispatcher" component={TripDispatcherScreen} />
      
      {/* Secondary Screens (Indices 4-6) */}
      <Tab.Screen name="Maintenance" component={MaintenanceScreen} />
      <Tab.Screen name="FuelExpense" component={FuelExpenseScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="LiveTracking" component={LiveTrackingScreen} />
    </Tab.Navigator>
  );
}
