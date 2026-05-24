import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, getTheme } from '../../constants/colors';
import { useTheme } from '../../contexts/ThemeContext';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoComplete,
  multiline = false,
  numberOfLines = 1,
  icon,
  error,
  editable = true,
  style,
  inputStyle,
  onFocus,
  onBlur,
  returnKeyType,
  onSubmitEditing,
  maxLength,
}) {
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.input,
            borderColor: error
              ? COLORS.error
              : focused
              ? COLORS.primary
              : theme.inputBorder,
            borderWidth: focused || error ? 2 : 1.5,
          },
          multiline && { height: numberOfLines * 44, alignItems: 'flex-start' },
        ]}
      >
        {icon && (
          <View style={styles.iconLeft}>
            <Ionicons name={icon} size={18} color={focused ? COLORS.primary : theme.textMuted} />
          </View>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          editable={editable}
          maxLength={maxLength}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => { setFocused(true); onFocus?.(); }}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          style={[
            styles.input,
            {
              color: theme.text,
              paddingLeft: icon ? 8 : 14,
              paddingRight: secureTextEntry ? 44 : 14,
              textAlignVertical: multiline ? 'top' : 'center',
              paddingTop: multiline ? 12 : 0,
            },
            inputStyle,
          ]}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.iconRight}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.error, { color: COLORS.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputWrapper: {
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    overflow: 'hidden',
  },
  iconLeft: {
    paddingLeft: 14,
    paddingRight: 4,
  },
  iconRight: {
    position: 'absolute',
    right: 14,
    height: '100%',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 14,
  },
  error: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 4,
  },
});
