import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../src/contexts/LangContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { COLORS, getTheme } from '../../src/constants/colors';
import Header from '../../src/components/common/Header';
import Card from '../../src/components/common/Card';
import Badge from '../../src/components/common/Badge';
import { GROWTH_RECORDS, VACCINATIONS } from '../../src/data/mockData';

const VACCINE_STATUS = {
  given: { type: 'success', icon: 'checkmark-circle', label: 'Given' },
  due: { type: 'warning', icon: 'time', label: 'Due Soon' },
  overdue: { type: 'error', icon: 'alert-circle', label: 'Overdue' },
};

export default function GrowthScreen() {
  const { t } = useLang();
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  const [activeTab, setActiveTab] = useState('growth');

  const latest = GROWTH_RECORDS[GROWTH_RECORDS.length - 1];
  const prev = GROWTH_RECORDS[GROWTH_RECORDS.length - 2];

  function GrowthStat({ label, value, unit, prevValue, color }) {
    const diff = prevValue ? (value - prevValue).toFixed(1) : null;
    const up = diff > 0;
    return (
      <View style={[styles.statCard, { backgroundColor: color + '22', borderColor: color + '44' }]}>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={[styles.statUnit, { color: color + 'aa' }]}>{unit}</Text>
        <Text style={[styles.statLabel, { color }]}>{label}</Text>
        {diff && (
          <View style={styles.diffRow}>
            <Ionicons name={up ? 'arrow-up' : 'arrow-down'} size={10} color={up ? COLORS.success : COLORS.error} />
            <Text style={{ fontSize: 10, fontWeight: '700', color: up ? COLORS.success : COLORS.error }}>
              {Math.abs(diff)}{unit}
            </Text>
          </View>
        )}
      </View>
    );
  }

  // Simple inline bar chart for growth
  const maxHeight = Math.max(...GROWTH_RECORDS.map(r => r.height));
  const maxWeight = Math.max(...GROWTH_RECORDS.map(r => r.weight));

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header title={t('growthTitle')} />

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        {[
          { id: 'growth', label: '📏 ' + t('growth') },
          { id: 'vaccines', label: '💉 ' + t('vaccines') },
        ].map(tab => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={[styles.tab, activeTab === tab.id && { borderBottomColor: COLORS.primary }]}
          >
            <Text style={[styles.tabText, { color: activeTab === tab.id ? COLORS.primary : theme.textMuted }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {activeTab === 'growth' ? (
          <>
            {/* Latest measurements */}
            <Card>
              <View style={styles.sectionRow}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Latest Measurements</Text>
                <Badge label={latest.age} type="primary" />
              </View>
              <View style={styles.statsRow}>
                <GrowthStat label="Height" value={latest.height} unit="cm" prevValue={prev?.height} color={COLORS.primary} />
                <GrowthStat label="Weight" value={latest.weight} unit="kg" prevValue={prev?.weight} color={COLORS.accent} />
                <GrowthStat label="Head" value={latest.headCirc} unit="cm" prevValue={prev?.headCirc} color={COLORS.admin} />
              </View>
            </Card>

            {/* Height chart */}
            <Card>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>📈 Height Progress</Text>
              <View style={styles.chart}>
                {GROWTH_RECORDS.map((r, i) => {
                  const pct = (r.height / maxHeight) * 100;
                  return (
                    <View key={i} style={styles.chartBar}>
                      <Text style={[styles.chartValue, { color: COLORS.primary }]}>{r.height}</Text>
                      <View style={styles.barContainer}>
                        <View style={[styles.bar, { height: `${pct}%`, backgroundColor: COLORS.primary, opacity: 0.7 + i * 0.1 }]} />
                      </View>
                      <Text style={[styles.chartLabel, { color: theme.textMuted }]}>{r.age}</Text>
                    </View>
                  );
                })}
              </View>
            </Card>

            {/* Weight chart */}
            <Card>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>⚖️ Weight Progress</Text>
              <View style={styles.chart}>
                {GROWTH_RECORDS.map((r, i) => {
                  const pct = (r.weight / maxWeight) * 100;
                  return (
                    <View key={i} style={styles.chartBar}>
                      <Text style={[styles.chartValue, { color: COLORS.accent }]}>{r.weight}</Text>
                      <View style={styles.barContainer}>
                        <View style={[styles.bar, { height: `${pct}%`, backgroundColor: COLORS.accent, opacity: 0.7 + i * 0.1 }]} />
                      </View>
                      <Text style={[styles.chartLabel, { color: theme.textMuted }]}>{r.age}</Text>
                    </View>
                  );
                })}
              </View>
            </Card>

            {/* History table */}
            <Card>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Measurement History</Text>
              <View style={[styles.tableHeader, { borderBottomColor: theme.border }]}>
                {['Date', 'Age', 'Height', 'Weight', 'Head'].map((h, i) => (
                  <Text key={i} style={[styles.tableHeadCell, { color: theme.textMuted, flex: i === 0 || i === 1 ? 2 : 1 }]}>{h}</Text>
                ))}
              </View>
              {[...GROWTH_RECORDS].reverse().map((r, i) => (
                <View key={i} style={[styles.tableRow, { borderBottomColor: theme.border, borderBottomWidth: i < GROWTH_RECORDS.length - 1 ? 1 : 0 }]}>
                  <Text style={[styles.tableCell, { color: theme.text, flex: 2 }]}>{r.date}</Text>
                  <Text style={[styles.tableCell, { color: theme.textMuted, flex: 2 }]}>{r.age}</Text>
                  <Text style={[styles.tableCell, { color: theme.text, flex: 1 }]}>{r.height}</Text>
                  <Text style={[styles.tableCell, { color: theme.text, flex: 1 }]}>{r.weight}</Text>
                  <Text style={[styles.tableCell, { color: theme.text, flex: 1 }]}>{r.headCirc}</Text>
                </View>
              ))}
            </Card>

            <TouchableOpacity
              onPress={() => Alert.alert('Add', 'Add measurement feature coming!')}
              style={[styles.addBtn, { backgroundColor: COLORS.primary }]}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addBtnText}>{t('addMeasurement')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Vaccine summary */}
            <View style={styles.vaccineStats}>
              {[
                { label: 'Given', count: VACCINATIONS.filter(v => v.status === 'given').length, color: COLORS.success, bg: COLORS.successLight },
                { label: 'Due Soon', count: VACCINATIONS.filter(v => v.status === 'due').length, color: COLORS.warning, bg: COLORS.warningLight },
                { label: 'Overdue', count: VACCINATIONS.filter(v => v.status === 'overdue').length, color: COLORS.error, bg: COLORS.errorLight },
              ].map((s, i) => (
                <View key={i} style={[styles.vaccStat, { backgroundColor: s.bg }]}>
                  <Text style={[styles.vaccStatNum, { color: s.color }]}>{s.count}</Text>
                  <Text style={[styles.vaccStatLabel, { color: s.color }]}>{s.label}</Text>
                </View>
              ))}
            </View>

            {/* Vaccine list */}
            {VACCINATIONS.map((vacc, i) => {
              const vstyle = VACCINE_STATUS[vacc.status];
              return (
                <View
                  key={vacc.id}
                  style={[styles.vaccineRow, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                  <View style={[styles.vaccIcon, { backgroundColor: vstyle.type === 'success' ? COLORS.successLight : vstyle.type === 'warning' ? COLORS.warningLight : COLORS.errorLight }]}>
                    <Ionicons name={vstyle.icon} size={20} color={vstyle.type === 'success' ? COLORS.success : vstyle.type === 'warning' ? COLORS.warning : COLORS.error} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.vaccName, { color: theme.text }]}>{vacc.name}</Text>
                    <Text style={[styles.vaccDate, { color: theme.textMuted }]}>Given: {vacc.dateGiven}</Text>
                    {vacc.nextDue && (
                      <Text style={[styles.vaccNext, { color: vacc.status === 'due' ? COLORS.warning : COLORS.error }]}>
                        Next: {vacc.nextDue}
                      </Text>
                    )}
                  </View>
                  <Badge label={vstyle.label} type={vstyle.type} />
                </View>
              );
            })}

            <TouchableOpacity
              onPress={() => Alert.alert('Add', 'Add vaccination record feature coming!')}
              style={[styles.addBtn, { backgroundColor: COLORS.admin }]}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addBtnText}>{t('addVaccine')}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row', borderBottomWidth: 1,
  },
  tab: {
    flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent',
  },
  tabText: { fontSize: 13, fontWeight: '800' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '900', marginBottom: 14 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, padding: 12, borderRadius: 14, borderWidth: 1, alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '900' },
  statUnit: { fontSize: 11, fontWeight: '700' },
  statLabel: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  diffRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  chart: { flexDirection: 'row', gap: 10, height: 120, alignItems: 'flex-end' },
  chartBar: { flex: 1, alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' },
  barContainer: { width: '100%', height: 80, justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 6, minHeight: 8 },
  chartValue: { fontSize: 9, fontWeight: '800' },
  chartLabel: { fontSize: 8, fontWeight: '600', textAlign: 'center' },
  tableHeader: {
    flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, marginBottom: 4,
  },
  tableHeadCell: { fontSize: 10, fontWeight: '700', flex: 1 },
  tableRow: { flexDirection: 'row', paddingVertical: 8 },
  tableCell: { fontSize: 11, fontWeight: '600', flex: 1 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 14, marginBottom: 16,
  },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  vaccineStats: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  vaccStat: {
    flex: 1, padding: 14, borderRadius: 14, alignItems: 'center', gap: 4,
  },
  vaccStatNum: { fontSize: 24, fontWeight: '900' },
  vaccStatLabel: { fontSize: 11, fontWeight: '700' },
  vaccineRow: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 14, borderWidth: 1, marginBottom: 8,
  },
  vaccIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  vaccName: { fontSize: 13, fontWeight: '800' },
  vaccDate: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  vaccNext: { fontSize: 11, fontWeight: '700', marginTop: 2 },
});
