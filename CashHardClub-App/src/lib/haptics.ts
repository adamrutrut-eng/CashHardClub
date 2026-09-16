import * as Haptics from 'expo-haptics';

/** Light tap feedback for primary actions. Never throws (no-op on devices without haptics). */
export function tap() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function success() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}
