import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, space } from '@/theme/tokens';
import { T } from './T';
import { GoldButton } from './GoldButton';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  body?: string;
  action?: { label: string; onPress: () => void; icon?: IconName };
}

export function EmptyState({ icon = 'diamond-outline', title, body, action }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconRing}>
        <Ionicons name={icon} size={22} color={colors.accent} />
      </View>
      <T variant="title" center style={styles.title}>
        {title}
      </T>
      {body ? (
        <T center style={styles.body}>
          {body}
        </T>
      ) : null}
      {action ? <GoldButton label={action.label} onPress={action.onPress} icon={action.icon} variant="outline" style={styles.btn} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: space.xxxl,
    paddingHorizontal: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  iconRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  title: { fontSize: 18, lineHeight: 24 },
  body: { marginTop: space.sm, maxWidth: 360 },
  btn: { marginTop: space.xl, alignSelf: 'stretch' },
});
