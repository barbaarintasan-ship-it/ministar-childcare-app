import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

const BADGE_STYLES = {
  success: { bg: COLORS.successLight, text: '#065f46' },
  warning: { bg: COLORS.warningLight, text: '#92400e' },
  error: { bg: COLORS.errorLight, text: '#991b1b' },
  info: { bg: COLORS.infoLight, text: '#1e40af' },
  primary: { bg: COLORS.primaryLight, text: '#14532d' },
  accent: { bg: COLORS.accentLight, text: '#7c2d12' },
  purple: { bg: COLORS.purpleLight, text: '#4c1d95' },
  gray: { bg: '#f3f4f6', text: '#374151' },
  checked_in: { bg: COLORS.successLight, text: '#065f46' },
  checked_out: { bg: COLORS.infoLight, text: '#1e40af' },
  absent: { bg: COLORS.errorLight, text: '#991b1b' },
  sleeping: { bg: COLORS.purpleLight, text: '#4c1d95' },
  awake: { bg: COLORS.successLight, text: '#065f46' },
  paid: { bg: COLORS.successLight, text: '#065f46' },
  overdue: { bg: COLORS.errorLight, text: '#991b1b' },
  upcoming: { bg: COLORS.warningLight, text: '#92400e' },
};

export default function Badge({ label, type = 'gray', size = 'sm', dot = false, style }) {
  const colors = BADGE_STYLES[type] || BADGE_STYLES.gray;
  const fontSize = size === 'xs' ? 9 : size === 'sm' ? 11 : 13;
  const paddingV = size === 'xs' ? 2 : size === 'sm' ? 3 : 5;
  const paddingH = size === 'xs' ? 6 : size === 'sm' ? 8 : 12;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          paddingVertical: paddingV,
          paddingHorizontal: paddingH,
        },
        style,
      ]}
    >
      {dot && (
        <View style={[styles.dot, { backgroundColor: colors.text }]} />
      )}
      <Text style={[styles.text, { color: colors.text, fontSize }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});
