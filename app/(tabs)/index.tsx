import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { storageService } from '../../services/storageService';
import { narrativeService } from '../../services/narrativeService';

export default function MainMenuScreen() {
  const router = useRouter();
  const [hasSavedStories, setHasSavedStories] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Improved handleContinueStory function
  const handleContinueStory = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (hasSavedStories) {
        router.push('/my-stories');
      } else {
        const savedStories = await narrativeService.getSavedStories();
        if (savedStories && savedStories.length > 0) {
          setHasSavedStories(true);
          router.push('/my-stories');
        } else {
          Alert.alert(
            'No Saved Stories',
            'You don\'t have any saved stories yet. Start a new story first.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error checking saved stories:', error);
      Alert.alert(
        'Error',
        'There was a problem accessing your saved stories.',
        [{ text: 'OK' }]
      );
    }
  };

  // 2. More robust useEffect hook for checking saved stories
  useEffect(() => {
    async function checkSavedStories() {
      try {
        setLoading(true);
        const savedStories = await narrativeService.getSavedStories();
        setHasSavedStories(savedStories && savedStories.length > 0);
      } catch (error) {
        console.error('Error checking saved stories:', error);
        setHasSavedStories(false);
      } finally {
        setLoading(false);
      }
    }

    checkSavedStories();
  }, []);

  const handleNewStory = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/character-creation');
  };

  const handleSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings');
  };
  
  const handleAbout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/about');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>HISTORICAL JOURNEYS</Text>
            <Text style={styles.subtitle}>Experience Lives That Shaped History</Text>
          </View>
          
          <View style={styles.menu}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleNewStory}
            >
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.menuText}>New Journey</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
            
            {/* 3. Updated Continue Journey button with better feedback */}
            <TouchableOpacity 
              style={[
                styles.menuItem,
                !hasSavedStories && styles.disabledMenuItem
              ]}
              onPress={handleContinueStory}
              disabled={loading} // Only disable when loading
            >
              <Ionicons 
                name="play-circle" 
                size={24} 
                color={hasSavedStories ? "#fff" : "#666"} 
              />
              <Text 
                style={[
                  styles.menuText, 
                  !hasSavedStories && styles.disabledMenuText
                ]}
              >
                Continue Journey
              </Text>
              {loading ? (
                <ActivityIndicator size="small" color="#666" />
              ) : (
                <Ionicons name="chevron-forward" size={20} color="#666" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleSettings}
            >
              <Ionicons name="settings" size={24} color="#fff" />
              <Text style={styles.menuText}>Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleAbout}
            >
              <Ionicons name="information-circle" size={24} color="#fff" />
              <Text style={styles.menuText}>About</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.disclaimer}>
            This interactive narrative experience is powered by AI and adapts to your choices.
            Each decision shapes a unique story through history.
          </Text>
          
          <View style={styles.featuredFigures}>
            <Text style={styles.featuredTitle}>Featured Historical Figures</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity 
                style={styles.figureCard}
                onPress={() => {
                  router.push({
                    pathname: '/character-creation/historical',
                    params: { featured: 'Gandhi' }
                  });
                }}
              >
                <View style={styles.figureImagePlaceholder}>
                  <Text style={styles.figureImageText}>Gandhi</Text>
                </View>
                <Text style={styles.figureName}>Gandhi</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.figureCard}
                onPress={() => {
                  router.push({
                    pathname: '/character-creation/historical',
                    params: { featured: 'Curie' }
                  });
                }}
              >
                <View style={styles.figureImagePlaceholder}>
                  <Text style={styles.figureImageText}>Curie</Text>
                </View>
                <Text style={styles.figureName}>Marie Curie</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.figureCard}
                onPress={() => {
                  router.push({
                    pathname: '/character-creation/historical',
                    params: { featured: 'Lincoln' }
                  });
                }}
              >
                <View style={styles.figureImagePlaceholder}>
                  <Text style={styles.figureImageText}>Lincoln</Text>
                </View>
                <Text style={styles.figureName}>Abraham Lincoln</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.viewAllCard}
                onPress={() => router.push('/character-creation')}
              >
                <Ionicons name="people" size={24} color="#6200ee" />
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#aaa',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  menu: {
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  disabledMenuItem: {
    borderLeftColor: '#666',
    backgroundColor: '#222',
  },
  menuText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 16,
    flex: 1,
  },
  disabledMenuText: {
    color: '#666',
  },
  disclaimer: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 30,
  },
  featuredFigures: {
    marginBottom: 20,
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  figureCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 90,
  },
  figureImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  figureImageText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  figureName: {
    color: '#ccc',
    textAlign: 'center',
    fontSize: 12,
  },
  viewAllCard: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#6200ee',
    borderStyle: 'dashed',
  },
  viewAllText: {
    color: '#6200ee',
    marginTop: 4,
    fontSize: 12,
  },
});