import { AuthUser, getCurrentUser } from '@services/auth.service';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
    showBack?: boolean;
};

export const AppHeader: React.FC<Props> = ({ showBack }) => {
    const router = useRouter();
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const me = await getCurrentUser();
                if (mounted && me) setUser(me);
            } catch {
                // not signed in
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <View style={styles.container}>
            {/* Left area: back button if requested */}
            <View style={styles.leftArea}>
                {showBack ? (
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => router.replace('/(tabs)')}
                        style={styles.backBtn}
                    >
                        <Text style={styles.backIcon}>←</Text>
                        <Text style={styles.backText}>Back</Text>
                    </Pressable>
                ) : null}
            </View>

            {/* centered title */}
            <View style={styles.centerWrap} pointerEvents="none">
                <Text style={styles.logo}>InfoXP</Text>
            </View>

            {/* Right area: user or sign in link */}
            <View style={styles.rightArea}>
                {user ? (
                    <Text style={styles.user}>{user.name}</Text>
                ) : (
                    <Link href="/sign-in" asChild>
                        <Pressable accessibilityRole="button">
                            <Text style={styles.signIn}>Sign in</Text>
                        </Pressable>
                    </Link>
                )}
            </View>
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
        position: 'relative',
        backgroundColor: '#171D25',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#1F242B',
    },
    leftArea: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    rightArea: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    centerWrap: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
        paddingVertical: 6,
        paddingRight: 8,
    },
    backIcon: {
        color: '#1A9FFF',
        fontSize: 16,
        marginRight: 4,
    },
    backText: {
        color: '#1A9FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    logo: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1A9FFF',
    },
    user: {
        fontSize: 16,
        color: '#DCDEDF',
    },
    signIn: {
        fontSize: 16,
        color: '#DCDEDF',
        fontWeight: '600',
    },
});

export default AppHeader;
