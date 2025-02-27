import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Mock saved games data
const SAVED_GAMES = [
  {
    id: '1',
    title: 'The Mysterious Envelope',
    character: 'Detective Holmes',
    lastPlayed: '2 hours ago',
    progress: 35,
  },
  {
    id: '2',
    title: 'Journey to the Unknown',
    character: 'Explorer Jane',
    lastPlayed: '1 day ago',
    progress: 68,
  },
  {
    id: '3',
    title: 'The Forgotten Past',
    character: 'Amnesiac Protagonist',
    lastPlayed: '3 days ago',
    progress: 12,
  },
];

export default function SavedGamesScreen() {
  const router = useRouter();

  const renderSavedGame = ({ item }) => (
    <TouchableOpacity 
      style={styles.savedGameItem}
      onPress={() => router.push('/narrative')}
    >
      <View style={styles.savedGameHeader}>
        <Text style={styles.savedGameTitle}>{item.title}</Text>
        <Text style={styles.lastPlayed}>{item.lastPlayed}</Text>
      </View>
      
      <Text style={styles.characterName}>Character: {item.character}</Text>
      
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
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="trash-outline" size={20} color="#ff5252" />
          <Text style={[styles.actionText, { color: '#ff5252' }]}>Delete</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.continueButton]}
          onPress={() => router.push('/narrative')}
        >
          <Text style={styles.continueText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
        <Text style={styles.title}>Saved Stories</Text>
      </View>
      
      <FlatList
        data={SAVED_GAMES}
        renderItem={renderSavedGame}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>No saved stories found</Text>
            <TouchableOpacity 
              style={styles.newStoryButton}
              onPress={() => router.push('/character-creation')}
            >
              <Text style={styles.newStoryText}>Start a New Story</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  savedGameItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  savedGameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  savedGameTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  lastPlayed: {
    color: '#999',
    fontSize: 12,
  },
  characterName: {
    color: '#ccc',
    marginBottom: 12,
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
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    marginLeft: 4,
  },
  continueButton: {
    backgroundColor: '#6200ee',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  continueText: {
    color: '#fff',
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 64,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  newStoryButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 12,
  },
  newStoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});