# BLE Device Manager

A React Native application that demonstrates Bluetooth Low Energy (BLE) device management with advanced animations and real-time data visualization.

## Features

### 🔍 BLE Device Management
- **Scan and Discover**: Automatically scan for nearby BLE devices
- **Device Connection**: Connect to selected BLE devices with automatic retry
- **Service Discovery**: Browse device services and characteristics
- **Characteristic Notifications**: Subscribe to real-time data streams
- **Auto-Reconnect**: Automatic reconnection with exponential backoff
- **Manual Disconnect**: Graceful disconnection with cleanup

### 🎨 Advanced Animations
- **Real-time Data Visualization**: Animated charts and graphs
- **Pulse Animations**: Heartbeat-like visual feedback
- **Wave Effects**: Dynamic wave animations based on data
- **Data-driven Scaling**: Visual elements that respond to BLE data
- **Smooth Transitions**: Fluid animations using React Native Reanimated

### 🏗️ Architecture & Code Quality
- **Separation of Concerns**: Clean architecture with services, hooks, and components
- **TypeScript**: Full type safety throughout the application
- **Custom Hooks**: Reusable BLE management logic
- **Error Handling**: Comprehensive error handling and user feedback
- **Permission Management**: Proper handling of BLE and location permissions

## Prerequisites

- Node.js (v18 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Physical device with Bluetooth support (recommended for testing)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BleApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup** (macOS only)
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Android Setup**
   - Open `android/app/src/main/AndroidManifest.xml`
   - Ensure the following permissions are present:
   ```xml
   <uses-permission android:name="android.permission.BLUETOOTH" />
   <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
   <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
   <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
   <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
   ```

```
src/
├── components/          # React components
│   ├── BLEAnimation.tsx # Animated data visualization
│   ├── BLEManagerApp.tsx # Main app component
│   ├── DeviceList.tsx   # Device scanning and selection
│   └── ServicesList.tsx # Services and characteristics browser
├── hooks/               # Custom React hooks
│   └── useBLE.ts        # BLE state management hook
├── services/            # Business logic services
│   └── BLEService.ts    # BLE operations and connection management
├── types/               # TypeScript type definitions
│   └── ble.ts          # BLE-related interfaces
└── utils/               # Utility functions
    └── permissions.ts   # Permission handling utilities
```

## Key Technologies

- **React Native**: Cross-platform mobile development
- **react-native-ble-plx**: BLE communication library
- **react-native-reanimated**: High-performance animations
- **react-native-permissions**: Permission management
- **TypeScript**: Type safety and better development experience

