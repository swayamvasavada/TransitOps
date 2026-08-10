import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import useAuthStore from '../store/AuthStore';
import AuthNavigator from './AuthNavigator';
import MainDrawerNavigator from './MainDrawerNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const token = useAuthStore(state => state.token);

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {token ? (
        <Stack.Screen name="Main" component={MainDrawerNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
