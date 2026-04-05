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
    body: `Starting your day, every day, at the same time will build routine and allow you to get work done. Prioritizing a wake-up time secondarily prioritizes a bedtime if you're trying to get a set amount of sleep in place.\n\nRecovery is key for a WARRior to perform at optimal levels.`,
  },
  {
    number: '02',
    title: '40+ MINUTE WORKOUT',
    body: `Sharpening your own blade is the essence of being a WARRior. Dedicating 40 minutes minimum daily to your physical fitness will provide you with resolve to do the hard work necessary to become the man you intend to be.\n\nThe type of workout is inconsequential — run, lift, cross-train, go for a walk, ruck, or even do yoga. Just get up and get moving with intent.`,
  },
  {
    number: '03',
    title: 'DRINK 1 GALLON OF WATER',
    body: `Drinking a gallon of water a day sounds simple, but this requirement will teach discipline and commitment over time. You won't be able to just chug a gallon of water at the end of the night. You must plan over the course of the day to consume water.\n\nDiscipline aside, consuming a gallon of water daily will provide many nutritional benefits.`,
  },
  {
    number: '04',
    title: 'DAILY PERSONAL FINANCE TOUCH POINT',
    body: `Touching your finances daily will keep you in tune with your fiscal situation as well as help guide you in decision making situations that may otherwise get you into money trouble.\n\nIf you are married, or share your finances with someone, you should be including them in these discussions as well.`,
  },
  {
    number: '05',
    title: 'INTENTIONAL FAMILY TIME',
    body: `FAMILY is the foundation of the WARRPath Totems. Family is, far and away, the most important thing we have in our lives. It is why we build up our FITNESS — so we can be present and active with them. It is why we work on our FINANCES — so we can furnish them with all that is required for life.\n\nMaking sure we touch base with our wife and kids, individually, on a daily basis ensures we grow and nourish those bonds and keep the family structure tight.\n\nThose men who are unmarried and/or don't have children should find family members to keep in touch with daily. Remember — family doesn't necessarily require blood relation.`,
  },
  {
    number: '06',
    title: 'NO DRUGS OR ALCOHOL',
    body: `An altered mind is an unsharpened mind. Removing drugs and alcohol from your daily routine will sharpen your mind and have profound effects on your physical fitness.\n\nThe simple act of removing these items from your routine will be more beneficial than you can imagine to your sleep, your mental clarity, and your physical performance.`,
  },
  {
    number: '07',
    title: 'INGREDIENT-BASED DIET',
    body: `An Ingredient-Based Diet is a style of eating focused on whole, minimally processed foods — ingredients you can recognize, pronounce, and trace back to natural sources. Instead of buying packaged or pre-made meals, you build your diet around individual ingredients that you prepare yourself.\n\nThe intent here is to clean up the fuel you are placing in your body so that you can perform to your potential.`,
  },
  {
    number: '08',
    title: 'DAILY PLANNER OR JOURNAL WORK',
    body: `A successful WARRior is not a man who is simply just physically fit, but also one who is mentally and intellectually capable. Keeping a Daily Planner or Journal will enable you to capture all your ideas, thoughts, dreams, fears, and actions into one place.\n\nCentralizing this information will provide a powerful resource for you to not only plan the future, but revisit the past and learn.`,
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
              <Image
                source={require('../../assets/logo-warrbuilt.png')}
                style={styles.warrbuiltLogo}
                resizeMode="contain"
              />
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
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: 24,
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
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    lineHeight: 24,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  warrbuiltLogo: {
    width: 200,
    height: 52,
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
