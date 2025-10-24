import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import RNItemBox from '../../components/ItemBox';
import { Game, fetchGames, toImageUri } from '../../services/game.service';

const toArray = (v?: string | string[] | null): string[] => Array.isArray(v) ? v : v ? [v] : [];

export default function GenresScreen() {
    const [games, setGames] = useState<Game[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

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

    const genres = useMemo(() => {
        const all = new Set<string>();
        (games ?? []).forEach(g => toArray(g.genre).forEach(ge => ge && all.add(ge)));
        return Array.from(all);
    }, [games]);

    const representatives = useMemo(() => {
        const map: Record<string, Game | undefined> = {};
        (games ?? []).forEach(g => {
            toArray(g.genre).forEach(ge => { if (!map[ge]) map[ge] = g; });
        });
        return map;
    }, [games]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Genres</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {loading && !games ? (
                <View style={styles.center}><ActivityIndicator color="#DCDEDF" /></View>
            ) : (
                <FlatList
                    data={genres}
                    keyExtractor={(g) => g}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <View style={styles.cell}>
                            <RNItemBox title={item} imageUri={toImageUri(representatives[item]?.image_url)} />
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#2D333C', padding: 16 },
    title: { fontSize: 24, fontWeight: '800', color: '#DCDEDF', marginBottom: 12 },
    error: { color: '#ef4444', marginTop: 12 },
    center: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },
    row: { gap: 12 },
    list: { paddingBottom: 16 },
    cell: { flex: 1, marginBottom: 12 },
});
