import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRitual } from '../context/RitualContext';
import TaskItem from '../components/TaskItem';
import { TASKS } from '../constants/tasks';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { formatDisplayDate, getTodayString } from '../utils/dateUtils';
import { TaskId } from '../types';

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

  const handleToggle = useCallback(
    async (taskId: TaskId) => {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await toggleTask(taskId);

      const nextCompleted = todayProgress.completed + 1;
      if (nextCompleted === todayProgress.total && Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
    [toggleTask, todayProgress]
  );

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
  const progressPct = todayProgress.total > 0
    ? todayProgress.completed / todayProgress.total
    : 0;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
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

        {/* Completion Banner */}
        {isTodayComplete && (
          <View style={styles.completeBanner}>
            <Text style={styles.completeBannerTitle}>DAY COMPLETE</Text>
            <Text style={styles.completeBannerSub}>
              Day {dayNumber} conquered. Keep the streak alive.
            </Text>
          </View>
        )}

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

        {/* Footer note */}
        {!isTodayComplete && (
          <Text style={styles.footerNote}>
            All 8 tasks must be completed to keep your streak.
          </Text>
        )}
      </ScrollView>
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
    justifyContent: 'center',
    backgroundColor: COLORS.redDeep,
    borderWidth: 1,
    borderColor: COLORS.redDark,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minWidth: 64,
  },
  streakFire: {
    fontSize: 18,
  },
  streakCount: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '900',
    color: COLORS.textPrimary,
    lineHeight: 26,
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
  completeBanner: {
    backgroundColor: COLORS.redDeep,
    borderWidth: 1,
    borderColor: COLORS.red,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  completeBannerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '900',
    color: COLORS.redBright,
    letterSpacing: 3,
    marginBottom: 4,
  },
  completeBannerSub: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
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
