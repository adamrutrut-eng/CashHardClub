import React from 'react';
import { StyleSheet, View } from 'react-native';
import * as Application from 'expo-application';
import { useRouter } from 'expo-router';
import { colors, space } from '@/theme/tokens';
import { CONTACTS, INSTAGRAM_HANDLE, PRIVACY_URL, SITE_URL, STORE_URL, SUPPORT_URL } from '@/data/content';
import { openInAppBrowser } from '@/lib/browser';
import { openEmail, openInstagram } from '@/lib/social';
import { Screen } from '@/components/Screen';
import { T } from '@/components/T';
import { Wordmark } from '@/components/Wordmark';
import { Row } from '@/components/Row';

export default function ClubScreen() {
  const router = useRouter();
  const version = Application.nativeApplicationVersion ?? '1.0.0';
  const build = Application.nativeBuildVersion ?? '';

  return (
    <Screen scroll>
      <View style={styles.hero}>
        <Wordmark size="lg" center />
        <T center style={styles.statement}>
          A streetwear and club brand in black, white and gold. Limited pieces, real nights. Everything sold here is physical
          — merch and event tickets — and every order completes on the official store.
        </T>
      </View>

      <T variant="eyebrow" style={styles.sectionLabel}>
        Follow
      </T>
      <View style={styles.group}>
        <Row icon="logo-instagram" title="Instagram" subtitle={`@${INSTAGRAM_HANDLE}`} onPress={() => openInstagram(INSTAGRAM_HANDLE)} external />
        <Row icon="bag-handle-outline" title="Official store" subtitle="Merch and event tickets" onPress={() => openInAppBrowser(STORE_URL)} external />
        <Row icon="globe-outline" title="Website" subtitle="cashhardclub.com" onPress={() => openInAppBrowser(SITE_URL)} external last />
      </View>

      <T variant="eyebrow" style={styles.sectionLabel}>
        Help
      </T>
      <View style={styles.group}>
        <Row icon="notifications-outline" title="Drop alerts" subtitle="Turn alerts on or off" onPress={() => router.navigate('/alerts')} />
        <Row icon="help-circle-outline" title="Support & FAQ" subtitle="Orders, sizing, alerts, your data" onPress={() => openInAppBrowser(SUPPORT_URL)} external />
        <Row icon="shield-checkmark-outline" title="Privacy policy" onPress={() => openInAppBrowser(PRIVACY_URL)} external />
        {CONTACTS.map((c, i) => (
          <Row
            key={c.email}
            icon="mail-outline"
            title={c.name}
            subtitle={c.email}
            onPress={() => openEmail(c.email, 'Cash Hard Club app')}
            external
            last={i === CONTACTS.length - 1}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <T variant="small" center>
          Cash Hard Club {version}
          {build ? ` (${build})` : ''}
        </T>
        <T variant="small" center>
          © CASH HARD CLUB · Est. MMXXIV
        </T>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingTop: space.xxl, paddingBottom: space.md },
  statement: { marginTop: space.xl, maxWidth: 520 },
  sectionLabel: { marginTop: space.xxl, marginBottom: space.xs },
  group: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.lineSoft },
  footer: { marginTop: space.xxxl, gap: 4 },
});
