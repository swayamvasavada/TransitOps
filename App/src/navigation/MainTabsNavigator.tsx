import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import DashboardScreen from '../screens/DashboardScreen';
import DriversScreen from '../screens/DriversScreen';
import FuelExpenseScreen from '../screens/FuelExpenseScreen';
import MaintenanceScreen from '../screens/MaintenanceScreen';
import TripDispatcherScreen from '../screens/TripDispatcherScreen';
import VehicleRegistryScreen from '../screens/VehicleRegistryScreen';
import { colors } from '../theme/colors';
import {
  LayoutDashboard,
  Truck,
  Users,
  Map,
  Wrench,
  Fuel,
  BarChart3,
} from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export default function MainTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.panel,
          borderTopColor: colors.borderSoft,
        },
        tabBarActiveTintColor: colors.amber,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => {
          let Icon = LayoutDashboard;
          if (route.name === 'Dashboard') Icon = LayoutDashboard;
          else if (route.name === 'VehicleRegistry') Icon = Truck;
          else if (route.name === 'Drivers') Icon = Users;
          else if (route.name === 'TripDispatcher') Icon = Map;
          else if (route.name === 'Maintenance') Icon = Wrench;
          else if (route.name === 'FuelExpense') Icon = Fuel;
          else if (route.name === 'Analytics') Icon = BarChart3;

          return <Icon color={color} size={size} />;
        },
      })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen
        name="VehicleRegistry"
        component={VehicleRegistryScreen}
        options={{ title: 'Vehicles' }}
      />
      <Tab.Screen name="Drivers" component={DriversScreen} />
      <Tab.Screen
        name="TripDispatcher"
        component={TripDispatcherScreen}
        options={{ title: 'Trips' }}
      />
      <Tab.Screen name="Maintenance" component={MaintenanceScreen} />
      <Tab.Screen
        name="FuelExpense"
        component={FuelExpenseScreen}
        options={{ title: 'Fuel' }}
      />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
    </Tab.Navigator>
  );
}
