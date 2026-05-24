import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
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
import { ADMIN_STATS, WEEKLY_ATTENDANCE, CHILDREN, INVOICES } from '../../src/data/mockData';

const { width } = Dimensions.get('window');
const BAR_MAX_H = 80;

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const theme = getTheme(isDark);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const maxPresent = Math.max(...WEEKLY_ATTENDANCE.map(d => d.present));
  const overdueCount = INVOICES.filter(i => i.status === 'overdue').length;

  const quickStats = [
    { label: t('totalChildren'), value: ADMIN_STATS.totalChildren, icon: 'people', color: COLORS.primary, route: '/(admin)/children' },
    { label: t('totalStaff'), value: ADMIN_STATS.totalStaff, icon: 'person', color: COLORS.teacher, route: '/(admin)/staff' },
    { label: t('attendanceRate'), value: ADMIN_STATS.attendanceRate + '%', icon: 'checkmark-circle', color: COLORS.success, route: '/(admin)/reports' },
    { label: t('monthlyRevenue'), value: '$' + (ADMIN_STATS.monthlyRevenue / 1000).toFixed(1) + 'k', icon: 'cash', color: COLORS.accent, route: '/(admin)/billing' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={[COLORS.admin, '#6d28d9']}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Admin Dashboard</Text>
            <Text style={styles.name}>{user?.name} 👩‍💼</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>
          <View style={styles.headerBtns}>
            <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { position: 'relative' }]}>
              <Ionicons name="notifications" size={18} color="#fff" />
              {overdueCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{overdueCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={styles.iconBtn}>
              <Ionicons name="log-out-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's snapshot */}
        <View style={styles.snapshot}>
          <View style={styles.snapshotItem}>
            <Text style={styles.snapshotNum}>{ADMIN_STATS.presentToday}</Text>
            <Text style={styles.snapshotLabel}>Present</Text>
          </View>
          <View style={styles.snapshotDivider} />
          <View style={styles.snapshotItem}>
            <Text style={styles.snapshotNum}>{ADMIN_STATS.absentToday}</Text>
            <Text style={styles.snapshotLabel}>Absent</Text>
          </View>
          <View style={styles.snapshotDivider} />
          <View style={styles.snapshotItem}>
            <Text style={styles.snapshotNum}>{ADMIN_STATS.staffOnDuty || 5}</Text>
            <Text style={styles.snapshotLabel}>Staff On Duty</Text>
          </View>
          <View style={styles.snapshotDivider} />
          <View style={styles.snapshotItem}>
            <Text style={[styles.snapshotNum, { color: overdueCount > 0 ? '#fde68a' : '#fff' }]}>
              {overdueCount}
            </Text>
            <Text style={styles.snapshotLabel}>Overdue Bills</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Stat cards */}
        <View style={styles.statsGrid}>
          {quickStats.map((stat, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => router.push(stat.route)}
              style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon} size={20} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.textMuted }]} numberOfLines={2}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weekly attendance chart */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>📊 Weekly Attendance</Text>
          <View style={styles.barChart}>
            {WEEKLY_ATTENDANCE.map((day, i) => {
              const h = (day.present / maxPresent) * BAR_MAX_H;
              return (
                <View key={i} style={styles.barGroup}>
                  <Text style={[styles.barValue, { color: COLORS.primary }]}>{day.present}</Text>
                  <View style={[styles.barTrack, { height: BAR_MAX_H }]}>
                    <View style={[styles.bar, { height: h, backgroundColor: COLORS.primary }]} />
                    <View style={[styles.bar, { height: (day.absent / maxPresent) * BAR_MAX_H, backgroundColor: COLORS.error + '66' }]} />
                  </View>
                  <Text style={[styles.barLabel, { color: theme.textMuted }]}>{day.day}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
              <Text style={[styles.legendText, { color: theme.textMuted }]}>Present</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.error + '66' }]} />
              <Text style={[styles.legendText, { color: theme.textMuted }]}>Absent</Text>
            </View>
          </View>
        </Card>

        {/* Recent children */}
        <Card>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>👶 Today's Roster</Text>
            <TouchableOpacity onPress={() => router.push('/(admin)/children')}>
              <Text style={[styles.viewAll, { color: COLORS.admin }]}>View All →</Text>
            </TouchableOpacity>
          </View>
          {CHILDREN.slice(0, 4).map((child, i) => (
            <View key={child.id} style={[styles.childRow, { borderBottomColor: theme.border, borderBottomWidth: i < 3 ? 1 : 0 }]}>
              <Text style={{ fontSize: 22, marginRight: 10 }}>{child.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.childName, { color: theme.text }]}>{child.name}</Text>
                <Text style={[styles.childInfo, { color: theme.textMuted }]}>{child.room} {child.roomEmoji} · {child.age} yrs</Text>
              </View>
              <Badge
                label={child.status === 'checked_in' ? '● In' : child.status === 'absent' ? '● Absent' : '● Out'}
                type={child.status === 'checked_in' ? 'success' : child.status === 'absent' ? 'error' : 'info'}
              />
            </View>
          ))}
        </Card>

        {/* Pending actions */}
        {overdueCount > 0 && (
          <TouchableOpacity
            onPress={() => router.push('/(admin)/billing')}
            style={[styles.alertBanner, { backgroundColor: COLORS.errorLight, borderColor: COLORS.error + '44' }]}
          >
            <Ionicons name="alert-circle" size={20} color={COLORS.error} />
            <Text style={[styles.alertText, { color: COLORS.error }]}>
              {overdueCount} overdue invoice{overdueCount > 1 ? 's' : ''} need attention
            </Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.error} />
          </TouchableOpacity>
        )}

        {/* Quick links */}
        <View style={styles.quickLinks}>
          {[
            { icon: 'person-add', label: 'Add Child', color: COLORS.primary, route: '/(admin)/children' },
            { icon: 'person-circle', label: 'Add Staff', color: COLORS.teacher, route: '/(admin)/staff' },
            { icon: 'document-text', label: 'Reports', color: COLORS.admin, route: '/(admin)/reports' },
            { icon: 'cash', label: 'Billing', color: COLORS.accent, route: '/(admin)/billing' },
          ].map((link, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => router.push(link.route)}
              style={[styles.quickLink, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View style={[styles.quickIcon, { backgroundColor: link.color + '20' }]}>
                <Ionicons name={link.icon} size={20} color={link.color} />
              </View>
              <Text style={[styles.quickLabel, { color: theme.text }]}>{link.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 28 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
  name: { color: '#fff', fontSize: 20, fontWeight: '900', marginVertical: 2 },
  date: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },
  headerBtns: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: -3, right: -3, width: 14, height: 14,
    backgroundColor: COLORS.accent, borderRadius: 7, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  snapshot: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center',
  },
  snapshotItem: { flex: 1, alignItems: 'center' },
  snapshotNum: { color: '#fff', fontSize: 20, fontWeight: '900' },
  snapshotLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: '700', textAlign: 'center', marginTop: 2 },
  snapshotDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.3)' },
  content: { padding: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  statCard: {
    width: '47%', padding: 14, borderRadius: 16, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 22, fontWeight: '900', marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '900', marginBottom: 14 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  viewAll: { fontSize: 13, fontWeight: '700' },
  barChart: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', marginBottom: 12 },
  barGroup: { flex: 1, alignItems: 'center', gap: 4 },
  barValue: { fontSize: 10, fontWeight: '800' },
  barTrack: { width: '100%', justifyContent: 'flex-end', gap: 2 },
  bar: { width: '100%', borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 11, fontWeight: '700' },
  chartLegend: { flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, fontWeight: '600' },
  childRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  childName: { fontSize: 13, fontWeight: '800' },
  childInfo: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  alertBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 14,
  },
  alertText: { flex: 1, fontSize: 13, fontWeight: '700' },
  quickLinks: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  quickLink: {
    flex: 1, alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1, gap: 6,
  },
  quickIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 11, fontWeight: '800', textAlign: 'center' },
});
