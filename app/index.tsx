import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { storageService } from '../services/storageService';

// Keep the splash screen visible until we're done
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      try {
        // Check if user has seen onboarding
        const hasSeenOnboarding = await storageService.getItem('hasSeenOnboarding');
        
        // Hide the splash screen
        await SplashScreen.hideAsync();
        
        // If user hasn't seen onboarding, route there first
        if (!hasSeenOnboarding) {
          router.replace('/onboarding');
          // Mark onboarding as seen for future launches
          await storageService.setItem('hasSeenOnboarding', 'true');
        }
      } catch (e) {
        console.warn('Error preparing app:', e);
      }
    }

    prepare();
  }, []);

  // Redirect to the main menu screen
  return <Redirect href="/(tabs)/" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  text: {
    color: '#fff',
    marginTop: 20,
  },
});