import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../src/contexts/LangContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { COLORS, getTheme } from '../../src/constants/colors';
import Header from '../../src/components/common/Header';
import Card from '../../src/components/common/Card';
import {
  WEEKLY_ATTENDANCE, MEAL_STATS, MONTHLY_REVENUE, CHILDREN, ADMIN_STATS,
} from '../../src/data/mockData';

const { width } = Dimensions.get('window');
const BAR_MAX_H = 90;
const CHART_W = width - 64;

const TABS = ['Attendance', 'Meals', 'Revenue', 'Rooms'];

function InlineBarChart({ data, keyA, keyB, colorA, colorB, labelKey, maxVal }) {
  const max = maxVal || Math.max(...data.map(d => Math.max(d[keyA] || 0, d[keyB] || 0)));
  return (
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-end' }}>
      {data.map((item, i) => {
        const hA = max > 0 ? ((item[keyA] || 0) / max) * BAR_MAX_H : 4;
        const hB = keyB && max > 0 ? ((item[keyB] || 0) / max) * BAR_MAX_H : 0;
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 9, fontWeight: '800', color: colorA }}>{item[keyA] || 0}</Text>
            <View style={{ height: BAR_MAX_H, justifyContent: 'flex-end', gap: 2 }}>
              <View style={{ height: Math.max(hA, 4), backgroundColor: colorA, borderRadius: 4, width: '100%' }} />
              {keyB ? <View style={{ height: Math.max(hB, 2), backgroundColor: colorB, borderRadius: 4, width: '100%' }} /> : null}
            </View>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#999' }}>{item[labelKey]}</Text>
          </View>
        );
      })}
    </View>
  );
}

function StatSummaryRow({ items }) {
  return (
    <View style={styles.summaryRow}>
      {items.map((item, i) => (
        <View key={i} style={[styles.summaryItem, i < items.length - 1 && styles.summaryItemBorder]}>
          <Text style={[styles.summaryVal, { color: item.color }]}>{item.value}</Text>
          <Text style={styles.summaryLbl}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

function HorizontalBar({ label, value, max, color, theme }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text }}>{label}</Text>
        <Text style={{ fontSize: 12, fontWeight: '800', color: color }}>{value}</Text>
      </View>
      <View style={[styles.barTrack, { backgroundColor: theme.cardAlt }]}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function ReportsScreen() {
  const { t } = useLang();
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  const [activeTab, setActiveTab] = useState('Attendance');

  // Rooms breakdown
  const roomData = ['Sunflower', 'Daisy', 'Rainbow', 'Butterfly'].map(room => ({
    room,
    count: CHILDREN.filter(c => c.room === room).length,
    checkedIn: CHILDREN.filter(c => c.room === room && c.status === 'checked_in').length,
  }));
  const maxRoom = Math.max(...roomData.map(r => r.count));

  // Meal stats
  const mealLabels = MEAL_STATS?.map(m => ({ ...m, label: m.meal?.slice(0, 3) || '' })) || [];

  // Revenue months
  const revenueData = MONTHLY_REVENUE || [
    { month: 'Jan', amount: 18200 },
    { month: 'Feb', amount: 19800 },
    { month: 'Mar', amount: 21000 },
    { month: 'Apr', amount: 20400 },
    { month: 'May', amount: 22600 },
    { month: 'Jun', amount: 21800 },
  ];
  const maxRevenue = Math.max(...revenueData.map(r => r.amount));

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header title={t('reports')} />

      {/* Tabs */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={[styles.tabsBar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}
        contentContainerStyle={styles.tabsContent}
      >
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabBtn, {
              backgroundColor: activeTab === tab ? COLORS.admin : theme.cardAlt,
              borderColor: COLORS.admin,
            }]}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? '#fff' : COLORS.admin }]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>

        {/* ======= ATTENDANCE ======= */}
        {activeTab === 'Attendance' && (
          <>
            <Card>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>📊 Weekly Attendance</Text>
              <StatSummaryRow items={[
                { label: 'Avg Present', value: Math.round(WEEKLY_ATTENDANCE.reduce((s, d) => s + d.present, 0) / WEEKLY_ATTENDANCE.length), color: COLORS.primary },
                { label: 'Avg Absent', value: Math.round(WEEKLY_ATTENDANCE.reduce((s, d) => s + d.absent, 0) / WEEKLY_ATTENDANCE.length), color: COLORS.error },
                { label: 'Rate', value: ADMIN_STATS.attendanceRate + '%', color: COLORS.success },
              ]} />
              <InlineBarChart
                data={WEEKLY_ATTENDANCE}
                keyA="present"
                keyB="absent"
                colorA={COLORS.primary}
                colorB={COLORS.error + '88'}
                labelKey="day"
              />
              <View style={[styles.legend, { marginTop: 12 }]}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
                  <Text style={[styles.legendText, { color: theme.textMuted }]}>Present</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: COLORS.error + '88' }]} />
                  <Text style={[styles.legendText, { color: theme.textMuted }]}>Absent</Text>
                </View>
              </View>
            </Card>

            <Card>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>📅 Today's Summary</Text>
              <View style={styles.todayGrid}>
                {[
                  { icon: 'people', label: 'Total Enrolled', value: ADMIN_STATS.totalChildren, color: COLORS.primary },
                  { icon: 'checkmark-circle', label: 'Present Today', value: ADMIN_STATS.presentToday, color: COLORS.success },
                  { icon: 'close-circle', label: 'Absent Today', value: ADMIN_STATS.absentToday, color: COLORS.error },
                  { icon: 'moon', label: 'Sleeping', value: CHILDREN.filter(c => c.status === 'sleeping').length, color: COLORS.teacher },
                ].map((item, i) => (
                  <View key={i} style={[styles.todayCard, { backgroundColor: item.color + '12', borderColor: item.color + '30' }]}>
                    <Ionicons name={item.icon} size={22} color={item.color} />
                    <Text style={[styles.todayVal, { color: item.color }]}>{item.value}</Text>
                    <Text style={[styles.todayLbl, { color: theme.textMuted }]}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </>
        )}

        {/* ======= MEALS ======= */}
        {activeTab === 'Meals' && (
          <>
            <Card>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>🍽️ Meal Participation</Text>
              {mealLabels.length > 0 ? (
                <>
                  <InlineBarChart
                    data={mealLabels.map(m => ({ ...m, label: m.label }))}
                    keyA="allEaten"
                    keyB="someEaten"
                    colorA={COLORS.success}
                    colorB={COLORS.warning + 'aa'}
                    labelKey="label"
                  />
                  <View style={[styles.legend, { marginTop: 12 }]}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
                      <Text style={[styles.legendText, { color: theme.textMuted }]}>All Eaten</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: COLORS.warning + 'aa' }]} />
                      <Text style={[styles.legendText, { color: theme.textMuted }]}>Some Eaten</Text>
                    </View>
                  </View>
                </>
              ) : (
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>No meal data available</Text>
              )}
            </Card>

            <Card>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>🥗 Today's Meal Stats</Text>
              {[
                { label: 'Breakfast Participation', value: 22, max: ADMIN_STATS.totalChildren, color: COLORS.accent },
                { label: 'Morning Snack', value: 20, max: ADMIN_STATS.totalChildren, color: COLORS.primary },
                { label: 'Lunch', value: 24, max: ADMIN_STATS.totalChildren, color: COLORS.success },
                { label: 'Afternoon Snack', value: 18, max: ADMIN_STATS.totalChildren, color: COLORS.teacher },
              ].map((item, i) => (
                <HorizontalBar key={i} {...item} theme={theme} />
              ))}
            </Card>

            <Card>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>⚠️ Allergy Alerts</Text>
              {CHILDREN.filter(c => c.allergyAlert).map(child => (
                <View key={child.id} style={[styles.allergyRow, { borderBottomColor: theme.border }]}>
                  <Text style={{ fontSize: 18 }}>{child.emoji}</Text>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[{ fontSize: 13, fontWeight: '800', color: theme.text }]}>{child.name}</Text>
                    <Text style={[{ fontSize: 11, color: COLORS.error, fontWeight: '600' }]}>
                      ⚠️ {child.allergies?.join(', ') || 'See notes'}
                    </Text>
                  </View>
                </View>
              ))}
              {CHILDREN.filter(c => c.allergyAlert).length === 0 && (
                <Text style={[styles.emptyText, { color: theme.textMuted }]}>No allergy alerts</Text>
              )}
            </Card>
          </>
        )}

        {/* ======= REVENUE ======= */}
        {activeTab === 'Revenue' && (
          <>
            <Card>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>💰 Monthly Revenue</Text>
              <StatSummaryRow items={[
                { label: 'This Month', value: '$' + (ADMIN_STATS.monthlyRevenue / 1000).toFixed(1) + 'k', color: COLORS.success },
                { label: 'Collected', value: '$' + ((ADMIN_STATS.monthlyRevenue * 0.87) / 1000).toFixed(1) + 'k', color: COLORS.primary },
                { label: 'Outstanding', value: '$' + ((ADMIN_STATS.monthlyRevenue * 0.13) / 1000).toFixed(1) + 'k', color: COLORS.error },
              ]} />
              <InlineBarChart
                data={revenueData.map(r => ({ ...r, amount: Math.round(r.amount / 1000), label: r.month?.slice(0, 3) || '' }))}
                keyA="amount"
                colorA={COLORS.success}
                labelKey="label"
              />
              <Text style={[styles.chartNote, { color: theme.textMuted }]}>Values in $k · Last 6 months</Text>
            </Card>

            <Card>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>📋 Revenue Breakdown</Text>
              {[
                { label: 'Tuition Fees', value: 18400, color: COLORS.primary },
                { label: 'Meal Plans', value: 2200, color: COLORS.accent },
                { label: 'Activity Fees', value: 800, color: COLORS.teacher },
                { label: 'Late Pickups', value: 320, color: COLORS.warning },
              ].map((item, i) => {
                const total = 21720;
                return (
                  <View key={i} style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>{item.label}</Text>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: item.color }}>
                        ${item.value.toLocaleString()} ({Math.round(item.value / total * 100)}%)
                      </Text>
                    </View>
                    <View style={[styles.barTrack, { backgroundColor: theme.cardAlt }]}>
                      <View style={[styles.barFill, { width: `${(item.value / total) * 100}%`, backgroundColor: item.color }]} />
                    </View>
                  </View>
                );
              })}
            </Card>
          </>
        )}

        {/* ======= ROOMS ======= */}
        {activeTab === 'Rooms' && (
          <>
            <Card>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>🏫 Classroom Capacity</Text>
              {roomData.map((room, i) => {
                const capacity = 8;
                const pct = Math.round((room.count / capacity) * 100);
                const colors = [COLORS.primary, COLORS.accent, COLORS.teacher, COLORS.success];
                return (
                  <View key={i} style={[styles.roomRow, { borderBottomColor: theme.border, borderBottomWidth: i < roomData.length - 1 ? 1 : 0 }]}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: theme.text }}>{room.room} Room</Text>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: colors[i] }}>
                          {room.count}/{capacity} ({pct}%)
                        </Text>
                      </View>
                      <View style={[styles.barTrack, { backgroundColor: theme.cardAlt }]}>
                        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: colors[i] }]} />
                      </View>
                      <Text style={{ fontSize: 10, fontWeight: '600', color: theme.textMuted, marginTop: 4 }}>
                        {room.checkedIn} checked in today
                      </Text>
                    </View>
                  </View>
                );
              })}
            </Card>

            <Card>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>👥 Staff per Room</Text>
              {roomData.map((room, i) => {
                const colors = [COLORS.primary, COLORS.accent, COLORS.teacher, COLORS.success];
                const staffCount = [2, 2, 1, 1][i];
                return (
                  <View key={i} style={[styles.staffRoomRow, { borderBottomColor: theme.border, borderBottomWidth: i < roomData.length - 1 ? 1 : 0 }]}>
                    <View style={[styles.roomDot, { backgroundColor: colors[i] }]} />
                    <Text style={[styles.roomName, { color: theme.text }]}>{room.room}</Text>
                    <View style={{ flex: 1 }} />
                    <View style={styles.staffPills}>
                      {Array(staffCount).fill(null).map((_, j) => (
                        <View key={j} style={[styles.staffPill, { backgroundColor: colors[i] + '20' }]}>
                          <Ionicons name="person" size={10} color={colors[i]} />
                        </View>
                      ))}
                    </View>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: colors[i], marginLeft: 8 }}>{staffCount}</Text>
                  </View>
                );
              })}
            </Card>

            <Card>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>📊 Age Distribution</Text>
              {[2, 3, 4, 5].map((age, i) => {
                const count = CHILDREN.filter(c => c.age === age).length;
                const colors = [COLORS.primary, COLORS.teacher, COLORS.success, COLORS.accent];
                return (
                  <HorizontalBar key={age} label={`Age ${age}`} value={count} max={CHILDREN.length} color={colors[i]} theme={theme} />
                );
              })}
            </Card>
          </>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabsBar: { maxHeight: 52, borderBottomWidth: 1 },
  tabsContent: { paddingHorizontal: 12, gap: 8, alignItems: 'center', paddingVertical: 8 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  tabText: { fontSize: 12, fontWeight: '700' },
  sectionTitle: { fontSize: 15, fontWeight: '900', marginBottom: 14 },
  summaryRow: { flexDirection: 'row', marginBottom: 16, borderRadius: 12, overflow: 'hidden' },
  summaryItem: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  summaryItemBorder: { borderRightWidth: 1, borderRightColor: '#e5e7eb' },
  summaryVal: { fontSize: 18, fontWeight: '900' },
  summaryLbl: { fontSize: 9, fontWeight: '700', color: '#9ca3af', marginTop: 2 },
  legend: { flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, fontWeight: '600' },
  chartNote: { fontSize: 10, fontWeight: '600', marginTop: 8, textAlign: 'right' },
  todayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  todayCard: {
    width: '47%', padding: 14, borderRadius: 14, borderWidth: 1,
    alignItems: 'center', gap: 4,
  },
  todayVal: { fontSize: 24, fontWeight: '900' },
  todayLbl: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  barTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  allergyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1 },
  emptyText: { fontSize: 13, fontWeight: '600', textAlign: 'center', paddingVertical: 20 },
  roomRow: { paddingVertical: 12 },
  staffRoomRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 8 },
  roomDot: { width: 10, height: 10, borderRadius: 5 },
  roomName: { fontSize: 13, fontWeight: '800' },
  staffPills: { flexDirection: 'row', gap: 4 },
  staffPill: { width: 22, height: 22, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
