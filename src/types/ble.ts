import { Characteristic, Device } from 'react-native-ble-plx';

export interface BLEDevice {
  id: string;
  name: string | null;
  rssi: number | null;
  manufacturerData: string | null;
  serviceUUIDs: string[] | null;
  isConnected: boolean;
  device: Device;
}

export interface BLECharacteristic {
  uuid: string;
  serviceUUID: string;
  value: string | null;
  properties: {
    read: boolean;
    write: boolean;
    notify: boolean;
    indicate: boolean;
  };
  characteristic: Characteristic;
}

export interface BLEService {
  uuid: string;
  characteristics: BLECharacteristic[];
}

export interface BLEConnectionState {
  isScanning: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  connectedDevice: BLEDevice | null;
  error: string | null;
  autoReconnect: boolean;
}

export interface BLEAnimationData {
  value: number;
  timestamp: number;
  type: 'heartbeat' | 'temperature' | 'humidity' | 'pressure';
}

export interface BLEScanResult {
  devices: BLEDevice[];
  isScanning: boolean;
  error: string | null;
}