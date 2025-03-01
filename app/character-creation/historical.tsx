import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Type for historical figures
interface HistoricalFigure {
  id: string;
  name: string;
  era: string;
  shortDescription: string;
  image: string;
  keyTraits: string[];
}

// Mock data for historical figures
const HISTORICAL_FIGURES: HistoricalFigure[] = [
  {
    id: '1',
    name: 'Mahatma Gandhi',
    era: '20th Century',
    shortDescription: 'Leader of India\'s non-violent independence movement against British rule.',
    image: 'https://via.placeholder.com/150?text=Gandhi',
    keyTraits: ['non-violent', 'determined', 'principled', 'spiritual'],
  },
  {
    id: '2',
    name: 'Marie Curie',
    era: 'Late 19th - Early 20th Century',
    shortDescription: 'Physicist and chemist who conducted pioneering research on radioactivity.',
    image: 'https://via.placeholder.com/150?text=Curie',
    keyTraits: ['brilliant', 'dedicated', 'pioneering', 'perseverant'],
  },
  {
    id: '3',
    name: 'Leonardo da Vinci',
    era: 'Renaissance',
    shortDescription: 'Italian polymath, painter, sculptor, architect, scientist, and engineer.',
    image: 'https://via.placeholder.com/150?text=Leonardo',
    keyTraits: ['creative', 'curious', 'observant', 'inventive'],
  },
  {
    id: '4',
    name: 'Cleopatra',
    era: 'Ancient Egypt',
    shortDescription: 'The last active ruler of the Ptolemaic Kingdom of Egypt, known for her intelligence and political acumen.',
    image: 'https://via.placeholder.com/150?text=Cleopatra',
    keyTraits: ['strategic', 'charismatic', 'ambitious', 'multilingual'],
  },
  {
    id: '5',
    name: 'Nelson Mandela',
    era: '20th Century',
    shortDescription: 'Revolutionary, anti-apartheid activist, and former President of South Africa.',
    image: 'https://via.placeholder.com/150?text=Mandela',
    keyTraits: ['resilient', 'forgiving', 'dignified', 'visionary'],
  },
];

// Categories for filtering
const ERAS = [
  { id: 'all', name: 'All Eras' },
  { id: 'ancient', name: 'Ancient' },
  { id: 'medieval', name: 'Medieval' },
  { id: 'renaissance', name: 'Renaissance' },
  { id: '19th', name: '19th Century' },
  { id: '20th', name: '20th Century' },
];

export default function HistoricalFiguresScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEra, setSelectedEra] = useState('all');
  const [figures, setFigures] = useState<HistoricalFigure[]>(HISTORICAL_FIGURES);
  const [selectedFigure, setSelectedFigure] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [storyAccuracy, setStoryAccuracy] = useState(true); // Toggle for historical accuracy

  // Filter figures based on search and era
  useEffect(() => {
    let filtered = [...HISTORICAL_FIGURES];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(figure => 
        figure.name.toLowerCase().includes(query) ||
        figure.shortDescription.toLowerCase().includes(query)
      );
    }
    
    if (selectedEra !== 'all') {
      filtered = filtered.filter(figure => 
        figure.era.toLowerCase().includes(selectedEra.toLowerCase())
      );
    }
    
    setFigures(filtered);
  }, [searchQuery, selectedEra]);

  // Start the story with the selected character
  const startStory = () => {
    if (!selectedFigure) return;
    
    setLoading(true);
    
    // In a real app, you would prepare the character data
    // and initial story state here, potentially calling an API
    
    setTimeout(() => {
      setLoading(false);
      router.push({
        pathname: '/narrative/[id]',
        params: { 
          id: selectedFigure,
          accuracy: storyAccuracy ? 'accurate' : 'creative' 
        }
      });
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Choose a Historical Figure</Text>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search historical figures..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {/* Era Filters */}
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.erasContainer}
        contentContainerStyle={styles.erasContent}
      >
        {ERAS.map(era => (
          <TouchableOpacity
            key={era.id}
            style={[
              styles.eraButton,
              selectedEra === era.id && styles.selectedEraButton
            ]}
            onPress={() => setSelectedEra(era.id)}
          >
            <Text 
              style={[
                styles.eraButtonText,
                selectedEra === era.id && styles.selectedEraButtonText
              ]}
            >
              {era.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Historical Figures List */}
      <ScrollView style={styles.figuresContainer}>
        {figures.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color="#666" />
            <Text style={styles.emptyText}>No historical figures match your search</Text>
          </View>
        ) : (
          figures.map(figure => (
            <TouchableOpacity
              key={figure.id}
              style={[
                styles.figureCard,
                selectedFigure === figure.id && styles.selectedFigureCard
              ]}
              onPress={() => setSelectedFigure(figure.id)}
            >
              <Image source={{ uri: figure.image }} style={styles.figureImage} />
              <View style={styles.figureInfo}>
                <View style={styles.figureHeader}>
                  <Text style={styles.figureName}>{figure.name}</Text>
                  {selectedFigure === figure.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#6200ee" />
                  )}
                </View>
                <Text style={styles.figureEra}>{figure.era}</Text>
                <Text style={styles.figureDescription}>{figure.shortDescription}</Text>
                <View style={styles.traitsContainer}>
                  {figure.keyTraits.map(trait => (
                    <View key={trait} style={styles.traitPill}>
                      <Text style={styles.traitText}>{trait}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      
      {/* Accuracy Toggle and Start Button */}
      {selectedFigure && (
        <View style={styles.footer}>
          <View style={styles.accuracyToggle}>
            <Text style={styles.accuracyLabel}>Story Mode:</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  storyAccuracy && styles.activeToggleOption
                ]}
                onPress={() => setStoryAccuracy(true)}
              >
                <Text style={storyAccuracy ? styles.activeToggleText : styles.toggleText}>
                  Historically Accurate
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  !storyAccuracy && styles.activeToggleOption
                ]}
                onPress={() => setStoryAccuracy(false)}
              >
                <Text style={!storyAccuracy ? styles.activeToggleText : styles.toggleText}>
                  Creative Liberty
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.startButton}
            onPress={startStory}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.startButtonText}>Begin Journey</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
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
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#fff',
  },
  erasContainer: {
    maxHeight: 40,
    marginBottom: 12,
    marginTop: 4,
  },
  eraButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#2a2a2a',
    marginRight: 8,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedEraButton: {
    backgroundColor: '#6200ee',
  },
  eraButtonText: {
    color: '#ccc',
    fontSize: 13,
  },
  selectedEraButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  erasContent: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  figuresContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  figureCard: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  selectedFigureCard: {
    borderColor: '#6200ee',
    backgroundColor: '#3a2457',
  },
  figureImage: {
    width: 120,
    height: 160,
  },
  figureInfo: {
    flex: 1,
    padding: 12,
  },
  figureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  figureName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  figureEra: {
    color: '#999',
    marginBottom: 8,
  },
  figureDescription: {
    color: '#ccc',
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  traitPill: {
    backgroundColor: '#444',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  traitText: {
    color: '#fff',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 64,
  },
  emptyText: {
    color: '#999',
    marginTop: 16,
    fontSize: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  accuracyToggle: {
    marginBottom: 16,
  },
  accuracyLabel: {
    color: '#fff',
    marginBottom: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeToggleOption: {
    backgroundColor: '#6200ee',
  },
  toggleText: {
    color: '#ccc',
  },
  activeToggleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  startButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 16,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 8,
  },
});