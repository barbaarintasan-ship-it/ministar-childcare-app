import { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../src/contexts/LangContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { COLORS, getTheme } from '../../src/constants/colors';
import Header from '../../src/components/common/Header';
import Badge from '../../src/components/common/Badge';
import Avatar from '../../src/components/common/Avatar';
import * as api from '../../src/lib/api';

export default function AttendanceScreen() {
  const { t } = useLang();
  const { isDark } = useTheme();
  const theme = getTheme(isDark);

  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    api.getChildren()
      .then(kids => {
        setChildren(kids);
        setAttendance(Object.fromEntries(kids.map(c => [c.id, { status: c.status, checkin: c.checkinTime, checkout: c.checkoutTime }])));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const setStatus = async (id, status) => {
    const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    setAttendance(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        status,
        checkin: status === 'checked_in' && !prev[id]?.checkin ? now : prev[id]?.checkin,
        checkout: status === 'checked_out' ? now : prev[id]?.checkout,
      },
    }));
    try {
      await api.updateAttendance(id, { status });
    } catch (e) {
      console.error('Attendance update failed:', e.message);
    }
  };

  const present = Object.values(attendance).filter(a => a.status === 'checked_in').length;
  const out = Object.values(attendance).filter(a => a.status === 'checked_out').length;
  const absent = Object.values(attendance).filter(a => a.status === 'absent').length;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header title={t('attendanceTitle')} />

      {/* Summary */}
      <View style={[styles.summary, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        {[
          { label: 'Present', count: present, color: COLORS.success, bg: COLORS.successLight },
          { label: 'Checked Out', count: out, color: COLORS.teacher, bg: COLORS.teacherLight },
          { label: 'Absent', count: absent, color: COLORS.error, bg: COLORS.errorLight },
          { label: 'Total', count: children.length, color: COLORS.primary, bg: COLORS.primaryLight },
        ].map((s, i) => (
          <View key={i} style={[styles.summaryItem, { backgroundColor: s.bg }]}>
            <Text style={[styles.summaryCount, { color: s.color }]}>{s.count}</Text>
            <Text style={[styles.summaryLabel, { color: s.color }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* QR Scan button */}
      <TouchableOpacity
        onPress={() => Alert.alert('QR Scanner', 'Camera QR scanner would open here.\n\nThis requires a physical device with camera access.')}
        style={[styles.qrBtn, { backgroundColor: COLORS.teacher + '15', borderColor: COLORS.teacher }]}
      >
        <Ionicons name="qr-code" size={22} color={COLORS.teacher} />
        <Text style={[styles.qrText, { color: COLORS.teacher }]}>{t('qrCheckIn')} — Scan Parent QR Code</Text>
        <Ionicons name="camera" size={18} color={COLORS.teacher} />
      </TouchableOpacity>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.teacher} />
        </View>
      ) : (
      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {children.map((child) => {
          const att = attendance[child.id] || { status: 'not_arrived', checkin: null, checkout: null };
          return (
            <View
              key={child.id}
              style={[styles.childCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View style={styles.childHeader}>
                <Avatar name={child.name} emoji={child.emoji} size={46} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.childName, { color: theme.text }]}>{child.name}</Text>
                    {child.allergyAlert && <Text style={styles.allergyWarn}>⚠️</Text>}
                  </View>
                  <Text style={[styles.childInfo, { color: theme.textMuted }]}>
                    {child.age} yrs · {child.room} {child.roomEmoji}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    {att.checkin && (
                      <View style={styles.timeChip}>
                        <Ionicons name="enter-outline" size={10} color={COLORS.success} />
                        <Text style={[styles.timeText, { color: COLORS.success }]}>{att.checkin}</Text>
                      </View>
                    )}
                    {att.checkout && (
                      <View style={styles.timeChip}>
                        <Ionicons name="exit-outline" size={10} color={COLORS.teacher} />
                        <Text style={[styles.timeText, { color: COLORS.teacher }]}>{att.checkout}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Badge
                  label={att.status === 'checked_in' ? '● In' : att.status === 'checked_out' ? '● Out' : '● Absent'}
                  type={att.status === 'checked_in' ? 'success' : att.status === 'checked_out' ? 'info' : 'error'}
                  dot={false}
                />
              </View>

              {/* Action buttons */}
              <View style={[styles.actionRow, { borderTopColor: theme.border }]}>
                <TouchableOpacity
                  onPress={() => setStatus(child.id, 'checked_in')}
                  style={[
                    styles.actionBtn,
                    { backgroundColor: att.status === 'checked_in' ? COLORS.success : COLORS.successLight },
                  ]}
                >
                  <Ionicons name="enter" size={15} color={att.status === 'checked_in' ? '#fff' : COLORS.success} />
                  <Text style={[styles.actionText, { color: att.status === 'checked_in' ? '#fff' : COLORS.success }]}>
                    {t('checkIn')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setStatus(child.id, 'checked_out')}
                  style={[
                    styles.actionBtn,
                    { backgroundColor: att.status === 'checked_out' ? COLORS.teacher : COLORS.teacherLight },
                  ]}
                >
                  <Ionicons name="exit" size={15} color={att.status === 'checked_out' ? '#fff' : COLORS.teacher} />
                  <Text style={[styles.actionText, { color: att.status === 'checked_out' ? '#fff' : COLORS.teacher }]}>
                    {t('checkOut')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setStatus(child.id, 'absent')}
                  style={[
                    styles.actionBtn,
                    { backgroundColor: att.status === 'absent' ? COLORS.error : COLORS.errorLight },
                  ]}
                >
                  <Ionicons name="close-circle" size={15} color={att.status === 'absent' ? '#fff' : COLORS.error} />
                  <Text style={[styles.actionText, { color: att.status === 'absent' ? '#fff' : COLORS.error }]}>
                    {t('markAbsent')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: 'row', padding: 12, gap: 8, borderBottomWidth: 1,
  },
  summaryItem: {
    flex: 1, padding: 10, borderRadius: 12, alignItems: 'center',
  },
  summaryCount: { fontSize: 20, fontWeight: '900' },
  summaryLabel: { fontSize: 9, fontWeight: '700', textAlign: 'center' },
  qrBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 12, padding: 12,
    borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed',
  },
  qrText: { flex: 1, fontSize: 13, fontWeight: '700' },
  childCard: {
    borderRadius: 16, borderWidth: 1, marginBottom: 10, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  childHeader: { flexDirection: 'row', alignItems: 'center', padding: 13 },
  childName: { fontSize: 14, fontWeight: '800' },
  childInfo: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  allergyWarn: { fontSize: 13 },
  timeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'transparent',
  },
  timeText: { fontSize: 10, fontWeight: '700' },
  actionRow: {
    flexDirection: 'row', gap: 6, padding: 10, borderTopWidth: 1,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 8, borderRadius: 10,
  },
  actionText: { fontSize: 11, fontWeight: '800' },
});
