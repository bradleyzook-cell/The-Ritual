import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../constants/theme';

const STEPS = [
  {
    number: '01',
    title: 'WAKE UP AT A SET TIME',
    body: `Starting your day at the same time every day builds routine and creates a foundation for everything else. Prioritizing a wake-up time secondarily locks in a bedtime — recovery is key for a man performing at optimal levels.`,
  },
  {
    number: '02',
    title: '40+ MINUTE WORKOUT',
    body: `Sharpening your blade is the essence of being a man. Dedicate 40 minutes minimum daily to physical fitness — run, lift, ruck, walk, or yoga. Just move with purpose.`,
  },
  {
    number: '03',
    title: 'DRINK 1 GALLON OF WATER',
    body: `Drinking a gallon a day demands planning — you can't chug it at night. This requirement teaches discipline and daily commitment while delivering real nutritional benefits.`,
  },
  {
    number: '04',
    title: 'DAILY PERSONAL FINANCE TOUCH POINT',
    body: `Touching your finances daily keeps you in tune with your fiscal situation and guides your decisions. If you share finances, include your partner in these conversations.`,
  },
  {
    number: '05',
    title: 'INTENTIONAL FAMILY TIME',
    body: `Family is the foundation of the WARRPath Totems — it's why we build fitness and pursue financial strength. Connect with your wife and kids individually, every single day. Those without immediate family should extend this commitment to close relationships.`,
  },
  {
    number: '06',
    title: 'NO DRUGS OR ALCOHOL',
    body: `An altered mind is an unsharpened mind. Removing drugs and alcohol will improve your sleep, sharpen your mental clarity, and elevate your physical performance.`,
  },
  {
    number: '07',
    title: 'INGREDIENT-BASED DIET',
    body: `An Ingredient-Based Diet means building your meals around whole, minimally processed foods you can recognize and trace to natural sources. Clean fuel is how a man performs at his potential.`,
  },
  {
    number: '08',
    title: 'DAILY PLANNER OR JOURNAL WORK',
    body: `A man is not just physically fit — he is mentally and intellectually sharp. A daily planner or journal captures your ideas, plans, fears, and victories, providing a powerful resource to plan the future and revisit the past.`,
  },
];

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Image
            source={require('../../assets/logo-ritual.png')}
            style={styles.ritualLogo}
            resizeMode="contain"
          />
          <View style={styles.heroDivider} />
          <Text style={styles.heroBody}>
            Men require discipline to become warriors. Enter The Ritual — an 8-step daily action list to help center yourself around the Totems of your WARRPath.
          </Text>
        </View>

        {/* Task list overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewLabel}>THE 8 DAILY ACTIONS</Text>
          {STEPS.map((step) => (
            <View key={step.number} style={styles.overviewRow}>
              <Text style={styles.overviewNum}>{step.number}</Text>
              <Text style={styles.overviewTitle}>{step.title}</Text>
            </View>
          ))}
        </View>

        {/* Detailed steps */}
        {STEPS.map((step, i) => (
          <View key={step.number} style={styles.stepBlock}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepNumber}>{step.number}</Text>
              <Text style={styles.stepTitle}>{step.title}</Text>
            </View>
            <Text style={styles.stepBody}>{step.body}</Text>
            {i < STEPS.length - 1 && <View style={styles.stepDivider} />}
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <View style={styles.footerBrand}>
            <Pressable
              onPress={() => Linking.openURL('https://www.warrbuilt.com')}
              style={({ pressed }) => [styles.logoWrap, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.warrbuiltText}>
                <Text style={styles.warrText}>WARR</Text>
                <Text style={styles.builtText}>Built</Text>
              </Text>
            </Pressable>
            <Pressable
              onPress={() => Linking.openURL('https://www.instagram.com/warrbuilt')}
              style={({ pressed }) => [styles.igBtn, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="logo-instagram" size={28} color="#E1306C" />
              <Text style={styles.igHandle}>@warrbuilt</Text>
            </Pressable>
          </View>
          <Text style={styles.footerText}>
            WARRBuilt focuses on helping men identify their tribe and become who they are meant to be.
          </Text>
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
  scroll: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
  },

  // Hero
  hero: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
  },
  ritualLogo: {
    width: 220,
    height: 220,
    borderRadius: 16,
  },
  heroDivider: {
    width: 48,
    height: 3,
    backgroundColor: COLORS.red,
    marginVertical: SPACING.lg,
  },
  heroBody: {
    fontSize: FONTS.sizes.lg,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: 26,
  },

  // Overview card
  overviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  overviewLabel: {
    fontSize: FONTS.sizes.xs,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textMuted,
    letterSpacing: 2,
    marginBottom: SPACING.md,
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  overviewNum: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.bodyBold,
    color: COLORS.red,
    width: 28,
  },
  overviewTitle: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textSecondary,
    flex: 1,
  },

  // Steps
  stepBlock: {
    marginBottom: SPACING.sm,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  stepNumber: {
    fontSize: FONTS.sizes.xxxl,
    fontFamily: FONTS.heading,
    color: COLORS.redDeep,
    lineHeight: FONTS.sizes.xxxl + 16,
    width: 52,
  },
  stepTitle: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.bodyBold,
    color: COLORS.textPrimary,
    letterSpacing: 1,
    paddingTop: 6,
    lineHeight: 22,
  },
  stepBody: {
    fontSize: FONTS.sizes.lg,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: 26,
    paddingLeft: 52 + SPACING.md,
  },
  stepDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xl,
  },

  // Footer
  footer: {
    marginTop: SPACING.xl,
  },
  footerDivider: {
    height: 1,
    backgroundColor: COLORS.red,
    marginBottom: SPACING.lg,
  },
  footerBrand: {
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  logoWrap: {
    borderRadius: 8,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  warrbuiltText: {
    fontSize: 34,
    fontFamily: FONTS.heading,
  },
  warrText: {
    color: COLORS.red,
  },
  builtText: {
    color: COLORS.textPrimary,
  },
  igBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  igHandle: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.bodyBold,
    color: '#E1306C',
  },
  footerText: {
    fontSize: FONTS.sizes.sm,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
  },
});
