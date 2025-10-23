import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';
import { AppHeader } from '../../components/AppHeader';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                header: () => <AppHeader />,
                tabBarStyle: {
                    backgroundColor: '#171D25',
                    borderTopColor: '#1F242B',
                },
                tabBarActiveTintColor: '#1A9FFF',
                tabBarInactiveTintColor: '#DCDEDF',
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
                                fontWeight: '600',
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
                                fontWeight: '600',
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
                                fontWeight: '600',
                            }}
                        >
                            Games
                        </Text>
                    ),
                }}
            />
        </Tabs>
    );
}
