import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLang } from '../../src/contexts/LangContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { COLORS, getTheme } from '../../src/constants/colors';
import Card from '../../src/components/common/Card';
import Badge from '../../src/components/common/Badge';
import Avatar from '../../src/components/common/Avatar';
import { CHILDREN } from '../../src/data/mockData';

export default function ChildProfileScreen() {
  const { t } = useLang();
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const child = CHILDREN[0];

  function InfoRow({ icon, label, value, color }) {
    return (
      <View style={styles.infoRow}>
        <View style={[styles.infoIcon, { backgroundColor: (color || COLORS.primary) + '20' }]}>
          <Ionicons name={icon} size={16} color={color || COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.infoLabel, { color: theme.textMuted }]}>{label}</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerNav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('childProfile')}</Text>
          <TouchableOpacity style={styles.backBtn}>
            <Ionicons name="create-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.childHero}>
          <Avatar name={child.name} emoji={child.emoji} size={80} />
          <Text style={styles.heroName}>{child.name}</Text>
          <Text style={styles.heroSub}>{child.age} {t('years')} · {child.room} {child.roomEmoji}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
            <Badge
              label={child.status === 'checked_in' ? '✅ ' + t('checkedIn') : t('absent')}
              type={child.status === 'checked_in' ? 'success' : 'error'}
            />
            {child.allergyAlert && (
              <Badge label="⚠️ Allergy Alert" type="error" />
            )}
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Basic Info */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {t('childInfo')}
          </Text>
          <InfoRow icon="person-outline" label={t('name')} value={child.name} />
          <InfoRow icon="calendar-outline" label={t('dateOfBirth')} value={child.dob} />
          <InfoRow icon="home-outline" label={t('classRoom')} value={`${child.room} ${child.roomEmoji}`} />
          <InfoRow icon="time-outline" label={t('enrollmentDate')} value={child.enrollDate} />
          <InfoRow icon="school-outline" label={t('teacherAssigned')} value={child.teacherName} color={COLORS.teacher} />
        </Card>

        {/* Allergies */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            ⚠️ {t('allergies')}
          </Text>
          {child.allergies.length > 0 ? (
            <View style={styles.allergyList}>
              {child.allergies.map((a, i) => (
                <View key={i} style={[styles.allergyTag, { backgroundColor: COLORS.errorLight }]}>
                  <Ionicons name="warning" size={12} color={COLORS.error} />
                  <Text style={[styles.allergyText, { color: COLORS.error }]}>{a}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.noData, { color: theme.textMuted }]}>{t('noAllergies')}</Text>
          )}
          {child.medicalNotes ? (
            <View style={[styles.medicalNote, { backgroundColor: COLORS.warningLight }]}>
              <Text style={[styles.medicalNoteLabel, { color: '#92400e' }]}>📋 {t('medicalNotes')}</Text>
              <Text style={[styles.medicalNoteText, { color: '#78350f' }]}>{child.medicalNotes}</Text>
            </View>
          ) : null}
        </Card>

        {/* Emergency Contacts */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            📞 {t('emergencyContacts')}
          </Text>
          {[
            { name: child.parentName, relation: 'Mother / Legal Guardian', phone: child.parentPhone, primary: true },
            { name: child.emergencyContact.split(' — ')[0], relation: 'Emergency Contact', phone: child.emergencyContact.split(' — ')[1], primary: false },
          ].map((contact, i) => (
            <View
              key={i}
              style={[styles.contactCard, { backgroundColor: i === 0 ? COLORS.primaryLight : theme.cardAlt, borderColor: i === 0 ? COLORS.primary + '44' : theme.border }]}
            >
              <Avatar name={contact.name} size={42} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.contactName, { color: theme.text }]}>{contact.name}</Text>
                  {contact.primary && <Badge label="Primary" type="primary" size="xs" />}
                </View>
                <Text style={[styles.contactRelation, { color: theme.textMuted }]}>{contact.relation}</Text>
                <Text style={[styles.contactPhone, { color: COLORS.primary }]}>{contact.phone}</Text>
              </View>
              <TouchableOpacity
                onPress={() => Alert.alert('Call', `Call ${contact.name}?`)}
                style={[styles.callBtn, { backgroundColor: COLORS.primary }]}
              >
                <Ionicons name="call" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </Card>

        {/* Today's Status */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>📊 Today's Status</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusItem, { backgroundColor: COLORS.successLight }]}>
              <Text style={styles.statusEmoji}>✅</Text>
              <Text style={[styles.statusLabel, { color: '#065f46' }]}>{t('checkedIn')}</Text>
              <Text style={[styles.statusValue, { color: '#065f46' }]}>{child.checkinTime || '—'}</Text>
            </View>
            <View style={[styles.statusItem, { backgroundColor: COLORS.purpleLight }]}>
              <Text style={styles.statusEmoji}>😴</Text>
              <Text style={[styles.statusLabel, { color: '#4c1d95' }]}>{t('napTime')}</Text>
              <Text style={[styles.statusValue, { color: '#4c1d95' }]}>{child.sleepDuration || '—'}</Text>
            </View>
            <View style={[styles.statusItem, { backgroundColor: COLORS.amberLight }]}>
              <Text style={styles.statusEmoji}>😄</Text>
              <Text style={[styles.statusLabel, { color: '#78350f' }]}>{t('moodToday')}</Text>
              <Text style={[styles.statusValue, { color: '#78350f' }]}>{child.mood}</Text>
            </View>
          </View>
        </Card>

        {/* Growth link */}
        <TouchableOpacity
          onPress={() => router.push('/(parent)/growth')}
          style={[styles.growthLink, { backgroundColor: COLORS.adminLight, borderColor: COLORS.admin + '44' }]}
        >
          <View style={[styles.growthIcon, { backgroundColor: COLORS.admin + '22' }]}>
            <Ionicons name="trending-up" size={22} color={COLORS.admin} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.growthTitle, { color: COLORS.admin }]}>{t('growthTitle')}</Text>
            <Text style={[styles.growthSub, { color: COLORS.admin + 'aa' }]}>
              Height, weight & vaccination records
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.admin} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: 32, paddingHorizontal: 20 },
  headerNav: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  backBtn: {
    width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '900' },
  childHero: { alignItems: 'center' },
  heroName: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 12 },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', marginTop: 3 },
  content: { padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '900', marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  infoIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: 11, fontWeight: '600', marginBottom: 1 },
  infoValue: { fontSize: 14, fontWeight: '700' },
  allergyList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  allergyTag: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  allergyText: { fontSize: 13, fontWeight: '800' },
  noData: { fontSize: 13, fontWeight: '600', fontStyle: 'italic' },
  medicalNote: { padding: 12, borderRadius: 12, marginTop: 8 },
  medicalNoteLabel: { fontSize: 11, fontWeight: '800', marginBottom: 4 },
  medicalNoteText: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  contactCard: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    borderRadius: 14, marginBottom: 10, borderWidth: 1,
  },
  contactName: { fontSize: 14, fontWeight: '800' },
  contactRelation: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  contactPhone: { fontSize: 13, fontWeight: '700', marginTop: 3 },
  callBtn: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  statusRow: { flexDirection: 'row', gap: 10 },
  statusItem: {
    flex: 1, padding: 12, borderRadius: 14, alignItems: 'center',
  },
  statusEmoji: { fontSize: 22, marginBottom: 4 },
  statusLabel: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  statusValue: { fontSize: 12, fontWeight: '900', textAlign: 'center', marginTop: 2 },
  growthLink: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 8,
  },
  growthIcon: {
    width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center',
  },
  growthTitle: { fontSize: 14, fontWeight: '900' },
  growthSub: { fontSize: 11, fontWeight: '600', marginTop: 2 },
});
