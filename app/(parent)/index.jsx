import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useLang } from '../../src/contexts/LangContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { COLORS, getTheme } from '../../src/constants/colors';
import { CHILDREN } from '../../src/data/mockData';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const ACTIVITY_FEED = [
  { id: 1, type: 'checkin',  icon: '✅', color: '#10b981', bg: '#d1fae5', title: 'Checked In',        desc: 'Arrived at Mini Star',          time: '7:45 AM' },
  { id: 2, type: 'meal',     icon: '🥞', color: '#f59e0b', bg: '#fef3c7', title: 'Breakfast',          desc: 'Ate all of their breakfast',     time: '8:30 AM' },
  { id: 3, type: 'activity', icon: '🎨', color: '#3b82f6', bg: '#dbeafe', title: 'Circle Time',        desc: 'Songs, stories & morning chat',  time: '9:15 AM' },
  { id: 4, type: 'photo',    icon: '📸', color: '#8b5cf6', bg: '#ede9fe', title: 'Photo Shared',       desc: 'Painting activity',              time: '10:00 AM' },
  { id: 5, type: 'meal',     icon: '🥗', color: '#f59e0b', bg: '#fef3c7', title: 'Lunch',              desc: 'Ate most of their lunch',        time: '12:00 PM' },
  { id: 6, type: 'sleep',    icon: '😴', color: '#6d28d9', bg: '#ede9fe', title: 'Nap Time',           desc: 'Slept 1hr 45min',                time: '1:00 PM' },
  { id: 7, type: 'activity', icon: '🧩', color: '#10b981', bg: '#d1fae5', title: 'Outdoor Play',       desc: 'Playground & group games',       time: '3:00 PM' },
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
  const child = CHILDREN[0];

  const statusColor = child.status === 'checked_in' ? '#10b981' : child.status === 'absent' ? '#ef4444' : '#6b7280';
  const statusLabel = child.status === 'checked_in' ? 'Checked In' : child.status === 'absent' ? 'Absent Today' : 'Checked Out';
  const statusBg    = child.status === 'checked_in' ? '#d1fae5' : child.status === 'absent' ? '#fee2e2' : '#f3f4f6';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} showsVerticalScrollIndicator={false}>

      {/* ─── HEADER ─── */}
      <LinearGradient colors={['#ffffff', '#f0faf6']} style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerTop}>
          <Image source={require('../../logo.png')} style={styles.logo} resizeMode="contain" />
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
              <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={styles.iconBtn}>
              <Ionicons name="log-out-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.greeting}>{getGreeting()}, <Text style={{ color: COLORS.primary }}>{user?.name?.split(' ')[0]}</Text> 👋</Text>

        {/* Child Status Card */}
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
      </LinearGradient>

      <View style={styles.body}>

        {/* ─── TODAY'S STATS ─── */}
        <View style={styles.statsRow}>
          {[
            { emoji: '😄', label: 'Mood',   value: child.moodEmoji + ' ' + child.mood,   color: '#10b981', bg: '#d1fae5' },
            { emoji: '😴', label: 'Nap',    value: child.sleepDuration || '1h 45m',       color: '#8b5cf6', bg: '#ede9fe' },
            { emoji: '🍽', label: 'Meals',  value: '3 / 3',                              color: '#f59e0b', bg: '#fef3c7' },
            { emoji: '🚗', label: 'Pickup', value: '5:00 PM',                            color: '#3b82f6', bg: '#dbeafe' },
          ].map((s, i) => (
            <View key={i} style={[styles.statBox, { backgroundColor: s.bg }]}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={[styles.statValue, { color: s.color }]} numberOfLines={1}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: s.color }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ─── QUICK ACTIONS ─── */}
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

        {/* ─── TEACHER NOTE ─── */}
        <View style={[styles.teacherNote, { borderColor: COLORS.primary + '30' }]}>
          <View style={styles.teacherNoteTop}>
            <View style={styles.teacherAvatar}>
              <Text style={{ fontSize: 18 }}>👩‍🏫</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.teacherName, { color: COLORS.primaryDark }]}>{child.teacherName}</Text>
              <Text style={{ fontSize: 11, color: COLORS.primary, fontWeight: '600' }}>Today's Note</Text>
            </View>
            <Text style={{ fontSize: 11, color: COLORS.primary, fontWeight: '600' }}>Today</Text>
          </View>
          <Text style={[styles.teacherNoteText, { color: COLORS.primaryDark }]}>"{child.teacherNote}"</Text>
        </View>

        {/* ─── ACTIVITY FEED ─── */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Activity</Text>
            <TouchableOpacity onPress={() => router.push('/(parent)/reports')}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.primary }}>Full Report →</Text>
            </TouchableOpacity>
          </View>

          {ACTIVITY_FEED.map((item, i) => (
            <View key={item.id} style={styles.feedItem}>
              {/* Timeline line */}
              <View style={styles.timelineCol}>
                <View style={[styles.timelineDot, { backgroundColor: item.color }]} />
                {i < ACTIVITY_FEED.length - 1 && <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />}
              </View>
              {/* Content */}
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

        {/* ─── MESSAGES PREVIEW ─── */}
        <TouchableOpacity
          onPress={() => router.push('/(parent)/messages')}
          style={[styles.messageBanner, { backgroundColor: COLORS.primary }]}
          activeOpacity={0.85}
        >
          <View style={styles.messageBannerLeft}>
            <Ionicons name="chatbubble-ellipses" size={22} color="#fff" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.messageBannerTitle}>Message {child.teacherName}</Text>
              <Text style={styles.messageBannerSub}>Tap to open conversation</Text>
            </View>
          </View>
          <View style={styles.messageBadge}>
            <Text style={styles.messageBadgeText}>{child.unreadMessages || 2}</Text>
          </View>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  logo: { width: 110, height: 44 },
  headerRight: { flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 38, height: 38, backgroundColor: COLORS.primaryLight,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute', top: 7, right: 7,
    width: 8, height: 8, backgroundColor: COLORS.accent, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#fff',
  },
  greeting: { fontSize: 20, fontWeight: '800', color: '#1a1a2e', marginBottom: 14 },
  childCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 6,
    borderWidth: 1.5, borderColor: COLORS.primary + '22',
  },
  childAvatar: {
    width: 60, height: 60, borderRadius: 18, backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  childName: { fontSize: 17, fontWeight: '900', color: '#1a1a2e', marginBottom: 2 },
  childSub: { fontSize: 12, color: '#6b7280', fontWeight: '600', marginBottom: 8 },
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
  body: { padding: 16, gap: 14 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statBox: {
    flex: 1, borderRadius: 14, padding: 10, alignItems: 'center', gap: 3,
  },
  statEmoji: { fontSize: 18, marginBottom: 2 },
  statValue: { fontSize: 11, fontWeight: '900', textAlign: 'center' },
  statLabel: { fontSize: 9, fontWeight: '700', textAlign: 'center' },
  card: {
    borderRadius: 20, padding: 16, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: { fontSize: 16, fontWeight: '900', marginBottom: 14 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionBtn: { width: '30%', alignItems: 'center', gap: 7 },
  actionIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  teacherNote: {
    borderRadius: 18, padding: 14, borderWidth: 1.5,
    backgroundColor: COLORS.primaryLight,
  },
  teacherNoteTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  teacherAvatar: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  teacherName: { fontSize: 14, fontWeight: '900' },
  teacherNoteText: { fontSize: 14, fontWeight: '600', lineHeight: 21, fontStyle: 'italic' },
  feedItem: { flexDirection: 'row', gap: 10 },
  timelineCol: { alignItems: 'center', paddingTop: 6 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginBottom: 4 },
  timelineLine: { width: 2, flex: 1, borderRadius: 1, minHeight: 16 },
  feedContent: {
    flex: 1, borderRadius: 14, padding: 10,
  },
  feedHeader: { flexDirection: 'row', alignItems: 'center' },
  feedIcon: { fontSize: 20 },
  feedTitle: { fontSize: 13, fontWeight: '800' },
  feedDesc: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  feedTime: { fontSize: 11, fontWeight: '700' },
  messageBanner: {
    borderRadius: 18, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 8,
  },
  messageBannerLeft: { flexDirection: 'row', alignItems: 'center' },
  messageBannerTitle: { color: '#fff', fontWeight: '800', fontSize: 14 },
  messageBannerSub: { color: 'rgba(255,255,255,0.75)', fontWeight: '600', fontSize: 12, marginTop: 1 },
  messageBadge: {
    backgroundColor: COLORS.accent, width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  messageBadgeText: { color: '#fff', fontSize: 12, fontWeight: '900' },
});
