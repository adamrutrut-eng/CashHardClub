import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, space } from '@/theme/tokens';
import { useLayout } from '@/theme/layout';
import { PRIVACY_URL, TERMS_URL } from '@/data/content';
import { openInAppBrowser } from '@/lib/browser';
import { TERMS_VERSION, useTerms } from '@/lib/terms';
import { Screen } from '@/components/Screen';
import { T } from '@/components/T';
import { Wordmark } from '@/components/Wordmark';
import { GoldButton } from '@/components/GoldButton';

/**
 * One-time agreement screen (clickwrap): clear notice, links to both documents, and one button the user is
 * told means agreement. No data, no account, no permission prompt. Shown again only when TERMS_VERSION changes.
 */
export default function WelcomeScreen() {
  const { accept, previousVersion } = useTerms();
  const { horizontalInset } = useLayout();
  const updated = previousVersion !== null && previousVersion !== TERMS_VERSION;

  return (
    <Screen scroll bottomInset padded={false} contentStyle={{ ...styles.content, paddingHorizontal: Math.max(horizontalInset, 16) }}>
      <View style={styles.column}>
        <Wordmark size="md" center />
        <T variant="title" center accessibilityRole="header" style={styles.heading}>
          {updated ? "We've updated our Terms" : 'Before you start'}
        </T>
        <T variant="body" center style={styles.body}>
          {updated
            ? "We've updated our Terms of Use. Please take a look before you continue."
            : 'Welcome to the official CASH HARD CLUB app. Please read our Terms of Use and Privacy Policy. They explain that purchases happen on our official store, that event entry depends on age limits and venue rules, and how disputes are handled.'}
        </T>

        <View style={styles.links}>
          <DocLink label="Terms of Use" url={TERMS_URL} />
          <DocLink label="Privacy Policy" url={PRIVACY_URL} />
        </View>

        <T variant="small" center style={styles.notice}>
          By tapping Agree and continue, you agree to the Terms of Use and acknowledge the Privacy Policy.
        </T>
        <GoldButton label="Agree and continue" onPress={() => void accept()} style={styles.button} />
      </View>
    </Screen>
  );
}

function DocLink({ label, url }: { label: string; url: string }) {
  return (
    <Pressable
      onPress={() => openInAppBrowser(url)}
      accessibilityRole="link"
      accessibilityLabel={label}
      accessibilityHint="Opens a web page"
      style={({ pressed }) => [styles.link, pressed && styles.pressed]}
    >
      <T variant="bodyStrong" style={styles.linkText}>
        {label}
      </T>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', paddingVertical: space.xxl },
  column: { width: '100%', maxWidth: 520, alignSelf: 'center' },
  heading: { marginTop: space.xxl },
  body: { marginTop: space.lg },
  links: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.xl, marginTop: space.lg },
  link: { minHeight: 44, minWidth: 44, justifyContent: 'center', paddingHorizontal: space.xs },
  linkText: { color: colors.accent, textDecorationLine: 'underline' },
  pressed: { opacity: 0.6 },
  notice: { marginTop: space.xxl, color: colors.body },
  button: { marginTop: space.md },
});
