import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { COLORS, getTheme } from '../../src/constants/colors';
import { ADMIN_STATS, WEEKLY_ATTENDANCE, CHILDREN } from '../../src/data/mockData';

const { width } = Dimensions.get('window');
const BAR_MAX_H = 72;

const QUICK_ACTIONS = [
  { icon: 'person-add',    label: 'Add Child', color: COLORS.primary, route: '/(admin)/children' },
  { icon: 'person-circle', label: 'Add Staff', color: COLORS.teacher, route: '/(admin)/staff'    },
  { icon: 'bar-chart',     label: 'Reports',   color: COLORS.admin,   route: '/(admin)/reports'  },
  { icon: 'people',        label: 'All Children', color: '#10b981',   route: '/(admin)/children' },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const theme = getTheme(isDark);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const overdueCount = 0;
  const maxPresent   = Math.max(...WEEKLY_ATTENDANCE.map(d => d.present));
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const attendancePct = Math.round((ADMIN_STATS.presentToday / ADMIN_STATS.totalChildren) * 100);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} showsVerticalScrollIndicator={false}>

      {/* ─── HEADER ─── */}
      <LinearGradient colors={[COLORS.admin, '#5b21b6']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <Image source={require('../../logo.png')} style={styles.logo} resizeMode="contain" tintColor="#fff" />
          <View style={styles.headerBtns}>
            <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
              <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={18} color="#fff" />
              {overdueCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{overdueCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={styles.iconBtn}>
              <Ionicons name="log-out-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.adminLabel}>Admin Dashboard</Text>
        <Text style={styles.adminName}>{user?.name} 👩‍💼</Text>
        <Text style={styles.adminDate}>{today}</Text>

        {/* Today's Snapshot */}
        <View style={styles.snapshot}>
          {[
            { value: ADMIN_STATS.presentToday,       label: 'Present',       color: '#d1fae5', text: '#065f46' },
            { value: ADMIN_STATS.absentToday,         label: 'Absent',        color: '#fee2e2', text: '#991b1b' },
            { value: ADMIN_STATS.staffOnDuty || 5,   label: 'Staff on Duty', color: '#dbeafe', text: '#1e40af' },
            { value: overdueCount,                    label: 'Overdue Bills', color: overdueCount > 0 ? '#fef3c7' : '#d1fae5', text: overdueCount > 0 ? '#92400e' : '#065f46' },
          ].map((s, i) => (
            <View key={i} style={styles.snapCol}>
              {i > 0 && <View style={styles.snapDivider} />}
              <View style={[styles.snapItem, { backgroundColor: s.color }]}>
                <Text style={[styles.snapValue, { color: s.text }]}>{s.value}</Text>
                <Text style={[styles.snapLabel, { color: s.text }]}>{s.label}</Text>
              </View>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.body}>

        {/* ─── ALERT ─── */}
        {overdueCount > 0 && (
          <TouchableOpacity
            onPress={() => router.push('/(admin)/billing')}
            style={styles.alertBanner}
            activeOpacity={0.85}
          >
            <Ionicons name="alert-circle" size={20} color="#92400e" />
            <Text style={styles.alertText}>
              {overdueCount} overdue invoice{overdueCount > 1 ? 's' : ''} need{overdueCount === 1 ? 's' : ''} attention
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#92400e" />
          </TouchableOpacity>
        )}

        {/* ─── KPI CARDS ─── */}
        <View style={styles.kpiGrid}>
          {[
            { icon: 'people',          label: 'Total Children', value: ADMIN_STATS.totalChildren,        color: COLORS.primary, route: '/(admin)/children' },
            { icon: 'person',          label: 'Total Staff',    value: ADMIN_STATS.totalStaff,           color: COLORS.teacher, route: '/(admin)/staff'    },
            { icon: 'checkmark-circle',label: 'Attendance',     value: ADMIN_STATS.attendanceRate + '%', color: '#10b981',      route: '/(admin)/reports'  },
            { icon: 'analytics',       label: 'Reports',        value: 'View',                           color: COLORS.admin,   route: '/(admin)/reports'  },
          ].map((k, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => router.push(k.route)}
              style={[styles.kpiCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              activeOpacity={0.8}
            >
              <View style={[styles.kpiIcon, { backgroundColor: k.color + '18' }]}>
                <Ionicons name={k.icon} size={22} color={k.color} />
              </View>
              <Text style={[styles.kpiValue, { color: theme.text }]}>{k.value}</Text>
              <Text style={[styles.kpiLabel, { color: theme.textMuted }]}>{k.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── ATTENDANCE RATE BAR ─── */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Attendance</Text>
            <Text style={[styles.pctText, { color: COLORS.primary }]}>{attendancePct}%</Text>
          </View>
          <View style={[styles.attendBar, { backgroundColor: theme.border }]}>
            <View style={[styles.attendFill, { width: `${attendancePct}%` }]} />
          </View>
          <Text style={[styles.attendCaption, { color: theme.textMuted }]}>
            {ADMIN_STATS.presentToday} present · {ADMIN_STATS.absentToday} absent · {ADMIN_STATS.totalChildren} total
          </Text>
        </View>

        {/* ─── WEEKLY CHART ─── */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Weekly Attendance</Text>
          <View style={styles.barChart}>
            {WEEKLY_ATTENDANCE.map((day, i) => {
              const barH = (day.present / maxPresent) * BAR_MAX_H;
              const isToday = i === 0;
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={[styles.barNum, { color: isToday ? COLORS.primary : theme.textMuted }]}>{day.present}</Text>
                  <View style={[styles.barTrack, { height: BAR_MAX_H, backgroundColor: theme.border }]}>
                    <View style={[styles.barFill, {
                      height: barH,
                      backgroundColor: isToday ? COLORS.primary : COLORS.primary + '66',
                      borderRadius: 6,
                    }]} />
                  </View>
                  <Text style={[styles.barDay, { color: isToday ? COLORS.primary : theme.textMuted, fontWeight: isToday ? '900' : '600' }]}>
                    {day.day}
                  </Text>
                </View>
              );
            })}
          </View>
          <View style={styles.legend}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
            <Text style={[styles.legendText, { color: theme.textMuted }]}>Present · </Text>
            <View style={[styles.legendDot, { backgroundColor: COLORS.error + '66' }]} />
            <Text style={[styles.legendText, { color: theme.textMuted }]}>Absent (highlighted = today)</Text>
          </View>
        </View>

        {/* ─── QUICK ACTIONS ─── */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            {QUICK_ACTIONS.map((a, i) => (
              <TouchableOpacity key={i} onPress={() => router.push(a.route)} style={styles.actionBtn} activeOpacity={0.75}>
                <View style={[styles.actionIcon, { backgroundColor: a.color + '18' }]}>
                  <Ionicons name={a.icon} size={22} color={a.color} />
                </View>
                <Text style={[styles.actionLabel, { color: theme.text }]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── TODAY'S ROSTER ─── */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Roster</Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/children')}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.admin }}>View All →</Text>
            </TouchableOpacity>
          </View>
          {CHILDREN.slice(0, 5).map((child, i) => {
            const sc = { checked_in: '#10b981', absent: '#ef4444', checked_out: '#6b7280' }[child.status] || '#6b7280';
            const sb = { checked_in: '#d1fae5', absent: '#fee2e2', checked_out: '#f3f4f6' }[child.status] || '#f3f4f6';
            const sl = { checked_in: '● In', absent: '● Absent', checked_out: '● Out' }[child.status] || '—';
            return (
              <View key={child.id} style={[styles.rosterRow, { borderBottomColor: theme.border, borderBottomWidth: i < 4 ? 1 : 0 }]}>
                <Text style={styles.rosterEmoji}>{child.emoji}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.rosterName, { color: theme.text }]}>{child.name}</Text>
                  <Text style={[styles.rosterMeta, { color: theme.textMuted }]}>{child.room} {child.roomEmoji} · {child.age} yrs</Text>
                </View>
                <View style={[styles.statusChip, { backgroundColor: sb }]}>
                  <Text style={[styles.statusChipText, { color: sc }]}>{sl}</Text>
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
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  logo: { width: 100, height: 40, opacity: 0.95 },
  headerBtns: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute', top: -3, right: -3, width: 16, height: 16,
    backgroundColor: COLORS.accent, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },
  notifBadgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  adminLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600' },
  adminName: { color: '#fff', fontSize: 22, fontWeight: '900', marginVertical: 4 },
  adminDate: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', marginBottom: 18 },
  snapshot: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 18, padding: 4, gap: 4 },
  snapCol: { flex: 1, flexDirection: 'row' },
  snapDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 6 },
  snapItem: { flex: 1, borderRadius: 14, padding: 10, alignItems: 'center', gap: 2, marginLeft: 4 },
  snapValue: { fontSize: 22, fontWeight: '900' },
  snapLabel: { fontSize: 9, fontWeight: '700', textAlign: 'center', marginTop: 1 },
  body: { padding: 16, gap: 14 },
  alertBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fef3c7', borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: '#fde68a',
  },
  alertText: { flex: 1, fontSize: 13, fontWeight: '700', color: '#92400e' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpiCard: {
    width: '47%', borderRadius: 18, padding: 16, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  kpiIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  kpiValue: { fontSize: 26, fontWeight: '900', marginBottom: 2 },
  kpiLabel: { fontSize: 12, fontWeight: '600' },
  card: {
    borderRadius: 20, padding: 16, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: '900' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  pctText: { fontSize: 22, fontWeight: '900' },
  attendBar: { height: 12, borderRadius: 6, marginBottom: 8, overflow: 'hidden' },
  attendFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 6 },
  attendCaption: { fontSize: 12, fontWeight: '600' },
  barChart: { flexDirection: 'row', gap: 6, alignItems: 'flex-end', marginTop: 12, marginBottom: 10 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barNum: { fontSize: 11, fontWeight: '800' },
  barTrack: { width: '100%', borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%' },
  barDay: { fontSize: 11 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  actionBtn: { flex: 1, alignItems: 'center', gap: 8 },
  actionIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  rosterRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11 },
  rosterEmoji: { fontSize: 26 },
  rosterName: { fontSize: 14, fontWeight: '800' },
  rosterMeta: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusChipText: { fontSize: 12, fontWeight: '800' },
});
