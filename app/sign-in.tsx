import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SignIn() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>This is a placeholder screen.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
    },
});
