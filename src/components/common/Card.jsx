import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, getTheme } from '../../constants/colors';
import { useTheme } from '../../contexts/ThemeContext';

export default function Card({ children, style, padding = 16, radius = 18, shadow = true }) {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          padding,
          borderRadius: radius,
          shadowColor: theme.shadow,
          elevation: shadow ? 3 : 0,
          shadowOpacity: shadow ? 1 : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    marginBottom: 12,
  },
});
