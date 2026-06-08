import { useState, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { useLang } from '../../src/contexts/LangContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { COLORS, getTheme } from '../../src/constants/colors';
import Avatar from '../../src/components/common/Avatar';
import Badge from '../../src/components/common/Badge';
import * as api from '../../src/lib/api';

const QUICK_REPLIES = [
  'Thanks! 😊', 'What time?', 'She loves art!', 'Great news!',
  'On my way!', 'Can you call me?',
];

export default function MessagesScreen() {
  const { user } = useAuth();
  const { t } = useLang();
  const { isDark } = useTheme();
  const theme = getTheme(isDark);
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);

  const [child, setChild] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');

  useEffect(() => {
    api.getChildren()
      .then(kids => {
        const firstChild = kids[0] || null;
        setChild(firstChild);
        if (firstChild) {
          return api.getMessages(firstChild.id).then(msgs => {
            setMessages(msgs.map(m => ({
              id: m.id,
              role: m.sender_role || m.role || 'teacher',
              sender: m.sender_name || m.sender || 'Teacher',
              text: m.text || m.message || '',
              time: m.time || new Date(m.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
              read: m.read ?? true,
            })));
          });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sendMessage = async (text) => {
    const val = (text || input).trim();
    if (!val || !child) return;
    const newMsg = {
      id: String(Date.now()),
      role: 'parent',
      sender: user?.name || 'Parent',
      text: val,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      read: true,
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    try {
      await api.sendMessage(child.id, val, child.teacherId);
    } catch (e) {
      console.error('Send message failed:', e.message);
    }
  };

  function MessageBubble({ msg }) {
    const isParent = msg.role === 'parent';
    return (
      <View style={[styles.msgWrapper, { alignItems: isParent ? 'flex-end' : 'flex-start' }]}>
        {!isParent && (
          <Avatar name={msg.sender} emoji="👩‍🏫" size={30} style={{ marginRight: 8, alignSelf: 'flex-end', marginBottom: 2 }} />
        )}
        <View style={{ maxWidth: '78%' }}>
          {!isParent && (
            <Text style={[styles.senderName, { color: theme.textMuted }]}>{msg.sender}</Text>
          )}
          <View style={[
            styles.bubble,
            isParent
              ? { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 }
              : { backgroundColor: theme.card, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: theme.border },
          ]}>
            <Text style={[styles.bubbleText, { color: isParent ? '#fff' : theme.text }]}>
              {msg.text}
            </Text>
          </View>
          <Text style={[styles.msgTime, { color: theme.textMuted, textAlign: isParent ? 'right' : 'left' }]}>
            {msg.time}
            {isParent && ' ✓✓'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: COLORS.primary, paddingTop: insets.top + 10 }]}>
        <View style={styles.headerContent}>
          <Avatar name="Teacher" emoji="👩‍🏫" size={42} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerName}>{child?.room ? `${child.room} Teacher` : 'Teacher'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={styles.onlineDot} />
              <Text style={styles.headerSub}>Active now · {child?.room || ''} {child?.roomEmoji || ''}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.callBtn}>
            <Ionicons name="call" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages list */}
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.msgList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListHeaderComponent={
          <View style={[styles.systemMsg, { borderColor: theme.border }]}>
            <Text style={[styles.systemMsgText, { color: theme.textMuted }]}>
              🔒 Conversation about {child?.name || 'your child'}
            </Text>
          </View>
        }
        renderItem={({ item }) => <MessageBubble msg={item} />}
      />
      )}

      {/* Quick replies */}
      <View style={[styles.quickReplies, { borderTopColor: theme.border }]}>
        <FlatList
          horizontal
          data={QUICK_REPLIES}
          keyExtractor={(_, i) => String(i)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 8, paddingVertical: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => sendMessage(item)}
              style={[styles.quickReply, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <Text style={[styles.quickReplyText, { color: theme.text }]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Input */}
      <View style={[
        styles.inputBar,
        { backgroundColor: theme.card, borderTopColor: theme.border, paddingBottom: insets.bottom + 8 },
      ]}>
        <TouchableOpacity style={[styles.attachBtn, { backgroundColor: theme.cardAlt }]}>
          <Ionicons name="attach" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={t('typeMessage')}
          placeholderTextColor={theme.textMuted}
          multiline
          style={[styles.textInput, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
          onSubmitEditing={() => sendMessage()}
        />
        <TouchableOpacity
          onPress={() => sendMessage()}
          style={[styles.sendBtn, { backgroundColor: input.trim() ? COLORS.primary : theme.cardAlt }]}
          disabled={!input.trim()}
        >
          <Ionicons name="send" size={18} color={input.trim() ? '#fff' : theme.textMuted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  headerName: { color: '#fff', fontSize: 15, fontWeight: '900' },
  onlineDot: { width: 7, height: 7, backgroundColor: '#4ade80', borderRadius: 4 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' },
  callBtn: {
    width: 36, height: 36, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  msgList: { padding: 16, gap: 4 },
  systemMsg: { alignSelf: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 16 },
  systemMsgText: { fontSize: 11, fontWeight: '600' },
  msgWrapper: { flexDirection: 'row', marginVertical: 3 },
  senderName: { fontSize: 10, fontWeight: '600', marginBottom: 3 },
  bubble: {
    padding: 11, borderRadius: 18, maxWidth: '100%',
  },
  bubbleText: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  msgTime: { fontSize: 10, fontWeight: '600', marginTop: 3 },
  quickReplies: { borderTopWidth: 1 },
  quickReply: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5,
  },
  quickReplyText: { fontSize: 12, fontWeight: '700' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 12, paddingTop: 10, borderTopWidth: 1,
  },
  attachBtn: {
    width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
  textInput: {
    flex: 1, borderRadius: 20, borderWidth: 1.5, paddingHorizontal: 14,
    paddingVertical: 10, fontSize: 14, maxHeight: 100, fontWeight: '500',
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
  },
});
