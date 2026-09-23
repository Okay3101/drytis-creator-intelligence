import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { accountApi } from '../../api/account';
import { useAuth } from '../../store/auth';
import { colors, spacing, font, radius } from '../../utils/theme';

interface Message {
  id: number;
  sender_type: 'user' | 'admin';
  message: string;
  created_at: string;
}

export default function SupportScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const load = async () => {
    try {
      const { data } = await accountApi.support();
      setMessages(data.data?.messages ?? []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onSend = async () => {
    if (!text.trim()) return;
    const msg = text.trim();
    setText('');
    setSending(true);
    try {
      await accountApi.sendSupportMessage(msg);
      await load();
      listRef.current?.scrollToEnd({ animated: true });
    } catch {}
    setSending(false);
  };

  if (loading) {
    return <View style={s.center}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.header}>
        <Text style={s.title}>Support</Text>
        <Text style={s.subtitle}>Our team typically replies within 24 hours</Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => String(m.id)}
        contentContainerStyle={s.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const isUser = item.sender_type === 'user';
          return (
            <View style={[s.bubble, isUser ? s.userBubble : s.adminBubble]}>
              <Text style={[s.bubbleText, isUser ? s.userText : s.adminText]}>{item.message}</Text>
              <Text style={s.bubbleTime}>
                {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={s.emptyBox}>
            <Text style={s.emptyText}>Send us a message and we'll get back to you soon.</Text>
          </View>
        }
      />

      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          style={[s.sendBtn, (!text.trim() || sending) && s.sendDisabled]}
          onPress={onSend}
          disabled={!text.trim() || sending}
        >
          <Text style={s.sendIcon}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg },
  header: { padding: spacing.lg, paddingTop: spacing.xl + spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: font.xl, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
  list: { padding: spacing.lg, gap: spacing.sm },
  bubble: { maxWidth: '80%', borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.xs },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  adminBubble: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  bubbleText: { fontSize: font.base, lineHeight: 22 },
  userText: { color: colors.white },
  adminText: { color: colors.text },
  bubbleTime: { fontSize: 10, marginTop: 4, opacity: 0.6, color: colors.textMuted },
  emptyBox: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyText: { color: colors.textMuted, fontSize: font.base, textAlign: 'center' },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm,
    padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1, backgroundColor: colors.surfaceAlt, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md,
    color: colors.text, fontSize: font.base, maxHeight: 120,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  sendDisabled: { opacity: 0.4 },
  sendIcon: { color: colors.white, fontSize: font.lg, fontWeight: '700' },
});
