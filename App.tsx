import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BLEManagerApp } from './src/components/BLEManagerApp';

export default function App() {
  return (
    <SafeAreaProvider>
       <BLEManagerApp /> 
    </SafeAreaProvider>
  );
}
