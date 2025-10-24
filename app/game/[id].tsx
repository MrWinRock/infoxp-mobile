import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchGameById, Game, toImageUri } from '../../services/game.service';

export default function GameDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [game, setGame] = useState<Game | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            router.replace('/(tabs)/games');
            return;
        }
        let mounted = true;
        setLoading(true);
        setError(null);
        fetchGameById(String(id))
            .then(data => {
                if (!mounted) return;
                if (!data) {
                    router.replace('/(tabs)/games');
                    return;
                }
                setGame(data);
            })
            .catch(err => { console.error(err); if (mounted) setError('Failed to load game'); })
            .finally(() => mounted && setLoading(false));
        return () => { mounted = false; };
    }, [id, router]);

    if (error) return <View style={[styles.container, styles.center]}><Text style={styles.error}>{error}</Text></View>;
    if (loading) return <View style={[styles.container, styles.center]}><ActivityIndicator color="#DCDEDF" /></View>;
    if (!game) return null;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.headerImageWrap}>
                <Image source={{ uri: toImageUri(game.image_url) }} style={styles.headerImage} resizeMode="cover" />
                <View style={styles.headerOverlay} />
                <View style={styles.headerTextWrap}>
                    <Text style={styles.headerTitle}>{game.title}</Text>
                    {!!(game.developer && game.developer.length) && (
                        <Text style={styles.headerSub}>{game.developer.join(', ')}</Text>
                    )}
                </View>
            </View>

            <View style={styles.section}>
                {game.description ? (
                    <>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.paragraph}>{game.description}</Text>
                    </>
                ) : null}
            </View>

            <View style={styles.section}>
                {!!(game.genre && game.genre.length) && (
                    <>
                        <Text style={styles.sectionTitle}>Genres</Text>
                        <View style={styles.chipsRow}>
                            {game.genre.map((g, i) => (
                                <View key={i} style={styles.chip}><Text style={styles.chipText}>{g}</Text></View>
                            ))}
                        </View>
                    </>
                )}
            </View>

            <View style={[styles.section, styles.infoCard]}>
                <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Game Information</Text>
                <InfoRow label="Release Date" value={game.releaseDate || '-'} />
                <InfoRow label="Developer" value={(game.developer ?? []).join(', ')} />
                <InfoRow label="Publisher" value={game.publisher || '-'} />
                {game.appId ? <InfoRow label="Steam App ID" value={String(game.appId)} /> : null}
            </View>

            {game.appId ? (
                <Pressable
                    onPress={() => {
                        const url = `https://store.steampowered.com/app/${game.appId}`;
                        Linking.openURL(url).catch(() => { });
                    }}
                    style={styles.primaryButton}
                    accessibilityRole="button"
                >
                    <Text style={styles.primaryButtonText}>View on Steam</Text>
                </Pressable>
            ) : null}
        </ScrollView>
    );
}

const InfoRow = ({ label, value }: { label: string; value?: string }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}:</Text>
        <Text style={styles.infoValue}>{value || '-'}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#2D333C' },
    content: { paddingBottom: 24 },
    center: { alignItems: 'center', justifyContent: 'center' },
    error: { color: '#ef4444' },

    headerImageWrap: { height: 220, backgroundColor: '#171D25' },
    headerImage: { width: '100%', height: '100%' },
    headerOverlay: { position: 'absolute', inset: 0 as any, backgroundColor: 'rgba(0,0,0,0.35)' },
    headerTextWrap: { position: 'absolute', left: 16, right: 16, bottom: 16 },
    headerTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginBottom: 6 },
    headerSub: { color: '#E5E7EB' },

    section: { paddingHorizontal: 16, paddingTop: 16 },
    sectionTitle: { color: '#DCDEDF', fontWeight: '800', fontSize: 18, marginBottom: 8 },
    paragraph: { color: '#C9CED6', lineHeight: 20 },

    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { backgroundColor: '#0B1218', borderColor: '#3A3F46', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
    chipText: { color: '#C9CED6' },

    infoCard: { backgroundColor: '#171D25', marginHorizontal: 16, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#3A3F46' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
    infoLabel: { color: '#9AA0A6' },
    infoValue: { color: '#DCDEDF', fontWeight: '600' },

    primaryButton: { height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A9FFF', margin: 16 },
    primaryButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
