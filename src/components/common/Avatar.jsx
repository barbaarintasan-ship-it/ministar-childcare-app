import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

const BG_COLORS = [
  '#e1f5ee', '#dbeafe', '#ede9fe', '#ffedd5', '#fce7f3',
  '#fef3c7', '#ccfbf1', '#fee2e2', '#f3e8ff', '#dcfce7',
];
const TEXT_COLORS = [
  '#14532d', '#1e40af', '#4c1d95', '#7c2d12', '#831843',
  '#78350f', '#134e4a', '#7f1d1d', '#581c87', '#14532d',
];

function getIndex(name) {
  if (!name) return 0;
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return sum % BG_COLORS.length;
}

export default function Avatar({ name, uri, size = 44, emoji, style }) {
  const idx = getIndex(name);
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const fontSize = size * 0.38;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.base, { width: size, height: size, borderRadius: size / 2 }, style]}
      />
    );
  }

  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: BG_COLORS[idx],
        },
        style,
      ]}
    >
      <Text style={[styles.text, { fontSize, color: TEXT_COLORS[idx] }]}>
        {emoji || initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  text: {
    fontWeight: '900',
  },
});
