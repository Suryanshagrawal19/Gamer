import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: '#121212' }
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="character-creation" />
        <Stack.Screen name="narrative" />
        <Stack.Screen name="saved-games" />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
        <Stack.Screen name="about" options={{ presentation: 'modal' }} />
        {/* Add the original gamer app screens */}
        <Stack.Screen name="games" />
        <Stack.Screen name="profile" />
      </Stack>
    </SafeAreaProvider>
  );
}