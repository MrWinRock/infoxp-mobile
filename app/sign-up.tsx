import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SignUp() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign up</Text>
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
        backgroundColor: '#2D333C',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
        color: '#DCDEDF',
    },
    subtitle: {
        fontSize: 14,
        color: '#ADB1B3',
    },
});
