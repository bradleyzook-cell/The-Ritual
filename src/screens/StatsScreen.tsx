import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRitual } from '../context/RitualContext';
import { TASKS, TASK_IDS } from '../constants/tasks';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { getTodayString, getDaysBetween } from '../utils/dateUtils';

export default function StatsScreen() {
  const {
    data,
    loading,
    currentStreak,
    bestStreak,
    totalCompleteDays,
    dayNumber,
  } = useRitual();

  const completionRate = useMemo(() => {
    if (!data) return 0;
    const today = getTodayString();
    const daysSinceStart = getDaysBetween(data.settings.startDate, today) + 1;
    if (daysSinceStart <= 0) return 0;
    return Math.round((totalCompleteDays / daysSinceStart) * 100);
  }, [data, totalCompleteDays]);

  const taskBreakdown = useMemo(() => {
    if (!data) return [];
    const today = getTodayString();
    const daysSinceStart = Math.max(1, getDaysBetween(data.settings.startDate, today) + 1);

    return TASKS.map((task) => {
      const count = Object.values(data.days).filter(
        (d) => d.date >= data.settings.startDate && !!d.completedTasks[task.id]
      ).length;
      return {
        task,
        count,
        pct: Math.round((count / daysSinceStart) * 100),
      };
    }).sort((a, b) => b.pct - a.pct);
  }, [data]);

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
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>STATS</Text>
          {data.settings.name ? (
            <Text style={styles.nameText}>{data.settings.name.toUpperCase()}</Text>
          ) : null}
        </View>

        {/* Streak hero */}
        <View style={styles.streakHero}>
          <Text style={styles.streakFire}>🔥</Text>
          <Text style={styles.streakNumber}>{currentStreak}</Text>
          <Text style={styles.streakLabel}>CURRENT STREAK</Text>
          {currentStreak === 0 && (
            <Text style={styles.streakSub}>Complete all 8 tasks today to start your streak</Text>
          )}
        </View>

        {/* Stats grid */}
        <View style={styles.gridRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{bestStreak}</Text>
            <Text style={styles.statLabel}>BEST STREAK</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalCompleteDays}</Text>
            <Text style={styles.statLabel}>DAYS COMPLETE</Text>
          </View>
        </View>
        <View style={styles.gridRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{dayNumber}</Text>
            <Text style={styles.statLabel}>DAY NUMBER</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, completionRate >= 80 && styles.statValueGood]}>
              {completionRate}%
            </Text>
            <Text style={styles.statLabel}>COMPLETION RATE</Text>
          </View>
        </View>

        {/* Task breakdown */}
        <Text style={styles.sectionTitle}>TASK BREAKDOWN</Text>
        <View style={styles.breakdownList}>
          {taskBreakdown.map(({ task, count, pct }) => (
            <View key={task.id} style={styles.breakdownRow}>
              <Text style={styles.taskIcon}>{task.icon}</Text>
              <View style={styles.breakdownContent}>
                <View style={styles.breakdownHeader}>
                  <Text style={styles.taskName} numberOfLines={1}>
                    {task.title}
                  </Text>
                  <Text style={styles.taskPct}>{pct}%</Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${pct}%` },
                      pct >= 90 && styles.barFillHigh,
                      pct < 60 && styles.barFillLow,
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
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
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 4,
  },
  nameText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.red,
    fontWeight: '700',
    letterSpacing: 1,
  },
  streakHero: {
    backgroundColor: COLORS.redDeep,
    borderWidth: 1,
    borderColor: COLORS.redDark,
    borderRadius: 12,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  streakFire: {
    fontSize: 36,
    marginBottom: SPACING.xs,
  },
  streakNumber: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '900',
    color: COLORS.textPrimary,
    lineHeight: FONTS.sizes.xxxl + 4,
  },
  streakLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.red,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: SPACING.xs,
  },
  streakSub: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  gridRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  statValueGood: {
    color: COLORS.redBright,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 2,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  breakdownList: {
    gap: SPACING.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskIcon: {
    fontSize: 20,
    width: 32,
    marginRight: SPACING.sm,
  },
  breakdownContent: {
    flex: 1,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  taskName: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  taskPct: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  barTrack: {
    height: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.redDark,
    borderRadius: 2,
  },
  barFillHigh: {
    backgroundColor: COLORS.redBright,
  },
  barFillLow: {
    backgroundColor: COLORS.redDeep,
  },
});
