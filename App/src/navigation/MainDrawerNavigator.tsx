import React from 'react';
import {createDrawerNavigator, DrawerContentScrollView, DrawerItemList} from '@react-navigation/drawer';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import MainTabsNavigator from './MainTabsNavigator';
import SettingsScreen from '../screens/SettingsScreen';
import useAuthStore from '../store/AuthStore';
import {colors} from '../theme/colors';
import { User } from 'lucide-react-native';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: any) {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
      <View style={styles.brand}>
        <Text style={styles.brandTitle}>LogiSphereAI</Text>
        <Text style={styles.brandMeta}>{user?.name || 'Guest'}</Text>
        <Text style={styles.brandMeta}>{user?.email || ''}</Text>
      </View>
      <DrawerItemList {...props} />
      <Pressable onPress={logout} style={styles.logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </Pressable>
    </DrawerContentScrollView>
  );
}

export default function MainDrawerNavigator() {
  const user = useAuthStore(state => state.user);

  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: colors.panel, borderBottomWidth: 0, elevation: 0, shadowOpacity: 0 },
        headerTintColor: colors.textPrimary,
        drawerStyle: { backgroundColor: colors.panel },
        drawerActiveTintColor: colors.amber,
        drawerInactiveTintColor: colors.textSecondary,
        headerLeft: () => null,
        headerTitle: () => (
          <Text style={{ color: colors.textPrimary, fontSize: 20, fontWeight: '700' }}>
            Hey! {user?.name || 'User'}
          </Text>
        ),
        headerRight: () => (
          <Pressable 
            onPress={() => navigation.navigate('Profile')}
            style={{ marginRight: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: colors.borderSoft, alignItems: 'center', justifyContent: 'center' }}
          >
            <User color={colors.textPrimary} size={20} />
          </Pressable>
        ),
      })}>
      <Drawer.Screen name="Operations" component={MainTabsNavigator} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContent: {flex: 1},
  brand: {padding: 18, borderBottomWidth: 1, borderBottomColor: colors.borderSoft, gap: 4},
  brandTitle: {color: colors.textPrimary, fontSize: 20, fontWeight: '900'},
  brandMeta: {color: colors.textMuted},
  logout: {margin: 14, marginTop: 'auto', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.border},
  logoutText: {color: colors.error, textAlign: 'center', fontWeight: '800'},
});
