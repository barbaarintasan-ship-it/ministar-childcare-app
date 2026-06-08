import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Image, Modal, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useLang } from '../../src/contexts/LangContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { COLORS, getTheme } from '../../src/constants/colors';
import * as api from '../../src/lib/api';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const ACTIVITY_FEED = [
  { id: 1, type: 'checkin',  icon: '✅', color: '#10b981', bg: '#d1fae5', title: 'Checked In',        desc: 'Arrived at Mini Star',          time: '7:45 AM' },
  { id: 2, type: 'meal',     icon: '🥞', color: '#f59e0b', bg: '#fef3c7', title: 'Breakfast',          desc: 'Ate all of their breakfast',    time: '8:30 AM' },
  { id: 3, type: 'activity', icon: '🎨', color: '#3b82f6', bg: '#dbeafe', title: 'Circle Time',        desc: 'Songs, stories & morning chat', time: '9:15 AM' },
  { id: 4, type: 'photo',    icon: '📸', color: '#8b5cf6', bg: '#ede9fe', title: 'Photo Shared',       desc: 'Painting activity',             time: '10:00 AM' },
  { id: 5, type: 'meal',     icon: '🥗', color: '#f59e0b', bg: '#fef3c7', title: 'Lunch',              desc: 'Ate most of their lunch',       time: '12:00 PM' },
  { id: 6, type: 'sleep',    icon: '😴', color: '#6d28d9', bg: '#ede9fe', title: 'Nap Time',           desc: 'Slept 1hr 45min',               time: '1:00 PM' },
  { id: 7, type: 'activity', icon: '🧩', color: '#10b981', bg: '#d1fae5', title: 'Outdoor Play',       desc: 'Playground & group games',      time: '3:00 PM' },
];

const QUICK_ACTIONS = [
  { icon: 'chatbubble-ellipses', label: 'Messages',     color: COLORS.primary,  route: '/(parent)/messages' },
  { icon: 'document-text',       label: 'Daily Report', color: COLORS.teacher,  route: '/(parent)/reports'  },
  { icon: 'images',              label: 'Photos',       color: COLORS.accent,   route: '/(parent)/photos'   },
  { icon: 'trending-up',         label: 'Growth',       color: COLORS.admin,    route: '/(parent)/growth'   },
  { icon: 'person',              label: 'Profile',      color: '#f59e0b',       route: '/(parent)/profile'  },
];

export default function ParentHome() {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const theme = getTheme(isDark);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    api.getChildren()
      .then(data => setChildren(data))
      .catch(err => console.error('Failed to load children:', err))
      .finally(() => setLoading(false));
  }, []);

  const child = children[0] || null;

  const MENU_ITEMS = [
    { icon: 'home-outline',            label: 'Dashboard',    route: '/(parent)/' },
    { icon: 'chatbubble-ellipses-outline', label: 'Messages', route: '/(parent)/messages' },
    { icon: 'document-text-outline',   label: 'Daily Report', route: '/(parent)/reports' },
    { icon: 'images-outline',          label: 'Photos',       route: '/(parent)/photos' },
    { icon: 'trending-up-outline',     label: 'Growth',       route: '/(parent)/growth' },
    { icon: 'person-outline',          label: 'Profile',      route: '/(parent)/profile' },
  ];

  const childStatus = child?.status || 'not_arrived';
  const statusColor = childStatus === 'checked_in' ? '#10b981' : childStatus === 'absent' ? '#ef4444' : '#6b7280';
  const statusLabel = childStatus === 'checked_in' ? 'Checked In' : childStatus === 'absent' ? 'Absent Today' : 'Checked Out';
  const statusBg    = childStatus === 'checked_in' ? '#d1fae5' : childStatus === 'absent' ? '#fee2e2' : '#f3f4f6';

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>

      {/* ── DRAWER MENU ── */}
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
              <View style={[styles.drawerAvatar, { backgroundColor: COLORS.primary + '22' }]}>
                <Text style={{ fontSize: 22 }}>👤</Text>
              </View>
              <View>
                <Text style={[styles.drawerUserName, { color: theme.text }]}>{user?.name}</Text>
                <Text style={[styles.drawerUserRole, { color: COLORS.primary }]}>Parent</Text>
              </View>
            </View>
            {MENU_ITEMS.map((item, i) => (
              <TouchableOpacity key={i} style={styles.drawerItem} onPress={() => { setMenuOpen(false); router.push(item.route); }}>
                <Ionicons name={item.icon} size={20} color={COLORS.primary} style={{ marginRight: 14 }} />
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

      {/* ── NAVBAR (website style: hamburger | logo | icons) ── */}
      <View style={[styles.navbar, { paddingTop: insets.top + 10, backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.navIconBtn} onPress={() => setMenuOpen(true)}>
          <Ionicons name="menu" size={24} color={theme.text} />
        </TouchableOpacity>
        <Image source={require('../../logo.png')} style={styles.navLogo} resizeMode="contain" />
        <View style={styles.navRight}>
          <TouchableOpacity onPress={toggleTheme} style={styles.navIconBtn}>
            <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navIconBtn}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity onPress={async () => { await logout(); router.replace('/login'); }} style={styles.navIconBtn}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── NAV BUTTONS (website style: filled + outlined pill) ── */}
      <View style={[styles.navButtons, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.btnFilled} onPress={() => router.push('/(parent)/messages')}>
          <Text style={styles.btnFilledText}>Messages  →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnOutline, { borderColor: COLORS.primary }]} onPress={() => router.push('/(parent)/reports')}>
          <Text style={[styles.btnOutlineText, { color: COLORS.primary }]}>Daily Report</Text>
        </TouchableOpacity>
      </View>

      {/* ── HERO (website style with overlay text) ── */}
      <LinearGradient colors={['#ffffff', '#e8f8f4']} style={styles.hero}>
        <Text style={styles.heroTag}>PARENT PORTAL</Text>
        <Text style={styles.heroTitle}>
          {getGreeting()},{'\n'}
          <Text style={{ color: COLORS.primary }}>{user?.name?.split(' ')[0]}</Text> 👋
        </Text>
        <Text style={styles.heroSub}>{child ? `Here's how ${child.name} is doing today.` : 'Welcome to Mini Star!'}</Text>

        {/* Child status card */}
        {child ? (
        <TouchableOpacity
          onPress={() => router.push('/(parent)/profile')}
          style={styles.childCard}
          activeOpacity={0.85}
        >
          <View style={styles.childAvatar}>
            <Text style={{ fontSize: 32 }}>{child.emoji}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childSub}>{child.age} yrs old · {child.room} {child.roomEmoji}</Text>
            <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
              {child.checkinTime ? <Text style={[styles.statusTime, { color: statusColor }]}>· {child.checkinTime}</Text> : null}
            </View>
          </View>
          <View style={styles.chevronWrap}>
            <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
          </View>
        </TouchableOpacity>
        ) : (
          <View style={[styles.childCard, { alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ color: '#6b7280', fontSize: 14 }}>No children enrolled yet. Contact the center.</Text>
          </View>
        )}

        {/* Stars rating (website style) */}
        <View style={styles.starsRow}>
          <Text style={styles.starsText}>Parents love us  </Text>
          <Text style={{ fontSize: 15 }}>⭐⭐⭐⭐⭐</Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>

        {/* ── FEATURES GRID (website style: 2x2 checkmarks) ── */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>What We Provide</Text>
          <View style={styles.featuresGrid}>
            {['Licensed & Certified Staff', 'Small Class Sizes', 'Structured Curriculum', 'Now Enrolling'].map((f, i) => (
              <View key={i} style={styles.featureItem}>
                <View style={styles.featureCheck}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
                <Text style={[styles.featureText, { color: theme.text }]}>{f}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── TODAY'S STATS ── */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Today at a Glance</Text>
          <View style={styles.statsRow}>
            {[
              { emoji: '😄', label: 'Mood',   value: (child?.moodEmoji || '😊') + ' ' + (child?.mood || 'Good'), color: '#10b981', bg: '#d1fae5' },
              { emoji: '😴', label: 'Nap',    value: '1h 45m',                                                              color: '#8b5cf6', bg: '#ede9fe' },
              { emoji: '🍽',  label: 'Meals',  value: '3 / 3',                              color: '#f59e0b', bg: '#fef3c7' },
              { emoji: '🚗', label: 'Pickup', value: '5:00 PM',                            color: '#3b82f6', bg: '#dbeafe' },
            ].map((s, i) => (
              <View key={i} style={[styles.statBox, { backgroundColor: s.bg }]}>
                <Text style={styles.statEmoji}>{s.emoji}</Text>
                <Text style={[styles.statValue, { color: s.color }]} numberOfLines={1}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: s.color }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── QUICK ACTIONS (website-style cards) ── */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((a, i) => (
              <TouchableOpacity key={i} onPress={() => router.push(a.route)} style={styles.actionBtn} activeOpacity={0.7}>
                <View style={[styles.actionIcon, { backgroundColor: a.color + '18' }]}>
                  <Ionicons name={a.icon} size={22} color={a.color} />
                </View>
                <Text style={[styles.actionLabel, { color: theme.text }]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── OUR PROGRAMS (website-style cards) ── */}
        <Text style={[styles.sectionTitleLg, { color: theme.text }]}>Our Programs</Text>
        <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>
          Age-appropriate care from birth to 12 years in a warm family setting.
        </Text>
        {[
          { emoji: '👶', title: 'Infant Program',   desc: 'Gentle, responsive care supporting feeding, rest, bonding, and early milestones.',    route: '/(parent)/reports' },
          { emoji: '🧒', title: 'Toddler Program',  desc: 'Active days filled with guided play, language building, and social discovery.',        route: '/(parent)/reports' },
          { emoji: '📚', title: 'School Program',   desc: 'School-readiness through structured learning, creative arts, and peer interaction.',   route: '/(parent)/reports' },
        ].map((prog, i) => (
          <View key={i} style={[styles.programCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.programImageBox, { backgroundColor: COLORS.primaryLight }]}>
              <Text style={{ fontSize: 48 }}>{prog.emoji}</Text>
            </View>
            <View style={styles.programContent}>
              <Text style={[styles.programTitle, { color: theme.text }]}>{prog.title}</Text>
              <Text style={[styles.programDesc, { color: theme.textSecondary }]}>{prog.desc}</Text>
              <TouchableOpacity style={[styles.learnMoreBtn, { backgroundColor: COLORS.primary }]} onPress={() => router.push(prog.route)}>
                <Text style={styles.learnMoreText}>Learn more</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* ── TEACHER NOTE ── */}
        <View style={[styles.teacherNote, { borderColor: COLORS.primary + '30', backgroundColor: COLORS.primaryLight }]}>
          <View style={styles.teacherNoteTop}>
            <View style={styles.teacherAvatar}>
              <Text style={{ fontSize: 18 }}>👩‍🏫</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.teacherName, { color: COLORS.primaryDark }]}>{child?.teacherName || 'Your Teacher'}</Text>
              <Text style={{ fontSize: 11, color: COLORS.primary, fontWeight: '600' }}>Today's Note</Text>
            </View>
            <Text style={{ fontSize: 11, color: COLORS.primary, fontWeight: '600' }}>Today</Text>
          </View>
          <Text style={[styles.teacherNoteText, { color: COLORS.primaryDark }]}>"{child?.teacherNote || 'Have a great day!'}"</Text>
        </View>

        {/* ── ACTIVITY FEED ── */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Activity</Text>
            <TouchableOpacity onPress={() => router.push('/(parent)/reports')}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.primary }}>Full Report →</Text>
            </TouchableOpacity>
          </View>
          {ACTIVITY_FEED.map((item, i) => (
            <View key={item.id} style={styles.feedItem}>
              <View style={styles.timelineCol}>
                <View style={[styles.timelineDot, { backgroundColor: item.color }]} />
                {i < ACTIVITY_FEED.length - 1 && <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />}
              </View>
              <View style={[styles.feedContent, { backgroundColor: item.bg, marginBottom: i < ACTIVITY_FEED.length - 1 ? 10 : 0 }]}>
                <View style={styles.feedHeader}>
                  <Text style={styles.feedIcon}>{item.icon}</Text>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={[styles.feedTitle, { color: item.color }]}>{item.title}</Text>
                    <Text style={[styles.feedDesc, { color: item.color + 'bb' }]}>{item.desc}</Text>
                  </View>
                  <Text style={[styles.feedTime, { color: item.color }]}>{item.time}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* ── MESSAGE BANNER ── */}
        <TouchableOpacity
          onPress={() => router.push('/(parent)/messages')}
          style={[styles.messageBanner, { backgroundColor: COLORS.primary }]}
          activeOpacity={0.85}
        >
          <View style={styles.messageBannerLeft}>
            <Ionicons name="chatbubble-ellipses" size={22} color="#fff" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.messageBannerTitle}>Message {child?.teacherName || 'Teacher'}</Text>
              <Text style={styles.messageBannerSub}>Tap to open conversation</Text>
            </View>
          </View>
          <View style={styles.messageBadge}>
            <Text style={styles.messageBadgeText}>{child?.unreadMessages || 0}</Text>
          </View>
        </TouchableOpacity>

      </View>

      {/* ── BOTTOM ACTION BAR (website style) ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10, backgroundColor: COLORS.primary }]}>
        {[
          { icon: 'call',       label: 'Call',    onPress: () => {} },
          { icon: 'chatbubble', label: 'Text',    onPress: () => router.push('/(parent)/messages') },
          { icon: 'mail',       label: 'Email',   onPress: () => {} },
          { icon: 'calendar',   label: 'Reports', onPress: () => router.push('/(parent)/reports') },
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
  notifDot: {
    position: 'absolute', top: 6, right: 6, width: 8, height: 8,
    backgroundColor: COLORS.accent, borderRadius: 4, borderWidth: 1.5, borderColor: '#fff',
  },
  navButtons: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 16,
    paddingVertical: 10, borderBottomWidth: 1,
  },
  btnFilled: {
    flex: 1, backgroundColor: COLORS.primary, borderRadius: 30,
    paddingVertical: 11, alignItems: 'center',
  },
  btnFilledText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  btnOutline: {
    flex: 1, borderWidth: 1.5, borderRadius: 30,
    paddingVertical: 11, alignItems: 'center',
  },
  btnOutlineText: { fontWeight: '800', fontSize: 13 },

  // Hero
  hero: { paddingHorizontal: 20, paddingVertical: 24 },
  heroTag: { fontSize: 11, fontWeight: '800', letterSpacing: 2, color: COLORS.primaryDark, marginBottom: 6 },
  heroTitle: { fontSize: 26, fontWeight: '900', color: '#1a1a2e', lineHeight: 32, marginBottom: 6 },
  heroSub: { fontSize: 14, color: '#4b5563', fontWeight: '500', marginBottom: 18 },
  childCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 14,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
    borderWidth: 1, borderColor: COLORS.primary + '22', marginBottom: 14,
  },
  childAvatar: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  childName: { fontSize: 16, fontWeight: '900', color: '#1a1a2e', marginBottom: 2 },
  childSub: { fontSize: 12, color: '#6b7280', fontWeight: '600', marginBottom: 6 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start',
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '800' },
  statusTime: { fontSize: 11, fontWeight: '600' },
  chevronWrap: {
    width: 30, height: 30, borderRadius: 10,
    backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  starsRow: { flexDirection: 'row', alignItems: 'center' },
  starsText: { fontSize: 13, fontWeight: '600', color: '#4b5563' },

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
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },

  // Features grid (website 2x2)
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  featureItem: { width: '46%', flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureCheck: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  featureText: { flex: 1, fontSize: 13, fontWeight: '700', lineHeight: 19 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 8 },
  statBox: { flex: 1, borderRadius: 14, padding: 10, alignItems: 'center', gap: 3 },
  statEmoji: { fontSize: 18, marginBottom: 2 },
  statValue: { fontSize: 11, fontWeight: '900', textAlign: 'center' },
  statLabel: { fontSize: 9, fontWeight: '700', textAlign: 'center' },

  // Quick actions
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionBtn: { width: '30%', alignItems: 'center', gap: 7 },
  actionIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },

  // Program cards (website style)
  programCard: {
    borderRadius: 18, overflow: 'hidden', marginBottom: 2,
    borderWidth: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  programImageBox: {
    height: 110, alignItems: 'center', justifyContent: 'center',
  },
  programContent: { padding: 16 },
  programTitle: { fontSize: 18, fontWeight: '900', marginBottom: 6 },
  programDesc: { fontSize: 14, lineHeight: 21, marginBottom: 14 },
  learnMoreBtn: { borderRadius: 30, paddingVertical: 11, alignItems: 'center' },
  learnMoreText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  // Teacher note
  teacherNote: { borderRadius: 18, padding: 14, borderWidth: 1.5 },
  teacherNoteTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  teacherAvatar: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  teacherName: { fontSize: 14, fontWeight: '900' },
  teacherNoteText: { fontSize: 14, fontWeight: '600', lineHeight: 21, fontStyle: 'italic' },

  // Activity feed
  feedItem: { flexDirection: 'row', gap: 10 },
  timelineCol: { alignItems: 'center', paddingTop: 6 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginBottom: 4 },
  timelineLine: { width: 2, flex: 1, borderRadius: 1, minHeight: 16 },
  feedContent: { flex: 1, borderRadius: 14, padding: 10 },
  feedHeader: { flexDirection: 'row', alignItems: 'center' },
  feedIcon: { fontSize: 20 },
  feedTitle: { fontSize: 13, fontWeight: '800' },
  feedDesc: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  feedTime: { fontSize: 11, fontWeight: '700' },

  // Message banner
  messageBanner: {
    borderRadius: 18, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8,
  },
  messageBannerLeft: { flexDirection: 'row', alignItems: 'center' },
  messageBannerTitle: { color: '#fff', fontWeight: '800', fontSize: 14 },
  messageBannerSub: { color: 'rgba(255,255,255,0.75)', fontWeight: '600', fontSize: 12, marginTop: 1 },
  messageBadge: {
    backgroundColor: COLORS.accent, width: 26, height: 26,
    borderRadius: 13, alignItems: 'center', justifyContent: 'center',
  },
  messageBadgeText: { color: '#fff', fontSize: 12, fontWeight: '900' },

  // Bottom bar (website style)
  bottomBar: { flexDirection: 'row', paddingTop: 14 },
  bottomBarItem: { flex: 1, alignItems: 'center', gap: 4 },
  bottomBarLabel: { color: '#fff', fontSize: 11, fontWeight: '800' },

  // Drawer menu
  drawerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', flexDirection: 'row' },
  drawer: {
    width: 280, height: '100%',
    shadowColor: '#000', shadowOffset: { width: 2, height: 0 }, shadowOpacity: 0.2, elevation: 10,
  },
  drawerHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 54, paddingBottom: 16, borderBottomWidth: 1,
  },
  drawerLogo: { width: 110, height: 40 },
  drawerUserRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20 },
  drawerAvatar: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  drawerUserName: { fontSize: 15, fontWeight: '800' },
  drawerUserRole: { fontSize: 12, fontWeight: '600', marginTop: 1 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20 },
  drawerItemText: { fontSize: 15, fontWeight: '600' },
  drawerLogout: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20,
    marginTop: 'auto', borderTopWidth: 1, borderTopColor: '#f3f4f6',
  },
});
