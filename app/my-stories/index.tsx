import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { narrativeService, SavedStory } from '../../services/narrativeService';

export default function SavedGamesScreen() {
  const router = useRouter();
  const [savedStories, setSavedStories] = useState<SavedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadSavedStories();
  }, []);

  const loadSavedStories = async () => {
    setLoading(true);
    try {
      const stories = await narrativeService.getSavedStories();
      // Sort by last played date, most recent first
      stories.sort((a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime());
      setSavedStories(stories);
    } catch (error) {
      console.error('Error loading saved stories:', error);
      Alert.alert('Error', 'Failed to load saved stories.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (storyId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Story',
      'Are you sure you want to delete this story? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteStory(storyId)
        }
      ]
    );
  };

  const deleteStory = async (storyId: string) => {
    setDeleting(storyId);
    try {
      const success = await narrativeService.deleteStory(storyId);
      if (success) {
        setSavedStories(stories => stories.filter(s => s.id !== storyId));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert('Error', 'Failed to delete the story.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      Alert.alert('Error', 'An error occurred while deleting the story.');
    } finally {
      setDeleting(null);
    }
  };

  const continueStory = (story: SavedStory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/narrative/[id]',
      params: {
        id: story.characterId,
        storyId: story.id,
        type: story.characterType,
        accuracy: story.context.accuracy,
        load: 'true'
      }
    });
  };

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Format as time if today
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      // Format as date for older entries
      return date.toLocaleDateString();
    }
  };

  const renderSavedStory = ({ item }: { item: SavedStory }) => (
    <View style={styles.storyCard}>
      <View style={styles.storyHeader}>
        <Text style={styles.storyTitle}>{item.title}</Text>
        <Text style={styles.lastPlayed}>{formatDate(item.lastPlayed)}</Text>
      </View>
      
      <Text style={styles.characterName}>
        {item.characterName}
        <Text style={styles.characterType}>
          {item.characterType === 'historical' ? ' (Historical Figure)' : ' (Custom Character)'}
        </Text>
      </Text>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${item.progress}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>{item.progress}% Complete</Text>
      </View>
      
      <View style={styles.storyActions}>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => confirmDelete(item.id)}
          disabled={deleting === item.id}
        >
          {deleting === item.id ? (
            <ActivityIndicator size="small" color="#ff5252" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={18} color="#ff5252" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => continueStory(item)}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Stories</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Loading saved stories...</Text>
        </View>
      ) : savedStories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={64} color="#666" />
          <Text style={styles.emptyText}>No saved stories found</Text>
          <TouchableOpacity 
            style={styles.newStoryButton}
            onPress={() => router.push('/character-creation')}
          >
            <Text style={styles.newStoryButtonText}>Create New Story</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedStories}
          renderItem={renderSavedStory}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.storyList}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ccc',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#ccc',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  newStoryButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  newStoryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  storyList: {
    padding: 16,
  },
  storyCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  lastPlayed: {
    color: '#999',
    fontSize: 12,
  },
  characterName: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 12,
  },
  characterType: {
    color: '#999',
    fontSize: 12,
    fontStyle: 'italic',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#444',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6200ee',
  },
  progressText: {
    color: '#999',
    fontSize: 12,
    textAlign: 'right',
  },
  storyActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff5252',
  },
  deleteButtonText: {
    color: '#ff5252',
    marginLeft: 8,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 8,
  },
});