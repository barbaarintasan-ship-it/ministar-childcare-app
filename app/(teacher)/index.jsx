import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { COLORS, getTheme } from '../../src/constants/colors';
import Badge from '../../src/components/common/Badge';
import { CHILDREN } from '../../src/data/mockData';

const TO_LOG = [
  { id: 1, icon: '🍽', label: 'Log Lunch',       done: true,  color: '#f59e0b', route: '/(teacher)/meals'      },
  { id: 2, icon: '😴', label: 'Log Nap',          done: true,  color: '#8b5cf6', route: '/(teacher)/sleep'      },
  { id: 3, icon: '🎨', label: 'Log Activity',     done: false, color: '#3b82f6', route: '/(teacher)/activities' },
  { id: 4, icon: '📸', label: 'Share Photos',     done: false, color: '#e8633a', route: '/(teacher)/upload'     },
  { id: 5, icon: '💊', label: 'Health Notes',     done: false, color: '#10b981', route: '/(teacher)/health'     },
  { id: 6, icon: '🍎', label: 'Log Afternoon Snack', done: false, color: '#f59e0b', route: '/(teacher)/meals'  },
];

export default function TeacherHome() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const theme = getTheme(isDark);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const myChildren = CHILDREN.filter(c => c.teacherId === 'staff-1');
  const present  = myChildren.filter(c => c.status === 'checked_in').length;
  const absent   = myChildren.filter(c => c.status === 'absent').length;
  const sleeping = myChildren.filter(c => c.sleepStart && !c.sleepEnd).length;
  const doneCount = TO_LOG.filter(t => t.done).length;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} showsVerticalScrollIndicator={false}>

      {/* ─── HEADER ─── */}
      <LinearGradient colors={[COLORS.teacher, '#1d4ed8']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <Image source={require('../../logo.png')} style={styles.logo} resizeMode="contain" tintColor="#fff" />
          <View style={styles.headerBtns}>
            <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
              <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={styles.iconBtn}>
              <Ionicons name="log-out-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greetingSmall}>Welcome back,</Text>
            <Text style={styles.greetingName}>{user?.name?.split(' ').slice(0, 2).join(' ')} 👩‍🏫</Text>
            <Text style={styles.greetingDate}>{today}</Text>
          </View>
          <View style={styles.roomBadge}>
            <Text style={styles.roomEmoji}>🌻</Text>
            <Text style={styles.roomText}>{user?.room || 'Sunflower'}</Text>
          </View>
        </View>

        {/* Snapshot */}
        <View style={styles.snapshot}>
          {[
            { value: present,          label: 'Present',  emoji: '✅', color: '#d1fae5', textColor: '#065f46' },
            { value: absent,           label: 'Absent',   emoji: '❌', color: '#fee2e2', textColor: '#991b1b' },
            { value: sleeping,         label: 'Sleeping', emoji: '😴', color: '#ede9fe', textColor: '#4c1d95' },
            { value: myChildren.length,label: 'Total',    emoji: '👶', color: '#dbeafe', textColor: '#1e40af' },
          ].map((s, i) => (
            <View key={i} style={[styles.snapItem, { backgroundColor: s.color }]}>
              <Text style={styles.snapEmoji}>{s.emoji}</Text>
              <Text style={[styles.snapValue, { color: s.textColor }]}>{s.value}</Text>
              <Text style={[styles.snapLabel, { color: s.textColor }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.body}>

        {/* ─── TO-DO CHECKLIST ─── */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Checklist</Text>
            <View style={[styles.progressPill, { backgroundColor: COLORS.teacher + '18' }]}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.teacher }}>
                {doneCount}/{TO_LOG.length}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <View style={[styles.progressFill, { width: `${(doneCount / TO_LOG.length) * 100}%`, backgroundColor: COLORS.teacher }]} />
          </View>

          <View style={styles.todoGrid}>
            {TO_LOG.map(item => (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(item.route)}
                style={[styles.todoItem, {
                  backgroundColor: item.done ? item.color + '18' : theme.cardAlt,
                  borderColor: item.done ? item.color + '44' : theme.border,
                  borderWidth: 1.5,
                }]}
                activeOpacity={0.75}
              >
                <Text style={styles.todoEmoji}>{item.icon}</Text>
                <Text style={[styles.todoLabel, { color: item.done ? item.color : theme.textSecondary }]}
                  numberOfLines={2}>{item.label}</Text>
                {item.done && (
                  <View style={[styles.doneBadge, { backgroundColor: item.color }]}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── QR CHECK-IN ─── */}
        <TouchableOpacity
          onPress={() => router.push('/(teacher)/attendance')}
          style={[styles.qrBanner, { backgroundColor: COLORS.teacher }]}
          activeOpacity={0.85}
        >
          <Ionicons name="qr-code" size={28} color="#fff" />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.qrTitle}>QR Check-In / Check-Out</Text>
            <Text style={styles.qrSub}>Scan parent QR code to record attendance</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>

        {/* ─── TODAY'S ROSTER ─── */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Today's Roster
            </Text>
            <Text style={[styles.rosterCount, { color: COLORS.teacher }]}>{myChildren.length} children</Text>
          </View>

          {myChildren.map((child, i) => {
            const statusColors = { checked_in: '#10b981', absent: '#ef4444', checked_out: '#6b7280' };
            const statusBgs    = { checked_in: '#d1fae5', absent: '#fee2e2', checked_out: '#f3f4f6' };
            const statusLabel  = { checked_in: '● In', absent: '● Absent', checked_out: '● Out' };
            const sc = statusColors[child.status] || '#6b7280';
            const sb = statusBgs[child.status] || '#f3f4f6';
            return (
              <View
                key={child.id}
                style={[styles.childRow, {
                  borderBottomColor: theme.border,
                  borderBottomWidth: i < myChildren.length - 1 ? 1 : 0,
                }]}
              >
                <View style={[styles.childEmoji, { backgroundColor: COLORS.primaryLight }]}>
                  <Text style={{ fontSize: 24 }}>{child.emoji}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.childName, { color: theme.text }]}>{child.name}</Text>
                    {child.allergyAlert && (
                      <View style={styles.allergyTag}>
                        <Text style={{ fontSize: 10 }}>⚠️</Text>
                        <Text style={styles.allergyText}>Allergy</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.childMeta, { color: theme.textMuted }]}>
                    {child.age} yrs · {child.moodEmoji} {child.mood}
                  </Text>
                  <Text style={[styles.childTime, { color: theme.textMuted }]}>
                    {child.checkinTime ? `In: ${child.checkinTime}` : ''}
                    {child.checkoutTime ? ` · Out: ${child.checkoutTime}` : ''}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <View style={[styles.statusChip, { backgroundColor: sb }]}>
                    <Text style={[styles.statusChipText, { color: sc }]}>
                      {statusLabel[child.status] || 'N/A'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push('/(teacher)/attendance')}
                    style={[styles.logBtn, { backgroundColor: COLORS.teacher + '18' }]}
                  >
                    <Text style={[styles.logBtnText, { color: COLORS.teacher }]}>Log</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 28 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  logo: { width: 100, height: 40, opacity: 0.95 },
  headerBtns: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greetingSmall: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
  greetingName: { color: '#fff', fontSize: 22, fontWeight: '900', marginVertical: 3 },
  greetingDate: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  roomBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, padding: 12,
    alignItems: 'center', minWidth: 72,
  },
  roomEmoji: { fontSize: 22, marginBottom: 4 },
  roomText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  snapshot: { flexDirection: 'row', gap: 8 },
  snapItem: { flex: 1, borderRadius: 14, padding: 10, alignItems: 'center', gap: 2 },
  snapEmoji: { fontSize: 18 },
  snapValue: { fontSize: 20, fontWeight: '900' },
  snapLabel: { fontSize: 9, fontWeight: '700', textAlign: 'center' },
  body: { padding: 16, gap: 14 },
  card: {
    borderRadius: 20, padding: 16, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: '900' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  progressPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  progressBar: { height: 6, borderRadius: 3, marginBottom: 14, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  todoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  todoItem: {
    width: '30.5%', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4, position: 'relative',
  },
  todoEmoji: { fontSize: 24 },
  todoLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  doneBadge: {
    position: 'absolute', top: 6, right: 6, width: 16, height: 16,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  qrBanner: {
    borderRadius: 18, padding: 18,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: COLORS.teacher, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6,
  },
  qrTitle: { color: '#fff', fontWeight: '900', fontSize: 15 },
  qrSub: { color: 'rgba(255,255,255,0.78)', fontSize: 12, fontWeight: '600', marginTop: 2 },
  rosterCount: { fontSize: 13, fontWeight: '700' },
  childRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  childEmoji: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  childName: { fontSize: 14, fontWeight: '800' },
  childMeta: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  childTime: { fontSize: 10, fontWeight: '600', marginTop: 1 },
  allergyTag: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#fee2e2', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8,
  },
  allergyText: { fontSize: 10, fontWeight: '800', color: '#991b1b' },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusChipText: { fontSize: 12, fontWeight: '800' },
  logBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  logBtnText: { fontSize: 12, fontWeight: '800' },
});
