import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { TASKS } from '../constants/tasks';

type Step = 0 | 1 | 2;

interface Props {
  onComplete: (name: string, wakeTime: string) => Promise<void>;
}

export default function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState<Step>(0);
  const [name, setName] = useState('');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [saving, setSaving] = useState(false);

  const handleStart = async () => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    const trimmedTime = wakeTime.trim();
    if (!timeRegex.test(trimmedTime)) {
      Alert.alert('Invalid Time', 'Please enter wake time in HH:MM format (e.g. 05:30)');
      return;
    }
    setSaving(true);
    await onComplete(name.trim(), trimmedTime);
    setSaving(false);
  };

  // ── Step 0: Welcome ─────────────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.welcomeContent}>
          <Image
            source={require('../../assets/logo-ritual.png')}
            style={styles.ritualLogo}
            resizeMode="contain"
          />
          <View style={styles.divider} />
          <Text style={styles.welcomeEyebrow}>WELCOME TO</Text>
          <Text style={styles.welcomeTitle}>THE RITUAL</Text>
          <Text style={styles.welcomeSub}>
            A daily discipline framework{'\n'}built for WARRiors.
          </Text>

          <View style={styles.warrbuiltCard}>
            <Image
              source={require('../../assets/logo-warrbuilt.png')}
              style={styles.warrbuiltLogo}
              resizeMode="contain"
              tintColor="#FFFFFF"
            />
          </View>

          <Pressable
            style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}
            onPress={() => setStep(1)}
          >
            <Text style={styles.btnText}>BEGIN</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ── Step 1: The Ritual overview ──────────────────────────────────────────
  if (step === 1) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.stepRoot}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepEyebrow}>THE COMMITMENT</Text>
            <Text style={styles.stepTitle}>THE RITUAL</Text>
            <View style={styles.dividerSmall} />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.bodyText}>
              Men require discipline to become warriors. The Ritual is an 8-step daily action
              list built around the Totems of the WARRPath — Family, Fitness, Finance, and Fortitude.
            </Text>
            <Text style={styles.rulesTitle}>THE LAW</Text>
            <Text style={styles.bodyText}>
              Complete all 8 tasks every day to maintain your streak. Miss one task — you miss
              the day. Miss a day — you restart from Day 1. There are no shortcuts. There is
              no partial credit.
            </Text>

            <Text style={styles.rulesTitle}>THE 8 DAILY ACTIONS</Text>
            <View style={styles.taskList}>
              {TASKS.map((task, i) => (
                <View key={task.id} style={styles.taskRow}>
                  <Text style={styles.taskNum}>{String(i + 1).padStart(2, '0')}</Text>
                  <Text style={styles.taskIcon}>{task.icon}</Text>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                </View>
              ))}
            </View>

            <View style={styles.phasePill}>
              <Text style={styles.phaseText}>
                Complete 30 days for Phase 1 · 60 for Phase 2 · 90 for Phase 3
              </Text>
            </View>
          </ScrollView>

          <View style={styles.bottomBar}>
            <Pressable
              style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}
              onPress={() => setStep(2)}
            >
              <Text style={styles.btnText}>I ACCEPT THE RITUAL</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Step 2: Setup ──────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={styles.stepRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.stepHeader}>
          <Text style={styles.stepEyebrow}>ALMOST THERE</Text>
          <Text style={styles.stepTitle}>YOUR SETUP</Text>
          <View style={styles.dividerSmall} />
          <Text style={styles.setupSub}>
            Configure your ritual before Day 1 begins.
          </Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>YOUR NAME (OPTIONAL)</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="words"
              returnKeyType="next"
              autoCorrect={false}
            />
          </View>

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

          <View style={styles.commitCard}>
            <Text style={styles.commitText}>
              "The Ritual demands full commitment. Every. Single. Day."
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <Pressable
            style={({ pressed }) => [
              styles.btn,
              pressed && { opacity: 0.8 },
              saving && styles.btnDisabled,
            ]}
            onPress={handleStart}
            disabled={saving}
          >
            <Text style={styles.btnText}>
              {saving ? 'STARTING...' : 'START THE RITUAL'}
            </Text>
          </Pressable>
          <Pressable onPress={() => setStep(1)} style={styles.backLink}>
            <Text style={styles.backLinkText}>← Back</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ── Welcome ────────────────────────────────────────────
  welcomeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  ritualLogo: {
    width: 160,
    height: 160,
    borderRadius: 20,
    marginBottom: SPACING.lg,
  },
  divider: {
    width: 56,
    height: 3,
    backgroundColor: COLORS.red,
    marginBottom: SPACING.lg,
  },
  welcomeEyebrow: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textMuted,
    letterSpacing: 4,
    marginBottom: SPACING.xs,
  },
  welcomeTitle: {
    fontSize: FONTS.sizes.xxxl,
    fontFamily: FONTS.heading,
    color: COLORS.textPrimary,
    letterSpacing: 6,
    marginBottom: SPACING.md,
  },
  welcomeSub: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  warrbuiltCard: {
    borderRadius: 10,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  warrbuiltLogo: {
    width: 180,
    height: 48,
  },

  // ── Step shell ────────────────────────────────────────────
  stepRoot: {
    flex: 1,
  },
  stepHeader: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  stepEyebrow: {
    fontSize: FONTS.sizes.xs,
    fontFamily: FONTS.bodyBold,
    color: COLORS.red,
    letterSpacing: 3,
    marginBottom: SPACING.xs,
  },
  stepTitle: {
    fontSize: FONTS.sizes.xxl,
    fontFamily: FONTS.heading,
    color: COLORS.textPrimary,
    letterSpacing: 4,
  },
  dividerSmall: {
    width: 40,
    height: 3,
    backgroundColor: COLORS.red,
    marginTop: SPACING.sm,
  },
  setupSub: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
  },

  // ── Step 1 content ──────────────────────────────────────────
  rulesTitle: {
    fontSize: FONTS.sizes.xs,
    fontFamily: FONTS.bodyBold,
    color: COLORS.red,
    letterSpacing: 3,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  bodyText: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  taskList: {
    marginTop: SPACING.xs,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  taskNum: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.bodyBold,
    color: COLORS.red,
    width: 28,
  },
  taskIcon: {
    fontSize: 18,
    width: 28,
  },
  taskTitle: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textSecondary,
  },
  phasePill: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.redDeep,
    borderWidth: 1,
    borderColor: COLORS.redDark,
    borderRadius: 8,
    padding: SPACING.md,
  },
  phaseText: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Step 2 content ──────────────────────────────────────────
  fieldGroup: {
    marginBottom: SPACING.lg,
    marginTop: SPACING.md,
  },
  fieldLabel: {
    fontSize: FONTS.sizes.xs,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textMuted,
    letterSpacing: 2,
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
    fontFamily: FONTS.body,
    color: COLORS.textPrimary,
  },
  fieldHint: {
    fontSize: FONTS.sizes.xs,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  commitCard: {
    marginTop: SPACING.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.red,
    paddingLeft: SPACING.md,
  },
  commitText: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.body,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    lineHeight: 24,
  },

  // ── Shared bottom bar ─────────────────────────────────────────
  bottomBar: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  btn: {
    backgroundColor: COLORS.red,
    borderRadius: 8,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  btnText: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textPrimary,
    letterSpacing: 3,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  backLink: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
  },
  backLinkText: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
});
