import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import RNItemBox from '../../components/ItemBox';
import { Game, fetchGames, toImageUri } from '../../services/game.service';

const toArray = (v?: string | string[] | null): string[] => Array.isArray(v) ? v : v ? [v] : [];

export default function GamesScreen() {
    const [games, setGames] = useState<Game[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 200);
        return () => clearTimeout(t);
    }, [query]);

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

    const filtered = useMemo(() => {
        if (!games) return [] as Game[];
        if (!debouncedQuery) return games;
        return games.filter(g => {
            const haystack = [g.title ?? '', ...toArray(g.genre), g.publisher ?? ''].join(' ').toLowerCase();
            return haystack.includes(debouncedQuery);
        });
    }, [games, debouncedQuery]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Games</Text>
            {/* search input + result count */}
            <View style={styles.searchRow}>
                <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search games…"
                    placeholderTextColor="#8A8F93"
                    style={styles.input}
                />
                <Text style={styles.count}>{filtered.length}{games ? ` / ${games.length}` : ''}</Text>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {loading && !games ? (
                <View style={styles.center}><ActivityIndicator color="#DCDEDF" /></View>
            ) : (
                <>
                    <FlatList
                        data={filtered}
                        keyExtractor={(g) => g._id}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={styles.list}
                        renderItem={({ item }) => (
                            <View style={styles.cell}>
                                <RNItemBox
                                    title={item.title}
                                    imageUri={toImageUri(item.image_url)}
                                    onPress={() => router.push({ pathname: '/game/[id]', params: { id: item._id } })}
                                />
                            </View>
                        )}
                    />
                    {filtered.length === 0 && (
                        <Text style={styles.empty}>No games match your search.</Text>
                    )}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#2D333C', padding: 16 },
    title: { fontSize: 24, fontWeight: '800', color: '#DCDEDF', marginBottom: 12 },
    error: { color: '#ef4444', marginTop: 12 },
    center: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },
    searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#3A3F46',
        backgroundColor: '#171D25',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: '#DCDEDF',
        fontSize: 16,
    },
    count: { color: '#9AA0A6', marginLeft: 4 },
    row: { gap: 12 },
    list: { paddingBottom: 16 },
    cell: { flex: 1, marginBottom: 12 },
    empty: { color: '#9AA0A6', marginTop: 12 },
});
