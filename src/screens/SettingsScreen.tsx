import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRitual } from '../context/RitualContext';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { formatDisplayDate } from '../utils/dateUtils';

export default function SettingsScreen() {
  const { data, loading, saveSettings, resetData, dayNumber } = useRitual();

  const [name, setName] = useState('');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) {
      setName(data.settings.name);
      setWakeTime(data.settings.wakeTime);
    }
  }, [data]);

  const handleSave = async () => {
    if (!data) return;
    const trimmedName = name.trim();
    const trimmedTime = wakeTime.trim();

    // Basic time format validation
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(trimmedTime)) {
      Alert.alert('Invalid Time', 'Please enter wake time in HH:MM format (e.g. 05:30)');
      return;
    }

    await saveSettings({
      ...data.settings,
      name: trimmedName,
      wakeTime: trimmedTime,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    Alert.alert(
      'START OVER',
      'This will permanently delete all your progress, streaks, and history. This cannot be undone.\n\nAre you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            await resetData();
          },
        },
      ]
    );
  };

  if (loading || !data) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>LOADING...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>SETTINGS</Text>
          </View>

          {/* Info card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>STARTED</Text>
              <Text style={styles.infoValue}>
                {formatDisplayDate(data.settings.startDate)}
              </Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>CURRENT DAY</Text>
              <Text style={[styles.infoValue, styles.infoValueRed]}>
                Day {dayNumber}
              </Text>
            </View>
          </View>

          {/* Name field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>YOUR NAME</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.textMuted}
              returnKeyType="next"
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* Wake time field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>WAKE TIME</Text>
            <TextInput
              style={styles.input}
              value={wakeTime}
              onChangeText={setWakeTime}
              placeholder="06:00"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numbers-and-punctuation"
              returnKeyType="done"
              maxLength={5}
              autoCorrect={false}
            />
            <Text style={styles.fieldHint}>24-hour format — e.g. 05:30 or 06:00</Text>
          </View>

          {/* Save button */}
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.buttonPressed,
              saved && styles.saveButtonSaved,
            ]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>
              {saved ? 'SAVED ✓' : 'SAVE CHANGES'}
            </Text>
          </Pressable>

          {/* Danger zone */}
          <View style={styles.dangerZone}>
            <Text style={styles.dangerLabel}>DANGER ZONE</Text>
            <Pressable
              style={({ pressed }) => [
                styles.resetButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>START OVER</Text>
            </Pressable>
            <Text style={styles.dangerHint}>
              Permanently deletes all progress, streaks, and history.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.sm,
    letterSpacing: 2,
  },
  scroll: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  header: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 4,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  infoDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    letterSpacing: 1,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  infoValueRed: {
    color: COLORS.red,
    fontWeight: '700',
  },
  fieldGroup: {
    marginBottom: SPACING.lg,
  },
  fieldLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
  },
  fieldHint: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  saveButton: {
    backgroundColor: COLORS.red,
    borderRadius: 8,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  saveButtonSaved: {
    backgroundColor: COLORS.redDark,
  },
  saveButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  dangerZone: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.lg,
  },
  dangerLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  resetButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.redDark,
    borderRadius: 8,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  resetButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.redDark,
    letterSpacing: 2,
  },
  dangerHint: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
