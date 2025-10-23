import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ChatScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chat</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2D333C' },
    title: { fontSize: 24, fontWeight: '700', color: '#DCDEDF' },
});
