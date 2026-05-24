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
import { CHILDREN, TODAY_ACTIVITIES, NOTICES, THIS_WEEK } from '../../src/data/mockData';

function getGreeting(t) {
  const h = new Date().getHours();
  if (h < 12) return t('goodMorning');
  if (h < 17) return t('goodAfternoon');
  return t('goodEvening');
}

export default function ParentHome() {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const theme = getTheme(isDark);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const child = CHILDREN[0]; // For demo: first child belongs to parent@demo.com
  const completedActivities = TODAY_ACTIVITIES.filter(a => a.completed).length;

  const quickActions = [
    { icon: 'person', label: t('childProfile'), color: COLORS.primary, route: '/(parent)/profile' },
    { icon: 'document-text', label: t('dailyReport'), color: COLORS.teacher, route: '/(parent)/reports' },
    { icon: 'images', label: t('photos'), color: COLORS.accent, route: '/(parent)/photos' },
    { icon: 'trending-up', label: t('growth'), color: COLORS.admin, route: '/(parent)/growth' },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBadge}>
              <Text style={{ fontSize: 22 }}>⭐</Text>
            </View>
            <View>
              <Text style={styles.appNameSmall}>MINI STAR</Text>
              <View style={styles.childcarePill}>
                <Text style={styles.childcareText}>CHILDCARE</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications" size={18} color="#fff" />
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={styles.iconBtn}>
              <Ionicons name="log-out-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.greeting}>{getGreeting(t)}, {user?.name?.split(' ')[0]} 👋</Text>

        {/* Child Status Card */}
        <View style={styles.childCard}>
          <View style={styles.childCardLeft}>
            <Avatar name={child.name} emoji={child.emoji} size={52} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.childName}>{child.name}</Text>
              <Text style={styles.childSub}>{child.age} yrs · {child.room} {child.roomEmoji}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 }}>
                <Badge
                  label={child.status === 'checked_in' ? '✅ ' + t('checkedIn') : child.status === 'absent' ? t('absent') : t('checkedOut')}
                  type={child.status === 'checked_in' ? 'success' : child.status === 'absent' ? 'error' : 'info'}
                />
                {child.checkinTime && <Text style={styles.timeText}>{child.checkinTime}</Text>}
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/(parent)/profile')} style={styles.arrowBtn}>
            <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Today's Stats */}
        <View style={styles.statsRow}>
          {[
            { icon: '😄', label: t('moodToday'), value: child.moodEmoji + ' ' + child.mood, color: '#10b981' },
            { icon: '😴', label: t('napTime'), value: child.sleepDuration || '—', color: '#8b5cf6' },
            { icon: '🍽', label: t('mealsToday'), value: '3 meals', color: '#f59e0b' },
            { icon: '🚗', label: t('pickupTime'), value: '5:00 PM', color: '#3b82f6' },
          ].map((stat, i) => (
            <View key={i} style={[styles.statBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: theme.text }]} numberOfLines={1}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]} numberOfLines={1}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Notices */}
        {NOTICES.slice(0, 1).map(n => (
          <TouchableOpacity key={n.id} style={[styles.noticeBanner, { backgroundColor: n.lightColor, borderLeftColor: n.color }]}>
            <Text style={styles.noticeIcon}>{n.icon}</Text>
            <Text style={[styles.noticeText, { color: n.color }]} numberOfLines={2}>{n.text}</Text>
          </TouchableOpacity>
        ))}

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('quickActions')}</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((a, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => router.push(a.route)}
              style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View style={[styles.actionIcon, { backgroundColor: a.color + '22' }]}>
                <Ionicons name={a.icon} size={22} color={a.color} />
              </View>
              <Text style={[styles.actionLabel, { color: theme.text }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* This Week */}
        <Card style={{ marginBottom: 14 }}>
          <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>
            📅 {t('upcomingWeek')}
          </Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {THIS_WEEK.map((day, i) => (
              <View
                key={i}
                style={[
                  styles.weekDay,
                  {
                    backgroundColor: i === 0 ? COLORS.primaryLight : theme.cardAlt,
                    borderColor: i === 0 ? COLORS.primary : theme.border,
                    borderWidth: i === 0 ? 2 : 1,
                  },
                ]}
              >
                <Text style={[styles.weekDayName, { color: i === 0 ? COLORS.primary : theme.textMuted }]}>
                  {day.day}
                </Text>
                <Text style={[styles.weekDayNum, { color: i === 0 ? COLORS.primary : theme.text }]}>
                  {day.date}
                </Text>
                <Text style={[styles.weekDayEvent, { color: theme.textMuted }]} numberOfLines={2}>
                  {day.event}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Today's Activities Preview */}
        <Card>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>🌟 {t('activitiesTitle')}</Text>
            <Text style={[styles.sectionSub, { color: theme.textMuted }]}>
              {completedActivities}/{TODAY_ACTIVITIES.length}
            </Text>
          </View>
          {TODAY_ACTIVITIES.slice(0, 4).map((act, i) => (
            <View key={act.id} style={[styles.activityRow, { borderBottomColor: theme.border, borderBottomWidth: i < 3 ? 1 : 0 }]}>
              <View style={[styles.activityIcon, { backgroundColor: act.color + '22' }]}>
                <Text style={{ fontSize: 16 }}>{act.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.activityTitle, { color: theme.text }]}>{act.title}</Text>
                <Text style={[styles.activityDesc, { color: theme.textMuted }]}>{act.desc}</Text>
              </View>
              <View style={styles.activityRight}>
                <Text style={[styles.activityTime, { color: theme.textMuted }]}>{act.time}</Text>
                {act.completed && <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />}
              </View>
            </View>
          ))}
          <TouchableOpacity
            onPress={() => router.push('/(parent)/reports')}
            style={[styles.viewMoreBtn, { borderColor: COLORS.primary }]}
          >
            <Text style={[styles.viewMoreText, { color: COLORS.primary }]}>View Full Report →</Text>
          </TouchableOpacity>
        </Card>

        {/* Teacher Note */}
        <Card style={[styles.teacherNoteCard, { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary + '44' }]}>
          <View style={styles.teacherNoteHeader}>
            <Avatar name={child.teacherName} emoji="👩‍🏫" size={36} />
            <View style={{ marginLeft: 10 }}>
              <Text style={[styles.teacherName, { color: COLORS.primaryDark }]}>{child.teacherName}</Text>
              <Text style={[styles.teacherSub, { color: COLORS.primary }]}>✏️ Today's Note</Text>
            </View>
          </View>
          <Text style={[styles.teacherNoteText, { color: COLORS.primaryDark }]}>
            "{child.teacherNote}"
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 28 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBadge: {
    width: 42, height: 42, backgroundColor: '#fff', borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  appNameSmall: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  childcarePill: {
    backgroundColor: COLORS.accent, paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 5, alignSelf: 'flex-start', marginTop: 2,
  },
  childcareText: { color: '#fff', fontSize: 8, fontWeight: '900', letterSpacing: 2 },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute', top: 6, right: 6,
    width: 7, height: 7, backgroundColor: COLORS.accent, borderRadius: 4,
  },
  greeting: { color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: '700', marginBottom: 14 },
  childCard: {
    backgroundColor: '#fff', borderRadius: 18, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  childCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  childName: { fontSize: 16, fontWeight: '900', color: '#1a1a2e' },
  childSub: { fontSize: 12, color: '#6b7280', fontWeight: '600', marginTop: 2 },
  timeText: { fontSize: 11, color: '#6b7280', fontWeight: '600' },
  arrowBtn: {
    width: 32, height: 32, backgroundColor: COLORS.primaryLight,
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
  },
  content: { padding: 16 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statBox: {
    flex: 1, borderRadius: 14, padding: 11, borderWidth: 1, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05,
    shadowRadius: 4, elevation: 2,
  },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: { fontSize: 11, fontWeight: '900', textAlign: 'center' },
  statLabel: { fontSize: 9, fontWeight: '600', textAlign: 'center', marginTop: 2 },
  noticeBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12,
    borderRadius: 14, marginBottom: 14, borderLeftWidth: 4,
  },
  noticeIcon: { fontSize: 18 },
  noticeText: { flex: 1, fontSize: 12, fontWeight: '700', lineHeight: 17 },
  sectionTitle: { fontSize: 15, fontWeight: '900', marginBottom: 12 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionSub: { fontSize: 12, fontWeight: '700' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  actionBtn: {
    width: '47%', padding: 14, borderRadius: 16, borderWidth: 1,
    alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  actionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 12, fontWeight: '800', textAlign: 'center' },
  weekDay: { flex: 1, alignItems: 'center', padding: 8, borderRadius: 12 },
  weekDayName: { fontSize: 10, fontWeight: '700' },
  weekDayNum: { fontSize: 16, fontWeight: '900', marginVertical: 2 },
  weekDayEvent: { fontSize: 8, fontWeight: '600', textAlign: 'center', lineHeight: 11 },
  activityRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10,
  },
  activityIcon: {
    width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center',
  },
  activityTitle: { fontSize: 13, fontWeight: '800' },
  activityDesc: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  activityRight: { alignItems: 'flex-end', gap: 3 },
  activityTime: { fontSize: 10, fontWeight: '600' },
  viewMoreBtn: {
    borderWidth: 1.5, borderRadius: 12, paddingVertical: 9,
    alignItems: 'center', marginTop: 10,
  },
  viewMoreText: { fontSize: 13, fontWeight: '800' },
  teacherNoteCard: { borderWidth: 1, borderRadius: 18, padding: 14 },
  teacherNoteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  teacherName: { fontSize: 13, fontWeight: '900' },
  teacherSub: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  teacherNoteText: { fontSize: 13, fontWeight: '600', lineHeight: 20, fontStyle: 'italic' },
});
