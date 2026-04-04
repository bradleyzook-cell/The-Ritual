import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRitual } from '../context/RitualContext';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { getTodayString, addDays, formatDate, parseDate } from '../utils/dateUtils';

const DOW_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PAD = SPACING.md;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - H_PAD * 2) / 7);

const BADGE_IMAGES = {
  30: require('../../assets/badge-thirty.png'),
  60: require('../../assets/badge-sixty.png'),
  90: require('../../assets/badge-ninety.png'),
} as const;

const PHASES = [
  { label: 'PHASE 1', checkpoint: 30 as const },
  { label: 'PHASE 2', checkpoint: 60 as const },
  { label: 'PHASE 3', checkpoint: 90 as const },
];

interface CalDay {
  dateStr: string;
  dayOfMonth: number;
  challengeDay: number; // 1-90 if in challenge, 0 otherwise
  isComplete: boolean;
  isMissed: boolean;
  isToday: boolean;
  isFuture: boolean;
}

interface CalMonth {
  year: number;
  month: number;          // 0-indexed
  monthName: string;
  weeks: (CalDay | null)[][];
  /** Challenge days that are checkpoints (30/60/90) within this month */
  checkpoints: number[];
}

function buildCalendar(
  startDate: string,
  days: Record<string, { isComplete: boolean }>
): CalMonth[] {
  const today = getTodayString();
  const endDate = addDays(startDate, 89); // day 90

  const startD = parseDate(startDate);
  const endD = parseDate(endDate);

  // Enumerate all calendar months that the challenge spans
  const months: CalMonth[] = [];
  let cur = new Date(startD.getFullYear(), startD.getMonth(), 1);
  const endMonth = new Date(endD.getFullYear(), endD.getMonth(), 1);

  while (cur <= endMonth) {
    const year = cur.getFullYear();
    const month = cur.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDow = new Date(year, month, 1).getDay(); // 0=Sun

    const checkpoints: number[] = [];
    const allDays: (CalDay | null)[] = Array(firstDow).fill(null);

    for (let dom = 1; dom <= daysInMonth; dom++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dom).padStart(2, '0')}`;
      const diffMs = parseDate(dateStr).getTime() - parseDate(startDate).getTime();
      const diff = Math.round(diffMs / 86400000);
      const challengeDay = diff >= 0 && diff <= 89 ? diff + 1 : 0;

      if (challengeDay === 30 || challengeDay === 60 || challengeDay === 90) {
        checkpoints.push(challengeDay);
      }

      const isComplete = !!days[dateStr]?.isComplete;
      const isFuture = dateStr > today;
      const isToday = dateStr === today;
      const isMissed = challengeDay > 0 && dateStr < today && !isComplete && !isToday;

      allDays.push({ dateStr, dayOfMonth: dom, challengeDay, isComplete, isMissed, isToday, isFuture });
    }

    // Pad last week
    while (allDays.length % 7 !== 0) allDays.push(null);

    const weeks: (CalDay | null)[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7) as (CalDay | null)[]);
    }

    const monthName = new Date(year, month, 1).toLocaleString('en-US', { month: 'long' });
    months.push({ year, month, monthName, weeks, checkpoints });

    cur = new Date(year, month + 1, 1);
  }

  return months;
}

function phaseCompleted(
  checkpoint: number,
  startDate: string,
  days: Record<string, { isComplete: boolean }>
): boolean {
  const start = checkpoint - 29;
  for (let d = start; d <= checkpoint; d++) {
    const date = addDays(startDate, d - 1);
    if (!days[date]?.isComplete) return false;
  }
  return true;
}

export default function HistoryScreen() {
  const {
    data,
    loading,
    currentStreak,
    bestStreak,
    totalCompleteDays,
    dayNumber,
  } = useRitual();

  const calendar = useMemo(() => {
    if (!data) return [];
    return buildCalendar(data.settings.startDate, data.days);
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

  const { startDate, days } = { startDate: data.settings.startDate, days: data.days };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>YOUR JOURNEY</Text>
          <Text style={styles.subtitle}>30 · 60 · 90 Day Challenge</Text>
        </View>

        {/* Stats strip */}
        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>🔥 {currentStreak}</Text>
            <Text style={styles.statLabel}>STREAK</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{bestStreak}</Text>
            <Text style={styles.statLabel}>BEST</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalCompleteDays}</Text>
            <Text style={styles.statLabel}>COMPLETE</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: COLORS.red }]}>{dayNumber}</Text>
            <Text style={styles.statLabel}>DAY</Text>
          </View>
        </View>

        {/* Calendar months */}
        {calendar.map(({ year, month, monthName, weeks, checkpoints }) => (
          <View key={`${year}-${month}`} style={styles.monthBlock}>
            <Text style={styles.monthLabel}>{monthName} {year}</Text>

            {/* Day-of-week headers */}
            <View style={styles.weekRow}>
              {DOW_LABELS.map((d, i) => (
                <View key={i} style={styles.cell}>
                  <Text style={styles.dowLabel}>{d}</Text>
                </View>
              ))}
            </View>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <View key={wi} style={styles.weekRow}>
                {week.map((day, di) => {
                  if (!day) return <View key={di} style={styles.cell} />;
                  return (
                    <View key={di} style={styles.cell}>
                      <View style={[
                        styles.dayCell,
                        day.challengeDay > 0 && styles.dayCellInChallenge,
                        day.isComplete && styles.dayCellComplete,
                        day.isMissed && styles.dayCellMissed,
                        day.isToday && !day.isComplete && styles.dayCellToday,
                      ]}>
                        <Text style={[
                          styles.dayNum,
                          day.challengeDay > 0 && styles.dayNumInChallenge,
                          day.isComplete && styles.dayNumComplete,
                          day.isMissed && styles.dayNumMissed,
                          day.isToday && !day.isComplete && styles.dayNumToday,
                          day.isFuture && day.challengeDay > 0 && styles.dayNumFuture,
                        ]}>
                          {day.dayOfMonth}
                        </Text>
                        {/* Checkpoint dot */}
                        {(day.challengeDay === 30 || day.challengeDay === 60 || day.challengeDay === 90) && (
                          <View style={styles.checkpointDot} />
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}

            {/* Phase badges that fall within this month */}
            {checkpoints.map((cp) => {
              const reached = dayNumber >= cp;
              const perfect = reached && phaseCompleted(cp, startDate, days);
              if (!reached) return null;
              return (
                <View key={cp} style={styles.badgeWrap}>
                  <Image
                    source={BADGE_IMAGES[cp as keyof typeof BADGE_IMAGES]}
                    style={styles.badgeImage}
                    resizeMode="contain"
                  />
                  {!perfect && (
                    <Text style={styles.badgeIncomplete}>
                      Complete all {cp} days without missing one to earn this badge
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        ))}

        {/* Legend */}
        <View style={styles.legend}>
          <LegendItem color={COLORS.red}     border={COLORS.redBright} label="Complete" />
          <LegendItem color="transparent"    border={COLORS.red}       label="Today" />
          <LegendItem color={COLORS.redDeep} border={COLORS.redDeep}   label="Missed" />
          <LegendItem color={COLORS.surface} border={COLORS.border}    label="Upcoming" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LegendItem({ color, border, label }: { color: string; border: string; label: string }) {
  return (
    <View style={legendStyles.item}>
      <View style={[legendStyles.dot, { backgroundColor: color, borderColor: border }]} />
      <Text style={legendStyles.label}>{label}</Text>
    </View>
  );
}

const legendStyles = StyleSheet.create({
  item:  { flexDirection: 'row', alignItems: 'center', marginRight: SPACING.md, marginBottom: SPACING.xs },
  dot:   { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, marginRight: 6 },
  label: { fontSize: FONTS.sizes.xs, fontFamily: FONTS.body, color: COLORS.textSecondary },
});

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: COLORS.background },
  loading:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: COLORS.textMuted, fontFamily: FONTS.body, fontSize: FONTS.sizes.sm, letterSpacing: 2 },
  scroll:      { paddingHorizontal: H_PAD, paddingBottom: SPACING.xxl },

  header:   { paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  title:    { fontSize: FONTS.sizes.xxl, fontFamily: FONTS.heading, color: COLORS.textPrimary, letterSpacing: 4 },
  subtitle: { fontSize: FONTS.sizes.sm, fontFamily: FONTS.body, color: COLORS.textMuted, marginTop: 2 },

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
  statBox:   { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FONTS.sizes.lg, fontFamily: FONTS.heading, color: COLORS.textPrimary },
  statLabel: { fontSize: FONTS.sizes.xs, fontFamily: FONTS.body, color: COLORS.textMuted, letterSpacing: 1, marginTop: 2 },
  divider:   { width: 1, height: 32, backgroundColor: COLORS.border },

  monthBlock: { marginBottom: SPACING.xl },
  monthLabel: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },

  weekRow: { flexDirection: 'row' },
  cell:    { width: CELL_SIZE, height: CELL_SIZE, alignItems: 'center', justifyContent: 'center' },
  dowLabel: {
    fontSize: FONTS.sizes.xs,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },

  dayCell: {
    width: CELL_SIZE - 4,
    height: CELL_SIZE - 4,
    borderRadius: (CELL_SIZE - 4) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellInChallenge: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayCellComplete: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.redBright,
  },
  dayCellMissed: {
    backgroundColor: COLORS.redDeep,
    borderColor: COLORS.redDeep,
  },
  dayCellToday: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.red,
  },

  dayNum: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  dayNumInChallenge: {
    color: COLORS.textSecondary,
  },
  dayNumComplete: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.textPrimary,
  },
  dayNumMissed: {
    color: COLORS.redMuted,
  },
  dayNumToday: {
    fontFamily: FONTS.bodyBold,
    color: COLORS.red,
  },
  dayNumFuture: {
    color: COLORS.textMuted,
  },

  checkpointDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.redBright,
  },

  badgeWrap: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  badgeImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  badgeIncomplete: {
    fontSize: FONTS.sizes.xs,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    fontStyle: 'italic',
  },

  legend: { flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.sm },
});
