import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../src/contexts/LangContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { COLORS, getTheme } from '../../src/constants/colors';
import Header from '../../src/components/common/Header';
import Modal from '../../src/components/common/Modal';
import Button from '../../src/components/common/Button';
import Badge from '../../src/components/common/Badge';
import Avatar from '../../src/components/common/Avatar';
import { STAFF } from '../../src/data/mockData';

const ROLES = ['Teacher', 'Assistant', 'Admin', 'Director', 'Cook', 'Nurse'];
const CLASSROOMS = ['Sunflower', 'Daisy', 'Rainbow', 'Butterfly', 'All'];
const STATUS_OPTIONS = ['active', 'on_leave', 'part_time'];

export default function StaffScreen() {
  const { t } = useLang();
  const { isDark } = useTheme();
  const theme = getTheme(isDark);

  const [staff, setStaff] = useState(STAFF);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [form, setForm] = useState({
    name: '', role: 'Teacher', classroom: 'Sunflower',
    email: '', phone: '', status: 'active', certifications: '',
  });
  const [saving, setSaving] = useState(false);

  const allRoles = ['all', ...ROLES];

  const filteredStaff = staff.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || s.role === filterRole;
    return matchSearch && matchRole;
  });

  const openAdd = () => {
    setEditStaff(null);
    setForm({ name: '', role: 'Teacher', classroom: 'Sunflower', email: '', phone: '', status: 'active', certifications: '' });
    setShowModal(true);
  };

  const openEdit = (member) => {
    setEditStaff(member);
    setForm({
      name: member.name,
      role: member.role,
      classroom: member.classroom || 'Sunflower',
      email: member.email || '',
      phone: member.phone || '',
      status: member.status || 'active',
      certifications: member.certifications ? member.certifications.join(', ') : '',
    });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.name.trim()) return Alert.alert('Error', 'Staff name is required');
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    if (editStaff) {
      setStaff(prev => prev.map(s => s.id === editStaff.id ? {
        ...s,
        name: form.name,
        role: form.role,
        classroom: form.classroom,
        email: form.email,
        phone: form.phone,
        status: form.status,
        certifications: form.certifications ? form.certifications.split(',').map(c => c.trim()).filter(Boolean) : [],
      } : s));
    } else {
      const newMember = {
        id: 'staff-new-' + Date.now(),
        name: form.name,
        role: form.role,
        classroom: form.classroom,
        email: form.email,
        phone: form.phone,
        status: form.status,
        certifications: form.certifications ? form.certifications.split(',').map(c => c.trim()).filter(Boolean) : [],
        emoji: '👤',
        hireDate: new Date().toISOString().split('T')[0],
        childrenCount: 0,
        rating: 5.0,
      };
      setStaff(prev => [...prev, newMember]);
    }
    setSaving(false);
    setShowModal(false);
    Alert.alert('Success', editStaff ? 'Staff member updated!' : 'Staff member added!');
  };

  const deleteStaff = (member) => {
    Alert.alert(
      'Remove Staff',
      `Remove ${member.name} from staff?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => setStaff(prev => prev.filter(s => s.id !== member.id)) },
      ]
    );
  };

  const getStatusBadge = (status) => {
    if (status === 'active') return { label: '● Active', type: 'success' };
    if (status === 'on_leave') return { label: '● On Leave', type: 'warning' };
    if (status === 'part_time') return { label: '● Part-time', type: 'info' };
    return { label: status, type: 'gray' };
  };

  const getRoleColor = (role) => {
    const map = {
      Teacher: COLORS.teacher,
      Assistant: COLORS.primary,
      Admin: COLORS.admin,
      Director: COLORS.accent,
      Cook: '#f59e0b',
      Nurse: COLORS.error,
    };
    return map[role] || COLORS.teacher;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header
        title={t('manageStaff')}
        rightComponent={
          <TouchableOpacity onPress={openAdd} style={[styles.addBtn, { backgroundColor: COLORS.teacher }]}>
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
            placeholder="Search staff by name, role..."
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

      {/* Role filters */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={[styles.filtersBar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}
        contentContainerStyle={styles.filtersContent}
      >
        {allRoles.map(role => (
          <TouchableOpacity
            key={role}
            onPress={() => setFilterRole(role)}
            style={[styles.filterBtn, {
              backgroundColor: filterRole === role ? COLORS.teacher : theme.cardAlt,
              borderColor: COLORS.teacher,
            }]}
          >
            <Text style={[styles.filterText, { color: filterRole === role ? '#fff' : COLORS.teacher }]}>
              {role === 'all' ? '⭐ All' : role}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Count */}
      <View style={[styles.countRow, { backgroundColor: theme.bg }]}>
        <Text style={[styles.countText, { color: theme.textMuted }]}>
          {filteredStaff.length} staff members
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {filteredStaff.map((member) => {
          const badge = getStatusBadge(member.status);
          const roleColor = getRoleColor(member.role);
          return (
            <View key={member.id} style={[styles.staffCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.cardTop}>
                <Avatar name={member.name} emoji={member.emoji} size={48} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Text style={[styles.staffName, { color: theme.text }]}>{member.name}</Text>
                    <View style={[styles.rolePill, { backgroundColor: roleColor + '20', borderColor: roleColor }]}>
                      <Text style={[styles.rolePillText, { color: roleColor }]}>{member.role}</Text>
                    </View>
                  </View>
                  <Text style={[styles.staffInfo, { color: theme.textMuted }]}>
                    {member.classroom ? `${member.classroom} Room` : 'All Classrooms'} · Hired {member.hireDate || 'N/A'}
                  </Text>
                  {member.email ? (
                    <Text style={[styles.staffContact, { color: theme.textSecondary }]}>
                      ✉️ {member.email}
                    </Text>
                  ) : null}
                  {member.certifications?.length > 0 ? (
                    <View style={styles.certsRow}>
                      {member.certifications.slice(0, 2).map((cert, i) => (
                        <View key={i} style={[styles.certChip, { backgroundColor: theme.cardAlt }]}>
                          <Text style={[styles.certText, { color: theme.textMuted }]}>{cert}</Text>
                        </View>
                      ))}
                      {member.certifications.length > 2 && (
                        <Text style={[styles.certMore, { color: theme.textMuted }]}>+{member.certifications.length - 2}</Text>
                      )}
                    </View>
                  ) : null}
                </View>
                <Badge label={badge.label} type={badge.type} />
              </View>

              {/* Stats row */}
              <View style={[styles.statsRow, { borderTopColor: theme.border, borderBottomColor: theme.border }]}>
                <View style={styles.statItem}>
                  <Text style={[styles.statVal, { color: theme.text }]}>{member.childrenCount || 0}</Text>
                  <Text style={[styles.statLbl, { color: theme.textMuted }]}>Children</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statVal, { color: COLORS.accent }]}>{member.rating ? member.rating.toFixed(1) : '—'}</Text>
                  <Text style={[styles.statLbl, { color: theme.textMuted }]}>Rating</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statVal, { color: theme.text }]}>{member.phone || '—'}</Text>
                  <Text style={[styles.statLbl, { color: theme.textMuted }]}>Phone</Text>
                </View>
              </View>

              <View style={[styles.cardActions, { borderTopColor: theme.border }]}>
                <TouchableOpacity onPress={() => openEdit(member)} style={[styles.actionBtn, { backgroundColor: COLORS.teacher + '15' }]}>
                  <Ionicons name="create-outline" size={14} color={COLORS.teacher} />
                  <Text style={[styles.actionText, { color: COLORS.teacher }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteStaff(member)} style={[styles.actionBtn, { backgroundColor: COLORS.errorLight }]}>
                  <Ionicons name="trash-outline" size={14} color={COLORS.error} />
                  <Text style={[styles.actionText, { color: COLORS.error }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showModal} onClose={() => setShowModal(false)} title={editStaff ? 'Edit Staff Member' : 'Add Staff Member'} scrollable>
        {[
          { label: 'Full Name *', key: 'name', placeholder: 'Patricia Torres' },
          { label: 'Email', key: 'email', placeholder: 'patricia@ministar.com', keyboardType: 'email-address' },
          { label: 'Phone', key: 'phone', placeholder: '+1 555-000-0000', keyboardType: 'phone-pad' },
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

        <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Role</Text>
        <View style={styles.optionsRow}>
          {ROLES.map(role => (
            <TouchableOpacity
              key={role}
              onPress={() => setForm(f => ({ ...f, role }))}
              style={[styles.optionChip, {
                backgroundColor: form.role === role ? getRoleColor(role) + '20' : theme.cardAlt,
                borderColor: form.role === role ? getRoleColor(role) : theme.border,
              }]}
            >
              <Text style={[styles.optionChipText, { color: form.role === role ? getRoleColor(role) : theme.textSecondary }]}>{role}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Classroom</Text>
        <View style={styles.optionsRow}>
          {CLASSROOMS.map(room => (
            <TouchableOpacity
              key={room}
              onPress={() => setForm(f => ({ ...f, classroom: room }))}
              style={[styles.optionChip, {
                backgroundColor: form.classroom === room ? COLORS.primary + '20' : theme.cardAlt,
                borderColor: form.classroom === room ? COLORS.primary : theme.border,
              }]}
            >
              <Text style={[styles.optionChipText, { color: form.classroom === room ? COLORS.primary : theme.textSecondary }]}>{room}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Status</Text>
        <View style={styles.optionsRow}>
          {STATUS_OPTIONS.map(s => {
            const colors = { active: COLORS.success, on_leave: COLORS.warning, part_time: COLORS.teacher };
            const labels = { active: 'Active', on_leave: 'On Leave', part_time: 'Part-time' };
            return (
              <TouchableOpacity
                key={s}
                onPress={() => setForm(f => ({ ...f, status: s }))}
                style={[styles.optionChip, {
                  backgroundColor: form.status === s ? colors[s] + '20' : theme.cardAlt,
                  borderColor: form.status === s ? colors[s] : theme.border,
                }]}
              >
                <Text style={[styles.optionChipText, { color: form.status === s ? colors[s] : theme.textSecondary }]}>{labels[s]}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Certifications (comma separated)</Text>
          <TextInput
            value={form.certifications}
            onChangeText={v => setForm(f => ({ ...f, certifications: v }))}
            placeholder="CPR, First Aid, ECE Level 2"
            placeholderTextColor={theme.textMuted}
            style={[styles.textInput, { backgroundColor: theme.input, color: theme.text, borderColor: theme.inputBorder }]}
          />
        </View>

        <Button
          title={saving ? t('saving') : editStaff ? 'Save Changes' : 'Add Staff Member'}
          onPress={save}
          loading={saving}
          color={COLORS.teacher}
          style={{ marginTop: 8 }}
        />
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
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  filterText: { fontSize: 12, fontWeight: '700' },
  countRow: { paddingHorizontal: 16, paddingVertical: 8 },
  countText: { fontSize: 12, fontWeight: '600' },
  staffCard: { borderRadius: 16, borderWidth: 1, marginBottom: 10, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', padding: 13 },
  staffName: { fontSize: 14, fontWeight: '800' },
  rolePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  rolePillText: { fontSize: 10, fontWeight: '800' },
  staffInfo: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  staffContact: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  certsRow: { flexDirection: 'row', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  certChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  certText: { fontSize: 9, fontWeight: '700' },
  certMore: { fontSize: 9, fontWeight: '700', alignSelf: 'center' },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 10 },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 13, fontWeight: '900' },
  statLbl: { fontSize: 9, fontWeight: '600', marginTop: 1 },
  statDivider: { width: 1 },
  cardActions: { flexDirection: 'row', gap: 8, padding: 10, borderTopWidth: 1 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 8, borderRadius: 10,
  },
  actionText: { fontSize: 12, fontWeight: '800' },
  fieldLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  textInput: { borderWidth: 1.5, borderRadius: 12, padding: 12, fontSize: 14, fontWeight: '500' },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optionChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, borderWidth: 1.5 },
  optionChipText: { fontSize: 12, fontWeight: '700' },
});
