import React from 'react';

/**
 * Film-grain overlay, disabled for v1.
 * React Native's `resizeMode="repeat"` does not tile on the iOS New Architecture build: the
 * texture rendered once in the top-left corner as a lighter rectangle on every screen (seen on
 * TestFlight build 1.0.0 (1)). A tiled implementation can return in a later release.
 */
export function Grain(_props: { opacity?: number }) {
  return null;
}
