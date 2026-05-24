import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../src/contexts/LangContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { COLORS, getTheme } from '../../src/constants/colors';
import Header from '../../src/components/common/Header';
import Card from '../../src/components/common/Card';
import Badge from '../../src/components/common/Badge';
import { PAYMENTS } from '../../src/data/mockData';

export default function PaymentsScreen() {
  const { t } = useLang();
  const { isDark } = useTheme();
  const theme = getTheme(isDark);

  const totalPaid = PAYMENTS.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const nextPayment = PAYMENTS.find(p => p.status === 'upcoming');
  const overdue = PAYMENTS.find(p => p.status === 'overdue');

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Header title={t('paymentsTitle')} />
      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary + '44' }]}>
            <Ionicons name="wallet" size={22} color={COLORS.primary} />
            <Text style={[styles.summaryValue, { color: COLORS.primaryDark }]}>${totalPaid.toLocaleString()}</Text>
            <Text style={[styles.summaryLabel, { color: COLORS.primary }]}>{t('totalPaid')}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: COLORS.warningLight, borderColor: '#fde68a' }]}>
            <Ionicons name="calendar" size={22} color={COLORS.warning} />
            <Text style={[styles.summaryValue, { color: '#78350f' }]}>${nextPayment?.amount || 0}</Text>
            <Text style={[styles.summaryLabel, { color: '#92400e' }]}>{t('nextPayment')}</Text>
          </View>
        </View>

        {/* Upcoming Payment */}
        {nextPayment && (
          <Card style={[styles.upcomingCard, { borderColor: COLORS.warning + '66' }]}>
            <View style={styles.upcomingHeader}>
              <View>
                <Text style={[styles.upcomingTitle, { color: theme.text }]}>{nextPayment.desc}</Text>
                <Text style={[styles.upcomingDate, { color: theme.textMuted }]}>
                  Due: {nextPayment.dueDate}
                </Text>
              </View>
              <Badge label="Upcoming" type="warning" />
            </View>
            <View style={styles.upcomingAmount}>
              <Text style={[styles.amountValue, { color: theme.text }]}>
                ${nextPayment.amount.toLocaleString()}
              </Text>
              <TouchableOpacity
                onPress={() => Alert.alert('Pay Now', 'Redirecting to payment...')}
                style={styles.payBtn}
              >
                <Ionicons name="card" size={16} color="#fff" />
                <Text style={styles.payBtnText}>{t('payNow')}</Text>
              </TouchableOpacity>
            </View>
            {/* Payment methods */}
            <View style={[styles.methodsRow, { borderTopColor: theme.border }]}>
              {['💳 Visa', '🏦 Bank', '💵 Cash'].map((m, i) => (
                <TouchableOpacity key={i} style={[styles.methodBtn, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}>
                  <Text style={[styles.methodText, { color: theme.text }]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        {/* Overdue */}
        {overdue && (
          <View style={[styles.overdueAlert, { backgroundColor: COLORS.errorLight, borderColor: COLORS.error + '44' }]}>
            <Ionicons name="alert-circle" size={18} color={COLORS.error} />
            <Text style={[styles.overdueText, { color: COLORS.error }]}>
              Overdue payment: ${overdue.amount} — Please pay immediately
            </Text>
          </View>
        )}

        {/* Payment History */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>🕒 {t('paymentHistory')}</Text>
        {PAYMENTS.filter(p => p.status === 'paid').map((payment, i) => (
          <View
            key={payment.id}
            style={[styles.paymentRow, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <View style={[styles.paymentIcon, { backgroundColor: COLORS.successLight }]}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.paymentDesc, { color: theme.text }]}>{payment.desc}</Text>
              <Text style={[styles.paymentMethod, { color: theme.textMuted }]}>
                {payment.method} · {payment.paidDate}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.paymentAmount, { color: theme.text }]}>
                ${payment.amount.toLocaleString()}
              </Text>
              <Badge label="Paid" type="paid" size="xs" />
            </View>
          </View>
        ))}

        {/* Add card */}
        <TouchableOpacity
          style={[styles.addCardBtn, { borderColor: COLORS.primary }]}
          onPress={() => Alert.alert('Add Card', 'Card management coming soon!')}
        >
          <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
          <Text style={[styles.addCardText, { color: COLORS.primary }]}>{t('addCard')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  summaryCard: {
    flex: 1, padding: 16, borderRadius: 18, borderWidth: 1, alignItems: 'center', gap: 6,
  },
  summaryValue: { fontSize: 22, fontWeight: '900' },
  summaryLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  upcomingCard: { borderWidth: 1.5, marginBottom: 14 },
  upcomingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  upcomingTitle: { fontSize: 14, fontWeight: '800' },
  upcomingDate: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  upcomingAmount: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amountValue: { fontSize: 28, fontWeight: '900' },
  payBtn: {
    backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center',
    gap: 6, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14,
  },
  payBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  methodsRow: {
    flexDirection: 'row', gap: 8, marginTop: 14, paddingTop: 14, borderTopWidth: 1,
  },
  methodBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 12, alignItems: 'center', borderWidth: 1,
  },
  methodText: { fontSize: 12, fontWeight: '700' },
  overdueAlert: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 14, marginBottom: 16, borderWidth: 1,
  },
  overdueText: { flex: 1, fontSize: 13, fontWeight: '700' },
  sectionTitle: { fontSize: 15, fontWeight: '900', marginBottom: 12 },
  paymentRow: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 14, borderWidth: 1, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  paymentIcon: {
    width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  paymentDesc: { fontSize: 13, fontWeight: '800' },
  paymentMethod: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  paymentAmount: { fontSize: 16, fontWeight: '900' },
  addCardBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center',
    borderWidth: 2, borderStyle: 'dashed', borderRadius: 14,
    paddingVertical: 14, marginTop: 8, marginBottom: 16,
  },
  addCardText: { fontSize: 14, fontWeight: '800' },
});
