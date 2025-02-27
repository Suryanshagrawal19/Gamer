import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Predefined characters to choose from
const PREDEFINED_CHARACTERS = [
  {
    id: '1',
    name: 'Sherlock Holmes',
    description: 'A brilliant detective with exceptional analytical abilities and attention to detail.',
    traits: ['analytical', 'observant', 'intelligent', 'eccentric']
  },
  {
    id: '2',
    name: 'Marie Curie',
    description: 'A pioneering scientist who discovered radium and polonium, dedicated to her research.',
    traits: ['determined', 'curious', 'intelligent', 'dedicated']
  },
  {
    id: '3',
    name: 'Nelson Mandela',
    description: 'A revolutionary leader who fought against apartheid and became a symbol of peace.',
    traits: ['resilient', 'forgiving', 'principled', 'inspiring']
  }
];

// Character trait options
const TRAIT_OPTIONS = [
  'analytical', 'creative', 'cautious', 'impulsive', 'brave', 'fearful',
  'honest', 'deceptive', 'compassionate', 'ruthless', 'logical', 'emotional',
  'extroverted', 'introverted', 'optimistic', 'pessimistic'
];

export default function CharacterCreationScreen() {
  const router = useRouter();
  const [isCustomCharacter, setIsCustomCharacter] = useState(false);
  const [selectedPredefinedId, setSelectedPredefinedId] = useState('');
  const [name, setName] = useState('');
  const [background, setBackground] = useState('');
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleTrait = (trait: string) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter(t => t !== trait));
    } else {
      if (selectedTraits.length < 5) { // Limit to 5 traits
        setSelectedTraits([...selectedTraits, trait]);
      }
    }
  };

  const handleCreateCharacter = () => {
    setIsLoading(true);
    
    // In a real app, you would send this data to your backend
    // to generate a detailed persona with an LLM
    
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to the narrative screen
      router.push('/narrative');
    }, 2000);
  };

  const selectPredefinedCharacter = (id: string) => {
    setSelectedPredefinedId(id);
    const character = PREDEFINED_CHARACTERS.find(c => c.id === id);
    if (character) {
      setName(character.name);
      setSelectedTraits(character.traits);
    }
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
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Choose character type:</Text>
          <View style={styles.switchOptionsContainer}>
            <TouchableOpacity
              style={[
                styles.switchOption,
                !isCustomCharacter && styles.activeSwitchOption
              ]}
              onPress={() => setIsCustomCharacter(false)}
            >
              <Text style={styles.switchOptionText}>Famous Personality</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.switchOption,
                isCustomCharacter && styles.activeSwitchOption
              ]}
              onPress={() => setIsCustomCharacter(true)}
            >
              <Text style={styles.switchOptionText}>Custom Character</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {!isCustomCharacter ? (
          <View style={styles.predefinedContainer}>
            <Text style={styles.sectionTitle}>Select a Historical Figure</Text>
            <Text style={styles.instruction}>Choose a famous personality whose perspective you'd like to adopt.</Text>
            
            {PREDEFINED_CHARACTERS.map(character => (
              <TouchableOpacity 
                key={character.id}
                style={[
                  styles.characterCard,
                  selectedPredefinedId === character.id && styles.selectedCharacterCard
                ]}
                onPress={() => selectPredefinedCharacter(character.id)}
              >
                <View style={styles.characterCardHeader}>
                  <Text style={styles.characterName}>{character.name}</Text>
                  {selectedPredefinedId === character.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#6200ee" />
                  )}
                </View>
                <Text style={styles.characterDescription}>{character.description}</Text>
                <View style={styles.characterTraits}>
                  {character.traits.map(trait => (
                    <View key={trait} style={styles.traitPill}>
                      <Text style={styles.traitPillText}>{trait}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.customContainer}>
            <Text style={styles.sectionTitle}>Create Your Own Character</Text>
            <Text style={styles.instruction}>Define who you'll be in this narrative experience.</Text>
            
            <Text style={styles.label}>Character Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter name..."
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
            
            <Text style={styles.label}>Background Story</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Briefly describe your character's background..."
              placeholderTextColor="#999"
              value={background}
              onChangeText={setBackground}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <Text style={styles.label}>Character Traits (Select up to 5)</Text>
            <View style={styles.traitsContainer}>
              {TRAIT_OPTIONS.map(trait => (
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
                      styles.traitButtonText,
                      selectedTraits.includes(trait) && styles.selectedTraitButtonText
                    ]}
                  >
                    {trait}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.createButton,
            ((!isCustomCharacter && !selectedPredefinedId) || 
             (isCustomCharacter && (!name || selectedTraits.length === 0))) && 
            styles.disabledButton
          ]}
          onPress={handleCreateCharacter}
          disabled={isLoading || 
                   (!isCustomCharacter && !selectedPredefinedId) || 
                   (isCustomCharacter && (!name || selectedTraits.length === 0))}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.createButtonText}>Generate Character</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
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
  },
  switchContainer: {
    marginBottom: 24,
  },
  switchLabel: {
    color: '#fff',
    marginBottom: 8,
  },
  switchOptionsContainer: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    overflow: 'hidden',
  },
  switchOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeSwitchOption: {
    backgroundColor: '#6200ee',
  },
  switchOptionText: {
    color: '#fff',
  },
  predefinedContainer: {
    
  },
  customContainer: {
    
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instruction: {
    color: '#aaa',
    marginBottom: 16,
  },
  characterCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  selectedCharacterCard: {
    borderColor: '#6200ee',
    backgroundColor: '#3a2457',
  },
  characterCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  characterName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  characterDescription: {
    color: '#ccc',
    marginBottom: 12,
    lineHeight: 20,
  },
  characterTraits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  traitPill: {
    backgroundColor: '#444',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  traitPillText: {
    color: '#fff',
    fontSize: 12,
  },
  label: {
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#444',
  },
  textArea: {
    height: 100,
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  traitButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  selectedTraitButton: {
    backgroundColor: '#3a2457',
    borderColor: '#6200ee',
  },
  traitButtonText: {
    color: '#ccc',
  },
  selectedTraitButtonText: {
    color: '#fff',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  createButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#444',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 8,
  },
});