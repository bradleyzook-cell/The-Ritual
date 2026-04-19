import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRitual } from '../context/RitualContext';
import { TASKS } from '../constants/tasks';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { getTodayString, getDaysBetween, addDays, formatShortDate } from '../utils/dateUtils';

const BADGE_IMAGES = {
  30: require('../../assets/badge-thirty.png'),
  60: require('../../assets/badge-sixty.png'),
  90: require('../../assets/badge-ninety.png'),
} as const;

type KnownCheckpoint = 30 | 60 | 90;

const KNOWN_BADGES: { label: string; checkpoint: KnownCheckpoint }[] = [
  { label: 'PHASE 1', checkpoint: 30 },
  { label: 'PHASE 2', checkpoint: 60 },
  { label: 'PHASE 3', checkpoint: 90 },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BADGE_CARD_SIZE = Math.floor((SCREEN_WIDTH - SPACING.md * 2 - SPACING.sm * 2) / 3);

function checkpointName(cp: number): string {
  if (cp === 30) return 'THIRTY';
  if (cp === 60) return 'SIXTY';
  if (cp === 90) return 'NINETY';
  return `DAY ${cp}`;
}

export default function StatsScreen() {
  const {
    data,
    loading,
    dayNumber,
    badgesEarned,
    nextBadge,
    completionRate,
  } = useRitual();

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

        {/* Day hero */}
        <View style={styles.dayHero}>
          <Text style={styles.dayNumber}>{dayNumber}</Text>
          <Text style={styles.dayLabel}>DAY</Text>
        </View>

        {/* Next badge date */}
        <View style={styles.nextBadgeCard}>
          {nextBadge ? (
            <>
              <Text style={styles.nextBadgeLabel}>NEXT BADGE</Text>
              <Text style={styles.nextBadgeCheckpoint}>{checkpointName(nextBadge.checkpoint)}</Text>
              <Text style={styles.nextBadgeDate}>{nextBadge.date}</Text>
            </>
          ) : (
            <Text style={styles.nextBadgeLabel}>ALL BADGES EARNED</Text>
          )}
        </View>

        {/* Badges Earned + Completion Rate */}
        <View style={styles.gridRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{badgesEarned} / 4</Text>
            <Text style={styles.statLabel}>BADGES EARNED</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, completionRate >= 80 && styles.statValueGood]}>
              {completionRate}%
            </Text>
            <Text style={styles.statLabel}>COMPLETION RATE</Text>
          </View>
        </View>

        {/* Badges */}
        <Text style={styles.sectionTitle}>BADGES</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.badgeRow}
        >
          {KNOWN_BADGES.map(({ label, checkpoint }) => {
            const earned = dayNumber >= checkpoint;
            const targetDate = addDays(data.settings.startDate, checkpoint - 1);
            return (
              <View key={checkpoint} style={styles.badgeCard}>
                <Image
                  source={BADGE_IMAGES[checkpoint]}
                  style={[styles.badgeImg, !earned && styles.badgeImgDim]}
                  resizeMode="contain"
                />
                <Text style={styles.badgeLabel}>{label}</Text>
                <Text style={[styles.badgeStatus, earned && styles.badgeStatusEarned]}>
                  {earned ? 'EARNED' : formatShortDate(targetDate)}
                </Text>
              </View>
            );
          })}

          {/* Mystery badge — logo hidden until revealed in a future update */}
          <View style={[styles.badgeCard, styles.mysteryCard]}>
            <View style={styles.mysteryImgBox}>
              <Text style={styles.mysteryMark}>?</Text>
            </View>
            <Text style={[styles.badgeLabel, styles.mysteryText]}>???</Text>
            <Text style={[styles.badgeStatus, styles.mysteryText]}>???</Text>
          </View>
        </ScrollView>

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
    fontFamily: FONTS.body,
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
    fontFamily: FONTS.heading,
    color: COLORS.textPrimary,
    letterSpacing: 4,
  },
  nameText: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.bodyBold,
    color: COLORS.red,
    letterSpacing: 1,
  },
  dayHero: {
    backgroundColor: COLORS.redDeep,
    borderWidth: 1,
    borderColor: COLORS.redDark,
    borderRadius: 12,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dayNumber: {
    fontSize: FONTS.sizes.xxxl,
    fontFamily: FONTS.heading,
    color: COLORS.textPrimary,
    lineHeight: FONTS.sizes.xxxl + 16,
  },
  dayLabel: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.bodyBold,
    color: COLORS.red,
    letterSpacing: 2,
    marginTop: SPACING.xs,
  },
  nextBadgeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  nextBadgeLabel: {
    fontSize: FONTS.sizes.xs,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  nextBadgeCheckpoint: {
    fontSize: FONTS.sizes.xl,
    fontFamily: FONTS.heading,
    color: COLORS.textPrimary,
    lineHeight: FONTS.sizes.xl + 10,
    marginTop: 2,
  },
  nextBadgeDate: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.bodyBold,
    color: COLORS.red,
    marginTop: 2,
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
    fontFamily: FONTS.heading,
    color: COLORS.textPrimary,
  },
  statValueGood: {
    color: COLORS.redBright,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textMuted,
    letterSpacing: 2,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  badgeRow: {
    gap: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  badgeCard: {
    width: BADGE_CARD_SIZE,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
  },
  mysteryCard: {
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  badgeImg: {
    width: BADGE_CARD_SIZE - SPACING.sm * 2,
    height: BADGE_CARD_SIZE - SPACING.sm * 2,
  },
  badgeImgDim: {
    opacity: 0.2,
  },
  mysteryImgBox: {
    width: BADGE_CARD_SIZE - SPACING.sm * 2,
    height: BADGE_CARD_SIZE - SPACING.sm * 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 6,
  },
  mysteryMark: {
    fontSize: FONTS.sizes.xxxl,
    fontFamily: FONTS.heading,
    color: COLORS.border,
    lineHeight: FONTS.sizes.xxxl + 16,
  },
  mysteryText: {
    color: COLORS.border,
  },
  badgeLabel: {
    fontSize: FONTS.sizes.xs,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginTop: SPACING.xs,
  },
  badgeStatus: {
    fontSize: FONTS.sizes.xs,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  badgeStatusEarned: {
    color: COLORS.red,
    fontFamily: FONTS.bodyBold,
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
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  taskPct: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.bodyBold,
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
