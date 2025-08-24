import React, { useEffect, useState } from 'react';
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBLE } from '../hooks/useBLE';
import { BLEAnimationData } from '../types/ble';
import { demoDataGenerator } from '../utils/demoData';
import { requestBLEPermissions } from '../utils/permissions';
import { BLEAnimation } from './BLEAnimation';
import { DeviceList } from './DeviceList';
import { ServicesList } from './ServicesList';

export const BLEManagerApp: React.FC = () => {
  const {
    devices,
    connectionState,
    services,
    animationData,
    startScan,
    stopScan,
    connectToDevice,
    disconnectDevice,
    subscribeToCharacteristic,
    clearError,
  } = useBLE();

  const [currentTab, setCurrentTab] = useState<'devices' | 'services' | 'animation'>('devices');
  const [selectedDataType, setSelectedDataType] = useState<BLEAnimationData['type']>('heartbeat');
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Request permissions on app start
  useEffect(() => {
    const checkPermissions = async () => {
      const hasPermissions = await requestBLEPermissions();
      if (!hasPermissions) {
        Alert.alert(
          'Permissions Required',
          'Bluetooth permissions are required for this app to work properly.',
          [{ text: 'OK' }]
        );
      }
    };

    checkPermissions();
  }, []);

  // Handle connection state changes
  useEffect(() => {
    if (connectionState.error) {
      Alert.alert('BLE Error', connectionState.error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [connectionState.error, clearError]);

  const handleDevicePress = async (device: any) => {
    if (device.isConnected) {
      Alert.alert(
        'Disconnect Device',
        `Do you want to disconnect from ${device.name || 'this device'}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Disconnect', style: 'destructive', onPress: disconnectDevice }
        ]
      );
    } else {
      try {
        await connectToDevice(device);
        setCurrentTab('services');
      } catch (error) {
        Alert.alert('Connection Failed', `Failed to connect to ${device.name || 'device'}`);
      }
    }
  };

  const handleSubscribeToCharacteristic = async (
    serviceUUID: string,
    characteristicUUID: string,
    dataType: BLEAnimationData['type']
  ) => {
    try {
      await subscribeToCharacteristic(serviceUUID, characteristicUUID, dataType);
      setSelectedDataType(dataType);
      setCurrentTab('animation');
      Alert.alert(
        'Subscription Successful',
        `Now receiving ${dataType} data. Check the Animation tab to see the visualization.`
      );
    } catch (error) {
      Alert.alert('Subscription Failed', 'Failed to subscribe to characteristic notifications.');
    }
  };

  const startDemoMode = (dataType: BLEAnimationData['type'] = 'heartbeat') => {
    setIsDemoMode(true);
    setSelectedDataType(dataType);
    setCurrentTab('animation');

    // Start generating demo data
    demoDataGenerator.startGenerating(dataType, (_data) => {
      // This will be handled by the animation component
    });
  };

  const stopDemoMode = () => {
    setIsDemoMode(false);
    demoDataGenerator.stopGenerating();
  };

  const renderTabButton = (
    title: string,
    tab: 'devices' | 'services' | 'animation',
    badge?: string
  ) => (
    <TouchableOpacity
      style={[styles.tabButton, currentTab === tab && styles.activeTabButton]}
      onPress={() => setCurrentTab(tab)}
    >
      <Text style={[styles.tabButtonText, currentTab === tab && styles.activeTabButtonText]}>
        {title}
      </Text>
      {badge && <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>}
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (currentTab) {
      case 'devices':
        return (
          <DeviceList
            devices={devices}
            isScanning={connectionState.isScanning}
            onDevicePress={handleDevicePress}
            onScanPress={startScan}
            onStopScan={stopScan}
          />
        );
      case 'services':
        return (
          <ServicesList
            services={services}
            onSubscribeToCharacteristic={handleSubscribeToCharacteristic}
          />
        );
      case 'animation':
        return (
          <View style={styles.animationContainer}>
            <BLEAnimation data={animationData} type={selectedDataType} />
            {animationData.length === 0 && (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No data received yet</Text>
                <Text style={styles.noDataSubtext}>
                  Subscribe to a characteristic notification to see animated data
                </Text>
              </View>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>BLE Device Manager</Text>
        <View style={styles.headerActions}>
          {!isDemoMode ? (
            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => startDemoMode('heartbeat')}
            >
              <Text style={styles.demoButtonText}>Demo Mode</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.demoButton}
              onPress={stopDemoMode}
            >
              <Text style={styles.demoButtonText}>Stop Demo</Text>
            </TouchableOpacity>
          )}
        </View>
        {connectionState.connectedDevice && (
          <View style={styles.connectionStatus}>
            <View style={styles.connectionDot} />
            <Text style={styles.connectionText}>
              Connected to {connectionState.connectedDevice.name || 'Device'}
            </Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {renderTabButton('Devices', 'devices', devices.length > 0 ? devices.length.toString() : undefined)}
        {renderTabButton('Services', 'services', services.length > 0 ? services.length.toString() : undefined)}
        {renderTabButton('Animation', 'animation', animationData.length > 0 ? animationData.length.toString() : undefined)}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Connection Status */}
      {connectionState.isConnecting && (
        <View style={styles.connectingOverlay}>
          <Text style={styles.connectingText}>
            {connectionState.autoReconnect ? 'Reconnecting...' : 'Connecting...'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  demoButton: {
    backgroundColor: '#28A745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  demoButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  connectionText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C757D',
  },
  activeTabButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  animationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  noDataContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6C757D',
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#ADB5BD',
    textAlign: 'center',
  },
  connectingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
});