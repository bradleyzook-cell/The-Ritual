import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { AntonSC_400Regular } from '@expo-google-fonts/anton-sc';
import { SourceSans3_400Regular, SourceSans3_700Bold } from '@expo-google-fonts/source-sans-3';

import { RitualProvider, useRitual } from './src/context/RitualContext';
import TodayScreen from './src/screens/TodayScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import StatsScreen from './src/screens/StatsScreen';
import AboutScreen from './src/screens/AboutScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { COLORS, FONTS } from './src/constants/theme';

type Tab = 'Today' | 'History' | 'Stats' | 'About' | 'Settings';
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: { name: Tab; icon: IoniconName; iconActive: IoniconName }[] = [
  { name: 'Today',    icon: 'flame-outline',       iconActive: 'flame' },
  { name: 'History',  icon: 'calendar-outline',    iconActive: 'calendar' },
  { name: 'Stats',    icon: 'stats-chart-outline', iconActive: 'stats-chart' },
  { name: 'About',    icon: 'book-outline',        iconActive: 'book' },
  { name: 'Settings', icon: 'settings-outline',   iconActive: 'settings' },
];

// ── Main tab app (shown after onboarding) ─────────────────────────
function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>('Today');

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        {activeTab === 'Today'    && <TodayScreen />}
        {activeTab === 'History'  && <HistoryScreen />}
        {activeTab === 'Stats'    && <StatsScreen />}
        {activeTab === 'About'    && <AboutScreen />}
        {activeTab === 'Settings' && <SettingsScreen />}
      </View>
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
  );
}

// ── App content — checks onboarding state ─────────────────────────
function AppContent() {
  const { data, loading, completeOnboarding } = useRitual();

  if (loading) return null;

  if (!data?.hasOnboarded) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  return <MainApp />;
}

// ── Root entry point ─────────────────────────────────────────────
export default function App() {
  const [fontsLoaded] = useFonts({
    AntonSC_400Regular,
    SourceSans3_400Regular,
    SourceSans3_700Bold,
  });

  // Loading screen shown while fonts initialise — keeps brand visible
  if (!fontsLoaded) {
    return (
      <View style={loading.root}>
        <StatusBar style="light" />
        <Image
          source={require('./assets/logo-ritual.png')}
          style={loading.logo}
          resizeMode="contain"
        />
        <View style={loading.divider} />
        <Text style={loading.title}>THE RITUAL</Text>
        <Text style={loading.sub}>BY WARRBUILT</Text>
        <View style={loading.warrbuiltCard}>
          <Image
            source={require('./assets/logo-warrbuilt.png')}
            style={loading.warrbuiltLogo}
            resizeMode="contain"
          />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <RitualProvider>
        <StatusBar style="light" backgroundColor={COLORS.background} />
        <AppContent />
      </RitualProvider>
    </SafeAreaProvider>
  );
}

// ── Loading screen styles (system fonts — custom not yet loaded) ──
const loading = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 18,
    marginBottom: 24,
  },
  divider: {
    width: 48,
    height: 3,
    backgroundColor: '#AE2012',
    marginBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 8,
    marginBottom: 6,
  },
  sub: {
    color: '#444444',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 4,
    marginBottom: 40,
  },
  warrbuiltCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  warrbuiltLogo: {
    width: 160,
    height: 44,
  },
});

// ── Main app styles ───────────────────────────────────────────────
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
