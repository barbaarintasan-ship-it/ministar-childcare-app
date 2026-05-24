import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../src/contexts/LangContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { COLORS, getTheme } from '../../src/constants/colors';
import Header from '../../src/components/common/Header';
import Modal from '../../src/components/common/Modal';
import Button from '../../src/components/common/Button';
import Avatar from '../../src/components/common/Avatar';
import Badge from '../../src/components/common/Badge';
import { CHILDREN } from '../../src/data/mockData';

const NOTE_TYPES = [
  { id: 'general', label: 'General Note', icon: '📝', color: COLORS.teacher },
  { id: 'temperature', label: 'Temperature', icon: '🌡️', color: COLORS.warning },
  { id: 'incident', label: 'Incident Report', icon: '⚠️', color: COLORS.error },
  { id: 'medication', label: 'Medication Given', icon: '💊', color: COLORS.admin },
];

const SAMPLE_NOTES = [
  { id: 'hn1', childId: 'child-1', childName: 'Emma Johnson', type: 'general', icon: '📝', text: 'Emma was feeling a bit quiet today. She ate well but seemed tired during activities. Suggest an early night.', time: '2:30 PM', color: COLORS.teacher },
  { id: 'hn2', childId: 'child-2', childName: 'Liam Smith', type: 'incident', icon: '⚠️', text: 'Minor fall on playground. Small scratch on left knee. Cleaned and bandaged. Parents notified.', time: '11:15 AM', color: COLORS.error },
  { id: 'hn3', childId: 'child-4', childName: 'Noah Williams', type: 'temperature', icon: '🌡️', text: 'Temp: 37.1°C — Normal range. Child feeling well, active and engaged throughout the day.', time: '9:00 AM', color: COLORS.warning },
];

export default function HealthScreen() {
  const { t } = useLang();
  const { isDark } = useTheme();
  const theme = getTheme(isDark);

  const [notes, setNotes] = useState(SAMPLE_NOTES);
  const [showModal, setShowModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState(CHILDREN[0]);
  const [form, setForm] = useState({ type: 'general', text: '', temperature: '' });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');

  const saveNote = async () => {
    if (!form.text.trim()) return Alert.alert('Error', 'Please enter a note');
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    const typeData = NOTE_TYPES.find(n => n.id === form.type);
    const newNote = {
      id: String(Date.now()),
      childId: selectedChild.id,
      childName: selectedChild.name,
      type: form.type,
      icon: typeData?.icon,
      text: form.type === 'temperature' ? `Temp: ${form.temperature}°C — ${form.text}` : form.text,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      color: typeData?.color,
    };
    setNotes(prev => [newNote, ...prev]);
    setForm({ type: 'general', text: '', temperature: '' });
    setSaving(false);
    setShowModal(false);
    Alert.alert('Saved', t('noteSaved'));
  };

  const filteredNotes = filter === 'all' ? notes : notes.filter(n => n.type === filter);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header
        title={t('healthTitle')}
        rightComponent={
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={[styles.addBtn, { backgroundColor: COLORS.error }]}
          >
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        }
      />

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.filtersBar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity
          onPress={() => setFilter('all')}
          style={[styles.filterBtn, { backgroundColor: filter === 'all' ? COLORS.primary : theme.cardAlt, borderColor: COLORS.primary }]}
        >
          <Text style={[styles.filterText, { color: filter === 'all' ? '#fff' : COLORS.primary }]}>All</Text>
        </TouchableOpacity>
        {NOTE_TYPES.map(type => (
          <TouchableOpacity
            key={type.id}
            onPress={() => setFilter(type.id)}
            style={[styles.filterBtn, { backgroundColor: filter === type.id ? type.color : theme.cardAlt, borderColor: type.color }]}
          >
            <Text style={{ fontSize: 13 }}>{type.icon}</Text>
            <Text style={[styles.filterText, { color: filter === type.id ? '#fff' : type.color }]}>{type.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {filteredNotes.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💊</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No health notes yet today</Text>
          </View>
        ) : (
          filteredNotes.map((note) => (
            <View
              key={note.id}
              style={[styles.noteCard, { backgroundColor: theme.card, borderColor: note.color + '44', borderLeftColor: note.color }]}
            >
              <View style={styles.noteHeader}>
                <Text style={styles.noteTypeIcon}>{note.icon}</Text>
                <Text style={[styles.childName, { color: theme.text }]}>{note.childName}</Text>
                <Text style={[styles.noteTime, { color: theme.textMuted }]}>{note.time}</Text>
                <Badge label={NOTE_TYPES.find(t => t.id === note.type)?.label || note.type} type={
                  note.type === 'incident' ? 'error' : note.type === 'temperature' ? 'warning' : note.type === 'medication' ? 'info' : 'primary'
                } size="xs" />
              </View>
              <Text style={[styles.noteText, { color: theme.textSecondary }]}>{note.text}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Note Modal */}
      <Modal visible={showModal} onClose={() => setShowModal(false)} title={t('addNote')} scrollable>
        {/* Child selector */}
        <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Select Child</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {CHILDREN.filter(c => c.status !== 'absent').map(child => (
              <TouchableOpacity
                key={child.id}
                onPress={() => setSelectedChild(child)}
                style={[
                  styles.childSelectBtn,
                  {
                    backgroundColor: selectedChild.id === child.id ? COLORS.primaryLight : theme.cardAlt,
                    borderColor: selectedChild.id === child.id ? COLORS.primary : theme.border,
                  },
                ]}
              >
                <Text style={{ fontSize: 18 }}>{child.emoji}</Text>
                <Text style={[styles.childSelectName, { color: selectedChild.id === child.id ? COLORS.primary : theme.textSecondary }]}>
                  {child.firstName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Note type */}
        <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Note Type</Text>
        <View style={styles.typesGrid}>
          {NOTE_TYPES.map(type => (
            <TouchableOpacity
              key={type.id}
              onPress={() => setForm(f => ({ ...f, type: type.id }))}
              style={[
                styles.typeCard,
                {
                  backgroundColor: form.type === type.id ? type.color + '20' : theme.cardAlt,
                  borderColor: form.type === type.id ? type.color : theme.border,
                },
              ]}
            >
              <Text style={{ fontSize: 20 }}>{type.icon}</Text>
              <Text style={[styles.typeCardLabel, { color: form.type === type.id ? type.color : theme.textSecondary }]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {form.type === 'temperature' && (
          <>
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Temperature (°C)</Text>
            <TextInput
              value={form.temperature}
              onChangeText={v => setForm(f => ({ ...f, temperature: v }))}
              placeholder="e.g. 37.2"
              placeholderTextColor={theme.textMuted}
              keyboardType="decimal-pad"
              style={[styles.textInput, { backgroundColor: theme.input, color: theme.text, borderColor: theme.inputBorder }]}
            />
          </>
        )}

        <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Note *</Text>
        <TextInput
          value={form.text}
          onChangeText={v => setForm(f => ({ ...f, text: v }))}
          placeholder="Describe the situation..."
          placeholderTextColor={theme.textMuted}
          multiline
          numberOfLines={4}
          style={[styles.textInput, styles.textArea, { backgroundColor: theme.input, color: theme.text, borderColor: theme.inputBorder }]}
        />

        <Button title={saving ? t('saving') : 'Save Health Note'} onPress={saveNote} loading={saving} color={COLORS.error} style={{ marginTop: 8 }} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  filtersBar: { maxHeight: 60, borderBottomWidth: 1 },
  filtersContent: { paddingHorizontal: 12, gap: 8, alignItems: 'center', paddingVertical: 8 },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5,
  },
  filterText: { fontSize: 12, fontWeight: '700' },
  noteCard: {
    padding: 14, borderRadius: 14, borderWidth: 1, borderLeftWidth: 4, marginBottom: 10,
  },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  noteTypeIcon: { fontSize: 18 },
  childName: { fontSize: 13, fontWeight: '800', flex: 1 },
  noteTime: { fontSize: 10, fontWeight: '600' },
  noteText: { fontSize: 13, fontWeight: '500', lineHeight: 19 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 15, fontWeight: '700' },
  fieldLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 },
  childSelectBtn: {
    alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1.5, gap: 4, minWidth: 65,
  },
  childSelectName: { fontSize: 10, fontWeight: '700' },
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeCard: {
    width: '47%', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1.5, gap: 4,
  },
  typeCardLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  textInput: {
    borderWidth: 1.5, borderRadius: 12, padding: 12, fontSize: 14, fontWeight: '500', marginBottom: 14,
  },
  textArea: { height: 90, textAlignVertical: 'top' },
});
