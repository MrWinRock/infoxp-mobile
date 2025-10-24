import React from 'react';
import { Image, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

type Props = {
    title: string;
    imageUri?: string;
    onPress?: () => void;
    style?: ViewStyle;
};

export const ItemBox: React.FC<Props> = ({ title, imageUri, onPress, style }) => {
    return (
        <Pressable onPress={onPress} style={[styles.card, style]} accessibilityRole="button">
            <View style={styles.imageWrapper}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
                ) : (
                    <View style={[styles.image, { backgroundColor: '#0B1218' }]} />
                )}
                <View style={styles.overlay} />
                <View style={styles.labelWrap}>
                    <Text style={styles.label}>{title}</Text>
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#171D25',
    },
    imageWrapper: {
        width: '100%',
        aspectRatio: 1,
    },
    image: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
    } as any,
    overlay: {
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.35)',
    } as any,
    labelWrap: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    label: {
        color: '#0876c4',
        fontWeight: '700',
    },
});

export default ItemBox;
