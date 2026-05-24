import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import { useLang } from '../src/contexts/LangContext';
import { useTheme } from '../src/contexts/ThemeContext';
import { COLORS, getTheme } from '../src/constants/colors';
import Input from '../src/components/common/Input';
import Button from '../src/components/common/Button';

const ROLES = [
  { id: 'parent', icon: 'people', emoji: '👨‍👩‍👧', color: COLORS.primary, lightColor: COLORS.primaryLight, demo: 'parent@demo.com' },
  { id: 'teacher', icon: 'school', emoji: '👩‍🏫', color: COLORS.teacher, lightColor: COLORS.teacherLight, demo: 'teacher@demo.com' },
  { id: 'admin', icon: 'settings', emoji: '👩‍💼', color: COLORS.admin, lightColor: COLORS.adminLight, demo: 'admin@demo.com' },
];

export default function LoginScreen() {
  const { login } = useAuth();
  const { t, lang, setLang } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const theme = getTheme(isDark);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedRole, setSelectedRole] = useState('parent');
  const [email, setEmail] = useState('parent@demo.com');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = (role) => {
    setSelectedRole(role.id);
    setEmail(role.demo);
    setPassword('demo123');
    setError('');
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.success) {
      if (result.role === 'parent') router.replace('/(parent)');
      else if (result.role === 'teacher') router.replace('/(teacher)');
      else if (result.role === 'admin') router.replace('/(admin)');
    } else {
      setError(result.error || t('invalidCredentials'));
    }
  };

  const activeRole = ROLES.find(r => r.id === selectedRole);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.bg }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header gradient */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={[styles.hero, { paddingTop: insets.top + 20 }]}
        >
          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => setLang(lang === 'en' ? 'es' : 'en')}
              style={styles.topBtn}
            >
              <Text style={styles.topBtnText}>{lang === 'en' ? '🇪🇸 ES' : '🇺🇸 EN'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTheme} style={styles.topBtn}>
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Logo */}
          <View style={styles.logoWrap}>
            <View style={styles.logoBox}>
              <Text style={styles.logoEmoji}>⭐</Text>
            </View>
            <Text style={styles.appName}>{t('appName').toUpperCase()}</Text>
            <View style={styles.taglineBox}>
              <Text style={styles.tagline}>CHILDCARE</Text>
            </View>
            <Text style={styles.appSub}>{t('appTagline')}</Text>
          </View>
        </LinearGradient>

        {/* Form */}
        <View style={[styles.formContainer, { backgroundColor: theme.bg }]}>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {/* Role selector */}
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
              {t('role').toUpperCase()}
            </Text>
            <View style={styles.roleRow}>
              {ROLES.map((role) => {
                const isActive = selectedRole === role.id;
                return (
                  <TouchableOpacity
                    key={role.id}
                    onPress={() => handleRoleSelect(role)}
                    style={[
                      styles.roleCard,
                      {
                        backgroundColor: isActive ? role.lightColor : theme.cardAlt,
                        borderColor: isActive ? role.color : theme.border,
                        borderWidth: isActive ? 2 : 1.5,
                      },
                    ]}
                  >
                    <Text style={styles.roleEmoji}>{role.emoji}</Text>
                    <Text
                      style={[
                        styles.roleLabel,
                        { color: isActive ? role.color : theme.textSecondary },
                      ]}
                    >
                      {t(role.id)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Inputs */}
            <Input
              label={t('email')}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              icon="mail-outline"
            />
            <Input
              label={t('password')}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              icon="lock-closed-outline"
            />

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: COLORS.errorLight }]}>
                <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                <Text style={[styles.errorText, { color: COLORS.error }]}>{error}</Text>
              </View>
            ) : null}

            <Button
              title={loading ? t('signingIn') : t('signIn')}
              onPress={handleLogin}
              loading={loading}
              color={activeRole?.color}
              size="lg"
              style={{ marginTop: 8 }}
            />

            <TouchableOpacity
              onPress={() => router.push('/signup')}
              style={styles.signupLink}
            >
              <Text style={[styles.signupText, { color: theme.textSecondary }]}>
                {t('noAccount')}{' '}
                <Text style={{ color: activeRole?.color, fontWeight: '800' }}>
                  {t('signUp')}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Demo accounts */}
          <View style={[styles.demoBox, { backgroundColor: COLORS.warningLight, borderColor: '#fde68a' }]}>
            <Text style={styles.demoTitle}>🎮 {t('demoAccounts')}</Text>
            <Text style={[styles.demoHint, { color: '#92400e' }]}>{t('demoHint')}</Text>
            <View style={styles.demoList}>
              {ROLES.map((role) => (
                <TouchableOpacity
                  key={role.id}
                  onPress={() => handleRoleSelect(role)}
                  style={styles.demoItem}
                >
                  <Text style={styles.demoItemText}>{role.emoji} {role.demo}</Text>
                  <Text style={[styles.demoItemRole, { color: role.color }]}>→ {t(role.id)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginBottom: 20,
  },
  topBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  topBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  logoWrap: {
    alignItems: 'center',
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logoEmoji: { fontSize: 40 },
  appName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  taglineBox: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 14,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 8,
  },
  tagline: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 4,
  },
  appSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  roleCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
  },
  roleEmoji: { fontSize: 26, marginBottom: 4 },
  roleLabel: { fontSize: 11, fontWeight: '800' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  errorText: { fontSize: 13, fontWeight: '600', flex: 1 },
  signupLink: { alignItems: 'center', marginTop: 16 },
  signupText: { fontSize: 14, fontWeight: '600' },
  demoBox: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 32,
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#92400e',
    marginBottom: 2,
  },
  demoHint: { fontSize: 11, fontWeight: '600', marginBottom: 10 },
  demoList: { gap: 6 },
  demoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  demoItemText: { fontSize: 12, fontWeight: '600', color: '#92400e' },
  demoItemRole: { fontSize: 12, fontWeight: '800' },
});
