import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { API_BASE_URL } from '../../config/api';
import {
    ApiChatMessage,
    HttpError,
    deleteSessionById,
    endSessionById,
    getMessagesBySessionId,
    getSession,
    listSessionsByUserId,
    startChatStream,
} from '../../services/chat.service';

type Sender = 'user' | 'chatbot';
interface Message { sender: Sender; text: string }
interface Thread {
    id: string;
    title: string;
    createdAt: number;
    updatedAt: number;
    preview: string;
    messageCount: number;
}

export default function ChatScreen() {
    // UI state
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [userId, setUserId] = useState<string | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [threads, setThreads] = useState<Thread[]>([]);
    const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
    const [isThreadsOpen, setIsThreadsOpen] = useState(false);
    const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');

    const scrollRef = useRef<ScrollView | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const CHAT_BASE = useMemo(() => `${API_BASE_URL}/api/chat`, []);

    const now = () => Date.now();

    // Read user from storage
    const restoreUserId = useCallback(async (): Promise<string | null> => {
        try {
            const raw = await AsyncStorage.getItem('auth.user');
            if (raw) {
                const obj = JSON.parse(raw) as Record<string, any>;
                const id = obj?.id || obj?._id || obj?.user?.id || obj?.user?._id;
                if (id) return String(id);
            }
        } catch { }
        return (await AsyncStorage.getItem('chat_user_id')) || null;
    }, []);

    // Mount logs
    useEffect(() => {
        console.log('[Chat] mounted');
        return () => console.log('[Chat] unmounted');
    }, []);

    // Restore userId
    useEffect(() => {
        (async () => {
            const id = await restoreUserId();
            if (id) {
                console.log('[Chat] restored userId:', id);
                setUserId(id);
            } else {
                console.log('[Chat] no stored userId');
            }
        })();
    }, [restoreUserId]);

    const mapServerMessages = useCallback((server: ApiChatMessage[]): Message[] =>
        server.map((m) => ({ sender: m.sender === 'user' ? 'user' : 'chatbot', text: m.message })), []);

    const refreshThreads = useCallback(
        async (uid: string, options?: { autoSelectIfNone?: boolean }): Promise<Thread[]> => {
            const autoSelect = options?.autoSelectIfNone ?? true;
            try {
                const token = await AsyncStorage.getItem('auth_token');
                const { sessions } = await listSessionsByUserId(CHAT_BASE, uid, 1, 50, token || undefined);
                const mapped: Thread[] = sessions
                    .map((s, i) => {
                        const created = (s as any).createdAt || s.session_started;
                        const updated = (s as any).lastMessageAt || (s as any).updatedAt || s.session_started;
                        return {
                            id: (s as any)._id,
                            title: `Chat ${sessions.length - i}`,
                            createdAt: created ? new Date(created).getTime() : now(),
                            updatedAt: updated ? new Date(updated).getTime() : now(),
                            preview: '',
                            messageCount: (s as any).messageCount ?? 0,
                        };
                    })
                    .sort((a, b) => b.updatedAt - a.updatedAt);
                setThreads(mapped);
                if (autoSelect && !activeThreadId && mapped[0]) {
                    setActiveThreadId(mapped[0].id);
                }
                return mapped;
            } catch (e) {
                console.error('Failed to load sessions', e);
                return [];
            }
        },
        [CHAT_BASE, activeThreadId]
    );

    // Ensure at least one session exists and load thread list
    useEffect(() => {
        if (!userId) return;
        (async () => {
            const token = (await AsyncStorage.getItem('auth_token')) || undefined;
            const list = await refreshThreads(userId);
            if (list.length === 0) {
                try {
                    const s = await getSession(CHAT_BASE, userId, token);
                    setSessionId((s as any)?._id || null);
                } catch (e) {
                    console.warn('getSession failed, will rely on first message to create.', e);
                } finally {
                    await refreshThreads(userId);
                }
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    // Load messages for active session from server
    useEffect(() => {
        (async () => {
            if (!userId || !activeThreadId) return;
            try {
                setLoadingHistory(true);
                setError(null);
                setSessionId(activeThreadId);
                const token = (await AsyncStorage.getItem('auth_token')) || undefined;
                const serverMessages = await getMessagesBySessionId(CHAT_BASE, activeThreadId, 200, token);
                const mapped = mapServerMessages(serverMessages);
                setMessages(
                    mapped.length === 0
                        ? [{ sender: 'chatbot', text: 'Hi! This is a new session. Ask me anything to get started.' }]
                        : mapped
                );
            } catch (e) {
                if (e instanceof HttpError && e.status === 404) {
                    setMessages([{ sender: 'chatbot', text: 'Hi! This is a new session. Ask me anything to get started.' }]);
                } else {
                    console.error('Failed to load messages', e);
                    setError(e instanceof Error ? e.message : 'Failed to load messages');
                }
            } finally {
                setLoadingHistory(false);
            }
        })();
    }, [userId, activeThreadId, CHAT_BASE, mapServerMessages]);

    // Auto scroll to bottom when messages change
    useEffect(() => {
        const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
        return () => clearTimeout(t);
    }, [messages]);

    useEffect(() => () => abortRef.current?.abort(), []);

    const appendBotPlaceholder = () => setMessages(prev => [...prev, { sender: 'chatbot', text: '...' }]);
    const replaceLastBotText = (updater: (prevText: string) => string) => {
        setMessages(prev => {
            const last = prev[prev.length - 1];
            if (!last || last.sender !== 'chatbot') return prev;
            const clone = [...prev];
            clone[clone.length - 1] = { sender: 'chatbot', text: updater(last.text) };
            return clone;
        });
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isStreaming) return;
        setError(null);
        const currentInput = input;
        setInput('');
        setMessages(prev => [...prev, { sender: 'user', text: currentInput }]);
        appendBotPlaceholder();
        setIsStreaming(true);

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        let endpoint = CHAT_BASE;
        if (activeThreadId) endpoint = `${CHAT_BASE}/${encodeURIComponent(activeThreadId)}`;

        console.log('[Chat] POST /api/chat', { endpoint, hasUserId: !!userId, hasSession: !!activeThreadId, chars: currentInput.length });

        try {
            const token = (await AsyncStorage.getItem('auth_token')) || undefined;
            const result = await startChatStream({
                endpoint,
                message: currentInput,
                userId,
                token,
                signal: controller.signal,
                extraBody: { toolName: 'web_search' },
            });

            if (result.newSessionId) {
                setSessionId(result.newSessionId);
                setActiveThreadId(prev => (prev ?? result.newSessionId ?? null));
            }
            if (result.newUserId && !userId) {
                setUserId(result.newUserId);
                await AsyncStorage.setItem('chat_user_id', result.newUserId);
                console.log('[Chat] received x-user-id header:', result.newUserId);
            }

            if (result.jsonText !== undefined) {
                replaceLastBotText(() => result.jsonText || '(empty response)');
                console.log('[Chat] non-stream response complete');
                return;
            }

            if (!result.stream) {
                replaceLastBotText(() => '(no data)');
                console.log('[Chat] no stream returned');
                return;
            }

            let first = true;
            for await (const chunk of result.stream) {
                if (!chunk) continue;
                replaceLastBotText(prevText => (first ? chunk : prevText + chunk));
                first = false;
            }
            console.log('[Chat] stream finished');
            replaceLastBotText(prev => (prev === '...' ? '(no data)' : prev));

            if (userId) {
                const list = await refreshThreads(userId);
                if (!activeThreadId && list[0]) {
                    setActiveThreadId(list[0].id);
                }
            }
        } catch (err: any) {
            if (err?.name === 'AbortError') {
                replaceLastBotText(() => '[stopped]');
                console.log('[Chat] request aborted');
            } else {
                console.error('Chat request error:', err);
                setError(err instanceof Error ? err.message : 'Request failed');
                replaceLastBotText(() => 'Sorry, an error occurred. Please try again.');
            }
        } finally {
            setIsStreaming(false);
        }
    };

    const stopStreaming = () => {
        if (isStreaming) {
            console.log('[Chat] Stop pressed');
            abortRef.current?.abort();
        }
    };

    const handleNewChat = async () => {
        console.log('[Chat] New Chat');
        abortRef.current?.abort();
        setIsStreaming(false);
        setMessages([]);
        setInput('');
        setError(null);
        try {
            if (activeThreadId) {
                const token = (await AsyncStorage.getItem('auth_token')) || undefined;
                await endSessionById(CHAT_BASE, activeThreadId, token);
            }
        } catch (e) {
            console.warn('End session failed (continuing):', e);
        }
        setActiveThreadId(null);
        setSessionId(null);
        if (userId) await refreshThreads(userId, { autoSelectIfNone: false });
    };

    const handleDeleteThread = async (tid: string) => {
        try {
            const token = (await AsyncStorage.getItem('auth_token')) || undefined;
            await deleteSessionById(CHAT_BASE, tid, token);
            if (userId) {
                const list = await refreshThreads(userId);
                const nextId = list[0]?.id || null;
                setActiveThreadId(nextId);
            }
            setMessages([]);
        } catch (e) {
            console.error('Delete session failed', e);
            setError(e instanceof Error ? e.message : 'Failed to delete session');
        }
    };

    const beginRename = (tid: string, current: string) => {
        setEditingThreadId(tid);
        setEditingTitle(current);
    };
    const commitRename = () => {
        if (!editingThreadId) return;
        const title = editingTitle.trim();
        if (!title) return setEditingThreadId(null);
        setThreads(prev => prev.map(t => (t.id === editingThreadId ? { ...t, title } : t)));
        setEditingThreadId(null);
        setEditingTitle('');
    };

    return (
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={styles.container}>
            {/* Header */}
            <View style={styles.headerWrap}>
                <View style={styles.headerLeft}>
                    <Pressable onPress={() => setIsThreadsOpen(true)} style={styles.iconBtn} accessibilityRole="button">
                        <Ionicons name="chatbubbles-outline" size={22} color="#DCDEDF" />
                    </Pressable>
                    <View style={styles.botAvatar}><Text style={{ fontSize: 18 }}>🤖</Text></View>
                    <View>
                        <Text style={styles.headerTitle}>InfoXP Assistant</Text>
                        <Text style={styles.headerSub}>Real-time streaming responses</Text>
                    </View>
                    {sessionId ? (
                        <View style={styles.sessionPill}><Text style={styles.sessionPillText}>Session • {sessionId.slice(-6)}</Text></View>
                    ) : null}
                </View>
                <View style={styles.headerRight}>
                    {isStreaming ? (
                        <Pressable onPress={stopStreaming} style={[styles.actionBtn, { backgroundColor: '#DC2626' }]} accessibilityRole="button">
                            <Ionicons name="stop" size={18} color="#fff" />
                            <Text style={styles.actionBtnText}>Stop</Text>
                        </Pressable>
                    ) : (
                        <Pressable onPress={handleNewChat} style={styles.actionBtn} accessibilityRole="button">
                            <Ionicons name="add" size={18} color="#fff" />
                            <Text style={styles.actionBtnText}>New</Text>
                        </Pressable>
                    )}
                </View>
            </View>

            {/* Messages */}
            <View style={styles.chatBody}>
                <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
                    {loadingHistory && messages.length === 0 ? (
                        <View style={{ gap: 12 }}>
                            <View style={styles.skelSmall} />
                            <View style={styles.skelLarge} />
                            <View style={styles.skelSmall} />
                        </View>
                    ) : messages.length === 0 ? (
                        <View style={styles.emptyWrap}>
                            <Text style={styles.emptyIcon}>💬</Text>
                            <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
                        </View>
                    ) : (
                        <View style={{ gap: 10 }}>
                            {messages.map((m, i) => (
                                <View key={i} style={[styles.msgRow, m.sender === 'user' ? styles.right : styles.left]}>
                                    <View style={[styles.bubble, m.sender === 'user' ? styles.userBubble : styles.botBubble]}>
                                        <Text selectable style={styles.msgText}>{m.text}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </ScrollView>
            </View>

            {/* Composer */}
            <View style={styles.composerWrap}>
                <View style={styles.composer}>
                    <TextInput
                        value={input}
                        onChangeText={setInput}
                        placeholder="Message InfoXP Assistant..."
                        placeholderTextColor="#8A8F93"
                        style={styles.input}
                        editable={!isStreaming}
                        onSubmitEditing={handleSendMessage}
                        returnKeyType="send"
                    />
                    <Pressable onPress={handleSendMessage} disabled={!input.trim() || isStreaming} style={[styles.sendBtn, (!input.trim() || isStreaming) && styles.sendBtnDisabled]} accessibilityRole="button">
                        <Ionicons name="send" size={18} color="#fff" />
                    </Pressable>
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                {!userId ? <Text style={styles.hintText}>A user ID will be assigned automatically on your first message.</Text> : null}
            </View>

            {/* Threads Modal */}
            <Modal visible={isThreadsOpen} animationType="slide" onRequestClose={() => setIsThreadsOpen(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Your chats</Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <Pressable onPress={handleNewChat} style={styles.modalBtn} accessibilityRole="button">
                                <Ionicons name="add" size={18} color="#fff" />
                                <Text style={styles.modalBtnText}>New</Text>
                            </Pressable>
                            <Pressable onPress={() => setIsThreadsOpen(false)} style={[styles.modalBtn, { backgroundColor: '#374151' }]} accessibilityRole="button">
                                <Ionicons name="close" size={18} color="#fff" />
                                <Text style={styles.modalBtnText}>Close</Text>
                            </Pressable>
                        </View>
                    </View>
                    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12 }}>
                        {threads.length === 0 ? (
                            <Text style={{ color: '#9AA0A6', textAlign: 'center', marginTop: 16 }}>No chats yet</Text>
                        ) : (
                            <View style={{ gap: 8 }}>
                                {threads.map((t) => (
                                    <Pressable key={t.id} onPress={() => { setActiveThreadId(t.id); setIsThreadsOpen(false); }} style={[styles.threadRow, t.id === activeThreadId && styles.threadActive]} accessibilityRole="button">
                                        <View style={{ flex: 1 }}>
                                            {editingThreadId === t.id ? (
                                                <TextInput
                                                    value={editingTitle}
                                                    onChangeText={setEditingTitle}
                                                    onBlur={commitRename}
                                                    onSubmitEditing={commitRename}
                                                    style={styles.threadEdit}
                                                    autoFocus
                                                />
                                            ) : (
                                                <>
                                                    <Text style={styles.threadTitle} numberOfLines={1}>{t.title || 'New chat'}</Text>
                                                    <Text style={styles.threadMeta} numberOfLines={1}>{new Date(t.updatedAt).toLocaleString()} • {t.messageCount} msg</Text>
                                                </>
                                            )}
                                        </View>
                                        <Pressable onPress={() => editingThreadId === t.id ? commitRename() : beginRename(t.id, t.title)} style={styles.iconSmall} accessibilityRole="button">
                                            <Ionicons name={editingThreadId === t.id ? 'checkmark' : 'create-outline'} size={16} color="#DCDEDF" />
                                        </Pressable>
                                        <Pressable onPress={() => handleDeleteThread(t.id)} style={[styles.iconSmall, { marginLeft: 4 }]} accessibilityRole="button">
                                            <Ionicons name="trash-outline" size={16} color="#ef4444" />
                                        </Pressable>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#2D333C' },
    headerWrap: {
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#1F242B',
        backgroundColor: '#171D25',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#0F141B' },
    botAvatar: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#0F141B', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: '#DCDEDF', fontSize: 16, fontWeight: '700' },
    headerSub: { color: '#9AA0A6', fontSize: 12 },
    sessionPill: { marginLeft: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999, backgroundColor: '#0F141B' },
    sessionPillText: { color: '#9AA0A6', fontSize: 10 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1A9FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
    actionBtnText: { color: '#fff', fontWeight: '700' },

    chatBody: { flex: 1, backgroundColor: '#171D25' },
    msgRow: { width: '100%', flexDirection: 'row' },
    left: { justifyContent: 'flex-start' },
    right: { justifyContent: 'flex-end' },
    bubble: { maxWidth: '84%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
    userBubble: { backgroundColor: '#1A9FFF', borderTopRightRadius: 4 },
    botBubble: { backgroundColor: '#0F141B', borderTopLeftRadius: 4 },
    msgText: { color: '#FFFFFF' },

    skelSmall: { height: 20, width: 120, backgroundColor: '#0F141B', borderRadius: 6 },
    skelLarge: { height: 80, width: '100%', backgroundColor: '#0F141B', borderRadius: 10 },
    emptyWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
    emptyIcon: { fontSize: 28, marginBottom: 6, color: '#9AA0A6' },
    emptyText: { color: '#9AA0A6' },

    composerWrap: { padding: 12, backgroundColor: '#171D25', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#1F242B' },
    composer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    input: { flex: 1, backgroundColor: '#0F141B', color: '#DCDEDF', borderRadius: 12, paddingHorizontal: 12, paddingVertical: Platform.select({ ios: 12, android: 8 }), borderWidth: 1, borderColor: '#243042' },
    sendBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#1A9FFF', alignItems: 'center', justifyContent: 'center' },
    sendBtnDisabled: { opacity: 0.5 },
    errorText: { color: '#ef4444', textAlign: 'center', marginTop: 6 },
    hintText: { color: '#9AA0A6', textAlign: 'center', marginTop: 4, fontSize: 12 },

    modalContainer: { flex: 1, backgroundColor: '#2D333C' },
    modalHeader: { paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#171D25', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#1F242B', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    modalTitle: { color: '#DCDEDF', fontSize: 16, fontWeight: '700' },
    modalBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1A9FFF', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
    modalBtnText: { color: '#fff', fontWeight: '700' },
    threadRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#0F141B', borderRadius: 10 },
    threadActive: { backgroundColor: '#162032' },
    threadTitle: { color: '#DCDEDF', fontWeight: '700' },
    threadMeta: { color: '#9AA0A6', fontSize: 12, marginTop: 2 },
    iconSmall: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#243042' },
    threadEdit: { color: '#DCDEDF', backgroundColor: '#0F141B', borderColor: '#243042', borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6 },
});
