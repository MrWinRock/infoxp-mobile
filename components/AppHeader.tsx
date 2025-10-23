import { AuthUser, getCurrentUser } from '@services/auth.service';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const AppHeader: React.FC = () => {
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const me = await getCurrentUser();
                if (mounted && me) setUser(me);
            } catch {
                // Not signed in
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.logo}>InfoXP</Text>
            {user ? (
                <Text style={styles.user}>Hello, {user.name}</Text>
            ) : (
                <Link href="/sign-in" asChild>
                    <Pressable accessibilityRole="button">
                        <Text style={styles.signIn}>Sign in</Text>
                    </Pressable>
                </Link>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 100,
        paddingHorizontal: 16,
        paddingTop: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#171D25',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#1F242B',
    },
    logo: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A9FFF',
    },
    user: {
        fontSize: 14,
        color: '#DCDEDF',
    },
    signIn: {
        fontSize: 14,
        color: '#DCDEDF',
        fontWeight: '600',
    },
});

export default AppHeader;
