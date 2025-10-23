import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function GamesScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Games</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2D333C' },
    title: { fontSize: 24, fontWeight: '700', color: '#DCDEDF' },
});
