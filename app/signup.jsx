import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Image,
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
  { id: 'parent', emoji: '👨‍👩‍👧', color: COLORS.primary },
  { id: 'teacher', emoji: '👩‍🏫', color: COLORS.teacher },
  { id: 'admin', emoji: '👩‍💼', color: COLORS.admin },
];

export default function SignupScreen() {
  const { signup } = useAuth();
  const { t } = useLang();
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [selectedRole, setSelectedRole] = useState('parent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await signup(email.trim(), password, name.trim(), selectedRole);
    setLoading(false);
    if (result.success) {
      if (result.role === 'parent') router.replace('/(parent)');
      else if (result.role === 'teacher') router.replace('/(teacher)');
      else if (result.role === 'admin') router.replace('/(admin)');
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.bg }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Image
              source={require('../logo.png')}
              style={{ width: 120, height: 100, marginBottom: 8 }}
              resizeMode="contain"
            />
            <Text style={styles.title}>{t('createAccount')}</Text>
          </View>
        </LinearGradient>

        <View style={[styles.form, { backgroundColor: theme.bg }]}>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {/* Role */}
            <Text style={[styles.label, { color: theme.textMuted }]}>
              {t('role').toUpperCase()}
            </Text>
            <View style={styles.roleRow}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => setSelectedRole(r.id)}
                  style={[
                    styles.roleBtn,
                    {
                      backgroundColor: selectedRole === r.id ? r.color + '22' : theme.cardAlt,
                      borderColor: selectedRole === r.id ? r.color : theme.border,
                      borderWidth: selectedRole === r.id ? 2 : 1.5,
                    },
                  ]}
                >
                  <Text style={styles.roleEmoji}>{r.emoji}</Text>
                  <Text style={[styles.roleText, { color: selectedRole === r.id ? r.color : theme.textSecondary }]}>
                    {t(r.id)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label={t('fullName')}
              value={name}
              onChangeText={setName}
              placeholder="John Smith"
              icon="person-outline"
              autoCapitalize="words"
            />
            <Input
              label={t('email')}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
            />
            <Input
              label={t('password')}
              value={password}
              onChangeText={setPassword}
              placeholder="Min 6 characters"
              secureTextEntry
              icon="lock-closed-outline"
            />
            <Input
              label={t('confirmPassword')}
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Repeat password"
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
              title={loading ? t('creatingAccount') : t('signUp')}
              onPress={handleSignup}
              loading={loading}
              color={ROLES.find(r => r.id === selectedRole)?.color}
              size="lg"
              style={{ marginTop: 8 }}
            />

            <TouchableOpacity onPress={() => router.back()} style={styles.loginLink}>
              <Text style={[styles.loginText, { color: theme.textSecondary }]}>
                {t('haveAccount')}{' '}
                <Text style={{ color: COLORS.primary, fontWeight: '800' }}>{t('signIn')}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerContent: { alignItems: 'center' },
  logoEmoji: { fontSize: 36, marginBottom: 8 },
  title: { color: '#fff', fontSize: 22, fontWeight: '900' },
  form: {
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
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  roleBtn: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 14 },
  roleEmoji: { fontSize: 24, marginBottom: 4 },
  roleText: { fontSize: 11, fontWeight: '800' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  errorText: { fontSize: 13, fontWeight: '600', flex: 1 },
  loginLink: { alignItems: 'center', marginTop: 16 },
  loginText: { fontSize: 14, fontWeight: '600' },
});
