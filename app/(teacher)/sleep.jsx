import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../src/contexts/LangContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { COLORS, getTheme } from '../../src/constants/colors';
import Header from '../../src/components/common/Header';
import Avatar from '../../src/components/common/Avatar';
import Badge from '../../src/components/common/Badge';
import { CHILDREN } from '../../src/data/mockData';

function getDuration(start, end) {
  if (!start || !end) return null;
  const toMin = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const diff = toMin(end) - toMin(start);
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}h ${m}m`;
}

export default function SleepScreen() {
  const { t } = useLang();
  const { isDark } = useTheme();
  const theme = getTheme(isDark);

  const [sleepLogs, setSleepLogs] = useState(
    Object.fromEntries(
      CHILDREN.map(c => [c.id, { sleeping: false, start: c.sleepStart, end: c.sleepEnd }])
    )
  );

  const startSleep = (id) => {
    const now = new Date();
    const t24 = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setSleepLogs(prev => ({ ...prev, [id]: { sleeping: true, start: t24, end: null } }));
  };

  const endSleep = (id) => {
    const now = new Date();
    const t24 = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setSleepLogs(prev => ({ ...prev, [id]: { ...prev[id], sleeping: false, end: t24 } }));
  };

  const format12 = (t24) => {
    if (!t24) return null;
    const [h, m] = t24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const currentlySleeping = Object.values(sleepLogs).filter(s => s.sleeping).length;
  const completed = Object.values(sleepLogs).filter(s => s.start && s.end).length;

  const presentChildren = CHILDREN.filter(c => c.status !== 'absent');

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header title={t('sleepTitle')} />

      {/* Summary */}
      <View style={[styles.summary, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={[styles.summaryItem, { backgroundColor: COLORS.purpleLight }]}>
          <Text style={[styles.summaryNum, { color: '#4c1d95' }]}>{currentlySleeping}</Text>
          <Text style={[styles.summaryLbl, { color: '#6d28d9' }]}>Sleeping Now</Text>
        </View>
        <View style={[styles.summaryItem, { backgroundColor: COLORS.successLight }]}>
          <Text style={[styles.summaryNum, { color: '#065f46' }]}>{completed}</Text>
          <Text style={[styles.summaryLbl, { color: '#059669' }]}>Completed</Text>
        </View>
        <View style={[styles.summaryItem, { backgroundColor: COLORS.amberLight }]}>
          <Text style={[styles.summaryNum, { color: '#78350f' }]}>
            {presentChildren.length - currentlySleeping - completed}
          </Text>
          <Text style={[styles.summaryLbl, { color: '#92400e' }]}>Not Logged</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {presentChildren.map((child) => {
          const log = sleepLogs[child.id];
          const duration = getDuration(log.start, log.end);
          return (
            <View
              key={child.id}
              style={[
                styles.childCard,
                {
                  backgroundColor: log.sleeping
                    ? COLORS.purpleLight
                    : duration
                    ? COLORS.successLight
                    : theme.card,
                  borderColor: log.sleeping
                    ? '#8b5cf6'
                    : duration
                    ? COLORS.success
                    : theme.border,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <Avatar name={child.name} emoji={child.emoji} size={44} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.childName, { color: theme.text }]}>{child.name}</Text>
                  <Text style={[styles.childInfo, { color: theme.textMuted }]}>
                    {child.age} yrs · {child.room}
                  </Text>
                  <View style={styles.timesRow}>
                    {log.start && (
                      <View style={styles.timeChip}>
                        <Ionicons name="moon" size={11} color="#8b5cf6" />
                        <Text style={[styles.timeText, { color: '#8b5cf6' }]}>
                          {format12(log.start)}
                        </Text>
                      </View>
                    )}
                    {log.end && (
                      <View style={styles.timeChip}>
                        <Ionicons name="sunny" size={11} color="#f59e0b" />
                        <Text style={[styles.timeText, { color: '#f59e0b' }]}>
                          {format12(log.end)}
                        </Text>
                      </View>
                    )}
                    {duration && (
                      <View style={styles.timeChip}>
                        <Ionicons name="time" size={11} color={COLORS.success} />
                        <Text style={[styles.timeText, { color: COLORS.success }]}>{duration}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  {log.sleeping ? (
                    <Badge label="😴 Sleeping" type="purple" />
                  ) : duration ? (
                    <Badge label="✅ Done" type="success" />
                  ) : (
                    <Badge label="Awake" type="gray" />
                  )}
                </View>
              </View>

              {/* Action buttons */}
              <View style={[styles.actions, { borderTopColor: log.sleeping ? '#8b5cf666' : theme.border }]}>
                {!log.sleeping && !log.end ? (
                  <TouchableOpacity
                    onPress={() => startSleep(child.id)}
                    style={[styles.actionBtn, { backgroundColor: '#8b5cf6' }]}
                  >
                    <Ionicons name="moon" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>{t('sleepStart')}</Text>
                  </TouchableOpacity>
                ) : log.sleeping ? (
                  <TouchableOpacity
                    onPress={() => endSleep(child.id)}
                    style={[styles.actionBtn, { backgroundColor: '#f59e0b' }]}
                  >
                    <Ionicons name="sunny" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>{t('sleepEnd')}</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.doneBox, { backgroundColor: COLORS.successLight }]}>
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                    <Text style={[styles.doneText, { color: COLORS.success }]}>
                      Slept {duration} ✓
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', padding: 12, gap: 8, borderBottomWidth: 1 },
  summaryItem: { flex: 1, padding: 10, borderRadius: 12, alignItems: 'center' },
  summaryNum: { fontSize: 22, fontWeight: '900' },
  summaryLbl: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  childCard: {
    borderRadius: 16, borderWidth: 1.5, marginBottom: 10, overflow: 'hidden',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 13 },
  childName: { fontSize: 14, fontWeight: '800' },
  childInfo: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  timesRow: { flexDirection: 'row', gap: 8, marginTop: 5, flexWrap: 'wrap' },
  timeChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  timeText: { fontSize: 10, fontWeight: '700' },
  actions: { padding: 10, borderTopWidth: 1 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 10, borderRadius: 12,
  },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  doneBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 10, borderRadius: 12,
  },
  doneText: { fontSize: 14, fontWeight: '800' },
});
