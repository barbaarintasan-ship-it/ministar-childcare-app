import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../src/contexts/LangContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { COLORS, getTheme } from '../../src/constants/colors';
import Header from '../../src/components/common/Header';
import Modal from '../../src/components/common/Modal';
import Button from '../../src/components/common/Button';
import Badge from '../../src/components/common/Badge';
import { TODAY_ACTIVITIES } from '../../src/data/mockData';

const ACTIVITY_TYPES = [
  { id: 'art', label: 'Art & Craft', icon: '🎨', color: '#e8633a' },
  { id: 'story', label: 'Story Time', icon: '📚', color: '#3b82f6' },
  { id: 'outdoor', label: 'Outdoor Play', icon: '🌳', color: '#10b981' },
  { id: 'music', label: 'Music & Dance', icon: '🎵', color: '#14b8a6' },
  { id: 'puzzle', label: 'Puzzle & Games', icon: '🧩', color: '#ec4899' },
  { id: 'science', label: 'Science Fun', icon: '🔬', color: '#8b5cf6' },
  { id: 'cooking', label: 'Cooking', icon: '🍳', color: '#f59e0b' },
  { id: 'circle', label: 'Circle Time', icon: '🌅', color: '#3da98a' },
];

export default function ActivitiesScreen() {
  const { t } = useLang();
  const { isDark } = useTheme();
  const theme = getTheme(isDark);

  const [activities, setActivities] = useState(TODAY_ACTIVITIES);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type: 'art', title: '', desc: '', time: '' });

  const saveActivity = () => {
    if (!form.title.trim()) return Alert.alert('Error', 'Please enter a title');
    const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const typeData = ACTIVITY_TYPES.find(a => a.id === form.type);
    const newActivity = {
      id: String(Date.now()),
      time: form.time || now,
      icon: typeData?.icon || '⭐',
      type: form.type,
      title: form.title,
      desc: form.desc,
      completed: false,
      color: typeData?.color || COLORS.primary,
    };
    setActivities(prev => [...prev, newActivity]);
    setForm({ type: 'art', title: '', desc: '', time: '' });
    setShowModal(false);
  };

  const toggleComplete = (id) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
  };

  const completedCount = activities.filter(a => a.completed).length;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header
        title={t('activitiesTitle')}
        rightComponent={
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={[styles.addBtn, { backgroundColor: COLORS.primary }]}
          >
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        }
      />

      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
            <Text style={[styles.progressLabel, { color: theme.text }]}>Today's Progress</Text>
            <Text style={[styles.progressCount, { color: COLORS.primary }]}>{completedCount}/{activities.length}</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: theme.cardAlt }]}>
            <View style={[styles.progressFill, { width: `${(completedCount / activities.length) * 100}%`, backgroundColor: COLORS.primary }]} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {/* Completed */}
        {activities.filter(a => a.completed).length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>✅ Completed</Text>
            {activities.filter(a => a.completed).map(act => (
              <ActivityCard key={act.id} act={act} theme={theme} onToggle={toggleComplete} />
            ))}
          </>
        )}

        {/* Upcoming */}
        {activities.filter(a => !a.completed).length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>⏳ Upcoming</Text>
            {activities.filter(a => !a.completed).map(act => (
              <ActivityCard key={act.id} act={act} theme={theme} onToggle={toggleComplete} />
            ))}
          </>
        )}
      </ScrollView>

      {/* Add Activity Modal */}
      <Modal visible={showModal} onClose={() => setShowModal(false)} title={t('addActivity')} scrollable>
        {/* Type selector */}
        <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Activity Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {ACTIVITY_TYPES.map(type => (
              <TouchableOpacity
                key={type.id}
                onPress={() => setForm(f => ({ ...f, type: type.id }))}
                style={[
                  styles.typeBtn,
                  {
                    backgroundColor: form.type === type.id ? type.color : theme.cardAlt,
                    borderColor: type.color,
                  },
                ]}
              >
                <Text style={{ fontSize: 18 }}>{type.icon}</Text>
                <Text style={[styles.typeBtnLabel, { color: form.type === type.id ? '#fff' : theme.textSecondary }]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Title *</Text>
        <TextInput
          value={form.title}
          onChangeText={v => setForm(f => ({ ...f, title: v }))}
          placeholder="e.g. Finger painting"
          placeholderTextColor={theme.textMuted}
          style={[styles.textInput, { backgroundColor: theme.input, color: theme.text, borderColor: theme.inputBorder }]}
        />

        <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Description</Text>
        <TextInput
          value={form.desc}
          onChangeText={v => setForm(f => ({ ...f, desc: v }))}
          placeholder="Brief description..."
          placeholderTextColor={theme.textMuted}
          multiline
          numberOfLines={3}
          style={[styles.textInput, styles.textArea, { backgroundColor: theme.input, color: theme.text, borderColor: theme.inputBorder }]}
        />

        <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Time (optional)</Text>
        <TextInput
          value={form.time}
          onChangeText={v => setForm(f => ({ ...f, time: v }))}
          placeholder="e.g. 9:00 AM"
          placeholderTextColor={theme.textMuted}
          style={[styles.textInput, { backgroundColor: theme.input, color: theme.text, borderColor: theme.inputBorder }]}
        />

        <Button title="Save Activity" onPress={saveActivity} color={COLORS.primary} style={{ marginTop: 8 }} />
      </Modal>
    </View>
  );
}

function ActivityCard({ act, theme, onToggle }) {
  return (
    <TouchableOpacity
      onPress={() => onToggle(act.id)}
      style={[
        styles.actCard,
        {
          backgroundColor: act.completed ? act.color + '15' : theme.card,
          borderColor: act.completed ? act.color + '44' : theme.border,
        },
      ]}
    >
      <View style={[styles.actIcon, { backgroundColor: act.color + '22' }]}>
        <Text style={{ fontSize: 20 }}>{act.icon}</Text>
      </View>
      <View style={{ flex: 1, marginHorizontal: 12 }}>
        <Text style={[styles.actTitle, { color: theme.text, textDecorationLine: act.completed ? 'line-through' : 'none' }]}>
          {act.title}
        </Text>
        <Text style={[styles.actDesc, { color: theme.textMuted }]}>{act.desc}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 5 }}>
        <Text style={[styles.actTime, { color: theme.textMuted }]}>{act.time}</Text>
        <View style={[styles.checkbox, { borderColor: act.completed ? act.color : theme.border, backgroundColor: act.completed ? act.color : 'transparent' }]}>
          {act.completed && <Ionicons name="checkmark" size={12} color="#fff" />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  progressBar: {
    flexDirection: 'row', padding: 12, borderBottomWidth: 1, paddingHorizontal: 16,
  },
  progressLabel: { fontSize: 13, fontWeight: '700' },
  progressCount: { fontSize: 13, fontWeight: '900' },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  sectionLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 8 },
  actCard: {
    flexDirection: 'row', alignItems: 'center', padding: 13,
    borderRadius: 14, borderWidth: 1, marginBottom: 8,
  },
  actIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  actTitle: { fontSize: 14, fontWeight: '800' },
  actDesc: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  actTime: { fontSize: 10, fontWeight: '600' },
  checkbox: {
    width: 22, height: 22, borderRadius: 7, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  fieldLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  typeBtn: {
    alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1.5, gap: 4, minWidth: 80,
  },
  typeBtnLabel: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  textInput: {
    borderWidth: 1.5, borderRadius: 12, padding: 12,
    fontSize: 14, fontWeight: '500', marginBottom: 14,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
});
