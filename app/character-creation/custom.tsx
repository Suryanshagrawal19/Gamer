import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Historical eras for character placement
const HISTORICAL_ERAS = [
  { id: 'ancient', name: 'Ancient World (3000 BCE - 500 CE)', icon: 'business' },
  { id: 'medieval', name: 'Medieval Period (500 - 1500 CE)', icon: 'shield' },
  { id: 'renaissance', name: 'Renaissance (1400 - 1700 CE)', icon: 'brush' },
  { id: 'industrial', name: 'Industrial Age (1700 - 1900 CE)', icon: 'construct' },
  { id: 'modern', name: 'Modern Era (1900 - 2000 CE)', icon: 'globe' },
  { id: 'contemporary', name: 'Contemporary (2000 CE - Present)', icon: 'phone-portrait' },
];

// Character traits options
const CHARACTER_TRAITS = [
  'brave', 'cautious', 'creative', 'analytical', 'diplomatic', 'ambitious',
  'compassionate', 'resilient', 'curious', 'disciplined', 'independent', 'loyal',
  'optimistic', 'patient', 'resourceful', 'spiritual', 'strategic', 'stubborn',
  'charismatic', 'introverted', 'extroverted', 'thoughtful', 'impulsive', 'meticulous'
];

export default function CustomCharacterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [background, setBackground] = useState('');
  const [selectedEra, setSelectedEra] = useState('');
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [storyAccuracy, setStoryAccuracy] = useState(true); // Toggle for historical accuracy
  
  // Handle trait selection
  const toggleTrait = (trait: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter(t => t !== trait));
    } else {
      if (selectedTraits.length < 5) {
        setSelectedTraits([...selectedTraits, trait]);
      } else {
        Alert.alert('Trait Limit', 'You can select up to 5 traits for your character.');
      }
    }
  };
  
  // Create and start a story with the character
  const createCharacter = () => {
    // Validate inputs
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter a name for your character.');
      return;
    }
    
    if (!selectedEra) {
      Alert.alert('Missing Information', 'Please select a historical era for your character.');
      return;
    }
    
    if (selectedTraits.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one trait for your character.');
      return;
    }
    
    // Proceed with character creation
    setLoading(true);
    
    // Simulate API call to create character
    setTimeout(() => {
      // In a real app, you would call your API here
      setLoading(false);
      
      // Navigate to narrative screen with the character
      router.push({
        pathname: '/narrative/custom',
        params: { 
          name: name,
          era: selectedEra,
          traits: selectedTraits.join(','),
          accuracy: storyAccuracy ? 'accurate' : 'creative',
          background: background || 'No background provided.'
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
        <Text style={styles.title}>Create Your Character</Text>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Character Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What is your character's name?</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter character name..."
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            maxLength={30}
          />
        </View>
        
        {/* Historical Era */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose a historical era</Text>
          <Text style={styles.sectionDescription}>
            Your character will experience events from this time period.
          </Text>
          
          {HISTORICAL_ERAS.map(era => (
            <TouchableOpacity
              key={era.id}
              style={[
                styles.eraOption,
                selectedEra === era.id && styles.selectedEraOption
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setSelectedEra(era.id);
              }}
            >
              <View style={styles.eraIconContainer}>
                <Ionicons 
                  name={era.icon as any} 
                  size={24} 
                  color={selectedEra === era.id ? '#fff' : '#6200ee'} 
                />
              </View>
              <Text 
                style={[
                  styles.eraName,
                  selectedEra === era.id && styles.selectedEraName
                ]}
              >
                {era.name}
              </Text>
              {selectedEra === era.id && (
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Character Traits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select character traits (up to 5)</Text>
          <Text style={styles.sectionDescription}>
            These traits will influence your character's storyline and available choices.
          </Text>
          
          <View style={styles.traitsContainer}>
            {CHARACTER_TRAITS.map(trait => (
              <TouchableOpacity
                key={trait}
                style={[
                  styles.traitButton,
                  selectedTraits.includes(trait) && styles.selectedTraitButton
                ]}
                onPress={() => toggleTrait(trait)}
              >
                <Text 
                  style={[
                    styles.traitText,
                    selectedTraits.includes(trait) && styles.selectedTraitText
                  ]}
                >
                  {trait}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {selectedTraits.length > 0 && (
            <View style={styles.selectedTraitsContainer}>
              <Text style={styles.selectedTraitsTitle}>Selected Traits:</Text>
              <Text style={styles.selectedTraitsText}>
                {selectedTraits.join(', ')}
              </Text>
            </View>
          )}
        </View>
        
        {/* Character Background */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Character Background (Optional)</Text>
          <Text style={styles.sectionDescription}>
            Provide some background information about your character.
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your character's background, motivations, or any special details..."
            placeholderTextColor="#999"
            value={background}
            onChangeText={setBackground}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        {/* Accuracy Toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Story Accuracy Mode</Text>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                storyAccuracy && styles.activeToggleOption
              ]}
              onPress={() => setStoryAccuracy(true)}
            >
              <Ionicons 
                name="book" 
                size={20} 
                color={storyAccuracy ? '#fff' : '#ccc'} 
                style={styles.toggleIcon}
              />
              <View>
                <Text style={[
                  styles.toggleText,
                  storyAccuracy && styles.activeToggleText
                ]}>
                  Historically Authentic
                </Text>
                <Text style={styles.toggleDescription}>
                  Your character will experience historically accurate events
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.toggleOption,
                !storyAccuracy && styles.activeToggleOption
              ]}
              onPress={() => setStoryAccuracy(false)}
            >
              <Ionicons 
                name="color-wand" 
                size={20} 
                color={!storyAccuracy ? '#fff' : '#ccc'} 
                style={styles.toggleIcon}
              />
              <View>
                <Text style={[
                  styles.toggleText,
                  !storyAccuracy && styles.activeToggleText
                ]}>
                  Creative Liberty
                </Text>
                <Text style={styles.toggleDescription}>
                  Reimagine history with alternative possibilities
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Create Character Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={createCharacter}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.createButtonText}>Begin Your Story</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    color: '#bbb',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  eraOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectedEraOption: {
    backgroundColor: '#6200ee',
  },
  eraIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eraName: {
    color: '#fff',
    flex: 1,
  },
  selectedEraName: {
    fontWeight: 'bold',
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  traitButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 4,
    borderWidth: 1,
    borderColor: '#444',
  },
  selectedTraitButton: {
    backgroundColor: '#3a2457',
    borderColor: '#6200ee',
  },
  traitText: {
    color: '#ccc',
  },
  selectedTraitText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedTraitsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6200ee',
  },
  selectedTraitsTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  selectedTraitsText: {
    color: '#ccc',
  },
  toggleContainer: {
    marginTop: 8,
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  activeToggleOption: {
    backgroundColor: '#3a2457',
    borderWidth: 1,
    borderColor: '#6200ee',
  },
  toggleIcon: {
    marginRight: 12,
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  activeToggleText: {
    color: '#fff',
  },
  toggleDescription: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  createButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
});