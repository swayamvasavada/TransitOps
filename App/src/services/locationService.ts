import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

// Exported for Geofence validation fallback, but no longer used for simulated user position
export const MOCK_ORGANIZATION = {
  id: 'ORG001',
  name: 'LogiSphere Head Office',
  latitude: 23.05288,
  longitude: 72.61891,
  geofenceRadius: 200 // meters
};

/**
 * Requests location permission for Android devices.
 * iOS handles permissions via Info.plist and triggers automatically when geolocation is used.
 */
const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    Geolocation.requestAuthorization();
    return true; // We assume true, actual permission will be evaluated on Geolocation call
  }

  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission Required',
          message: 'LogiSphere AI needs your location to verify your attendance clock-in.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  return false;
};

/**
 * Fetches the user's actual device location via GPS hardware.
 */
export const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number }> => {
  const hasPermission = await requestLocationPermission();

  if (!hasPermission) {
    throw new Error('Location permission denied');
  }

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        console.log('📍 Fetched Real GPS Location:', position.coords.latitude, position.coords.longitude);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  });
};
