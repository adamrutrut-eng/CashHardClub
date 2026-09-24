import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const grain = require('../../assets/grain.png');

/** Film-grain overlay (the website's body::after). Purely decorative; never intercepts touches. */
export function Grain({ opacity = 0.07 }: { opacity?: number }) {
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Image source={grain} resizeMode="repeat" style={[StyleSheet.absoluteFill, { opacity }]} accessible={false} />
    </View>
  );
}
