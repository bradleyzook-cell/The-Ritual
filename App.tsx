import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { AntonSC_400Regular } from '@expo-google-fonts/anton-sc';
import { SourceSans3_400Regular, SourceSans3_700Bold } from '@expo-google-fonts/source-sans-3';

import { RitualProvider } from './src/context/RitualContext';
import TodayScreen from './src/screens/TodayScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import StatsScreen from './src/screens/StatsScreen';
import AboutScreen from './src/screens/AboutScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { COLORS, FONTS } from './src/constants/theme';

type Tab = 'Today' | 'History' | 'Stats' | 'About' | 'Settings';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: {
  name: Tab;
  icon: IoniconName;
  iconActive: IoniconName;
}[] = [
  { name: 'Today',    icon: 'flame-outline',              iconActive: 'flame' },
  { name: 'History',  icon: 'calendar-outline',          iconActive: 'calendar' },
  { name: 'Stats',    icon: 'stats-chart-outline',       iconActive: 'stats-chart' },
  { name: 'About',    icon: 'book-outline',              iconActive: 'book' },
  { name: 'Settings', icon: 'settings-outline',          iconActive: 'settings' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('Today');
  const [fontsLoaded] = useFonts({
    AntonSC_400Regular,
    SourceSans3_400Regular,
    SourceSans3_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <RitualProvider>
        <StatusBar style="light" backgroundColor={COLORS.background} />
        <View style={styles.root}>
          {/* Screens */}
          <View style={styles.content}>
            {activeTab === 'Today'    && <TodayScreen />}
            {activeTab === 'History'  && <HistoryScreen />}
            {activeTab === 'Stats'    && <StatsScreen />}
            {activeTab === 'About'    && <AboutScreen />}
            {activeTab === 'Settings' && <SettingsScreen />}
          </View>

          {/* Custom tab bar */}
          <SafeAreaView edges={['bottom']} style={styles.tabBarWrap}>
            <View style={styles.tabBar}>
              {TAB_CONFIG.map(({ name, icon, iconActive }) => {
                const active = activeTab === name;
                return (
                  <Pressable
                    key={name}
                    style={styles.tabItem}
                    onPress={() => setActiveTab(name)}
                  >
                    <Ionicons
                      name={active ? iconActive : icon}
                      size={22}
                      color={active ? COLORS.tabActive : COLORS.tabInactive}
                    />
                    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                      {name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </SafeAreaView>
        </View>
      </RitualProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  tabBarWrap: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tabBar: {
    flexDirection: 'row',
    height: 56,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: FONTS.sizes.xs,
    fontFamily: FONTS.body,
    color: COLORS.tabInactive,
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: COLORS.tabActive,
  },
});
