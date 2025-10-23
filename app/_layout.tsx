import { Stack } from "expo-router";
import { AppHeader } from "../components/AppHeader";

export default function RootLayout() {
  return (
    <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="sign-in"
        options={{
          headerShown: true,
          header: () => <AppHeader showBack />,
          contentStyle: { backgroundColor: '#2D333C' },
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          headerShown: true,
          header: () => <AppHeader showBack />,
          contentStyle: { backgroundColor: '#2D333C' },
        }}
      />
    </Stack>
  );
}
