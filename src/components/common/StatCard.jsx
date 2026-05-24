import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getTheme } from '../../constants/colors';
import { useTheme } from '../../contexts/ThemeContext';

export default function StatCard({
  label,
  value,
  icon,
  color = COLORS.primary,
  lightColor,
  trend,
  trendUp,
  onPress,
  style,
  size = 'md',
}) {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  const bgLight = lightColor || color + '22';
  const isSmall = size === 'sm';

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          padding: isSmall ? 14 : 18,
        },
        style,
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: bgLight }]}>
        <Ionicons name={icon} size={isSmall ? 18 : 22} color={color} />
      </View>
      <Text
        style={[styles.value, { color: theme.text, fontSize: isSmall ? 20 : 26 }]}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text style={[styles.label, { color: theme.textMuted, fontSize: isSmall ? 11 : 12 }]}>
        {label}
      </Text>
      {trend !== undefined && (
        <View style={styles.trend}>
          <Ionicons
            name={trendUp ? 'arrow-up' : 'arrow-down'}
            size={11}
            color={trendUp ? COLORS.success : COLORS.error}
          />
          <Text style={{ color: trendUp ? COLORS.success : COLORS.error, fontSize: 11, fontWeight: '700' }}>
            {trend}
          </Text>
        </View>
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  value: {
    fontWeight: '900',
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  label: {
    fontWeight: '600',
  },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
});
