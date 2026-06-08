import { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../src/contexts/LangContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { COLORS, getTheme } from '../../src/constants/colors';
import Header from '../../src/components/common/Header';
import Modal from '../../src/components/common/Modal';
import Button from '../../src/components/common/Button';
import Badge from '../../src/components/common/Badge';
import Avatar from '../../src/components/common/Avatar';
import * as api from '../../src/lib/api';

export default function ChildrenScreen() {
  const { t } = useLang();
  const { isDark } = useTheme();
  const theme = getTheme(isDark);

  const [children, setChildren] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRoom, setFilterRoom] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editChild, setEditChild] = useState(null);
  const [form, setForm] = useState({ name: '', age: '', room: '', parentName: '', parentEmail: '', parentPhone: '', allergies: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.getChildren(), api.getClassrooms()])
      .then(([kids, rooms]) => {
        setChildren(kids);
        setClassrooms(rooms);
        if (rooms.length > 0) setForm(f => ({ ...f, room: rooms[0].name }));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const roomOptions = classrooms.length > 0
    ? classrooms.map(r => r.name)
    : ['Sunflower', 'Daisy', 'Rainbow', 'Butterfly'];

  const filteredChildren = children.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.emergencyContact || '').toLowerCase().includes(search.toLowerCase());
    const matchRoom = filterRoom === 'all' || c.room === filterRoom;
    return matchSearch && matchRoom;
  });

  const openAdd = () => {
    setEditChild(null);
    setForm({ name: '', age: '', room: roomOptions[0] || '', parentName: '', parentEmail: '', parentPhone: '', allergies: '' });
    setShowModal(true);
  };

  const openEdit = (child) => {
    setEditChild(child);
    setForm({
      name: child.name, age: String(child.age), room: child.room,
      parentName: child.emergencyContact || '',
      parentEmail: '',
      parentPhone: child.emergencyPhone || '',
      allergies: child.allergies.join(', '),
    });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.name.trim()) return Alert.alert('Error', 'Child name is required');
    setSaving(true);
    try {
      const [firstName, ...rest] = form.name.trim().split(' ');
      const classroom = classrooms.find(r => r.name === form.room);
      const payload = {
        first_name: firstName,
        last_name: rest.join(' ') || '',
        age: parseInt(form.age) || 3,
        classroom_id: classroom?.id || null,
        allergies: form.allergies ? form.allergies.split(',').map(a => a.trim()).filter(Boolean) : [],
        emergency_contact: form.parentName,
        emergency_phone: form.parentPhone,
      };
      if (editChild) {
        const updated = await api.updateChild(editChild.id, payload);
        setChildren(prev => prev.map(c => c.id === editChild.id ? updated : c));
      } else {
        const created = await api.createChild(payload);
        setChildren(prev => [...prev, created]);
      }
      setShowModal(false);
      Alert.alert('Success', editChild ? 'Child updated!' : 'Child added successfully!');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteChild = (child) => {
    Alert.alert(
      t('deleteChild'),
      `Remove ${child.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive', onPress: async () => {
            try {
              await api.deleteChild(child.id);
              setChildren(prev => prev.filter(c => c.id !== child.id));
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          }
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header
        title={t('manageChildren')}
        rightComponent={
          <TouchableOpacity onPress={openAdd} style={[styles.addBtn, { backgroundColor: COLORS.primary }]}>
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        }
      />

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={[styles.searchInput, { backgroundColor: theme.input, borderColor: theme.inputBorder }]}>
          <Ionicons name="search" size={16} color={theme.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search children or parents..."
            placeholderTextColor={theme.textMuted}
            style={[styles.searchText, { color: theme.text }]}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Room filters */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={[styles.filtersBar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}
        contentContainerStyle={styles.filtersContent}
      >
        {['all', ...roomOptions].map(room => (
          <TouchableOpacity
            key={room}
            onPress={() => setFilterRoom(room)}
            style={[styles.filterBtn, { backgroundColor: filterRoom === room ? COLORS.primary : theme.cardAlt, borderColor: COLORS.primary }]}
          >
            <Text style={[styles.filterText, { color: filterRoom === room ? '#fff' : COLORS.primary }]}>
              {room === 'all' ? '🌟 All' : room}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Count */}
      <View style={[styles.countRow, { backgroundColor: theme.bg }]}>
        <Text style={[styles.countText, { color: theme.textMuted }]}>
          {filteredChildren.length} children
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {filteredChildren.map((child) => (
          <View key={child.id} style={[styles.childCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.cardTop}>
              <Avatar name={child.name} emoji={child.emoji} size={48} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.childName, { color: theme.text }]}>{child.name}</Text>
                  {child.allergyAlert && <Text>⚠️</Text>}
                </View>
                <Text style={[styles.childInfo, { color: theme.textMuted }]}>
                  {child.age} yrs · {child.room} {child.roomEmoji} · {child.enrollDate}
                </Text>
                <Text style={[styles.parentInfo, { color: theme.textSecondary }]}>
                  👨‍👩‍👧 {child.emergencyContact || 'No contact'} · {child.emergencyPhone || ''}
                </Text>
              </View>
              <Badge
                label={child.status === 'checked_in' ? '● In' : child.status === 'absent' ? '● Absent' : child.status === 'checked_out' ? '● Out' : '—'}
                type={child.status === 'checked_in' ? 'success' : child.status === 'absent' ? 'error' : child.status === 'checked_out' ? 'info' : 'gray'}
              />
            </View>
            <View style={[styles.cardActions, { borderTopColor: theme.border }]}>
              <TouchableOpacity onPress={() => openEdit(child)} style={[styles.actionBtn, { backgroundColor: COLORS.teacher + '15' }]}>
                <Ionicons name="create-outline" size={14} color={COLORS.teacher} />
                <Text style={[styles.actionText, { color: COLORS.teacher }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteChild(child)} style={[styles.actionBtn, { backgroundColor: COLORS.errorLight }]}>
                <Ionicons name="trash-outline" size={14} color={COLORS.error} />
                <Text style={[styles.actionText, { color: COLORS.error }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      )}

      {/* Add/Edit Modal */}
      <Modal visible={showModal} onClose={() => setShowModal(false)} title={editChild ? t('editChild') : t('addChild')} scrollable>
        {[
          { label: 'Child Name *', key: 'name', placeholder: 'Emma Johnson' },
          { label: 'Age', key: 'age', placeholder: '3', keyboardType: 'numeric' },
          { label: "Parent's Name", key: 'parentName', placeholder: 'Sarah Johnson' },
          { label: "Parent's Email", key: 'parentEmail', placeholder: 'sarah@email.com', keyboardType: 'email-address' },
          { label: 'Phone', key: 'parentPhone', placeholder: '+1 555-000-0000', keyboardType: 'phone-pad' },
          { label: 'Allergies (comma separated)', key: 'allergies', placeholder: 'Peanuts, Dairy' },
        ].map(field => (
          <View key={field.key} style={{ marginBottom: 12 }}>
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>{field.label}</Text>
            <TextInput
              value={form[field.key]}
              onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
              placeholder={field.placeholder}
              placeholderTextColor={theme.textMuted}
              keyboardType={field.keyboardType || 'default'}
              autoCapitalize={field.keyboardType === 'email-address' ? 'none' : 'words'}
              style={[styles.textInput, { backgroundColor: theme.input, color: theme.text, borderColor: theme.inputBorder }]}
            />
          </View>
        ))}

        <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Classroom</Text>
        <View style={styles.roomsRow}>
          {roomOptions.map(room => (
            <TouchableOpacity
              key={room}
              onPress={() => setForm(f => ({ ...f, room }))}
              style={[styles.roomBtn, { backgroundColor: form.room === room ? COLORS.primary + '20' : theme.cardAlt, borderColor: form.room === room ? COLORS.primary : theme.border }]}
            >
              <Text style={[styles.roomBtnText, { color: form.room === room ? COLORS.primary : theme.textSecondary }]}>{room}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button title={saving ? t('saving') : editChild ? 'Save Changes' : t('addChild')} onPress={save} loading={saving} color={COLORS.primary} style={{ marginTop: 8 }} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  searchBar: { padding: 12, borderBottomWidth: 1 },
  searchInput: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5,
  },
  searchText: { flex: 1, fontSize: 14, fontWeight: '500' },
  filtersBar: { maxHeight: 52, borderBottomWidth: 1 },
  filtersContent: { paddingHorizontal: 12, gap: 8, alignItems: 'center', paddingVertical: 8 },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5,
  },
  filterText: { fontSize: 12, fontWeight: '700' },
  countRow: { paddingHorizontal: 16, paddingVertical: 8 },
  countText: { fontSize: 12, fontWeight: '600' },
  childCard: { borderRadius: 16, borderWidth: 1, marginBottom: 10, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', alignItems: 'center', padding: 13 },
  childName: { fontSize: 14, fontWeight: '800' },
  childInfo: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  parentInfo: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 8, padding: 10, borderTopWidth: 1 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 8, borderRadius: 10,
  },
  actionText: { fontSize: 12, fontWeight: '800' },
  fieldLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  textInput: { borderWidth: 1.5, borderRadius: 12, padding: 12, fontSize: 14, fontWeight: '500' },
  roomsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  roomBtn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, borderWidth: 1.5 },
  roomBtnText: { fontSize: 13, fontWeight: '700' },
});
