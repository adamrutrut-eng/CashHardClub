import React from 'react';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { EmptyState } from '@/components/EmptyState';

/** Catches any unknown deep link so the app never shows a blank screen. */
export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <Screen scroll bottomInset header={<Header back />}>
      <EmptyState title="Not in the vault" body="That link doesn't lead anywhere in the app." action={{ label: 'Back to the shop', onPress: () => router.replace('/') }} />
    </Screen>
  );
}
