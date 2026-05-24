import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../src/contexts/LangContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { COLORS, getTheme } from '../../src/constants/colors';
import Header from '../../src/components/common/Header';
import Button from '../../src/components/common/Button';
import Avatar from '../../src/components/common/Avatar';
import { CHILDREN } from '../../src/data/mockData';

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅', time: '8:00 AM' },
  { id: 'morningSnack', label: 'Morning Snack', icon: '🍎', time: '10:00 AM' },
  { id: 'lunch', label: 'Lunch', icon: '☀️', time: '12:00 PM' },
  { id: 'afternoonSnack', label: 'Afternoon Snack', icon: '🍪', time: '3:00 PM' },
];

const PORTIONS = [
  { id: 'all', label: 'All', emoji: '😋', color: COLORS.success },
  { id: 'most', label: 'Most', emoji: '🙂', color: COLORS.teacher },
  { id: 'some', label: 'Some', emoji: '😐', color: COLORS.warning },
  { id: 'none', label: 'None', emoji: '😞', color: COLORS.error },
];

export default function MealsScreen() {
  const { t } = useLang();
  const { isDark } = useTheme();
  const theme = getTheme(isDark);

  const [activeMeal, setActiveMeal] = useState('lunch');
  const [mealLogs, setMealLogs] = useState(
    Object.fromEntries(CHILDREN.map(c => [c.id, { ...c.meals }]))
  );
  const [saving, setSaving] = useState(false);

  const setChildMeal = (childId, portion) => {
    setMealLogs(prev => ({
      ...prev,
      [childId]: { ...prev[childId], [activeMeal]: portion },
    }));
  };

  const saveMeals = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    Alert.alert('Saved', 'Meal logs saved successfully!');
  };

  const setAll = (portion) => {
    const update = {};
    CHILDREN.forEach(c => {
      if (c.status !== 'absent') {
        update[c.id] = { ...mealLogs[c.id], [activeMeal]: portion };
      }
    });
    setMealLogs(prev => ({ ...prev, ...update }));
  };

  const currentMeal = MEAL_TYPES.find(m => m.id === activeMeal);
  const presentChildren = CHILDREN.filter(c => c.status !== 'absent');

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header title={t('mealsTitle')} />

      {/* Meal type tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.tabsScroll, { backgroundColor: theme.card, borderBottomColor: theme.border }]}
        contentContainerStyle={styles.tabsContent}
      >
        {MEAL_TYPES.map(meal => (
          <TouchableOpacity
            key={meal.id}
            onPress={() => setActiveMeal(meal.id)}
            style={[
              styles.mealTab,
              {
                backgroundColor: activeMeal === meal.id ? COLORS.primary + '20' : 'transparent',
                borderBottomColor: activeMeal === meal.id ? COLORS.primary : 'transparent',
              },
            ]}
          >
            <Text style={styles.mealTabIcon}>{meal.icon}</Text>
            <Text style={[styles.mealTabLabel, { color: activeMeal === meal.id ? COLORS.primary : theme.textMuted }]}>
              {meal.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Current meal header */}
      <View style={[styles.mealHeader, { backgroundColor: COLORS.primaryLight, borderBottomColor: COLORS.primary + '33' }]}>
        <Text style={styles.mealHeaderEmoji}>{currentMeal?.icon}</Text>
        <View>
          <Text style={[styles.mealHeaderTitle, { color: COLORS.primaryDark }]}>
            {currentMeal?.label} — {currentMeal?.time}
          </Text>
          <Text style={[styles.mealHeaderSub, { color: COLORS.primary }]}>
            Logging for {presentChildren.length} children
          </Text>
        </View>
      </View>

      {/* Set all shortcut */}
      <View style={[styles.setAllRow, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Text style={[styles.setAllLabel, { color: theme.textMuted }]}>Set all:</Text>
        {PORTIONS.map(p => (
          <TouchableOpacity
            key={p.id}
            onPress={() => setAll(p.id)}
            style={[styles.setAllBtn, { backgroundColor: p.color + '20', borderColor: p.color + '44' }]}
          >
            <Text style={{ fontSize: 12 }}>{p.emoji}</Text>
            <Text style={[styles.setAllBtnText, { color: p.color }]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {presentChildren.map((child) => {
          const currentPortion = mealLogs[child.id]?.[activeMeal];
          return (
            <View
              key={child.id}
              style={[styles.childCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View style={styles.childRow}>
                <Avatar name={child.name} emoji={child.emoji} size={42} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.childName, { color: theme.text }]}>{child.name}</Text>
                  {child.allergyAlert && (
                    <Text style={{ fontSize: 10, color: COLORS.error, fontWeight: '700', marginTop: 1 }}>
                      ⚠️ {child.allergies.join(', ')}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.portionsRow}>
                {PORTIONS.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setChildMeal(child.id, p.id)}
                    style={[
                      styles.portionBtn,
                      {
                        backgroundColor: currentPortion === p.id ? p.color : theme.cardAlt,
                        borderColor: currentPortion === p.id ? p.color : theme.border,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 16 }}>{p.emoji}</Text>
                    <Text style={[styles.portionLabel, { color: currentPortion === p.id ? '#fff' : theme.textSecondary }]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}

        <Button
          title={saving ? 'Saving...' : t('saveMeals')}
          onPress={saveMeals}
          loading={saving}
          color={COLORS.primary}
          size="lg"
          style={{ marginTop: 8, marginBottom: 16 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabsScroll: { maxHeight: 70, borderBottomWidth: 1 },
  tabsContent: { paddingHorizontal: 12, gap: 4, alignItems: 'center' },
  mealTab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 3, borderRadius: 4,
  },
  mealTabIcon: { fontSize: 18 },
  mealTabLabel: { fontSize: 12, fontWeight: '700' },
  mealHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderBottomWidth: 1,
  },
  mealHeaderEmoji: { fontSize: 26 },
  mealHeaderTitle: { fontSize: 14, fontWeight: '900' },
  mealHeaderSub: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  setAllRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1,
  },
  setAllLabel: { fontSize: 12, fontWeight: '700' },
  setAllBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 7, borderRadius: 10, borderWidth: 1,
  },
  setAllBtnText: { fontSize: 11, fontWeight: '800' },
  childCard: {
    borderRadius: 14, borderWidth: 1, padding: 13,
    marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  childRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  childName: { fontSize: 14, fontWeight: '800' },
  portionsRow: { flexDirection: 'row', gap: 8 },
  portionBtn: {
    flex: 1, alignItems: 'center', gap: 3, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1.5,
  },
  portionLabel: { fontSize: 10, fontWeight: '700' },
});
