import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS, getTheme } from '../../constants/colors';
import { useTheme } from '../../contexts/ThemeContext';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = true,
  color,
}) {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);

  const bg = color
    ? color
    : variant === 'primary'
    ? COLORS.primary
    : variant === 'accent'
    ? COLORS.accent
    : variant === 'secondary'
    ? theme.cardAlt
    : variant === 'outline'
    ? 'transparent'
    : variant === 'danger'
    ? COLORS.error
    : variant === 'ghost'
    ? 'transparent'
    : COLORS.primary;

  const textColor =
    variant === 'secondary'
      ? theme.text
      : variant === 'outline'
      ? color || COLORS.primary
      : variant === 'ghost'
      ? color || COLORS.primary
      : '#fff';

  const borderColor =
    variant === 'outline' ? color || COLORS.primary : 'transparent';

  const padding =
    size === 'sm' ? { paddingVertical: 8, paddingHorizontal: 14 }
    : size === 'lg' ? { paddingVertical: 16, paddingHorizontal: 28 }
    : { paddingVertical: 13, paddingHorizontal: 20 };

  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 16 : 15;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: variant === 'outline' ? 2 : 0,
          opacity: disabled || loading ? 0.6 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        padding,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.inner}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={[styles.text, { color: textColor, fontSize }, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  iconWrap: {
    marginRight: 2,
  },
  text: {
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
