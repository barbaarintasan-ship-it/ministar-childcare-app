import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Image, Modal, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { COLORS, getTheme } from '../../src/constants/colors';
import Badge from '../../src/components/common/Badge';
import * as api from '../../src/lib/api';

const TO_LOG = [
  { id: 1, icon: '🍽', label: 'Log Lunch',            done: true,  color: '#f59e0b', route: '/(teacher)/meals'      },
  { id: 2, icon: '😴', label: 'Log Nap',               done: true,  color: '#8b5cf6', route: '/(teacher)/sleep'      },
  { id: 3, icon: '🎨', label: 'Log Activity',          done: false, color: '#3b82f6', route: '/(teacher)/activities' },
  { id: 4, icon: '📸', label: 'Share Photos',          done: false, color: '#e8633a', route: '/(teacher)/upload'     },
  { id: 5, icon: '💊', label: 'Health Notes',          done: false, color: '#10b981', route: '/(teacher)/health'     },
  { id: 6, icon: '🍎', label: 'Log Afternoon Snack',   done: false, color: '#f59e0b', route: '/(teacher)/meals'      },
];

export default function TeacherHome() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const theme = getTheme(isDark);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [menuOpen, setMenuOpen] = useState(false);
  const [allChildren, setAllChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const MENU_ITEMS = [
    { icon: 'home-outline',              label: 'Dashboard',  route: '/(teacher)/' },
    { icon: 'checkmark-circle-outline',  label: 'Attendance', route: '/(teacher)/attendance' },
    { icon: 'restaurant-outline',        label: 'Meals',      route: '/(teacher)/meals' },
    { icon: 'camera-outline',            label: 'Photos',     route: '/(teacher)/upload' },
    { icon: 'heart-outline',             label: 'Health',     route: '/(teacher)/health' },
    { icon: 'people-outline',            label: 'My Class',   route: '/(teacher)/attendance' },
  ];

  useEffect(() => {
    api.getChildren()
      .then(data => setAllChildren(data))
      .catch(err => console.error('Failed to load children:', err))
      .finally(() => setLoading(false));
  }, []);

  const myChildren = allChildren.filter(c => !c.teacherId || c.teacherId === user?.id);
  const present  = myChildren.filter(c => c.status === 'checked_in').length;
  const absent   = myChildren.filter(c => c.status === 'absent').length;
  const sleeping = 0;
  const doneCount = TO_LOG.filter(t => t.done).length;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: getTheme(isDark).bg }}>
        <ActivityIndicator size="large" color={COLORS.teacher} />
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
              <View style={[styles.drawerAvatar, { backgroundColor: COLORS.teacher + '22' }]}>
                <Text style={{ fontSize: 22 }}>👤</Text>
              </View>
              <View>
                <Text style={[styles.drawerUserName, { color: theme.text }]}>{user?.name}</Text>
                <Text style={[styles.drawerUserRole, { color: COLORS.teacher }]}>Teacher</Text>
              </View>
            </View>
            {MENU_ITEMS.map((item, i) => (
              <TouchableOpacity key={i} style={styles.drawerItem} onPress={() => { setMenuOpen(false); router.push(item.route); }}>
                <Ionicons name={item.icon} size={20} color={COLORS.teacher} style={{ marginRight: 14 }} />
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
            <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={COLORS.teacher} />
          </TouchableOpacity>
          <TouchableOpacity onPress={async () => { await logout(); router.replace('/login'); }} style={styles.navIconBtn}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.teacher} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── NAV BUTTONS (website style: filled + outlined pill) ── */}
      <View style={[styles.navButtons, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={[styles.btnFilled, { backgroundColor: COLORS.teacher }]} onPress={() => router.push('/(teacher)/attendance')}>
          <Text style={styles.btnFilledText}>Check-In  →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnOutline, { borderColor: COLORS.teacher }]} onPress={() => router.push('/(teacher)/activities')}>
          <Text style={[styles.btnOutlineText, { color: COLORS.teacher }]}>Activities</Text>
        </TouchableOpacity>
      </View>

      {/* ── HERO (keeps blue gradient, website layout) ── */}
      <LinearGradient colors={[COLORS.teacher, '#1d4ed8']} style={styles.hero}>
        <Text style={styles.heroTag}>TEACHER PORTAL</Text>
        <Text style={styles.heroTitle}>
          Welcome back,{'\n'}{user?.name?.split(' ').slice(0, 2).join(' ')} 👩‍🏫
        </Text>
        <Text style={styles.heroSub}>{today}</Text>

        {/* Snapshot (website card style) */}
        <View style={styles.snapshot}>
          {[
            { value: present,           label: 'Present',  emoji: '✅', color: '#d1fae5', textColor: '#065f46' },
            { value: absent,            label: 'Absent',   emoji: '❌', color: '#fee2e2', textColor: '#991b1b' },
            { value: sleeping,          label: 'Sleeping', emoji: '😴', color: '#ede9fe', textColor: '#4c1d95' },
            { value: myChildren.length, label: 'Total',    emoji: '👶', color: '#dbeafe', textColor: '#1e40af' },
          ].map((s, i) => (
            <View key={i} style={[styles.snapItem, { backgroundColor: s.color }]}>
              <Text style={styles.snapEmoji}>{s.emoji}</Text>
              <Text style={[styles.snapValue, { color: s.textColor }]}>{s.value}</Text>
              <Text style={[styles.snapLabel, { color: s.textColor }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Stars (website style) */}
        <View style={styles.starsRow}>
          <Text style={styles.starsText}>My room: </Text>
          <View style={styles.roomBadge}>
            <Text style={styles.roomEmoji}>🌻</Text>
            <Text style={styles.roomText}>{user?.room || 'Sunflower'}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>

        {/* ── FEATURES GRID (website 2x2 checkmarks) ── */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Overview</Text>
          <View style={styles.featuresGrid}>
            {[
              `${present} Children Present`,
              `${doneCount}/${TO_LOG.length} Tasks Done`,
              'Structured Curriculum',
              'Licensed & Certified',
            ].map((f, i) => (
              <View key={i} style={styles.featureItem}>
                <View style={[styles.featureCheck, { backgroundColor: COLORS.teacher }]}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
                <Text style={[styles.featureText, { color: theme.text }]}>{f}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── TO-DO CHECKLIST (website program-cards style) ── */}
        <Text style={[styles.sectionTitleLg, { color: theme.text }]}>Today's Checklist</Text>
        <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>
          Complete all daily logs to keep parents informed.
        </Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Tasks</Text>
            <View style={[styles.progressPill, { backgroundColor: COLORS.teacher + '18' }]}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.teacher }}>
                {doneCount}/{TO_LOG.length}
              </Text>
            </View>
          </View>
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
                <Text style={[styles.todoLabel, { color: item.done ? item.color : theme.textSecondary }]} numberOfLines={2}>
                  {item.label}
                </Text>
                {item.done && (
                  <View style={[styles.doneBadge, { backgroundColor: item.color }]}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── QR CHECK-IN (website-style card with learn more button) ── */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.qrImageBox, { backgroundColor: COLORS.teacherLight }]}>
            <Ionicons name="qr-code" size={56} color={COLORS.teacher} />
          </View>
          <View style={styles.qrContent}>
            <Text style={[styles.programTitle, { color: theme.text }]}>QR Check-In / Check-Out</Text>
            <Text style={[styles.programDesc, { color: theme.textSecondary }]}>
              Scan parent QR code to record attendance quickly and accurately.
            </Text>
            <TouchableOpacity
              style={[styles.learnMoreBtn, { backgroundColor: COLORS.teacher }]}
              onPress={() => router.push('/(teacher)/attendance')}
            >
              <Text style={styles.learnMoreText}>Open Scanner</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── TODAY'S ROSTER ── */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Roster</Text>
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
                style={[styles.childRow, { borderBottomColor: theme.border, borderBottomWidth: i < myChildren.length - 1 ? 1 : 0 }]}
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

      {/* ── BOTTOM ACTION BAR (website style) ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10, backgroundColor: COLORS.teacher }]}>
        {[
          { icon: 'checkmark-circle', label: 'Attendance', onPress: () => router.push('/(teacher)/attendance') },
          { icon: 'restaurant',       label: 'Meals',      onPress: () => router.push('/(teacher)/meals')      },
          { icon: 'camera',           label: 'Photos',     onPress: () => router.push('/(teacher)/upload')     },
          { icon: 'heart',            label: 'Health',     onPress: () => router.push('/(teacher)/health')     },
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
  navIconBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  navButtons: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 16,
    paddingVertical: 10, borderBottomWidth: 1,
  },
  btnFilled: { flex: 1, borderRadius: 30, paddingVertical: 11, alignItems: 'center' },
  btnFilledText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  btnOutline: { flex: 1, borderWidth: 1.5, borderRadius: 30, paddingVertical: 11, alignItems: 'center' },
  btnOutlineText: { fontWeight: '800', fontSize: 13 },

  // Hero (keeps blue gradient)
  hero: { paddingHorizontal: 20, paddingVertical: 24 },
  heroTag: { fontSize: 11, fontWeight: '800', letterSpacing: 2, color: 'rgba(255,255,255,0.75)', marginBottom: 6 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: '#fff', lineHeight: 30, marginBottom: 4 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginBottom: 18 },
  snapshot: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  snapItem: { flex: 1, borderRadius: 14, padding: 10, alignItems: 'center', gap: 2 },
  snapEmoji: { fontSize: 18 },
  snapValue: { fontSize: 20, fontWeight: '900' },
  snapLabel: { fontSize: 9, fontWeight: '700', textAlign: 'center' },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  starsText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  roomBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  roomEmoji: { fontSize: 14 },
  roomText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  // Body
  body: { padding: 16, gap: 14 },
  card: {
    borderRadius: 20, padding: 16, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: '900', marginBottom: 14 },
  sectionTitleLg: { fontSize: 26, fontWeight: '900', paddingHorizontal: 2, marginBottom: 6 },
  sectionSub: { fontSize: 14, lineHeight: 21, paddingHorizontal: 2, marginBottom: 12 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },

  // Features grid (website 2x2)
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  featureItem: { width: '46%', flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureCheck: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1, fontSize: 13, fontWeight: '700', lineHeight: 19 },

  // Checklist
  progressPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  progressBar: { height: 6, borderRadius: 3, marginBottom: 14, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  todoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  todoItem: { width: '30.5%', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4, position: 'relative' },
  todoEmoji: { fontSize: 24 },
  todoLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  doneBadge: {
    position: 'absolute', top: 6, right: 6, width: 16, height: 16,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center',
  },

  // QR card (website program-card style)
  qrImageBox: { height: 100, alignItems: 'center', justifyContent: 'center', borderRadius: 12, marginBottom: 14 },
  qrContent: {},
  programTitle: { fontSize: 18, fontWeight: '900', marginBottom: 6 },
  programDesc: { fontSize: 14, lineHeight: 21, marginBottom: 14 },
  learnMoreBtn: { borderRadius: 30, paddingVertical: 11, alignItems: 'center' },
  learnMoreText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  // Roster
  rosterCount: { fontSize: 13, fontWeight: '700' },
  childRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  childEmoji: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  childName: { fontSize: 14, fontWeight: '800' },
  childMeta: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  allergyTag: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#fee2e2', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8,
  },
  allergyText: { fontSize: 10, fontWeight: '800', color: '#991b1b' },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusChipText: { fontSize: 12, fontWeight: '800' },
  logBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  logBtnText: { fontSize: 12, fontWeight: '800' },

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
