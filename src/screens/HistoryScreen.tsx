import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRitual } from '../context/RitualContext';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import {
  getTodayString,
  isPast,
  isToday,
  groupIntoWeeks,
  getLastNDays,
  formatShortDate,
} from '../utils/dateUtils';

const DOT_SIZE = 36;
const DOT_GAP = 4;
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type DayStatus = 'complete' | 'missed' | 'inProgress' | 'upcoming' | 'preStart';

function getDayStatus(
  date: string | null,
  startDate: string,
  days: Record<string, { isComplete: boolean }>
): DayStatus {
  if (!date) return 'upcoming';
  if (date > getTodayString()) return 'upcoming';
  if (date < startDate) return 'preStart';
  if (isToday(date)) {
    return days[date]?.isComplete ? 'complete' : 'inProgress';
  }
  if (isPast(date)) {
    return days[date]?.isComplete ? 'complete' : 'missed';
  }
  return 'upcoming';
}

function dotColor(status: DayStatus): string {
  switch (status) {
    case 'complete':   return COLORS.red;
    case 'missed':     return COLORS.redDeep;
    case 'inProgress': return COLORS.redDark;
    case 'upcoming':   return COLORS.surface;
    case 'preStart':   return COLORS.background;
    default:           return COLORS.surface;
  }
}

function dotBorder(status: DayStatus): string {
  switch (status) {
    case 'complete':   return COLORS.redBright;
    case 'missed':     return COLORS.redDeep;
    case 'inProgress': return COLORS.redDark;
    case 'upcoming':   return COLORS.border;
    case 'preStart':   return 'transparent';
    default:           return COLORS.border;
  }
}

export default function HistoryScreen() {
  const { data, loading, currentStreak, bestStreak, totalCompleteDays } = useRitual();

  const weeks = useMemo(() => {
    if (!data) return [];
    const days = getLastNDays(77); // 11 weeks
    return groupIntoWeeks(days);
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

  const startDate = data.settings.startDate;
  const oldestDate = weeks.length > 0 ? (weeks[0].find(Boolean) ?? null) : null;
  const newestDate = weeks.length > 0
    ? ([...weeks[weeks.length - 1]].reverse().find(Boolean) ?? null)
    : null;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>YOUR JOURNEY</Text>
          {oldestDate && newestDate && (
            <Text style={styles.dateRange}>
              {formatShortDate(oldestDate as string)} — {formatShortDate(newestDate as string)}
            </Text>
          )}
        </View>

        {/* Streak summary */}
        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>🔥 {currentStreak}</Text>
            <Text style={styles.statLabel}>CURRENT STREAK</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{bestStreak}</Text>
            <Text style={styles.statLabel}>BEST STREAK</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalCompleteDays}</Text>
            <Text style={styles.statLabel}>TOTAL DAYS</Text>
          </View>
        </View>

        {/* Calendar grid */}
        <View style={styles.grid}>
          {/* Day-of-week labels */}
          <View style={styles.dayLabelsRow}>
            {DAY_LABELS.map((label, i) => (
              <Text key={i} style={styles.dayLabel}>
                {label}
              </Text>
            ))}
          </View>

          {/* Week rows */}
          {weeks.map((week, wi) => (
            <View key={wi} style={styles.weekRow}>
              {week.map((date, di) => {
                const status = getDayStatus(date, startDate, data.days);
                return (
                  <View
                    key={di}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: dotColor(status),
                        borderColor: dotBorder(status),
                      },
                      isToday(date ?? '') && styles.dotToday,
                    ]}
                  >
                    {isToday(date ?? '') && (
                      <View style={styles.dotTodayInner} />
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <LegendItem color={COLORS.red} border={COLORS.redBright} label="Complete" />
          <LegendItem color={COLORS.redDeep} border={COLORS.redDeep} label="Missed" />
          <LegendItem color={COLORS.redDark} border={COLORS.redDark} label="In Progress" />
          <LegendItem color={COLORS.surface} border={COLORS.border} label="Upcoming" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LegendItem({
  color,
  border,
  label,
}: {
  color: string;
  border: string;
  label: string;
}) {
  return (
    <View style={legendStyles.item}>
      <View
        style={[legendStyles.dot, { backgroundColor: color, borderColor: border }]}
      />
      <Text style={legendStyles.label}>{label}</Text>
    </View>
  );
}

const legendStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
    marginBottom: SPACING.xs,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 1,
    marginRight: 6,
  },
  label: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
});

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
  dateRange: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  statRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
  },
  grid: {
    marginBottom: SPACING.lg,
  },
  dayLabelsRow: {
    flexDirection: 'row',
    marginBottom: DOT_GAP,
  },
  dayLabel: {
    width: DOT_SIZE,
    marginRight: DOT_GAP,
    textAlign: 'center',
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    fontWeight: '600',
    letterSpacing: 1,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: DOT_GAP,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: DOT_GAP,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotToday: {
    borderWidth: 2,
    borderColor: COLORS.redBright,
  },
  dotTodayInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.redBright,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
  },
});
