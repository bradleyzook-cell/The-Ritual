import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  Modal,
  Pressable,
  Image,
  FlatList,
} from 'react-native';

const BADGE_IMAGES: Record<number, ReturnType<typeof require>> = {
  30: require('../../assets/badge-thirty.png'),
  60: require('../../assets/badge-sixty.png'),
  90: require('../../assets/badge-ninety.png'),
};
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRitual } from '../context/RitualContext';
import TaskItem from '../components/TaskItem';
import { TASKS } from '../constants/tasks';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { formatDisplayDate, getTodayString, subtractDays, formatShortDate } from '../utils/dateUtils';
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

type FailPhase = 'fail' | 'integrity';

export default function TodayScreen() {
  const {
    data,
    loading,
    toggleTask,
    toggleTaskForDate,
    completeDay,
    restartRitual,
    currentStreak,
    dayNumber,
    todayProgress,
    isTodayComplete,
  } = useRitual();

  const [showCompletion, setShowCompletion] = useState(false);
  const prevCompleteRef = useRef(false);

  // Failure modal state
  const [failPhase, setFailPhase] = useState<FailPhase | null>(null);
  const failShownRef = useRef(false);

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

  // Detect abandoned: startDate is in the past but zero days ever completed
  const abandoned = useMemo(() => {
    if (!data || currentStreak > 0 || isTodayComplete) return false;
    const today = getTodayString();
    return data.settings.startDate < today &&
      !Object.values(data.days).some((d) => d.isComplete);
  }, [data, currentStreak, isTodayComplete]);

  // Show failure modal once per session when streak is broken or journey is stale
  useEffect(() => {
    if ((streakBroken || abandoned) && !failShownRef.current && !loading) {
      failShownRef.current = true;
      setFailPhase('fail');
    }
  }, [streakBroken, loading]);

  const yesterday = subtractDays(getTodayString(), 1);

  // Yesterday's task completion state (for integrity check)
  const yesterdayLog = data?.days[yesterday];
  const yesterdayTasks = yesterdayLog?.completedTasks ?? {};
  const allYesterdayDone = TASKS.every((t) => !!yesterdayTasks[t.id]);

  // Auto-close integrity modal once all yesterday's tasks are checked
  useEffect(() => {
    if (failPhase === 'integrity' && allYesterdayDone) {
      setFailPhase(null);
    }
  }, [failPhase, allYesterdayDone]);

  const handleToggleYesterday = useCallback(
    async (taskId: TaskId) => {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await toggleTaskForDate(yesterday, taskId);
    },
    [toggleTaskForDate, yesterday]
  );

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
      {/* ── Failure Modal ── */}
      <Modal
        visible={failPhase !== null}
        animationType="fade"
        transparent={false}
        statusBarTranslucent
      >
        <SafeAreaView style={fail.root}>
          {failPhase === 'fail' && (
            <View style={fail.content}>
              <Text style={fail.skull}>💀</Text>
              <Text style={fail.heading}>{abandoned ? 'WHERE HAVE\nYOU BEEN?' : 'YOU FAILED.'}</Text>
              <View style={fail.bar} />
              <Text style={fail.sub}>
                {abandoned
                  ? 'Your ritual has gone cold.\nA WARRior doesn\'t disappear.'
                  : `${formatShortDate(yesterday)} was not completed.\nA WARRior owns it — no excuses.`}
              </Text>
              <Text style={fail.question}>{abandoned ? 'Ready to begin?' : 'What happened?'}</Text>

              {!abandoned && (
                <Pressable
                  style={({ pressed }) => [fail.btnIntegrity, pressed && { opacity: 0.8 }]}
                  onPress={() => setFailPhase('integrity')}
                >
                  <Text style={fail.btnIntegrityText}>I DID THE WORK</Text>
                  <Text style={fail.btnIntegritySub}>Check off what you completed — on your honor</Text>
                </Pressable>
              )}

              <Pressable
                style={({ pressed }) => [fail.btnRestart, pressed && { opacity: 0.8 }]}
                onPress={async () => {
                  await restartRitual();
                  setFailPhase(null);
                }}
              >
                <Text style={fail.btnRestartText}>RESTART THE RITUAL</Text>
                <Text style={fail.btnRestartSub}>Accept the failure. Begin again as Day 1.</Text>
              </Pressable>
            </View>
          )}

          {failPhase === 'integrity' && (
            <View style={fail.root}>
              <View style={fail.integrityHeader}>
                <Pressable onPress={() => setFailPhase('fail')} style={fail.backBtn}>
                  <Text style={fail.backText}>← BACK</Text>
                </Pressable>
                <Text style={fail.integrityTitle}>ON YOUR HONOR</Text>
              </View>
              <Text style={fail.integrityNote}>
                Check off what you actually completed on {formatShortDate(yesterday)}.{'\n'}
                If you didn't do it — don't check it.{'\n'}This is between you and the iron.
              </Text>
              <ScrollView style={fail.taskList} contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingBottom: SPACING.xxl }}>
                {TASKS.map((task) => {
                  const done = !!yesterdayTasks[task.id];
                  return (
                    <Pressable
                      key={task.id}
                      style={({ pressed }) => [
                        fail.taskRow,
                        done && fail.taskRowDone,
                        pressed && { opacity: 0.75 },
                      ]}
                      onPress={() => handleToggleYesterday(task.id)}
                    >
                      <Text style={fail.taskIcon}>{task.icon}</Text>
                      <Text style={[fail.taskTitle, done && fail.taskTitleDone]} numberOfLines={1}>
                        {task.title}
                      </Text>
                      <View style={[fail.checkbox, done && fail.checkboxDone]}>
                        {done && <Text style={fail.checkmark}>✓</Text>}
                      </View>
                    </Pressable>
                  );
                })}
                <Text style={fail.integrityFooter}>
                  Once all 8 are checked, your streak will be restored.
                </Text>
              </ScrollView>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* ── Day Completion Modal ── */}
      <Modal
        visible={showCompletion}
        animationType="fade"
        transparent={false}
        statusBarTranslucent
      >
        <SafeAreaView style={completion.root}>
          <View style={completion.content}>
            <Image
              source={require('../../assets/logo-ritual.png')}
              style={completion.logo}
              resizeMode="contain"
            />

            <View style={completion.dayWrap}>
              <Text style={completion.dayLabel}>DAY</Text>
              <Text style={completion.dayNumber}>{dayNumber}</Text>
            </View>

            <View style={completion.bar} />
            <Text style={completion.completeText}>COMPLETE</Text>
            <View style={completion.bar} />

            {/* Badge unlock on checkpoint days */}
            {BADGE_IMAGES[dayNumber] && (
              <View style={completion.badgeWrap}>
                <Image
                  source={BADGE_IMAGES[dayNumber]}
                  style={completion.badgeImg}
                  resizeMode="contain"
                />
              </View>
            )}

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
            <Image
              source={require('../../assets/logo-ritual.png')}
              style={styles.ritualLogo}
              resizeMode="contain"
            />
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
  logo: {
    width: 160,
    height: 160,
    marginBottom: SPACING.md,
    borderRadius: 12,
  },
  dayWrap: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dayLabel: {
    fontSize: FONTS.sizes.lg,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textSecondary,
    letterSpacing: 4,
  },
  dayNumber: {
    fontSize: 96,
    fontFamily: FONTS.heading,
    color: COLORS.textPrimary,
    lineHeight: 116,
  },
  bar: {
    width: 80,
    height: 3,
    backgroundColor: COLORS.red,
    marginVertical: SPACING.md,
  },
  completeText: {
    fontSize: FONTS.sizes.xxl,
    fontFamily: FONTS.heading,
    color: COLORS.textPrimary,
    letterSpacing: 6,
  },
  phrase: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.body,
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
    fontFamily: FONTS.heading,
    color: COLORS.textPrimary,
  },
  streakLabel: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.bodyBold,
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
    fontFamily: FONTS.bodyBold,
    color: COLORS.textPrimary,
    letterSpacing: 3,
  },
  badgeWrap: {
    marginVertical: SPACING.md,
    alignItems: 'center',
  },
  badgeImg: {
    width: 200,
    height: 200,
  },
});

// ── Failure modal styles ──
const fail = StyleSheet.create({
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
  skull: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  heading: {
    fontSize: FONTS.sizes.xxxl,
    fontFamily: FONTS.heading,
    color: COLORS.textPrimary,
    letterSpacing: 6,
    marginBottom: SPACING.md,
  },
  bar: {
    width: 60,
    height: 3,
    backgroundColor: COLORS.red,
    marginBottom: SPACING.lg,
  },
  sub: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  question: {
    fontSize: FONTS.sizes.lg,
    fontFamily: FONTS.bodyBold,
    color: COLORS.red,
    letterSpacing: 1,
    marginBottom: SPACING.xxl,
  },
  btnIntegrity: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.red,
    borderRadius: 10,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    width: '100%',
    marginBottom: SPACING.md,
  },
  btnIntegrityText: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  btnIntegritySub: {
    fontSize: FONTS.sizes.xs,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  btnRestart: {
    backgroundColor: COLORS.redDeep,
    borderWidth: 1,
    borderColor: COLORS.redDark,
    borderRadius: 10,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    width: '100%',
  },
  btnRestartText: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.bodyBold,
    color: COLORS.redBright,
    letterSpacing: 2,
  },
  btnRestartSub: {
    fontSize: FONTS.sizes.xs,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  // Integrity phase
  integrityHeader: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  backBtn: {
    paddingVertical: SPACING.xs,
    paddingRight: SPACING.sm,
  },
  backText: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.bodyBold,
    color: COLORS.red,
    letterSpacing: 1,
  },
  integrityTitle: {
    fontSize: FONTS.sizes.lg,
    fontFamily: FONTS.heading,
    color: COLORS.textPrimary,
    letterSpacing: 3,
  },
  integrityNote: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  taskList: {
    flex: 1,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  taskRowDone: {
    borderColor: COLORS.redDark,
    backgroundColor: COLORS.redDeep,
  },
  taskIcon: {
    fontSize: 20,
    width: 32,
    marginRight: SPACING.sm,
  },
  taskTitle: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
  },
  taskTitleDone: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodyBold,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.red,
  },
  checkmark: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontFamily: FONTS.bodyBold,
  },
  integrityFooter: {
    fontSize: FONTS.sizes.xs,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
    fontStyle: 'italic',
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
  ritualLogo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  dateText: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.body,
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
    fontFamily: FONTS.heading,
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
    fontFamily: FONTS.bodyBold,
    color: COLORS.red,
    letterSpacing: 2,
  },
  progressLabel: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
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
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
    letterSpacing: 0.3,
  },
});
