import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import SaveDialog from '../../components/SaveDialog';
import CharacterAvatar from '../../components/CharacterAvatar';
import EnvironmentBackground from '../../components/EnvironmentBackground';
import { narrativeService } from '../../services/narrativeService';
import { storyController } from '../../services/storyController';

// Types for narrative content
interface NarrativeChunk {
  id: string;
  text: string;
  type: 'narration' | 'dialogue' | 'thought' | 'historical-fact';
  speaker?: string;
  timestamp: Date;
}

interface Choice {
  id: string;
  text: string;
  impact: string;
  historicalAccuracy: 'accurate' | 'somewhat-accurate' | 'creative';
}

interface CharacterState {
  name: string;
  traits: string[];
  metrics: {
    influence: number;
    health: number;
    relationships: number;
    resources: number;
  };
  location: string;
  era: string;
  currentGoal?: string;
}

// Mock API for generating narrative content
const generateNextScene = async (
  characterId: string, 
  previousChoice: string | null,
  accuracy: 'accurate' | 'creative'
): Promise<{
  narrative: NarrativeChunk[],
  choices: Choice[]
}> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // In a real app, this would call your AI service
  // The response would be based on character, past choices, and accuracy setting
  
  // Mock response for Gandhi
  if (characterId === '1') { // Gandhi's ID
    const isAccurate = accuracy === 'accurate';
    
    if (!previousChoice) {
      // Initial narrative for Gandhi
      return {
        narrative: [
          {
            id: '1',
            text: "South Africa, 1893. You are Mohandas Gandhi, a 24-year-old lawyer who has recently arrived in South Africa to work on a legal case.",
            type: 'narration',
            timestamp: new Date()
          },
          {
            id: '2',
            text: "The train to Pretoria stops at Pietermaritzburg station. Despite having a first-class ticket, a railway official orders you to move to the third-class carriage.",
            type: 'narration',
            timestamp: new Date()
          },
          {
            id: '3',
            text: "Sir, you must move to the third-class carriage. Indians are not permitted in first-class.",
            type: 'dialogue',
            speaker: 'Railway Official',
            timestamp: new Date()
          },
          {
            id: '4',
            text: "Your heart races as you feel the sting of injustice. This discriminatory treatment conflicts with your understanding of British law and your rights as a British subject.",
            type: 'thought',
            timestamp: new Date()
          },
          {
            id: '5',
            text: "This incident would later be recognized as a pivotal moment in Gandhi's life, inspiring his commitment to fighting social injustice through non-violent resistance.",
            type: 'historical-fact',
            timestamp: new Date()
          }
        ],
        choices: [
          {
            id: 'comply',
            text: "Comply with the official and move to the third-class carriage",
            impact: "Avoid immediate conflict but feel the burn of injustice",
            historicalAccuracy: isAccurate ? 'somewhat-accurate' : 'creative'
          },
          {
            id: 'refuse',
            text: "Refuse to move, citing your valid first-class ticket",
            impact: "Stand up for your rights at personal risk",
            historicalAccuracy: isAccurate ? 'accurate' : 'somewhat-accurate'
          },
          {
            id: 'diplomatic',
            text: "Attempt to reason calmly with the official about your legal rights",
            impact: "Seek understanding while maintaining dignity",
            historicalAccuracy: isAccurate ? 'somewhat-accurate' : 'creative'
          }
        ]
      };
    } else if (previousChoice === 'refuse') {
      // Narrative continues if player refused to move
      return {
        narrative: [
          {
            id: '6',
            text: "\"I have a first-class ticket and the right to be here,\" you state firmly, showing your ticket.",
            type: 'dialogue',
            speaker: 'You',
            timestamp: new Date()
          },
          {
            id: '7',
            text: "The railway official's face hardens. He calls for a police constable who forcibly removes you from the train.",
            type: 'narration',
            timestamp: new Date()
          },
          {
            id: '8',
            text: "You're thrown off the train with your belongings. As the train departs, you're left alone on the cold platform at Pietermaritzburg station.",
            type: 'narration',
            timestamp: new Date()
          },
          {
            id: '9',
            text: "Sitting in the waiting room through the freezing night, you contemplate the injustice of racial prejudice. A transformative realization begins to form in your mind.",
            type: 'thought',
            timestamp: new Date()
          },
          {
            id: '10',
            text: "Historically, Gandhi spent the night in the cold waiting room and later wrote that this experience of racism, injustice, and humiliation was the moment he decided to fight for his rights and resist injustice.",
            type: 'historical-fact',
            timestamp: new Date()
          }
        ],
        choices: [
          {
            id: 'legal',
            text: "Focus on legal recourse - write to authorities about this injustice",
            impact: "Seek change through existing systems",
            historicalAccuracy: isAccurate ? 'accurate' : 'somewhat-accurate'
          },
          {
            id: 'organize',
            text: "Begin organizing Indian immigrants to collectively resist discriminatory laws",
            impact: "Start building a movement for collective resistance",
            historicalAccuracy: isAccurate ? 'accurate' : 'somewhat-accurate'
          },
          {
            id: 'return',
            text: "Consider returning to India rather than facing such treatment",
            impact: "Retreat from direct confrontation",
            historicalAccuracy: isAccurate ? 'creative' : 'somewhat-accurate'
          }
        ]
      };
    } else {
      // Default next scene
      return {
        narrative: [
          {
            id: '11',
            text: "The next day, reflecting on your experience, you begin to form ideas about dignity and peaceful resistance to injustice.",
            type: 'narration',
            timestamp: new Date()
          }
        ],
        choices: [
          {
            id: 'next1',
            text: "Continue your journey to Pretoria, determined to complete your legal work",
            impact: "Focus on your immediate professional responsibilities",
            historicalAccuracy: 'accurate'
          },
          {
            id: 'next2',
            text: "Contact local Indian community leaders to discuss the treatment of Indians",
            impact: "Begin building connections and understanding the broader context",
            historicalAccuracy: 'accurate'
          }
        ]
      };
    }
  } else {
    // Generic response for other characters
    return {
      narrative: [
        {
          id: 'generic1',
          text: "You stand at a crossroads, your future path yet to be determined.",
          type: 'narration',
          timestamp: new Date()
        }
      ],
      choices: [
        {
          id: 'gen1',
          text: "Choose the path of caution",
          impact: "Play it safe",
          historicalAccuracy: 'somewhat-accurate'
        },
        {
          id: 'gen2',
          text: "Choose the path of boldness",
          impact: "Take a risk",
          historicalAccuracy: 'creative'
        }
      ]
    };
  }
};

// Get character information
const getCharacter = async (characterId: string): Promise<{
  name: string;
  image: string;
  era: string;
  traits: string[];
}> => {
  // Mock character data
  const characters = {
    '1': {
      name: 'Mahatma Gandhi',
      image: 'https://via.placeholder.com/150?text=Gandhi',
      era: '20th Century',
      traits: ['non-violent', 'determined', 'principled', 'spiritual'],
    },
    // Add more characters as needed
  };
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return characters[characterId] || {
    name: 'Unknown Character',
    image: 'https://via.placeholder.com/150?text=Character',
    era: 'Unknown Era',
    traits: ['unknown'],
  };
};

export default function NarrativeScreen() {
  const router = useRouter();
  const { id, accuracy = 'accurate', characterType = 'historical' } = useLocalSearchParams();
  const characterId = Array.isArray(id) ? id[0] : id;
  const accuracyMode = Array.isArray(accuracy) ? accuracy[0] : accuracy;
  
  const [character, setCharacter] = useState({
    name: '',
    image: '',
    era: '',
    traits: [],
  });
  
  const [narrative, setNarrative] = useState<NarrativeChunk[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [previousChoice, setPreviousChoice] = useState<string | null>(null);
  const [previousChoices, setPreviousChoices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [customResponse, setCustomResponse] = useState('');
  
  // Add these state variables for saving functionality
  const [saveDialogVisible, setSaveDialogVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [storyId, setStoryId] = useState<string>('');
  const [storyTitle, setStoryTitle] = useState<string>('');
  
  // Add these state variables for story context
  const [currentYear, setCurrentYear] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [currentSituation, setCurrentSituation] = useState<string>('');
  
  // Add these to your state in narrative screen
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [environmentUri, setEnvironmentUri] = useState<string | null>(null);
  const [storyProgress, setStoryProgress] = useState<any>(null);
  
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Load character data and initial narrative
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Get character info
        const characterData = await getCharacter(characterId);
        setCharacter(characterData);
        
        // Get initial narrative
        const initialScene = await generateNextScene(
          characterId, 
          null, 
          accuracyMode as 'accurate' | 'creative'
        );
        
        setNarrative(initialScene.narrative);
        setChoices(initialScene.choices);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, [characterId, accuracyMode]);
  
  // Scroll to bottom when narrative updates
  useEffect(() => {
    if (scrollViewRef.current && narrative.length > 0) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [narrative]);
  
  // Add this effect after narrative updates
  useEffect(() => {
    if (narrative.length > 0 && storyProgress?.currentNodeId) {
      loadVisuals(storyProgress.currentNodeId);
    }
  }, [narrative, storyProgress?.currentNodeId]);
  
  // Add this function to load visuals
  const loadVisuals = async (nodeId: string) => {
    try {
      const visuals = await storyController.getNodeVisuals(nodeId);
      setAvatarUri(visuals.avatar);
      setEnvironmentUri(visuals.environment);
    } catch (error) {
      console.error('Error loading visuals:', error);
    }
  };
  
  // Handle making a choice
  const makeChoice = async (choiceId: string) => {
    try {
      // Vibrate for feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      setSelectedChoice(choiceId);
      setLoading(true);
      
      // Find the chosen option
      const choice = choices.find(c => c.id === choiceId);
      if (!choice) return;
      
      // Add the choice to the narrative
      setNarrative(prev => [
        ...prev,
        {
          id: `choice-${Date.now()}`,
          text: choice.text,
          type: 'dialogue',
          speaker: 'You',
          timestamp: new Date()
        }
      ]);
      
      // Wait for a moment to simulate thinking
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the next scene based on the choice
      const nextScene = await generateNextScene(
        characterId,
        choiceId,
        accuracyMode as 'accurate' | 'creative'
      );
      
      // Update state with new narrative and choices
      setNarrative(prev => [...prev, ...nextScene.narrative]);
      setChoices(nextScene.choices);
      setPreviousChoice(choiceId);
    } catch (error) {
      console.error('Error making choice:', error);
    } finally {
      setLoading(false);
      setSelectedChoice(null);
    }
  };
  
  // Handle custom response
  const submitCustomResponse = async () => {
    if (!customResponse.trim()) return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setLoading(true);
      
      // Add custom response to narrative
      setNarrative(prev => [
        ...prev,
        {
          id: `custom-${Date.now()}`,
          text: customResponse,
          type: 'dialogue',
          speaker: 'You',
          timestamp: new Date()
        }
      ]);
      
      // Clear input
      setCustomResponse('');
      
      // In a real app, this would send the custom response to an AI for processing
      // and generate a contextual response
      
      // Simulate AI thinking
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add AI response
      setNarrative(prev => [
        ...prev,
        {
          id: `ai-response-${Date.now()}`,
          text: "I understand your perspective. However, the situation requires you to choose a path forward. What will you do?",
          type: 'narration',
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Error processing custom response:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Add this function to handle opening the save dialog
  const openSaveDialog = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // If we don't have a title yet, generate a default one
    if (!storyTitle) {
      const date = new Date();
      const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
      setStoryTitle(`${character.name}'s Journey - ${formattedDate}`);
    }
    
    setSaveDialogVisible(true);
  };

  // Add this function to handle saving the story
  const saveStory = async (title: string) => {
    try {
      setSaving(true);
      
      // Generate a story ID if this is a new story
      const currentStoryId = storyId || `story-${Date.now()}`;
      setStoryId(currentStoryId);
      
      // Update the story title
      setStoryTitle(title);
      
      // Create the story context
      const context = {
        characterId,
        characterType: characterType as 'historical' | 'custom',
        accuracy: accuracyMode as 'accurate' | 'creative',
        previousChoices,
        currentYear,
        currentLocation,
        currentSituation
      };
      
      // Save the story - assuming narrativeService is imported/available
      const success = await narrativeService.saveStory(
        currentStoryId,
        characterId,
        characterType as 'historical' | 'custom',
        character.name,
        title,
        context,
        narrative,
        choices
      );
      
      if (success) {
        // Show success message
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Your story has been saved successfully.');
        setSaveDialogVisible(false);
      } else {
        // Show error message
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Failed to save your story. Please try again.');
      }
    } catch (error) {
      console.error('Error saving story:', error);
      Alert.alert('Error', 'An error occurred while saving your story.');
    } finally {
      setSaving(false);
    }
  };

  // Save the current story
  const saveCurrentStory = async () => {
    if (saving) return;
    
    try {
      setSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const currentStoryId = storyId || `story-${Date.now()}`;
      setStoryId(currentStoryId);
  
      const currentTitle = storyTitle || `${character.name}'s Journey - ${new Date().toLocaleDateString()}`;
      setStoryTitle(currentTitle);
      
      const context: StoryContext = {
        characterId,
        characterType,
        accuracy: accuracyMode as 'accurate' | 'creative',
        previousChoices,
        currentYear,
        currentLocation,
        currentSituation
      };
      
      const success = await narrativeService.saveStory(
        currentStoryId,
        characterId,
        characterType as 'historical' | 'custom',
        character.name,
        currentTitle,
        context,
        narrative,
        choices
      );
      
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Your story has been saved successfully.');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Failed to save your story. Please try again.');
      }
    } catch (error) {
      console.error('Error saving story:', error);
      Alert.alert('Error', 'An error occurred while saving your story.');
    } finally {
      setSaving(false);
    }
  };
  
  // Character info modal content
  const renderCharacterInfo = () => (
    <View style={styles.infoOverlay}>
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>{character.name}</Text>
        
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.infoImage} />
        ) : (
          <View style={styles.infoImagePlaceholder}>
            <Text style={styles.placeholderText}>
              {character.name.substring(0, 1)}
            </Text>
          </View>
        )}
        
        <Text style={styles.infoSubtitle}>Era</Text>
        <Text style={styles.infoText}>{character.era}</Text>
        
        <Text style={styles.infoSubtitle}>Key Traits</Text>
        <View style={styles.traitsContainer}>
          {character.traits.map((trait, index) => (
            <View key={index} style={styles.traitPill}>
              <Text style={styles.traitText}>{trait}</Text>
            </View>
          ))}
        </View>
        
        <Text style={styles.infoSubtitle}>Story Mode</Text>
        <Text style={styles.infoText}>
          {accuracyMode === 'accurate' 
            ? 'Historically Accurate: Following key events as they happened.' 
            : 'Creative Liberty: Reimagining history with alternative choices.'}
        </Text>
        
        <TouchableOpacity 
          style={styles.closeInfoButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowInfo(false);
          }}
        >
          <Text style={styles.closeInfoText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Render narrative chunk
  const renderNarrativeChunk = (chunk: NarrativeChunk) => {
    switch (chunk.type) {
      case 'dialogue':
        return (
          <View 
            key={chunk.id} 
            style={[
              styles.narrativeChunk, 
              styles.dialogueChunk,
              chunk.speaker === 'You' ? styles.playerDialogue : styles.npcDialogue
            ]}
          >
            {chunk.speaker && (
              <Text style={styles.speakerName}>{chunk.speaker}</Text>
            )}
            <Text style={styles.dialogueText}>{chunk.text}</Text>
          </View>
        );
      
      case 'historical-fact':
        return (
          <View key={chunk.id} style={[styles.narrativeChunk, styles.factChunk]}>
            <Ionicons name="information-circle" size={20} color="#FFD700" style={styles.factIcon} />
            <Text style={styles.factText}>{chunk.text}</Text>
          </View>
        );
      
      case 'thought':
        return (
          <View key={chunk.id} style={[styles.narrativeChunk, styles.thoughtChunk]}>
            <Text style={styles.thoughtText}>{chunk.text}</Text>
          </View>
        );
      
      default:
        return (
          <View key={chunk.id} style={[styles.narrativeChunk, styles.narrationChunk]}>
            <Text style={styles.narrationText}>{chunk.text}</Text>
          </View>
        );
    }
  };
  
  if (loading && narrative.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Preparing your historical journey...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (narrative.length > 0 && !storyId) {
              Alert.alert(
                'Unsaved Story',
                'You have an unsaved story. Do you want to save before leaving?',
                [
                  {
                    text: 'Don\'t Save',
                    onPress: () => router.back(),
                    style: 'destructive'
                  },
                  {
                    text: 'Save',
                    onPress: async () => {
                      await saveCurrentStory();
                      router.back();
                    }
                  },
                  {
                    text: 'Cancel',
                    style: 'cancel'
                  }
                ]
              );
            } else {
              router.back();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.characterButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowInfo(true);
          }}
        >
          <Text style={styles.characterName} numberOfLines={1}>
            {character.name}
          </Text>
          <Ionicons name="information-circle-outline" size={20} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.savingButton]}
            onPress={openSaveDialog}
            disabled={saving || narrative.length === 0}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="save-outline" size={22} color="#fff" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Environment Background */}
      {environmentUri && (
        <View style={styles.environmentContainer}>
          <Image 
            source={{ uri: environmentUri }} 
            style={styles.environmentImage} 
            resizeMode="cover"
          />
          {narrative[0]?.metadata?.location && (
            <View style={styles.locationBadge}>
              <Text style={styles.locationText}>
                {narrative[0].metadata.location}, {narrative[0].metadata.year || ''}
              </Text>
            </View>
          )}
        </View>
      )}
      
      {/* Narrative Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.narrativeScrollView}
        contentContainerStyle={styles.narrativeContent}
      >
        {narrative.map(renderNarrativeChunk)}
        
        {loading && (
          <View style={styles.thinkingContainer}>
            <ActivityIndicator size="small" color="#6200ee" />
            <Text style={styles.thinkingText}>Thinking...</Text>
          </View>
        )}
      </ScrollView>
      
      {/* Choices */}
      <View style={styles.choicesContainer}>
        {choices.map(choice => (
          <TouchableOpacity
            key={choice.id}
            style={[
              styles.choiceButton,
              selectedChoice === choice.id && styles.selectedChoiceButton,
              loading && styles.disabledChoiceButton
            ]}
            onPress={() => !loading && makeChoice(choice.id)}
            disabled={loading}
          >
            <View style={styles.choiceContent}>
              <Text style={styles.choiceText}>{choice.text}</Text>
              <Text style={styles.impactText}>{choice.impact}</Text>
            </View>
            {accuracyMode === 'accurate' && (
              <View style={[
                styles.accuracyIndicator,
                choice.historicalAccuracy === 'accurate' ? styles.accurateChoice :
                choice.historicalAccuracy === 'somewhat-accurate' ? styles.somewhatAccurateChoice :
                styles.creativeChoice
              ]}>
                <Ionicons 
                  name={
                    choice.historicalAccuracy === 'accurate' ? 'checkmark-circle' :
                    choice.historicalAccuracy === 'somewhat-accurate' ? 'help-circle' :
                    'alert-circle'
                  } 
                  size={16} 
                  color="#fff" 
                />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Custom Response Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
        style={styles.customInputContainer}
      >
        <TextInput
          style={styles.customInput}
          placeholder="Type a custom response..."
          placeholderTextColor="#999"
          value={customResponse}
          onChangeText={setCustomResponse}
          multiline
          maxLength={150}
          editable={!loading}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!customResponse.trim() || loading) && styles.disabledSendButton
          ]}
          onPress={submitCustomResponse}
          disabled={!customResponse.trim() || loading}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
      
      {/* Character Info Modal */}
      {showInfo && renderCharacterInfo()}
      
      {/* Save Dialog */}
      <SaveDialog 
        visible={saveDialogVisible}
        onClose={() => setSaveDialogVisible(false)}
        onSave={saveStory}
        initialTitle={storyTitle}
        characterName={character.name}
      />
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
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  characterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 8,
  },
  characterName: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 6,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  savingButton: {
    backgroundColor: '#888',
  },
  menuButton: {
    padding: 8,
  },
  narrativeScrollView: {
    flex: 1,
  },
  narrativeContent: {
    padding: 16,
  },
  narrativeChunk: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  narrationChunk: {
    backgroundColor: '#2a2a2a',
    padding: 12,
    alignSelf: 'center',
    maxWidth: '95%',
  },
  narrationText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  dialogueChunk: {
    padding: 12,
    maxWidth: '80%',
  },
  playerDialogue: {
    backgroundColor: '#6200ee',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  npcDialogue: {
    backgroundColor: '#444',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  speakerName: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 4,
  },
  dialogueText: {
    color: '#fff',
    fontSize: 16,
  },
  factChunk: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  factIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  factText: {
    color: '#FFD700',
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
  },
  thoughtChunk: {
    backgroundColor: '#3a2457',
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#6200ee',
  },
  thoughtText: {
    color: '#fff',
    fontStyle: 'italic',
    fontSize: 16,
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginBottom: 16,
  },
  thinkingText: {
    color: '#999',
    marginLeft: 8,
  },
  choicesContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  choiceButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#6200ee',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedChoiceButton: {
    backgroundColor: '#3a2457',
  },
  disabledChoiceButton: {
    opacity: 0.5,
  },
  choiceContent: {
    flex: 1,
    padding: 12,
  },
  choiceText: {
    color: '#fff',
    fontSize: 16,
  },
  impactText: {
    color: '#bbb',
    fontSize: 13,
    marginTop: 4,
    fontStyle: 'italic',
  },
  accuracyIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accurateChoice: {
    backgroundColor: '#4CAF50',
  },
  somewhatAccurateChoice: {
    backgroundColor: '#FF9800',
  },
  creativeChoice: {
    backgroundColor: '#9C27B0',
  },
  customInputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  customInput: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSendButton: {
    backgroundColor: '#444',
  },
  infoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  infoContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#6200ee',
  },
  infoTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#6200ee',
  },
  infoImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 16,
    backgroundColor: '#3a2457',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6200ee',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  environmentContainer: {
    height: 150,
    width: '100%',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  environmentImage: {
    width: '100%',
    height: '100%',
    opacity: 0.7, // Dim it to ensure text readability
  },
  locationBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  locationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeInfoButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  closeInfoText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
