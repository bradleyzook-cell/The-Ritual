import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RitualProvider } from './src/context/RitualContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RitualProvider>
          <StatusBar style="light" backgroundColor="#0A0A0A" />
          <AppNavigator />
        </RitualProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
