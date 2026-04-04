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
import { getTodayString, addDays, isToday } from '../utils/dateUtils';

const COLS = 5;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CELL_GAP = 8;
const H_PAD = SPACING.md * 2;
const CELL_SIZE = Math.floor((SCREEN_WIDTH - H_PAD - CELL_GAP * (COLS - 1)) / COLS);

const BADGE_IMAGES = {
  30: require('../../assets/badge-thirty.png'),
  60: require('../../assets/badge-sixty.png'),
  90: require('../../assets/badge-ninety.png'),
} as const;

const PHASES = [
  { label: 'PHASE 1', start: 1,  end: 30, checkpoint: 30 },
  { label: 'PHASE 2', start: 31, end: 60, checkpoint: 60 },
  { label: 'PHASE 3', start: 61, end: 90, checkpoint: 90 },
];

type DayStatus = 'complete' | 'missed' | 'today' | 'upcoming';

function getStatus(
  dayNum: number,
  startDate: string,
  days: Record<string, { isComplete: boolean }>
): DayStatus {
  const date = addDays(startDate, dayNum - 1);
  const today = getTodayString();
  if (date > today) return 'upcoming';
  if (isToday(date)) return days[date]?.isComplete ? 'complete' : 'today';
  return days[date]?.isComplete ? 'complete' : 'missed';
}

function cellStyle(status: DayStatus) {
  switch (status) {
    case 'complete':  return { bg: COLORS.red,       border: COLORS.redBright };
    case 'missed':    return { bg: COLORS.redDeep,   border: COLORS.redDeep };
    case 'today':     return { bg: 'transparent',    border: COLORS.redBright };
    case 'upcoming':  return { bg: COLORS.surface,   border: COLORS.border };
  }
}

function cellTextColor(status: DayStatus): string {
  switch (status) {
    case 'complete':  return COLORS.textPrimary;
    case 'missed':    return COLORS.redDark;
    case 'today':     return COLORS.redBright;
    case 'upcoming':  return COLORS.textMuted;
  }
}

function chunkIntoRows(start: number, end: number): number[][] {
  const days = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const rows: number[][] = [];
  for (let i = 0; i < days.length; i += COLS) {
    rows.push(days.slice(i, i + COLS));
  }
  return rows;
}

function phaseCompleted(
  start: number,
  end: number,
  startDate: string,
  days: Record<string, { isComplete: boolean }>
): boolean {
  for (let d = start; d <= end; d++) {
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

  // Only show phases the user has reached or started
  const visiblePhases = PHASES.filter((p) => dayNumber >= p.start);
  if (visiblePhases.length === 0) visiblePhases.push(PHASES[0]);

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
            <Text style={[styles.statValue, { color: COLORS.red }]}>
              {dayNumber}
            </Text>
            <Text style={styles.statLabel}>DAY</Text>
          </View>
        </View>

        {/* Phase grids */}
        {visiblePhases.map((phase, pi) => {
          const rows = chunkIntoRows(phase.start, phase.end);
          const reached = dayNumber >= phase.checkpoint;
          const perfect = reached && phaseCompleted(phase.start, phase.end, startDate, days);

          return (
            <View key={phase.label} style={styles.phaseBlock}>
              {/* Phase label */}
              <View style={styles.phaseHeader}>
                <Text style={styles.phaseLabel}>{phase.label}</Text>
                <Text style={styles.phaseDays}>
                  DAYS {phase.start}–{phase.end}
                </Text>
              </View>

              {/* Day grid */}
              <View style={styles.grid}>
                {rows.map((row, ri) => (
                  <View key={ri} style={styles.row}>
                    {row.map((dayNum) => {
                      const status = getStatus(dayNum, startDate, days);
                      const cs = cellStyle(status);
                      return (
                        <View
                          key={dayNum}
                          style={[
                            styles.cell,
                            { backgroundColor: cs.bg, borderColor: cs.border },
                          ]}
                        >
                          <Text style={[styles.cellNum, { color: cellTextColor(status) }]}>
                            {dayNum}
                          </Text>
                          {status === 'complete' && (
                            <Text style={styles.cellCheck}>✓</Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>

              {/* Checkpoint badge */}
              {reached && (
                <View style={styles.badgeWrap}>
                  <Image
                    source={BADGE_IMAGES[phase.checkpoint as keyof typeof BADGE_IMAGES]}
                    style={styles.badgeImage}
                    resizeMode="contain"
                  />
                  {!perfect && (
                    <Text style={styles.badgeIncomplete}>
                      Complete all {phase.checkpoint} days without missing one to earn this badge
                    </Text>
                  )}
                </View>
              )}

              {/* Phase divider */}
              {pi < visiblePhases.length - 1 && (
                <View style={styles.phaseDivider} />
              )}
            </View>
          );
        })}

        {/* Legend */}
        <View style={styles.legend}>
          <LegendItem color={COLORS.red}     border={COLORS.redBright} label="Complete" />
          <LegendItem color="transparent"    border={COLORS.redBright} label="Today" />
          <LegendItem color={COLORS.redDeep} border={COLORS.redDeep}   label="Missed" />
          <LegendItem color={COLORS.surface} border={COLORS.border}     label="Upcoming" />
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
  item: { flexDirection: 'row', alignItems: 'center', marginRight: SPACING.md, marginBottom: SPACING.xs },
  dot:  { width: 12, height: 12, borderRadius: 3, borderWidth: 1, marginRight: 6 },
  label: { fontSize: FONTS.sizes.xs, fontFamily: FONTS.body, color: COLORS.textSecondary },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: COLORS.textMuted, fontFamily: FONTS.body, fontSize: FONTS.sizes.sm, letterSpacing: 2 },
  scroll: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xxl },
  header: { paddingTop: SPACING.lg, paddingBottom: SPACING.md },
  title: { fontSize: FONTS.sizes.xxl, fontFamily: FONTS.heading, color: COLORS.textPrimary, letterSpacing: 4 },
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
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FONTS.sizes.lg, fontFamily: FONTS.heading, color: COLORS.textPrimary },
  statLabel: { fontSize: FONTS.sizes.xs, fontFamily: FONTS.body, color: COLORS.textMuted, letterSpacing: 1, marginTop: 2 },
  divider: { width: 1, height: 32, backgroundColor: COLORS.border },
  phaseBlock: { marginBottom: SPACING.md },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  phaseLabel: { fontSize: FONTS.sizes.sm, fontFamily: FONTS.bodyBold, color: COLORS.red, letterSpacing: 2 },
  phaseDays: { fontSize: FONTS.sizes.xs, fontFamily: FONTS.body, color: COLORS.textMuted },
  grid: { gap: CELL_GAP },
  row: { flexDirection: 'row', gap: CELL_GAP },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellNum: { fontSize: FONTS.sizes.sm, fontFamily: FONTS.bodyBold },
  cellCheck: { fontSize: 9, color: COLORS.textPrimary, position: 'absolute', bottom: 3, right: 5 },
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
  phaseDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.lg },
  legend: { flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.sm },
});
