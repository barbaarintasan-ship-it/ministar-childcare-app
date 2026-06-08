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
import * as api from '../../src/lib/api';

const STATUS_FILTERS = ['all', 'overdue', 'upcoming', 'paid'];

export default function BillingScreen() {
  const { t } = useLang();
  const { isDark } = useTheme();
  const theme = getTheme(isDark);

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [form, setForm] = useState({ childName: '', amount: '', dueDate: '', description: '', type: 'Tuition' });
  const [saving, setSaving] = useState(false);

  const normalizeInvoice = (p) => ({
    id: p.id,
    childName: p.child_name || p.childName || 'Unknown',
    parentName: p.parent_name || p.parentName || '',
    amount: parseFloat(p.amount) || 0,
    status: p.status || 'upcoming',
    description: p.description || p.desc || 'Monthly Tuition',
    type: p.type || 'Tuition',
    dueDate: p.due_date || p.dueDate || '',
    paidDate: p.paid_date || p.paidDate || null,
    method: p.method || 'Card',
    childId: p.child_id || p.childId || null,
  });

  useEffect(() => {
    api.getPayments()
      .then(data => setInvoices(data.map(normalizeInvoice)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const INVOICE_TYPES = ['Tuition', 'Meals', 'Activity Fee', 'Late Pickup', 'Other'];

  const filtered = invoices.filter(inv => {
    const matchStatus = filterStatus === 'all' || inv.status === filterStatus;
    const matchSearch = inv.childName?.toLowerCase().includes(search.toLowerCase()) ||
      inv.description?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.amount || 0), 0);
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + (i.amount || 0), 0);
  const totalUpcoming = invoices.filter(i => i.status === 'upcoming').reduce((s, i) => s + (i.amount || 0), 0);
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;

  const openInvoice = (inv) => {
    setSelectedInvoice(inv);
    setShowInvoiceModal(true);
  };

  const markPaid = (inv) => {
    Alert.alert(
      'Mark as Paid',
      `Mark invoice for ${inv.childName} as paid?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Paid', onPress: async () => {
            try {
              await api.markPaymentPaid(inv.id);
              const today = new Date().toISOString().split('T')[0];
              setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'paid', paidDate: today } : i));
              setShowInvoiceModal(false);
              Alert.alert('Updated', 'Invoice marked as paid.');
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  const sendReminder = (inv) => {
    Alert.alert('Reminder Sent', `Payment reminder sent to ${inv.parentName || inv.childName}'s parent.`);
  };

  const deleteInvoice = (inv) => {
    Alert.alert(
      'Delete Invoice',
      `Delete invoice for ${inv.childName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              await api.deletePayment(inv.id);
              setInvoices(prev => prev.filter(i => i.id !== inv.id));
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          }
        },
      ]
    );
  };

  const saveNew = async () => {
    if (!form.childName.trim() || !form.amount.trim()) {
      return Alert.alert('Error', 'Child name and amount are required');
    }
    setSaving(true);
    try {
      const payload = {
        description: form.description || form.type,
        amount: parseFloat(form.amount) || 0,
        due_date: form.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        status: 'upcoming',
        type: form.type,
        child_name: form.childName,
      };
      const created = await api.createPayment(payload);
      setInvoices(prev => [normalizeInvoice(created), ...prev]);
      setShowModal(false);
      setForm({ childName: '', amount: '', dueDate: '', description: '', type: 'Tuition' });
      Alert.alert('Created', 'Invoice created successfully!');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusStyle = (status) => {
    if (status === 'paid') return { label: '✓ Paid', type: 'success' };
    if (status === 'overdue') return { label: '! Overdue', type: 'error' };
    if (status === 'upcoming') return { label: '○ Upcoming', type: 'info' };
    return { label: status, type: 'gray' };
  };

  const formatAmount = (amt) => `$${(amt || 0).toFixed(2)}`;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header
        title={t('billing')}
        rightComponent={
          <TouchableOpacity onPress={() => setShowModal(true)} style={[styles.addBtn, { backgroundColor: COLORS.accent }]}>
            <Ionicons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        }
      />

      {/* Summary cards */}
      <View style={[styles.summaryBar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: COLORS.success + '15', borderColor: COLORS.success + '30' }]}>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
            <Text style={[styles.summaryAmt, { color: COLORS.success }]}>${(totalPaid / 1000).toFixed(1)}k</Text>
            <Text style={[styles.summaryLbl, { color: theme.textMuted }]}>Collected</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: COLORS.error + '15', borderColor: COLORS.error + '30' }]}>
            <Ionicons name="alert-circle" size={18} color={COLORS.error} />
            <Text style={[styles.summaryAmt, { color: COLORS.error }]}>${(totalOverdue / 1000).toFixed(1)}k</Text>
            <Text style={[styles.summaryLbl, { color: theme.textMuted }]}>{overdueCount} Overdue</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: COLORS.teacher + '15', borderColor: COLORS.teacher + '30' }]}>
            <Ionicons name="time" size={18} color={COLORS.teacher} />
            <Text style={[styles.summaryAmt, { color: COLORS.teacher }]}>${(totalUpcoming / 1000).toFixed(1)}k</Text>
            <Text style={[styles.summaryLbl, { color: theme.textMuted }]}>Upcoming</Text>
          </View>
        </View>
      </View>

      {/* Overdue banner */}
      {overdueCount > 0 && (
        <TouchableOpacity
          onPress={() => setFilterStatus('overdue')}
          style={[styles.overdueBanner, { backgroundColor: COLORS.errorLight, borderColor: COLORS.error + '44' }]}
        >
          <Ionicons name="warning" size={16} color={COLORS.error} />
          <Text style={[styles.overdueText, { color: COLORS.error }]}>
            {overdueCount} overdue invoice{overdueCount > 1 ? 's' : ''} — ${totalOverdue.toFixed(0)} outstanding
          </Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.error} />
        </TouchableOpacity>
      )}

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={[styles.searchInput, { backgroundColor: theme.input, borderColor: theme.inputBorder }]}>
          <Ionicons name="search" size={16} color={theme.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search invoices..."
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

      {/* Status filter */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={[styles.filtersBar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}
        contentContainerStyle={styles.filtersContent}
      >
        {STATUS_FILTERS.map(status => {
          const colors = { all: COLORS.admin, overdue: COLORS.error, upcoming: COLORS.teacher, paid: COLORS.success };
          const col = colors[status] || COLORS.admin;
          return (
            <TouchableOpacity
              key={status}
              onPress={() => setFilterStatus(status)}
              style={[styles.filterBtn, { backgroundColor: filterStatus === status ? col : theme.cardAlt, borderColor: col }]}
            >
              <Text style={[styles.filterText, { color: filterStatus === status ? '#fff' : col }]}>
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                {status === 'overdue' && overdueCount > 0 ? ` (${overdueCount})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading && <ActivityIndicator size="large" color={COLORS.admin} style={{ marginTop: 30 }} />}
      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🧾</Text>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No invoices found</Text>
          </View>
        ) : (
          filtered.map((inv) => {
            const badge = getStatusStyle(inv.status);
            const isOverdue = inv.status === 'overdue';
            return (
              <TouchableOpacity
                key={inv.id}
                onPress={() => openInvoice(inv)}
                style={[
                  styles.invoiceCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: isOverdue ? COLORS.error + '44' : theme.border,
                    borderLeftColor: isOverdue ? COLORS.error : inv.status === 'paid' ? COLORS.success : COLORS.teacher,
                  },
                ]}
              >
                <View style={styles.invoiceTop}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={[styles.invoiceName, { color: theme.text }]}>{inv.childName}</Text>
                      <Badge label={badge.label} type={badge.type} size="xs" />
                    </View>
                    <Text style={[styles.invoiceDesc, { color: theme.textSecondary }]}>
                      {inv.description || inv.type || 'Monthly Tuition'}
                    </Text>
                    <Text style={[styles.invoiceDate, { color: isOverdue ? COLORS.error : theme.textMuted }]}>
                      {isOverdue ? '⚠️ Due ' : '📅 Due '}{inv.dueDate}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <Text style={[styles.invoiceAmt, { color: isOverdue ? COLORS.error : inv.status === 'paid' ? COLORS.success : theme.text }]}>
                      {formatAmount(inv.amount)}
                    </Text>
                    <Ionicons name="chevron-forward" size={14} color={theme.textMuted} />
                  </View>
                </View>

                {/* Quick actions */}
                <View style={[styles.quickActions, { borderTopColor: theme.border }]}>
                  {inv.status !== 'paid' && (
                    <TouchableOpacity
                      onPress={() => markPaid(inv)}
                      style={[styles.quickBtn, { backgroundColor: COLORS.success + '15' }]}
                    >
                      <Ionicons name="checkmark-circle-outline" size={13} color={COLORS.success} />
                      <Text style={[styles.quickBtnText, { color: COLORS.success }]}>Mark Paid</Text>
                    </TouchableOpacity>
                  )}
                  {inv.status === 'overdue' && (
                    <TouchableOpacity
                      onPress={() => sendReminder(inv)}
                      style={[styles.quickBtn, { backgroundColor: COLORS.warning + '15' }]}
                    >
                      <Ionicons name="mail-outline" size={13} color={COLORS.warning} />
                      <Text style={[styles.quickBtnText, { color: COLORS.warning }]}>Remind</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => deleteInvoice(inv)}
                    style={[styles.quickBtn, { backgroundColor: COLORS.errorLight }]}
                  >
                    <Ionicons name="trash-outline" size={13} color={COLORS.error} />
                    <Text style={[styles.quickBtnText, { color: COLORS.error }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <Modal
          visible={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          title="Invoice Details"
        >
          <View style={[styles.detailBox, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailKey, { color: theme.textMuted }]}>Child</Text>
              <Text style={[styles.detailVal, { color: theme.text }]}>{selectedInvoice.childName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailKey, { color: theme.textMuted }]}>Description</Text>
              <Text style={[styles.detailVal, { color: theme.text }]}>{selectedInvoice.description || 'Monthly Tuition'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailKey, { color: theme.textMuted }]}>Amount</Text>
              <Text style={[styles.detailValLg, { color: selectedInvoice.status === 'overdue' ? COLORS.error : COLORS.success }]}>
                {formatAmount(selectedInvoice.amount)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailKey, { color: theme.textMuted }]}>Due Date</Text>
              <Text style={[styles.detailVal, { color: theme.text }]}>{selectedInvoice.dueDate}</Text>
            </View>
            {selectedInvoice.paidDate && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: theme.textMuted }]}>Paid On</Text>
                <Text style={[styles.detailVal, { color: COLORS.success }]}>{selectedInvoice.paidDate}</Text>
              </View>
            )}
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.detailKey, { color: theme.textMuted }]}>Status</Text>
              <Badge label={getStatusStyle(selectedInvoice.status).label} type={getStatusStyle(selectedInvoice.status).type} />
            </View>
          </View>

          <View style={{ gap: 10, marginTop: 8 }}>
            {selectedInvoice.status !== 'paid' && (
              <Button
                title="Mark as Paid"
                onPress={() => markPaid(selectedInvoice)}
                color={COLORS.success}
              />
            )}
            {selectedInvoice.status === 'overdue' && (
              <Button
                title="Send Payment Reminder"
                onPress={() => sendReminder(selectedInvoice)}
                color={COLORS.warning}
                variant="outline"
              />
            )}
          </View>
        </Modal>
      )}

      {/* Create Invoice Modal */}
      <Modal visible={showModal} onClose={() => setShowModal(false)} title="Create Invoice" scrollable>
        {[
          { label: 'Child Name *', key: 'childName', placeholder: 'Emma Johnson' },
          { label: 'Amount ($) *', key: 'amount', placeholder: '850.00', keyboardType: 'decimal-pad' },
          { label: 'Due Date', key: 'dueDate', placeholder: '2025-07-01' },
          { label: 'Description', key: 'description', placeholder: 'June Monthly Tuition' },
        ].map(field => (
          <View key={field.key} style={{ marginBottom: 12 }}>
            <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>{field.label}</Text>
            <TextInput
              value={form[field.key]}
              onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
              placeholder={field.placeholder}
              placeholderTextColor={theme.textMuted}
              keyboardType={field.keyboardType || 'default'}
              autoCapitalize={field.keyboardType ? 'none' : 'words'}
              style={[styles.textInput, { backgroundColor: theme.input, color: theme.text, borderColor: theme.inputBorder }]}
            />
          </View>
        ))}

        <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>Invoice Type</Text>
        <View style={styles.typesRow}>
          {INVOICE_TYPES.map(type => (
            <TouchableOpacity
              key={type}
              onPress={() => setForm(f => ({ ...f, type }))}
              style={[styles.typeChip, {
                backgroundColor: form.type === type ? COLORS.accent + '20' : theme.cardAlt,
                borderColor: form.type === type ? COLORS.accent : theme.border,
              }]}
            >
              <Text style={[styles.typeChipText, { color: form.type === type ? COLORS.accent : theme.textSecondary }]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title={saving ? t('saving') : 'Create Invoice'}
          onPress={saveNew}
          loading={saving}
          color={COLORS.accent}
          style={{ marginTop: 8 }}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  summaryBar: { padding: 12, borderBottomWidth: 1 },
  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryCard: {
    flex: 1, alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1, gap: 2,
  },
  summaryAmt: { fontSize: 16, fontWeight: '900' },
  summaryLbl: { fontSize: 9, fontWeight: '700' },
  overdueBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 12, marginTop: 8, padding: 10,
    borderRadius: 10, borderWidth: 1,
  },
  overdueText: { flex: 1, fontSize: 12, fontWeight: '700' },
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
  invoiceCard: {
    borderRadius: 14, borderWidth: 1, borderLeftWidth: 4, marginBottom: 10, overflow: 'hidden',
  },
  invoiceTop: { flexDirection: 'row', padding: 13 },
  invoiceName: { fontSize: 14, fontWeight: '800' },
  invoiceDesc: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  invoiceDate: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  invoiceAmt: { fontSize: 18, fontWeight: '900' },
  quickActions: { flexDirection: 'row', gap: 8, padding: 10, borderTopWidth: 1 },
  quickBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 9,
  },
  quickBtnText: { fontSize: 11, fontWeight: '800' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 15, fontWeight: '700' },
  detailBox: { borderRadius: 14, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1,
  },
  detailKey: { fontSize: 12, fontWeight: '700' },
  detailVal: { fontSize: 13, fontWeight: '700' },
  detailValLg: { fontSize: 18, fontWeight: '900' },
  fieldLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  textInput: { borderWidth: 1.5, borderRadius: 12, padding: 12, fontSize: 14, fontWeight: '500' },
  typesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, borderWidth: 1.5 },
  typeChipText: { fontSize: 12, fontWeight: '700' },
});
