import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthUser } from "@services/auth.service";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { DeviceEventEmitter, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
    showBack?: boolean;
};

export const AppHeader: React.FC<Props> = ({ showBack }) => {
    const router = useRouter();
    const [user, setUser] = useState<AuthUser | null>(null);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const raw = await AsyncStorage.getItem("auth.user");
                if (!mounted) return;
                if (raw) {
                    const me = JSON.parse(raw) as AuthUser;
                    setUser(me);
                } else {
                    setUser(null);
                }
            } catch {
                if (mounted) setUser(null);
            }
        })();
        const sub = DeviceEventEmitter.addListener('user-updated', async () => {
            try {
                const raw = await AsyncStorage.getItem('auth.user');
                setUser(raw ? (JSON.parse(raw) as AuthUser) : null);
            } catch {
                setUser(null);
            }
        });
        return () => {
            mounted = false;
            sub.remove();
        };
    }, []);

    const contentHeight = 56;
    return (
        <View
            style={[
                styles.container,
                { paddingTop: insets.top, height: insets.top + contentHeight },
            ]}
        >
            {/* Left area: back button if requested */}
            <View style={styles.leftArea}>
                {showBack ? (
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => router.replace("/(tabs)")}
                        style={styles.backBtn}
                    >
                        <Text style={styles.backIcon}>←</Text>
                    </Pressable>
                ) : null}
            </View>

            {/* Absolute centered title so it stays centered regardless of left/right */}
            <View style={styles.centerWrap} pointerEvents="none">
                <Text style={styles.logo}>InfoXP</Text>
            </View>

            {/* Right area: user or sign in link */}
            <View style={styles.rightArea}>
                {user ? (
                    <Link href="/profile" asChild>
                        <Pressable accessibilityRole="button">
                            <Text style={styles.user}>{user.name}</Text>
                        </Pressable>
                    </Link>
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
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        backgroundColor: "#171D25",
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#1F242B",
    },
    leftArea: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    rightArea: {
        flexDirection: "row",
        alignItems: "center",
    },
    centerWrap: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 48,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    backIcon: {
        color: "#1A9FFF",
        fontSize: 32,
        lineHeight: 36,
        fontWeight: "800",
        textAlign: "center",
    },
    logo: {
        fontSize: 32,
        lineHeight: 40,
        fontWeight: "700",
        color: "#1A9FFF",
    },
    user: {
        fontSize: 16,
        lineHeight: 20,
        color: "#DCDEDF",
    },
    signIn: {
        fontSize: 16,
        lineHeight: 20,
        color: "#DCDEDF",
        fontWeight: "600",
    },
});

export default AppHeader;
