import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLang } from '../../src/contexts/LangContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { COLORS, getTheme } from '../../src/constants/colors';
import Card from '../../src/components/common/Card';
import Header from '../../src/components/common/Header';
import Badge from '../../src/components/common/Badge';
import Avatar from '../../src/components/common/Avatar';
import { CHILDREN, TODAY_ACTIVITIES } from '../../src/data/mockData';

const MEAL_ICONS = { breakfast: '🌅', morningSnack: '🍎', lunch: '☀️', afternoonSnack: '🍪' };
const MEAL_LABELS_EN = { breakfast: 'Breakfast', morningSnack: 'Morning Snack', lunch: 'Lunch', afternoonSnack: 'Afternoon Snack' };

function MealBar({ portion, color }) {
  const pct = portion === 'all' ? 100 : portion === 'most' ? 75 : portion === 'some' ? 40 : 0;
  const label = portion === 'all' ? 'All eaten' : portion === 'most' ? 'Most eaten' : portion === 'some' ? 'Some eaten' : 'Not eaten';
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: 11, fontWeight: '600', color: '#6b7280' }}>{label}</Text>
        <Text style={{ fontSize: 11, fontWeight: '800', color }}>{pct}%</Text>
      </View>
      <View style={{ height: 8, backgroundColor: color + '22', borderRadius: 6, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: 6 }} />
      </View>
    </View>
  );
}

function WellnessBar({ label, value, color }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#4b5563' }}>{label}</Text>
        <Text style={{ fontSize: 13, fontWeight: '900', color }}>{value}%</Text>
      </View>
      <View style={{ height: 10, backgroundColor: color + '22', borderRadius: 6, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${value}%`, backgroundColor: color, borderRadius: 6 }} />
      </View>
    </View>
  );
}

export default function ReportsScreen() {
  const { t } = useLang();
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  const insets = useSafeAreaInsets();
  const child = CHILDREN[0];

  const completedActs = TODAY_ACTIVITIES.filter(a => a.completed);
  const upcomingActs = TODAY_ACTIVITIES.filter(a => !a.completed);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header title={t('dailyReport')} subtitle={child.name + ' · Today'} />
      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>

        {/* Date & Overview */}
        <View style={[styles.dateBanner, { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary + '44' }]}>
          <Ionicons name="calendar" size={18} color={COLORS.primary} />
          <Text style={[styles.dateText, { color: COLORS.primaryDark }]}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          <Badge label="Today" type="primary" />
        </View>

        {/* Meals */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>🍽 {t('mealsToday')}</Text>
          {Object.entries(child.meals).map(([mealKey, portion]) => (
            <View key={mealKey} style={styles.mealItem}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealIcon}>{MEAL_ICONS[mealKey]}</Text>
                <Text style={[styles.mealName, { color: theme.text }]}>{MEAL_LABELS_EN[mealKey]}</Text>
              </View>
              <MealBar
                portion={portion}
                color={
                  portion === 'all' ? COLORS.success
                  : portion === 'most' ? COLORS.teacher
                  : portion === 'some' ? COLORS.warning
                  : COLORS.error
                }
              />
            </View>
          ))}
        </Card>

        {/* Nap / Sleep */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>😴 {t('napTime')}</Text>
          {child.sleepDuration ? (
            <View style={styles.napRow}>
              <View style={[styles.napBox, { backgroundColor: COLORS.purpleLight }]}>
                <Ionicons name="moon" size={20} color="#8b5cf6" />
                <Text style={styles.napBoxLabel}>Fell asleep</Text>
                <Text style={styles.napBoxValue}>{child.sleepStart}</Text>
              </View>
              <View style={[styles.napBox, { backgroundColor: COLORS.amberLight }]}>
                <Ionicons name="sunny" size={20} color="#f59e0b" />
                <Text style={styles.napBoxLabel}>Woke up</Text>
                <Text style={styles.napBoxValue}>{child.sleepEnd}</Text>
              </View>
              <View style={[styles.napBox, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="time" size={20} color={COLORS.primary} />
                <Text style={styles.napBoxLabel}>Duration</Text>
                <Text style={styles.napBoxValue}>{child.sleepDuration}</Text>
              </View>
            </View>
          ) : (
            <Text style={{ color: theme.textMuted, fontStyle: 'italic', fontSize: 13 }}>No nap recorded today.</Text>
          )}
        </Card>

        {/* Wellness */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>📊 {t('wellnessTitle')}</Text>
          <WellnessBar label={t('eating')} value={child.wellness.eating} color={COLORS.primary} />
          <WellnessBar label={t('sleeping')} value={child.wellness.sleeping} color={COLORS.teacher} />
          <WellnessBar label={t('socializing')} value={child.wellness.socializing} color={COLORS.accent} />
          <WellnessBar label={t('learning')} value={child.wellness.learning} color={COLORS.success} />
        </Card>

        {/* Teacher's Note */}
        <Card style={{ backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary + '44' }}>
          <View style={styles.noteHeader}>
            <Avatar name={child.teacherName} emoji="👩‍🏫" size={40} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.noteName, { color: COLORS.primaryDark }]}>{child.teacherName}</Text>
              <Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: '600' }}>✏️ {t('teacherNote')}</Text>
            </View>
          </View>
          <Text style={[styles.noteText, { color: COLORS.primaryDark }]}>"{child.teacherNote || 'No note added yet for today.'}"</Text>
        </Card>

        {/* Activities */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>🌟 {t('activitiesTitle')}</Text>

          <Text style={[styles.subsectionLabel, { color: theme.textMuted }]}>
            ✅ {t('completed')} ({completedActs.length})
          </Text>
          {completedActs.map((act, i) => (
            <View key={act.id} style={[styles.actRow, { borderBottomColor: theme.border, borderBottomWidth: i < completedActs.length - 1 ? 1 : 0 }]}>
              <View style={[styles.actIcon, { backgroundColor: act.color + '22' }]}>
                <Text style={{ fontSize: 16 }}>{act.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actTitle, { color: theme.text }]}>{act.title}</Text>
                <Text style={[styles.actDesc, { color: theme.textMuted }]}>{act.desc}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 3 }}>
                <Text style={[styles.actTime, { color: theme.textMuted }]}>{act.time}</Text>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              </View>
            </View>
          ))}

          <Text style={[styles.subsectionLabel, { color: theme.textMuted, marginTop: 16 }]}>
            ⏳ {t('upcoming')} ({upcomingActs.length})
          </Text>
          {upcomingActs.map((act, i) => (
            <View key={act.id} style={[styles.actRow, { borderBottomColor: theme.border, borderBottomWidth: i < upcomingActs.length - 1 ? 1 : 0, opacity: 0.7 }]}>
              <View style={[styles.actIcon, { backgroundColor: theme.cardAlt }]}>
                <Text style={{ fontSize: 16 }}>{act.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actTitle, { color: theme.text }]}>{act.title}</Text>
                <Text style={[styles.actDesc, { color: theme.textMuted }]}>{act.desc}</Text>
              </View>
              <Text style={[styles.actTime, { color: theme.textMuted }]}>{act.time}</Text>
            </View>
          ))}
        </Card>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  dateBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 14, marginBottom: 14, borderWidth: 1,
  },
  dateText: { flex: 1, fontSize: 13, fontWeight: '700' },
  sectionTitle: { fontSize: 15, fontWeight: '900', marginBottom: 14 },
  subsectionLabel: { fontSize: 12, fontWeight: '700', marginBottom: 10 },
  mealItem: { marginBottom: 14 },
  mealHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  mealIcon: { fontSize: 18 },
  mealName: { fontSize: 14, fontWeight: '800' },
  napRow: { flexDirection: 'row', gap: 8 },
  napBox: { flex: 1, padding: 12, borderRadius: 14, alignItems: 'center', gap: 4 },
  napBoxLabel: { fontSize: 10, fontWeight: '600', color: '#6b7280', textAlign: 'center' },
  napBoxValue: { fontSize: 13, fontWeight: '900', color: '#1a1a2e' },
  noteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  noteName: { fontSize: 13, fontWeight: '900' },
  noteText: { fontSize: 13, fontWeight: '600', lineHeight: 20, fontStyle: 'italic' },
  actRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  actIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actTitle: { fontSize: 13, fontWeight: '800' },
  actDesc: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  actTime: { fontSize: 10, fontWeight: '600' },
});
