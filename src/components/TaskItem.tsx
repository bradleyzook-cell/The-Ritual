import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Task } from '../types';
import { COLORS, SPACING, FONTS } from '../constants/theme';

interface Props {
  task: Task;
  completed: boolean;
  onToggle: () => void;
  subtitle?: string;
}

export default function TaskItem({ task, completed, onToggle, subtitle }: Props) {
  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [
        styles.container,
        completed && styles.containerComplete,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{task.icon}</Text>
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.title, completed && styles.titleComplete]}
          numberOfLines={1}
        >
          {task.title}
        </Text>
        <Text style={styles.description} numberOfLines={1}>
          {subtitle ?? task.description}
        </Text>
      </View>

      <View style={[styles.checkbox, completed && styles.checkboxComplete]}>
        {completed && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  containerComplete: {
    borderColor: COLORS.redDark,
    backgroundColor: COLORS.redDeep,
  },
  pressed: {
    opacity: 0.75,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  icon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  titleComplete: {
    color: COLORS.textPrimary,
  },
  description: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxComplete: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.red,
  },
  checkmark: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
});
