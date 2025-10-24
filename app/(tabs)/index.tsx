import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import RNItemBox from '../../components/ItemBox';
import { Game, fetchGames, toImageUri } from '../../services/game.service';

const toArray = (v?: string | string[] | null): string[] => Array.isArray(v) ? v : v ? [v] : [];

export default function HomeScreen() {
    const [games, setGames] = useState<Game[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError(null);
        fetchGames()
            .then(data => { if (mounted) setGames(data); })
            .catch(err => { console.error(err); if (mounted) setError('Failed to load games'); })
            .finally(() => mounted && setLoading(false));
        return () => { mounted = false; };
    }, []);

    const first8 = useMemo(() => (games ?? []).slice(0, 8), [games]);
    const gameRows = useMemo(() => {
        const rows: Game[][] = [];
        for (let i = 0; i < first8.length; i += 2) {
            rows.push(first8.slice(i, i + 2));
        }
        return rows;
    }, [first8]);
    const genres = useMemo(() => {
        const all = new Set<string>();
        (games ?? []).forEach(g => toArray(g.genre).forEach(ge => ge && all.add(ge)));
        return Array.from(all).slice(0, 8);
    }, [games]);
    const representatives = useMemo(() => {
        const map: Record<string, Game | undefined> = {};
        (games ?? []).forEach(g => {
            toArray(g.genre).forEach(ge => { if (!map[ge]) map[ge] = g; });
        });
        return map;
    }, [games]);

    const genreRows = useMemo(() => {
        const list = genres;
        const rows: string[][] = [];
        for (let i = 0; i < list.length; i += 2) {
            rows.push(list.slice(i, i + 2));
        }
        return rows;
    }, [genres]);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {loading && !games ? (
                <View style={styles.center}><ActivityIndicator color="#DCDEDF" /></View>
            ) : (
                <>
                    <Section title="Games">
                        {gameRows.map((row, idx) => (
                            <View key={idx} style={styles.row}>
                                {row.map(item => (
                                    <View key={item._id} style={styles.cell}>
                                        <RNItemBox
                                            title={item.title}
                                            imageUri={toImageUri(item.image_url)}
                                            onPress={() => router.push({ pathname: '/game/[id]', params: { id: item._id } })}
                                        />
                                    </View>
                                ))}
                                {row.length === 1 ? <View style={[styles.cell]} /> : null}
                            </View>
                        ))}
                    </Section>

                    <Section title="Genre">
                        {genreRows.map((row, idx) => (
                            <View key={idx} style={styles.row}>
                                {row.map(genre => (
                                    <View key={genre} style={styles.cell}>
                                        <RNItemBox title={genre} imageUri={toImageUri(representatives[genre]?.image_url)} />
                                    </View>
                                ))}
                                {row.length === 1 ? <View style={[styles.cell]} /> : null}
                            </View>
                        ))}
                    </Section>
                </>
            )}
        </ScrollView>
    );
}

const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.hr} />
        {children}
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#2D333C' },
    content: { padding: 16 },
    center: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },
    error: { color: '#ef4444', marginTop: 12 },
    section: { marginTop: 24 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sectionTitle: { fontSize: 24, fontWeight: '800', color: '#DCDEDF' },
    hr: { height: 2, backgroundColor: '#3A3F46', marginTop: 8, marginBottom: 12, borderRadius: 1 },
    row: { flexDirection: 'row', gap: 12 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    cell: { flex: 1, marginBottom: 12 },
});
