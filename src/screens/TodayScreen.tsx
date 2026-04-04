import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRitual } from '../context/RitualContext';
import TaskItem from '../components/TaskItem';
import { TASKS } from '../constants/tasks';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { formatDisplayDate, getTodayString, subtractDays } from '../utils/dateUtils';
import { TaskId } from '../types';

const COMPLETION_PHRASES = [
  'THE WARRIOR SHOWED UP.',
  'DISCIPLINE IN ACTION.',
  'NO EXCUSES. NO SHORTCUTS.',
  'THE RITUAL DEMANDS IT.\nYOU DELIVERED.',
  'ONE MORE DAY EARNED.',
  'BUILT IN THE DARK.',
  'THE WORK IS DONE.',
  'FORGED BY INTENTION.',
];

export default function TodayScreen() {
  const {
    data,
    loading,
    toggleTask,
    currentStreak,
    dayNumber,
    todayProgress,
    isTodayComplete,
  } = useRitual();

  const [showCompletion, setShowCompletion] = useState(false);
  const prevCompleteRef = useRef(false);

  // Show completion screen when last task is checked off
  useEffect(() => {
    if (isTodayComplete && !prevCompleteRef.current) {
      setShowCompletion(true);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
    prevCompleteRef.current = isTodayComplete;
  }, [isTodayComplete]);

  const handleToggle = useCallback(
    async (taskId: TaskId) => {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await toggleTask(taskId);
    },
    [toggleTask]
  );

  // Detect a broken streak: had completed days before, but current streak is 0
  const streakBroken = useMemo(() => {
    if (!data || currentStreak > 0 || isTodayComplete) return false;
    const today = getTodayString();
    return Object.values(data.days).some(
      (d) => d.isComplete && d.date < today
    );
  }, [data, currentStreak, isTodayComplete]);

  const completionPhrase =
    COMPLETION_PHRASES[(dayNumber - 1) % COMPLETION_PHRASES.length];

  if (loading || !data) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>LOADING THE RITUAL...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const today = getTodayString();
  const todayLog = data.days[today];
  const wakeSubtitle = `Rise at ${data.settings.wakeTime} — no snoozing`;
  const progressPct =
    todayProgress.total > 0
      ? todayProgress.completed / todayProgress.total
      : 0;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* ── Day Completion Modal ── */}
      <Modal
        visible={showCompletion}
        animationType="fade"
        transparent={false}
        statusBarTranslucent
      >
        <SafeAreaView style={completion.root}>
          <View style={completion.content}>
            <Text style={completion.eyebrow}>THE RITUAL</Text>

            <View style={completion.dayWrap}>
              <Text style={completion.dayLabel}>DAY</Text>
              <Text style={completion.dayNumber}>{dayNumber}</Text>
            </View>

            <View style={completion.bar} />
            <Text style={completion.completeText}>COMPLETE</Text>
            <View style={completion.bar} />

            <Text style={completion.phrase}>{completionPhrase}</Text>

            <View style={completion.streakRow}>
              <Text style={completion.streakFire}>🔥</Text>
              <Text style={completion.streakNum}>{currentStreak}</Text>
              <Text style={completion.streakLabel}>
                {currentStreak === 1 ? 'DAY STREAK' : 'DAY STREAK'}
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                completion.dismissBtn,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => setShowCompletion(false)}
            >
              <Text style={completion.dismissText}>CONTINUE</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>THE RITUAL</Text>
            <Text style={styles.dateText}>{formatDisplayDate(today)}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={styles.streakCount}>{currentStreak}</Text>
          </View>
        </View>

        {/* Streak broken banner */}
        {streakBroken && (
          <View style={styles.resetBanner}>
            <Text style={styles.resetTitle}>YOUR RITUAL RESET</Text>
            <Text style={styles.resetBody}>
              You missed a day. A WARRior acknowledges and resets.{'\n'}
              Today is Day 1. Start again with intention.
            </Text>
          </View>
        )}

        {/* Day + Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={styles.dayLabel}>DAY {dayNumber}</Text>
            <Text style={styles.progressLabel}>
              {todayProgress.completed}/{todayProgress.total}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPct * 100}%` },
                isTodayComplete && styles.progressFillComplete,
              ]}
            />
          </View>
        </View>

        {/* Task List */}
        <View style={styles.taskList}>
          {TASKS.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              completed={!!todayLog?.completedTasks[task.id]}
              onToggle={() => handleToggle(task.id)}
              subtitle={task.id === 'wake_up' ? wakeSubtitle : undefined}
            />
          ))}
        </View>

        {!isTodayComplete && (
          <Text style={styles.footerNote}>
            All 8 tasks must be completed to keep your streak.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Completion modal styles ──
const completion = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  eyebrow: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.red,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: SPACING.xl,
  },
  dayWrap: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dayLabel: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 4,
  },
  dayNumber: {
    fontSize: 96,
    fontWeight: '900',
    color: COLORS.textPrimary,
    lineHeight: 100,
  },
  bar: {
    width: 80,
    height: 3,
    backgroundColor: COLORS.red,
    marginVertical: SPACING.md,
  },
  completeText: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 6,
  },
  phrase: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.redDeep,
    borderWidth: 1,
    borderColor: COLORS.redDark,
    borderRadius: 10,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  streakFire: { fontSize: 22 },
  streakNum: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  streakLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  dismissBtn: {
    backgroundColor: COLORS.red,
    borderRadius: 8,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
  },
  dismissText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 3,
  },
});

// ── Main screen styles ──
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  appTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 4,
  },
  dateText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  streakBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.redDeep,
    borderWidth: 1,
    borderColor: COLORS.redDark,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minWidth: 64,
  },
  streakFire: { fontSize: 18 },
  streakCount: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '900',
    color: COLORS.textPrimary,
    lineHeight: 26,
  },
  resetBanner: {
    backgroundColor: COLORS.redDeep,
    borderWidth: 1,
    borderColor: COLORS.red,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  resetTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '900',
    color: COLORS.redBright,
    letterSpacing: 2,
    marginBottom: SPACING.xs,
  },
  resetBody: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  progressSection: {
    marginBottom: SPACING.md,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  dayLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.red,
    letterSpacing: 2,
  },
  progressLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.redDark,
    borderRadius: 2,
  },
  progressFillComplete: {
    backgroundColor: COLORS.redBright,
  },
  taskList: {
    marginTop: SPACING.xs,
  },
  footerNote: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
    letterSpacing: 0.3,
  },
});
