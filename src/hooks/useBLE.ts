import { useCallback, useEffect, useState } from 'react';
import { bleService } from '../services/BLEService';
import { BLEAnimationData, BLEConnectionState, BLEDevice, BLEService } from '../types/ble';

export const useBLE = () => {
  const [devices, setDevices] = useState<BLEDevice[]>([]);
  const [connectionState, setConnectionState] = useState<BLEConnectionState>({
    isScanning: false,
    isConnecting: false,
    isConnected: false,
    connectedDevice: null,
    error: null,
    autoReconnect: false,
  });
  const [services, setServices] = useState<BLEService[]>([]);
  const [animationData, setAnimationData] = useState<BLEAnimationData[]>([]);

  // Initialize BLE service
  useEffect(() => {
    bleService.initialize().catch(console.error);
    return () => {
      bleService.destroy();
    };
  }, []);

  // Start scanning for devices
  const startScan = useCallback(async () => {
    setDevices([]);
    setConnectionState(prev => ({ ...prev, isScanning: true, error: null }));

    try {
      await bleService.scanForDevices(
        (device) => {
          setDevices(prev => {
            // Avoid duplicates
            const exists = prev.find(d => d.id === device.id);
            if (exists) {
              return prev.map(d => d.id === device.id ? { ...d, ...device } : d);
            }
            return [...prev, device];
          });
        },
        (error) => {
          setConnectionState(prev => ({ ...prev, error, isScanning: false }));
        }
      );
    } catch (error) {
      setConnectionState(prev => ({
        ...prev,
        error: `Scan failed: ${error}`,
        isScanning: false
      }));
    }
  }, []);

  // Stop scanning
  const stopScan = useCallback(() => {
    bleService.stopScan();
    setConnectionState(prev => ({ ...prev, isScanning: false }));
  }, []);

  // Connect to device
  const connectToDevice = useCallback(async (device: BLEDevice) => {
    try {
      await bleService.connectToDevice(device, setConnectionState);

      // Get services after connection
      const deviceServices = await bleService.getServices();
      setServices(deviceServices);
    } catch (error) {
      setConnectionState(prev => ({
        ...prev,
        error: `Connection failed: ${error}`,
        isConnecting: false
      }));
    }
  }, []);

  // Disconnect from device
  const disconnectDevice = useCallback(async () => {
    try {
      await bleService.disconnectDevice(setConnectionState);
      setServices([]);
      setAnimationData([]);
    } catch (error) {
      setConnectionState(prev => ({
        ...prev,
        error: `Disconnect failed: ${error}`
      }));
    }
  }, []);

  // Subscribe to characteristic
  const subscribeToCharacteristic = useCallback(async (
    serviceUUID: string,
    characteristicUUID: string,
    dataType: BLEAnimationData['type'] = 'heartbeat'
  ) => {
    try {
      await bleService.subscribeToCharacteristic(
        serviceUUID,
        characteristicUUID,
        (data) => {
          // Parse the data and add to animation data
          const value = parseFloat(data) || Math.random() * 100; // Fallback for demo
          const newData: BLEAnimationData = {
            value,
            timestamp: Date.now(),
            type: dataType,
          };

          setAnimationData(prev => {
            const updated = [...prev, newData];
            // Keep only last 50 data points for performance
            return updated.slice(-50);
          });
        }
      );
    } catch (error) {
      setConnectionState(prev => ({
        ...prev,
        error: `Subscription failed: ${error}`
      }));
    }
  }, []);

  // Write to characteristic
  const writeToCharacteristic = useCallback(async (
    serviceUUID: string,
    characteristicUUID: string,
    value: string
  ) => {
    try {
      await bleService.writeToCharacteristic(serviceUUID, characteristicUUID, value);
    } catch (error) {
      setConnectionState(prev => ({
        ...prev,
        error: `Write failed: ${error}`
      }));
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setConnectionState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    devices,
    connectionState,
    services,
    animationData,
    startScan,
    stopScan,
    connectToDevice,
    disconnectDevice,
    subscribeToCharacteristic,
    writeToCharacteristic,
    clearError,
  };
};