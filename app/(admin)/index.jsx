import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, Modal, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { COLORS, getTheme } from '../../src/constants/colors';
import * as api from '../../src/lib/api';

const { width } = Dimensions.get('window');
const BAR_MAX_H = 72;

const QUICK_ACTIONS = [
  { icon: 'person-add',    label: 'Add Child',    color: COLORS.primary, route: '/(admin)/children' },
  { icon: 'person-circle', label: 'Add Staff',    color: COLORS.teacher, route: '/(admin)/staff'    },
  { icon: 'bar-chart',     label: 'Reports',      color: COLORS.admin,   route: '/(admin)/reports'  },
  { icon: 'people',        label: 'All Children', color: '#10b981',      route: '/(admin)/children' },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const theme = getTheme(isDark);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState({ totalChildren: 0, totalStaff: 0, presentToday: 0, absentToday: 0, monthlyRevenue: 0, overdueAmount: 0 });
  const [weeklyAtt, setWeeklyAtt] = useState([]);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  const MENU_ITEMS = [
    { icon: 'home-outline',          label: 'Dashboard',    route: '/(admin)/' },
    { icon: 'people-outline',        label: 'Children',     route: '/(admin)/children' },
    { icon: 'person-circle-outline', label: 'Staff',        route: '/(admin)/staff' },
    { icon: 'bar-chart-outline',     label: 'Reports',      route: '/(admin)/reports' },
    { icon: 'cash-outline',          label: 'Billing',      route: '/(admin)/billing' },
    { icon: 'settings-outline',      label: 'Settings',     route: '/(admin)/settings' },
  ];

  useEffect(() => {
    Promise.all([
      api.getReportsSummary(),
      api.getWeeklyAttendance(),
      api.getChildren(),
    ])
      .then(([s, w, c]) => { setStats(s); setWeeklyAtt(w); setChildren(c); })
      .catch(err => console.error('Admin dashboard load error:', err))
      .finally(() => setLoading(false));
  }, []);

  const overdueCount = 0;
  const maxPresent   = weeklyAtt.length > 0 ? Math.max(...weeklyAtt.map(d => parseInt(d.present) || 0)) : 1;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const attendancePct = stats.totalChildren > 0 ? Math.round((stats.presentToday / stats.totalChildren) * 100) : 0;

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg }}>
        <ActivityIndicator size="large" color={COLORS.admin} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <TouchableOpacity style={styles.drawerOverlay} activeOpacity={1} onPress={() => setMenuOpen(false)}>
          <View style={[styles.drawer, { backgroundColor: theme.card }]}>
            <View style={[styles.drawerHeader, { borderBottomColor: theme.border }]}>
              <Image source={require('../../logo.png')} style={styles.drawerLogo} resizeMode="contain" />
              <TouchableOpacity onPress={() => setMenuOpen(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.drawerUserRow}>
              <View style={[styles.drawerAvatar, { backgroundColor: COLORS.admin + '22' }]}>
                <Text style={{ fontSize: 22 }}>👤</Text>
              </View>
              <View>
                <Text style={[styles.drawerUserName, { color: theme.text }]}>{user?.name}</Text>
                <Text style={[styles.drawerUserRole, { color: COLORS.admin }]}>Admin</Text>
              </View>
            </View>
            {MENU_ITEMS.map((item, i) => (
              <TouchableOpacity key={i} style={styles.drawerItem} onPress={() => { setMenuOpen(false); router.push(item.route); }}>
                <Ionicons name={item.icon} size={20} color={COLORS.admin} style={{ marginRight: 14 }} />
                <Text style={[styles.drawerItemText, { color: theme.text }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.drawerLogout} onPress={async () => { setMenuOpen(false); await logout(); router.replace('/login'); }}>
              <Ionicons name="log-out-outline" size={20} color="#ef4444" style={{ marginRight: 14 }} />
              <Text style={{ color: '#ef4444', fontSize: 15, fontWeight: '600' }}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

      {/* ── NAVBAR (website style) ── */}
      <View style={[styles.navbar, { paddingTop: insets.top + 10, backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.navIconBtn} onPress={() => setMenuOpen(true)}>
          <Ionicons name="menu" size={24} color={theme.text} />
        </TouchableOpacity>
        <Image source={require('../../logo.png')} style={styles.navLogo} resizeMode="contain" />
        <View style={styles.navRight}>
          <TouchableOpacity onPress={toggleTheme} style={styles.navIconBtn}>
            <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={COLORS.admin} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navIconBtn}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.admin} />
            {overdueCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{overdueCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={async () => { await logout(); router.replace('/login'); }} style={styles.navIconBtn}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.admin} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── NAV BUTTONS (website style: filled + outlined pill) ── */}
      <View style={[styles.navButtons, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={[styles.btnFilled, { backgroundColor: COLORS.admin }]} onPress={() => router.push('/(admin)/children')}>
          <Text style={styles.btnFilledText}>Children  →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnOutline, { borderColor: COLORS.admin }]} onPress={() => router.push('/(admin)/reports')}>
          <Text style={[styles.btnOutlineText, { color: COLORS.admin }]}>Reports</Text>
        </TouchableOpacity>
      </View>

      {/* ── HERO (keeps purple gradient, website layout) ── */}
      <LinearGradient colors={[COLORS.admin, '#5b21b6']} style={styles.hero}>
        <Text style={styles.heroTag}>ADMIN DASHBOARD</Text>
        <Text style={styles.heroTitle}>{user?.name} 👩‍💼</Text>
        <Text style={styles.heroSub}>{today}</Text>

        {/* Snapshot stats (website card style) */}
        <View style={styles.snapshot}>
          {[
            { value: stats.presentToday,     label: 'Present',       color: '#d1fae5', text: '#065f46' },
            { value: stats.absentToday,      label: 'Absent',        color: '#fee2e2', text: '#991b1b' },
            { value: stats.totalStaff,       label: 'Staff on Duty', color: '#dbeafe', text: '#1e40af' },
            { value: overdueCount,                  label: 'Overdue Bills', color: overdueCount > 0 ? '#fef3c7' : '#d1fae5', text: overdueCount > 0 ? '#92400e' : '#065f46' },
          ].map((s, i) => (
            <View key={i} style={[styles.snapItem, { backgroundColor: s.color }]}>
              <Text style={[styles.snapValue, { color: s.text }]}>{s.value}</Text>
              <Text style={[styles.snapLabel, { color: s.text }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Stars (website style) */}
        <View style={styles.starsRow}>
          <Text style={styles.starsText}>Parents love us  </Text>
          <Text style={{ fontSize: 14 }}>⭐⭐⭐⭐⭐</Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>

        {/* ── ALERT ── */}
        {overdueCount > 0 && (
          <TouchableOpacity onPress={() => router.push('/(admin)/billing')} style={styles.alertBanner} activeOpacity={0.85}>
            <Ionicons name="alert-circle" size={20} color="#92400e" />
            <Text style={styles.alertText}>
              {overdueCount} overdue invoice{overdueCount > 1 ? 's' : ''} need attention
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#92400e" />
          </TouchableOpacity>
        )}

        {/* ── FEATURES GRID (website 2x2 checkmarks) ── */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Centre Status</Text>
          <View style={styles.featuresGrid}>
            {['Licensed & Certified Staff', 'Small Class Sizes', 'Structured Curriculum', 'Now Enrolling'].map((f, i) => (
              <View key={i} style={styles.featureItem}>
                <View style={[styles.featureCheck, { backgroundColor: COLORS.admin }]}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
                <Text style={[styles.featureText, { color: theme.text }]}>{f}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── KPI CARDS (website-style grid) ── */}
        <Text style={[styles.sectionTitleLg, { color: theme.text }]}>Our Programs</Text>
        <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>
          Overview of children, staff, and attendance across all programs.
        </Text>
        <View style={styles.kpiGrid}>
          {[
            { icon: 'people',           label: 'Total Children', value: stats.totalChildren,        color: COLORS.primary, route: '/(admin)/children' },
            { icon: 'person',           label: 'Total Staff',    value: stats.totalStaff,           color: COLORS.teacher, route: '/(admin)/staff'    },
            { icon: 'checkmark-circle', label: 'Attendance',     value: attendancePct + '%',        color: '#10b981',      route: '/(admin)/reports'  },
            { icon: 'analytics',        label: 'Reports',        value: 'View',                           color: COLORS.admin,   route: '/(admin)/reports'  },
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
              <TouchableOpacity style={[styles.learnMoreBtn, { backgroundColor: k.color }]} onPress={() => router.push(k.route)}>
                <Text style={styles.learnMoreText}>View →</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── ATTENDANCE RATE ── */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Attendance</Text>
            <Text style={[styles.pctText, { color: COLORS.admin }]}>{attendancePct}%</Text>
          </View>
          <View style={[styles.attendBar, { backgroundColor: theme.border }]}>
            <View style={[styles.attendFill, { width: `${attendancePct}%`, backgroundColor: COLORS.admin }]} />
          </View>
          <Text style={[styles.attendCaption, { color: theme.textMuted }]}>
            {stats.presentToday} present · {stats.absentToday} absent · {stats.totalChildren} total
          </Text>
        </View>

        {/* ── WEEKLY CHART ── */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Weekly Attendance</Text>
          <View style={styles.barChart}>
            {weeklyAtt.length > 0 ? weeklyAtt.map((day, i) => {
              const barH = (parseInt(day.present) / maxPresent) * BAR_MAX_H;
              const isToday = i === weeklyAtt.length - 1;
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={[styles.barNum, { color: isToday ? COLORS.admin : theme.textMuted }]}>{day.present}</Text>
                  <View style={[styles.barTrack, { height: BAR_MAX_H, backgroundColor: theme.border }]}>
                    <View style={[styles.barFill, {
                      height: barH, borderRadius: 6,
                      backgroundColor: isToday ? COLORS.admin : COLORS.admin + '66',
                    }]} />
                  </View>
                  <Text style={[styles.barDay, { color: isToday ? COLORS.admin : theme.textMuted, fontWeight: isToday ? '900' : '600' }]}>
                    {day.day}
                  </Text>
                </View>
              );
            }) : <Text style={{ color: theme.textMuted, fontSize: 13 }}>No attendance data yet</Text>}
          </View>
        </View>

        {/* ── QUICK ACTIONS (website-style cards) ── */}
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

        {/* ── TODAY'S ROSTER ── */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Roster</Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/children')}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.admin }}>View All →</Text>
            </TouchableOpacity>
          </View>
          {children.slice(0, 5).map((child, i) => {
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

      {/* ── BOTTOM ACTION BAR (website style) ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10, backgroundColor: COLORS.admin }]}>
        {[
          { icon: 'people',    label: 'Children', onPress: () => router.push('/(admin)/children') },
          { icon: 'person',    label: 'Staff',    onPress: () => router.push('/(admin)/staff')    },
          { icon: 'bar-chart', label: 'Reports',  onPress: () => router.push('/(admin)/reports')  },
          { icon: 'settings',  label: 'Billing',  onPress: () => router.push('/(admin)/billing')  },
        ].map((a, i) => (
          <TouchableOpacity key={i} style={styles.bottomBarItem} onPress={a.onPress}>
            <Ionicons name={a.icon} size={22} color="#fff" />
            <Text style={styles.bottomBarLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Navbar
  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: 1,
  },
  navLogo: { width: 130, height: 48 },
  navRight: { flexDirection: 'row', gap: 2 },
  navIconBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notifBadge: {
    position: 'absolute', top: 5, right: 5, width: 14, height: 14,
    backgroundColor: COLORS.accent, borderRadius: 7, alignItems: 'center', justifyContent: 'center',
  },
  notifBadgeText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  navButtons: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 16,
    paddingVertical: 10, borderBottomWidth: 1,
  },
  btnFilled: { flex: 1, borderRadius: 30, paddingVertical: 11, alignItems: 'center' },
  btnFilledText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  btnOutline: { flex: 1, borderWidth: 1.5, borderRadius: 30, paddingVertical: 11, alignItems: 'center' },
  btnOutlineText: { fontWeight: '800', fontSize: 13 },

  // Hero (keeps purple gradient)
  hero: { paddingHorizontal: 20, paddingVertical: 24 },
  heroTag: { fontSize: 11, fontWeight: '800', letterSpacing: 2, color: 'rgba(255,255,255,0.75)', marginBottom: 6 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 4 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginBottom: 18 },
  snapshot: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  snapItem: { flex: 1, borderRadius: 14, padding: 10, alignItems: 'center', gap: 2 },
  snapValue: { fontSize: 22, fontWeight: '900' },
  snapLabel: { fontSize: 9, fontWeight: '700', textAlign: 'center', marginTop: 1 },
  starsRow: { flexDirection: 'row', alignItems: 'center' },
  starsText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },

  // Body
  body: { padding: 16, gap: 14 },
  alertBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fef3c7', borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: '#fde68a',
  },
  alertText: { flex: 1, fontSize: 13, fontWeight: '700', color: '#92400e' },
  card: {
    borderRadius: 20, padding: 16, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: '900', marginBottom: 14 },
  sectionTitleLg: { fontSize: 26, fontWeight: '900', paddingHorizontal: 2, marginBottom: 6 },
  sectionSub: { fontSize: 14, lineHeight: 21, paddingHorizontal: 2, marginBottom: 12 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  pctText: { fontSize: 22, fontWeight: '900' },

  // Features grid (website 2x2)
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  featureItem: { width: '46%', flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureCheck: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1, fontSize: 13, fontWeight: '700', lineHeight: 19 },

  // KPI cards (website program-card style)
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 2 },
  kpiCard: {
    width: '47%', borderRadius: 18, padding: 14, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  kpiIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  kpiValue: { fontSize: 24, fontWeight: '900', marginBottom: 2 },
  kpiLabel: { fontSize: 12, fontWeight: '600', marginBottom: 10 },
  learnMoreBtn: { borderRadius: 20, paddingVertical: 7, alignItems: 'center' },
  learnMoreText: { color: '#fff', fontWeight: '800', fontSize: 12 },

  // Attendance
  attendBar: { height: 12, borderRadius: 6, marginBottom: 8, overflow: 'hidden' },
  attendFill: { height: '100%', borderRadius: 6 },
  attendCaption: { fontSize: 12, fontWeight: '600' },

  // Weekly chart
  barChart: { flexDirection: 'row', gap: 6, alignItems: 'flex-end', marginTop: 12, marginBottom: 10 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barNum: { fontSize: 11, fontWeight: '800' },
  barTrack: { width: '100%', borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%' },
  barDay: { fontSize: 11 },

  // Quick actions
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  actionBtn: { flex: 1, alignItems: 'center', gap: 8 },
  actionIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },

  // Roster
  rosterRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11 },
  rosterEmoji: { fontSize: 26 },
  rosterName: { fontSize: 14, fontWeight: '800' },
  rosterMeta: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusChipText: { fontSize: 12, fontWeight: '800' },

  // Bottom bar
  bottomBar: { flexDirection: 'row', paddingTop: 14 },
  bottomBarItem: { flex: 1, alignItems: 'center', gap: 4 },
  bottomBarLabel: { color: '#fff', fontSize: 11, fontWeight: '800' },

  // Drawer
  drawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', flexDirection: 'row' },
  drawer: { width: 280, height: '100%', shadowColor: '#000', shadowOffset: { width: 2, height: 0 }, shadowOpacity: 0.2, elevation: 10 },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 54, paddingBottom: 16, borderBottomWidth: 1 },
  drawerLogo: { width: 110, height: 40 },
  drawerUserRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20 },
  drawerAvatar: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  drawerUserName: { fontSize: 15, fontWeight: '800' },
  drawerUserRole: { fontSize: 12, fontWeight: '600', marginTop: 1 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20 },
  drawerItemText: { fontSize: 15, fontWeight: '600' },
  drawerLogout: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, marginTop: 'auto', borderTopWidth: 1, borderTopColor: '#f3f4f6' },
});
