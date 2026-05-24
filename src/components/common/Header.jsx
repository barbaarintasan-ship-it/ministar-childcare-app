import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, getTheme } from '../../constants/colors';
import { useTheme } from '../../contexts/ThemeContext';

export default function Header({
  title,
  subtitle,
  showBack = false,
  rightComponent,
  backgroundColor,
  textColor = '#fff',
  onBack,
  transparent = false,
}) {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const bg = transparent
    ? 'transparent'
    : backgroundColor || (isDark ? theme.header : COLORS.primary);

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: bg,
          paddingTop: insets.top + (Platform.OS === 'android' ? 8 : 4),
        },
      ]}
    >
      <StatusBar
        barStyle={isDark || !transparent ? 'light-content' : 'dark-content'}
        backgroundColor={bg}
      />
      <View style={styles.inner}>
        <View style={styles.left}>
          {showBack && (
            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={textColor} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.center}>
          <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: textColor + 'cc' }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.right}>{rightComponent || <View style={{ width: 36 }} />}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  left: {
    width: 44,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  right: {
    width: 44,
    alignItems: 'flex-end',
  },
  backBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
});
