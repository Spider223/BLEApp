import { Alert, Platform } from 'react-native';
import { PERMISSIONS, request, RESULTS, Permission } from 'react-native-permissions';

export const requestBLEPermissions = async (): Promise<boolean> => {
  try {
    let permissions: Permission[] = [];

    if (Platform.OS === 'android') {
      // Android requires location permission for BLE scanning
      permissions = [
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
        PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      ];
    // } else if (Platform.OS === 'ios') {
    //   permissions = [
    //     PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL,
    //   ];
    }

    const results = await Promise.all(
      permissions.map(permission => request(permission))
    );

    const deniedPermissions = results.filter(result => result === RESULTS.DENIED);
    const blockedPermissions = results.filter(result => result === RESULTS.BLOCKED);

    if (blockedPermissions.length > 0) {
      Alert.alert(
        'Permissions Required',
        'Bluetooth permissions are required for this app to work. Please enable them in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => {} }, // You can add linking to settings here
        ]
      );
      return false;
    }

    if (deniedPermissions.length > 0) {
      Alert.alert(
        'Permissions Required',
        'This app needs Bluetooth permissions to scan and connect to devices.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
};

export const checkBLEPermissions = async (): Promise<boolean> => {
  try {
    let permissions: Permission[] = [];

    if (Platform.OS === 'android') {
      permissions = [
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
        PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      ];
    // } else if (Platform.OS === 'ios') {
    //   permissions = [
    //     PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL,
    //   ];
    }

    const results = await Promise.all(
      permissions.map(permission => request(permission))
    );

    return results.every(result => result === RESULTS.GRANTED);
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
};