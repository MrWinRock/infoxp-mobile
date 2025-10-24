import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, DeviceEventEmitter, Pressable, StyleSheet, Text, View } from 'react-native';
import { AuthUser, logout as doLogout } from '../services/auth.service';

export default function Profile() {
    const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
    const router = useRouter();

    const readUser = async () => {
        try {
            const raw = await AsyncStorage.getItem('auth.user');
            const parsed: AuthUser | null = raw ? JSON.parse(raw) : null;
            setUser(parsed?.name ? parsed : null);
        } catch {
            setUser(null);
        }
    };

    useEffect(() => {
        let mounted = true;
        (async () => {
            if (!mounted) return;
            await readUser();
        })();
        const sub = DeviceEventEmitter.addListener('user-updated', readUser);
        return () => {
            mounted = false;
            sub.remove();
        };
    }, []);

    useEffect(() => {
        if (user === null) {
            router.replace('/(tabs)');
        }
    }, [user, router]);

    const onLogout = async () => {
        await doLogout();
        DeviceEventEmitter.emit('user-updated');
        router.replace('/(tabs)');
    };

    if (user === undefined) {
        return (
            <View style={styles.loadingWrap}>
                <ActivityIndicator color="#1A9FFF" />
            </View>
        );
    }

    if (user === null) return null;

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Profile</Text>
                <View style={styles.info}>
                    <Text style={styles.row}><Text style={styles.key}>Name:</Text> {user.name}</Text>
                    {user.email ? (
                        <Text style={styles.row}><Text style={styles.key}>Email:</Text> {user.email}</Text>
                    ) : null}
                </View>
                <Pressable style={styles.button} onPress={onLogout}>
                    <Text style={styles.buttonText}>Logout</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#2D333C',
    },
    loadingWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2D333C',
    },
    card: {
        backgroundColor: '#171D25',
        borderRadius: 12,
        padding: 16,
        marginTop: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 12,
        color: '#DCDEDF',
    },
    info: {
        gap: 8,
        marginBottom: 16,
    },
    row: {
        color: '#DCDEDF',
        fontSize: 16,
    },
    key: {
        fontWeight: '700',
    },
    button: {
        height: 48,
        borderRadius: 10,
        backgroundColor: '#1A9FFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#0B1218',
        fontWeight: '700',
        fontSize: 16,
    },
});
