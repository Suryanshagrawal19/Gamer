import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Types
interface DialogueLine {
  id: string;
  text: string;
  speaker: 'character' | 'narrator' | 'player';
  timestamp: Date;
}

interface Choice {
  id: string;
  text: string;
  impact: string; // Brief description of the choice's impact
}

export default function NarrativeScreen() {
  const router = useRouter();
  const [dialogue, setDialogue] = useState<DialogueLine[]>([
    {
      id: '1',
      text: "Welcome to the interactive narrative. You find yourself in a dimly lit room, a single desk before you. On it, a mysterious envelope awaits.",
      speaker: 'narrator',
      timestamp: new Date()
    }
  ]);
  const [choices, setChoices] = useState<Choice[]>([
    {
      id: '1',
      text: "Open the envelope",
      impact: "Curious about its contents"
    },
    {
      id: '2',
      text: "Examine the room first",
      impact: "Cautious approach"
    },
    {
      id: '3',
      text: "Call out to see if anyone is there",
      impact: "Direct approach"
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [characterName, setCharacterName] = useState('The Protagonist');
  const [characterTraits, setCharacterTraits] = useState(['curious', 'determined']);
  
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [dialogue]);

  // Mock function to simulate AI response generation
  const generateNextScene = async (choiceId: string) => {
    setIsLoading(true);
    
    // Find the selected choice
    const selectedChoice = choices.find(choice => choice.id === choiceId);
    
    // Add player's choice to dialogue
    setDialogue(prev => [...prev, {
      id: Date.now().toString(),
      text: selectedChoice?.text || userInput,
      speaker: 'player',
      timestamp: new Date()
    }]);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock responses based on choice
    let newDialogue: DialogueLine[] = [];
    let newChoices: Choice[] = [];
    
    if (choiceId === '1') { // Open envelope
      newDialogue = [
        {
          id: (Date.now() + 1).toString(),
          text: "You carefully open the envelope. Inside, you find a letter and an old photograph of yourself standing in front of a building you don't recognize.",
          speaker: 'narrator',
          timestamp: new Date()
        },
        {
          id: (Date.now() + 2).toString(),
          text: "The letter reads: 'Your memory was not taken. It was given away. Come find yourself where it all began.'",
          speaker: 'narrator',
          timestamp: new Date()
        }
      ];
      
      newChoices = [
        {
          id: '4',
          text: "Examine the photograph closely",
          impact: "Searching for clues"
        },
        {
          id: '5',
          text: "Put everything back and leave the room",
          impact: "Rejecting the mystery"
        },
        {
          id: '6',
          text: "'Who wrote this letter?'",
          impact: "Demanding answers"
        }
      ];
    } else if (choiceId === '2') { // Examine room
      newDialogue = [
        {
          id: (Date.now() + 1).toString(),
          text: "The room is sparsely furnished. Besides the desk, there's a bookshelf with a few dusty volumes, a small window showing a night sky, and a door that appears to be unlocked.",
          speaker: 'narrator',
          timestamp: new Date()
        },
        {
          id: (Date.now() + 2).toString(),
          text: "Something about this place feels familiar, yet you can't quite place why.",
          speaker: 'narrator',
          timestamp: new Date()
        }
      ];
      
      newChoices = [
        {
          id: '7',
          text: "Check the books on the shelf",
          impact: "Seeking knowledge"
        },
        {
          id: '8',
          text: "Look out the window",
          impact: "Gaining perspective"
        },
        {
          id: '9',
          text: "Return to the envelope on the desk",
          impact: "Focusing on the main clue"
        }
      ];
    } else { // Call out
      newDialogue = [
        {
          id: (Date.now() + 1).toString(),
          text: "\"Hello? Is anyone there?\" Your voice echoes slightly in the room.",
          speaker: 'player',
          timestamp: new Date()
        },
        {
          id: (Date.now() + 2).toString(),
          text: "After a moment of silence, you hear footsteps approaching from beyond the door.",
          speaker: 'narrator',
          timestamp: new Date()
        },
        {
          id: (Date.now() + 3).toString(),
          text: "\"I see you've finally awakened. Do you remember who you are?\"",
          speaker: 'character',
          timestamp: new Date()
        }
      ];
      
      newChoices = [
        {
          id: '10',
          text: "\"No, who am I? And who are you?\"",
          impact: "Direct questioning"
        },
        {
          id: '11',
          text: "\"What is this place?\"",
          impact: "Seeking context"
        },
        {
          id: '12',
          text: "\"I don't need to answer your questions.\"",
          impact: "Defensive stance"
        }
      ];
    }
    
    // Update state with new dialogue and choices
    setTimeout(() => {
      setDialogue(prev => [...prev, ...newDialogue]);
      setChoices(newChoices);
      setIsLoading(false);
    }, 500);
  };

  const handleCustomInput = () => {
    if (!userInput.trim()) return;
    
    setDialogue(prev => [...prev, {
      id: Date.now().toString(),
      text: userInput,
      speaker: 'player',
      timestamp: new Date()
    }]);
    
    setUserInput('');
    setIsLoading(true);
    
    // Simulate AI response to custom input
    setTimeout(() => {
      setDialogue(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "I'm not sure I understand. Could you please choose one of the available options or phrase your response differently?",
        speaker: 'narrator',
        timestamp: new Date()
      }]);
      setIsLoading(false);
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
        <Text style={styles.title}>Interactive Narrative</Text>
        <TouchableOpacity 
          style={styles.characterButton}
          onPress={() => setShowPrompt(!showPrompt)}
        >
          <Ionicons name="person-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {showPrompt && (
        <View style={styles.promptOverlay}>
          <View style={styles.promptContainer}>
            <Text style={styles.promptTitle}>Character Profile</Text>
            <Text style={styles.promptLabel}>Name</Text>
            <TextInput
              style={styles.promptInput}
              value={characterName}
              onChangeText={setCharacterName}
              placeholderTextColor="#999"
            />
            <Text style={styles.promptLabel}>Character Traits</Text>
            <Text style={styles.traitsText}>{characterTraits.join(', ')}</Text>
            
            <View style={styles.promptButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowPrompt(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={() => {
                  // In a real app, you would save these traits and use them
                  // to influence the story generation
                  setShowPrompt(false);
                  setDialogue(prev => [...prev, {
                    id: Date.now().toString(),
                    text: `Character updated: ${characterName}, traits: ${characterTraits.join(', ')}`,
                    speaker: 'narrator',
                    timestamp: new Date()
                  }]);
                }}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.dialogueContainer}
        contentContainerStyle={styles.dialogueContent}
      >
        {dialogue.map((line) => (
          <View 
            key={line.id} 
            style={[
              styles.dialogueLine,
              line.speaker === 'player' ? styles.playerLine : 
              line.speaker === 'character' ? styles.characterLine : 
              styles.narratorLine
            ]}
          >
            {line.speaker === 'character' && (
              <Text style={styles.speakerName}>Mysterious Figure</Text>
            )}
            {line.speaker === 'player' && (
              <Text style={styles.speakerName}>{characterName}</Text>
            )}
            <Text style={styles.dialogueText}>{line.text}</Text>
          </View>
        ))}
        
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#6200ee" size="small" />
            <Text style={styles.loadingText}>Thinking...</Text>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.choicesContainer}>
        {choices.map((choice) => (
          <TouchableOpacity
            key={choice.id}
            style={styles.choiceButton}
            onPress={() => generateNextScene(choice.id)}
            disabled={isLoading}
          >
            <Text style={styles.choiceText}>{choice.text}</Text>
            <Text style={styles.impactText}>{choice.impact}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a custom response..."
            placeholderTextColor="#999"
            value={userInput}
            onChangeText={setUserInput}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !userInput.trim() && styles.disabledButton
            ]}
            onPress={handleCustomInput}
            disabled={!userInput.trim() || isLoading}
          >
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  characterButton: {
    padding: 8,
  },
  dialogueContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dialogueContent: {
    paddingVertical: 16,
  },
  dialogueLine: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    maxWidth: '90%',
  },
  narratorLine: {
    backgroundColor: '#2a2a2a',
    alignSelf: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#444',
  },
  characterLine: {
    backgroundColor: '#3a2457',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  playerLine: {
    backgroundColor: '#6200ee',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  speakerName: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 4,
  },
  dialogueText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  loadingText: {
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
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  choiceText: {
    color: '#fff',
    fontSize: 16,
  },
  impactText: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1e1e1e',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  input: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#444',
  },
  promptOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    borderWidth: 1,
    borderColor: '#6200ee',
  },
  promptTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  promptLabel: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 8,
  },
  promptInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
    marginBottom: 16,
  },
  traitsText: {
    color: '#fff',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  promptButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#444',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 