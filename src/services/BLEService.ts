import { BleManager } from 'react-native-ble-plx';
import { BLECharacteristic, BLEConnectionState, BLEDevice, BLEService } from '../types/ble';

class BLEServiceClass {
  private manager: BleManager;
  private connectedDevice: BLEDevice | null = null;
  private autoReconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.manager = new BleManager();
  }

  // Initialize BLE manager
  async initialize(): Promise<void> {
    try {
      await this.manager.destroy();
      this.manager = new BleManager();
    } catch (error) {
      console.error('Failed to initialize BLE manager:', error);
      throw error;
    }
  }

  // Scan for BLE devices
  async scanForDevices(
    onDeviceFound: (device: BLEDevice) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      await this.manager.startDeviceScan(
        null, // null means scan for all devices
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            onError(error.message);
            return;
          }
          console.log("device", device);
          console.log("madan")
          if (device) {
            const bleDevice: BLEDevice = {
              id: device.id,
              name: device.name,
              rssi: device.rssi,
              manufacturerData: device.manufacturerData,
              serviceUUIDs: device.serviceUUIDs,
              isConnected: false,
              device: device,
            };
            onDeviceFound(bleDevice);
          }
        }
      );
    } catch (error) {
      onError('Failed to start scanning');
    }
  }

  // Stop scanning
  stopScan(): void {
    this.manager.stopDeviceScan();
  }

  // Connect to a device
  async connectToDevice(
    device: BLEDevice,
    onStateChange: (state: BLEConnectionState) => void
  ): Promise<void> {
    try {
      onStateChange({
        isScanning: false,
        isConnecting: true,
        isConnected: false,
        connectedDevice: null,
        error: null,
        autoReconnect: this.autoReconnectAttempts > 0,
      });

      const connectedDevice = await device.device.connect({
        requestMTU: 512,
        timeout: 10000,
      });

      await connectedDevice.discoverAllServicesAndCharacteristics();

      const bleDevice: BLEDevice = {
        ...device,
        isConnected: true,
        device: connectedDevice,
      };

      this.connectedDevice = bleDevice;
      this.autoReconnectAttempts = 0;

      // Set up connection monitoring
      this.monitorConnection(bleDevice, onStateChange);

      onStateChange({
        isScanning: false,
        isConnecting: false,
        isConnected: true,
        connectedDevice: bleDevice,
        error: null,
        autoReconnect: false,
      });
    } catch (error) {
      onStateChange({
        isScanning: false,
        isConnecting: false,
        isConnected: false,
        connectedDevice: null,
        error: `Connection failed: ${error}`,
        autoReconnect: false,
      });
    }
  }

  // Monitor connection state
  private monitorConnection(
    device: BLEDevice,
    onStateChange: (state: BLEConnectionState) => void
  ): void {
    device.device.onDisconnected((error) => {
      console.log('Device disconnected:', error);

      if (this.autoReconnectAttempts < this.maxReconnectAttempts) {
        this.autoReconnectAttempts++;
        this.attemptReconnect(device, onStateChange);
      } else {
        this.connectedDevice = null;
        onStateChange({
          isScanning: false,
          isConnecting: false,
          isConnected: false,
          connectedDevice: null,
          error: 'Connection lost and max reconnection attempts reached',
          autoReconnect: false,
        });
      }
    });
  }

  // Attempt to reconnect
  private async attemptReconnect(
    device: BLEDevice,
    onStateChange: (state: BLEConnectionState) => void
  ): Promise<void> {
    const delay = Math.min(1000 * Math.pow(2, this.autoReconnectAttempts), 30000);

    onStateChange({
      isScanning: false,
      isConnecting: true,
      isConnected: false,
      connectedDevice: null,
      error: `Attempting to reconnect (${this.autoReconnectAttempts}/${this.maxReconnectAttempts})`,
      autoReconnect: true,
    });

    this.reconnectTimeout = setTimeout(async () => {
      try {
        await this.connectToDevice(device, onStateChange);
      } catch (error) {
        if (this.autoReconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect(device, onStateChange);
        }
      }
    }, delay);
  }

  // Disconnect from device
  async disconnectDevice(onStateChange: (state: BLEConnectionState) => void): Promise<void> {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.autoReconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect

    if (this.connectedDevice) {
      try {
        await this.connectedDevice.device.cancelConnection();
      } catch (error) {
        console.log('Error during disconnect:', error);
      }
    }

    this.connectedDevice = null;
    onStateChange({
      isScanning: false,
      isConnecting: false,
      isConnected: false,
      connectedDevice: null,
      error: null,
      autoReconnect: false,
    });
  }

  // Get services and characteristics
  async getServices(): Promise<BLEService[]> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    try {
      const services = await this.connectedDevice.device.services();
      const bleServices: BLEService[] = [];

      for (const service of services) {
        const characteristics = await service.characteristics();
        const bleCharacteristics: BLECharacteristic[] = characteristics.map(char => ({
          uuid: char.uuid,
          serviceUUID: service.uuid,
          value: char.value,
          properties: {
            read: char.isReadable,
            write: char.isWritableWithResponse || char.isWritableWithoutResponse,
            notify: char.isNotifiable,
            indicate: char.isIndicatable,
          },
          characteristic: char,
        }));

        bleServices.push({
          uuid: service.uuid,
          characteristics: bleCharacteristics,
        });
      }

      return bleServices;
    } catch (error) {
      throw new Error(`Failed to get services: ${error}`);
    }
  }

  // Subscribe to characteristic notifications
  // async subscribeToCharacteristic(
  //   serviceUUID: string,
  //   characteristicUUID: string,
  //   onDataReceived: (data: string) => void
  // ): Promise<void> {
  //   if (!this.connectedDevice) {
  //     throw new Error('No device connected');
  //   }

  //   try {
  //     const characteristic = await this.connectedDevice.device.readCharacteristicForService(
  //       serviceUUID,
  //       characteristicUUID
  //     );

  //     if (characteristic.isNotifiable) {
  //       await characteristic.monitor((error, monitoredCharacteristic) => {
  //         if (error) {
  //           console.error('Characteristic monitoring error:', error);
  //           return;
  //         }

  //         if (monitoredCharacteristic?.value) {
  //           onDataReceived(monitoredCharacteristic.value);
  //         }
  //       });
  //     } else {
  //       throw new Error('Characteristic is not notifiable');
  //     }
  //   } catch (error) {
  //     throw new Error(`Failed to subscribe to characteristic: ${error}`);
  //   }
  // }

  async subscribeToCharacteristic(
  serviceUUID: string,
  characteristicUUID: string,
  onDataReceived: (data: string) => void
): Promise<void> {
  if (!this.connectedDevice) {
    throw new Error('No device connected');
  }

  try {
    this.connectedDevice.device.monitorCharacteristicForService(
      serviceUUID,
      characteristicUUID,
      (error, characteristic) => {
        if (error) {
          console.error('Characteristic monitoring error:', error);
          return;
        }

        if (characteristic?.value) {
          onDataReceived(characteristic.value);
        }
      }
    );
  } catch (error) {
    throw new Error(`Failed to subscribe to characteristic: ${error}`);
  }
}


  // Write to characteristic
  async writeToCharacteristic(
    serviceUUID: string,
    characteristicUUID: string,
    value: string
  ): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    try {
      await this.connectedDevice.device.writeCharacteristicWithResponseForService(
        serviceUUID,
        characteristicUUID,
        value
      );
    } catch (error) {
      throw new Error(`Failed to write to characteristic: ${error}`);
    }
  }

  // Get connected device
  getConnectedDevice(): BLEDevice | null {
    return this.connectedDevice;
  }

  // Cleanup
  destroy(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.manager.destroy();
  }
}

export const bleService = new BLEServiceClass();