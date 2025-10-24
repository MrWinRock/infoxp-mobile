import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, DeviceEventEmitter, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { login } from '../services/auth.service';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const onSubmit = async () => {
        if (loading) return;
        setError(null);
        setLoading(true);
        try {
            const res = await login({ email, password });
            if (res.user) {
                await AsyncStorage.setItem('auth.user', JSON.stringify(res.user));
            }
            DeviceEventEmitter.emit('user-updated');
            // Navigate to home tabs on success
            router.replace('/(tabs)');
        } catch (err: unknown) {
            if (typeof err === 'object' && err !== null && 'response' in err) {
                const response = (err as { response?: { data?: { message?: string } } }).response;
                setError(response?.data?.message || 'Login failed');
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                style={styles.flex1}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
            >
                <ScrollView
                    contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.title}>Sign in</Text>

                    <View style={styles.card}>
                        <View style={styles.field}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="you@example.com"
                                placeholderTextColor="#8A8F93"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        <View style={styles.field}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>Password</Text>
                                <Pressable
                                    accessibilityRole="button"
                                    onPress={() => setShowPassword(s => !s)}
                                    style={styles.eyeBtn}
                                >
                                    {showPassword ? (
                                        <Ionicons name="eye-off-outline" size={18} color="#DCDEDF" />
                                    ) : (
                                        <Ionicons name="eye-outline" size={18} color="#DCDEDF" />
                                    )}
                                </Pressable>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor="#8A8F93"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        {error ? <Text style={styles.error}>{error}</Text> : null}

                        <Pressable style={styles.button} disabled={loading} onPress={onSubmit} accessibilityRole="button">
                            <LinearGradient
                                colors={["#07BFFF", "#2C74FF"]}
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 1, y: 0.5 }}
                                style={styles.buttonGradient}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.buttonText}>Login</Text>
                                )}
                            </LinearGradient>
                        </Pressable>
                    </View>

                    {/* CTA placed below the card with higher height */}
                    <Link href="/sign-up" style={styles.ctaButton} replace asChild>
                        <Pressable accessibilityRole="button">
                            <LinearGradient
                                colors={["#07BFFF", "#2C74FF"]}
                                start={{ x: 0, y: 0.5 }}
                                end={{ x: 1, y: 0.5 }}
                                style={styles.buttonGradient}
                            >
                                <Text style={styles.buttonText}>Create an account</Text>
                            </LinearGradient>
                        </Pressable>
                    </Link>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2D333C',
    },
    flex1: { flex: 1 },
    content: {
        padding: 24,
        flexGrow: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginTop: 16,
        marginBottom: 16,
        color: '#DCDEDF',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#171D25',
        borderRadius: 12,
        padding: 16,
    },
    ctaButton: {
        width: '80%',
        height: 48,
        marginTop: 24,
        marginHorizontal: "auto",
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#2C74FF',
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 4,
    },
    field: {
        marginBottom: 12,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 6,
        color: '#DCDEDF',
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#3A3F46',
        backgroundColor: '#0B1218',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: '#DCDEDF',
        fontSize: 16,
    },
    eyeBtn: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    error: {
        color: '#ef4444',
        marginTop: 4,
        marginBottom: 8,
    },
    button: {
        height: 56,
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 8,
        shadowColor: '#2C74FF',
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 4,
    },
    buttonGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 18,
    },
    footerText: {},
    dim: {},
    link: {},
});
