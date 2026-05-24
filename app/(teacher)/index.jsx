import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useLang } from '../../src/contexts/LangContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { COLORS, getTheme } from '../../src/constants/colors';
import Card from '../../src/components/common/Card';
import Badge from '../../src/components/common/Badge';
import Avatar from '../../src/components/common/Avatar';
import StatCard from '../../src/components/common/StatCard';
import { CHILDREN, ADMIN_STATS } from '../../src/data/mockData';

export default function TeacherHome() {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const theme = getTheme(isDark);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const myChildren = CHILDREN.filter(c => c.teacherId === 'staff-1'); // Ms. Patricia's children
  const present = myChildren.filter(c => c.status === 'checked_in').length;
  const absent = myChildren.filter(c => c.status === 'absent').length;
  const sleeping = myChildren.filter(c => c.sleepStart && !c.sleepEnd).length;

  const quickLinks = [
    { icon: 'moon', label: 'Sleep Log', color: COLORS.admin, route: '/(teacher)/sleep' },
    { icon: 'camera', label: 'Upload', color: COLORS.accent, route: '/(teacher)/upload' },
    { icon: 'document-text', label: 'Notes', color: COLORS.teacher, route: '/(teacher)/health' },
    { icon: 'sparkles', label: 'Activities', color: COLORS.success, route: '/(teacher)/activities' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[COLORS.teacher, '#1d4ed8']}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.name}>{user?.name?.split(' ').slice(0, 2).join(' ')} 👩‍🏫</Text>
            <Text style={styles.room}>{user?.room || 'Sunflower'} Room · Today</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={styles.iconBtn}>
              <Ionicons name="log-out-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Present', value: present, icon: '✅', bg: '#d1fae5', color: '#065f46' },
            { label: 'Absent', value: absent, icon: '❌', bg: '#fee2e2', color: '#991b1b' },
            { label: 'Sleeping', value: sleeping, icon: '😴', bg: '#ede9fe', color: '#4c1d95' },
            { label: 'Total', value: myChildren.length, icon: '👶', bg: '#dbeafe', color: '#1e40af' },
          ].map((s, i) => (
            <View key={i} style={[styles.miniStat, { backgroundColor: s.bg }]}>
              <Text style={styles.miniStatIcon}>{s.icon}</Text>
              <Text style={[styles.miniStatValue, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.miniStatLabel, { color: s.color }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Quick links */}
        <View style={styles.quickRow}>
          {quickLinks.map((link, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => router.push(link.route)}
              style={[styles.quickBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View style={[styles.quickIcon, { backgroundColor: link.color + '22' }]}>
                <Ionicons name={link.icon} size={20} color={link.color} />
              </View>
              <Text style={[styles.quickLabel, { color: theme.text }]}>{link.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Roster */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          👶 {t('todaysRoster')} ({myChildren.length})
        </Text>
        {myChildren.map((child) => {
          const statusMap = { checked_in: 'success', checked_out: 'info', absent: 'error' };
          const statusLabel = { checked_in: 'In', checked_out: 'Out', absent: 'Absent' };
          return (
            <View key={child.id} style={[styles.childRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Avatar name={child.name} emoji={child.emoji} size={44} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.childName, { color: theme.text }]}>{child.name}</Text>
                  {child.allergyAlert && (
                    <View style={[styles.allergyDot, { backgroundColor: COLORS.errorLight }]}>
                      <Text style={{ fontSize: 9, fontWeight: '900', color: COLORS.error }}>⚠️</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.childAge, { color: theme.textMuted }]}>
                  {child.age} yrs · {child.moodEmoji} {child.mood}
                </Text>
                <Text style={[styles.childTime, { color: theme.textMuted }]}>
                  {child.checkinTime ? `In: ${child.checkinTime}` : ''}
                  {child.checkoutTime ? ` · Out: ${child.checkoutTime}` : ''}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <Badge
                  label={statusLabel[child.status] || 'N/A'}
                  type={statusMap[child.status] || 'gray'}
                  dot
                />
                <TouchableOpacity
                  onPress={() => router.push('/(teacher)/attendance')}
                  style={[styles.logBtn, { backgroundColor: COLORS.teacher + '22' }]}
                >
                  <Text style={[styles.logBtnText, { color: COLORS.teacher }]}>Log</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* QR Scan shortcut */}
        <TouchableOpacity
          onPress={() => router.push('/(teacher)/attendance')}
          style={[styles.qrBtn, { backgroundColor: COLORS.teacher }]}
        >
          <Ionicons name="qr-code" size={22} color="#fff" />
          <Text style={styles.qrBtnText}>{t('qrCheckIn')} — Scan Parent QR</Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 28 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
  name: { color: '#fff', fontSize: 20, fontWeight: '900', marginVertical: 2 },
  room: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', gap: 8 },
  miniStat: {
    flex: 1, padding: 10, borderRadius: 12, alignItems: 'center', gap: 2,
  },
  miniStatIcon: { fontSize: 16 },
  miniStatValue: { fontSize: 18, fontWeight: '900' },
  miniStatLabel: { fontSize: 9, fontWeight: '700', textAlign: 'center' },
  content: { padding: 16 },
  quickRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  quickBtn: {
    flex: 1, alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1, gap: 6,
  },
  quickIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 11, fontWeight: '800', textAlign: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '900', marginBottom: 12 },
  childRow: {
    flexDirection: 'row', alignItems: 'center', padding: 13,
    borderRadius: 14, borderWidth: 1, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  childName: { fontSize: 14, fontWeight: '800' },
  childAge: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  childTime: { fontSize: 10, fontWeight: '600', marginTop: 1 },
  allergyDot: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 8 },
  logBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  logBtnText: { fontSize: 11, fontWeight: '800' },
  qrBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 16, borderRadius: 14, marginTop: 8,
  },
  qrBtnText: { flex: 1, color: '#fff', fontSize: 14, fontWeight: '800' },
});
