import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, } from 'react-native';
import { AppHeader } from '../../components/AppHeader';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                header: () => <AppHeader />,
                tabBarStyle: { backgroundColor: '#171D25', borderTopColor: '#1F242B' },
                tabBarActiveTintColor: '#1A9FFF',
                tabBarInactiveTintColor: '#DCDEDF',
                tabBarIconStyle: { display: 'none' },
                tabBarShowLabel: true,
                tabBarItemStyle: { paddingVertical: 6 },
                tabBarLabelStyle: { fontWeight: '600' },
                sceneStyle: { backgroundColor: '#2D333C' },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarLabel: ({ color, focused }) => (
                        <Text
                            style={{
                                color,
                                textDecorationLine: focused ? 'underline' : 'none',
                                textDecorationColor: focused ? '#1A9FFF' : undefined,
                                ...styles.navigateText
                            }}
                        >
                            Home
                        </Text>
                    ),
                }}
            />
            <Tabs.Screen
                name="genres"
                options={{
                    title: 'Genres',
                    tabBarLabel: ({ color, focused }) => (
                        <Text
                            style={{
                                color,
                                textDecorationLine: focused ? 'underline' : 'none',
                                textDecorationColor: focused ? '#1A9FFF' : undefined,
                                ...styles.navigateText
                            }}
                        >
                            Genres
                        </Text>
                    ),
                }}
            />
            <Tabs.Screen
                name="games"
                options={{
                    title: 'Games',
                    tabBarLabel: ({ color, focused }) => (
                        <Text
                            style={{
                                color,
                                textDecorationLine: focused ? 'underline' : 'none',
                                textDecorationColor: focused ? '#1A9FFF' : undefined,
                                ...styles.navigateText
                            }}
                        >
                            Games
                        </Text>
                    ),
                }}
            />
            <Tabs.Screen
                name="chat"
                options={{
                    title: 'Chat',
                    tabBarLabel: ({ color, focused }) => (
                        <Text
                            style={{
                                color,
                                textDecorationLine: focused ? 'underline' : 'none',
                                textDecorationColor: focused ? '#1A9FFF' : undefined,
                                ...styles.navigateText
                            }}
                        >
                            Chat
                        </Text>
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    navigateText: {
        fontWeight: '600',
        fontSize: 16,
    }

});