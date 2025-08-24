import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BLEDevice } from '../types/ble';

interface DeviceListProps {
  devices: BLEDevice[];
  isScanning: boolean;
  onDevicePress: (device: BLEDevice) => void;
  onScanPress: () => void;
  onStopScan: () => void;
}

export const DeviceList: React.FC<DeviceListProps> = ({
  devices,
  isScanning,
  onDevicePress,
  onScanPress,
  onStopScan,
}) => {
  const renderDevice = ({ item }: { item: BLEDevice }) => (
    <TouchableOpacity
      style={[styles.deviceItem, item.isConnected && styles.connectedDevice]}
      onPress={() => onDevicePress(item)}
      disabled={item.isConnected}
    >
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>
          {item.name || `Unknown Device (${item.id.slice(-8)})`}
        </Text>
        <Text style={styles.deviceId}>{item.id}</Text>
        {item.rssi && (
          <Text style={styles.rssi}>RSSI: {item.rssi} dBm</Text>
        )}
      </View>
      <View style={styles.deviceStatus}>
        {item.isConnected ? (
          <View style={styles.connectedIndicator}>
            <View style={styles.connectedDot} />
            <Text style={styles.connectedText}>Connected</Text>
          </View>
        ) : (
          <Text style={styles.connectText}>Tap to connect</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        {isScanning
          ? 'Scanning for devices...'
          : 'No devices found. Tap "Scan" to start searching.'}
      </Text>
      {isScanning && <ActivityIndicator style={styles.loading} color="#007AFF" />}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BLE Devices</Text>
        <TouchableOpacity
          style={[styles.scanButton, isScanning && styles.scanningButton]}
          onPress={isScanning ? onStopScan : onScanPress}
        >
          <Text style={styles.scanButtonText}>
            {isScanning ? 'Stop Scan' : 'Scan'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={devices}
        renderItem={renderDevice}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={devices.length === 0 ? styles.emptyList : undefined}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  scanButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  scanningButton: {
    backgroundColor: '#FF3B30',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  list: {
    flex: 1,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  connectedDevice: {
    backgroundColor: '#E8F5E8',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 2,
  },
  rssi: {
    fontSize: 12,
    color: '#6C757D',
  },
  deviceStatus: {
    alignItems: 'flex-end',
  },
  connectText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  connectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  connectedText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    marginBottom: 16,
  },
  loading: {
    marginTop: 8,
  },
});