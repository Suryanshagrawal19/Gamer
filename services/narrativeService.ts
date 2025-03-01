import axios from 'axios';
import { characterService } from './characterService';
import { storageService } from './storageService';
import Constants from 'expo-constants';

// Types for narrative content
export interface NarrativeChunk {
  id: string;
  text: string;
  type: 'narration' | 'dialogue' | 'thought' | 'historical-fact';
  speaker?: string;
  timestamp: Date;
}

export interface Choice {
  id: string;
  text: string;
  impact: string;
  historicalAccuracy: 'accurate' | 'somewhat-accurate' | 'creative';
}

export interface NarrativeResponse {
  narrative: NarrativeChunk[];
  choices: Choice[];
}

export interface StoryContext {
  characterId: string;
  characterType: 'historical' | 'custom';
  accuracy: 'accurate' | 'creative';
  previousChoices: {
    choiceId: string;
    choiceText: string;
    timestamp: Date;
  }[];
  currentYear?: string;
  currentLocation?: string;
  currentSituation?: string;
}

export interface SavedStory {
  id: string;
  characterId: string;
  characterType: 'historical' | 'custom';
  characterName: string;
  title: string;
  lastPlayed: Date;
  progress: number; // 0-100 percent
  context: StoryContext;
  currentNarrative: NarrativeChunk[];
  currentChoices: Choice[];
}

// Try to get API keys from environment
const HUGGING_FACE_API_KEY = Constants.expoConfig?.extra?.huggingFaceApiKey || '';
const USE_LOCAL_GPT4ALL = Constants.expoConfig?.extra?.useLocalGpt4all === 'true';
const GPT4ALL_LOCAL_URL = Constants.expoConfig?.extra?.gpt4allUrl || 'http://localhost:4891';

/**
 * This service provides AI-powered narrative generation with multiple backends:
 * 1. Hugging Face Inference API (free tier)
 * 2. GPT4All API (local deployment option)
 * 3. Mock data fallback if APIs are unavailable
 */
class NarrativeService {
  private useHuggingFace: boolean = !!HUGGING_FACE_API_KEY;
  private useGPT4All: boolean = USE_LOCAL_GPT4ALL;
  private mockEnabled: boolean = true; // Fallback to mock data
  
  // Cache for narrative responses to reduce API calls
  private narrativeCache: Map<string, NarrativeResponse> = new Map();
  
  // Mock data for offline development
  private mockNarratives: Record<string, Record<string, NarrativeResponse>> = {
    // Gandhi's narrative branches
    '1': {
      // Initial narrative for Gandhi (train incident)
      'initial': {
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
            historicalAccuracy: 'somewhat-accurate'
          },
          {
            id: 'refuse',
            text: "Refuse to move, citing your valid first-class ticket",
            impact: "Stand up for your rights at personal risk",
            historicalAccuracy: 'accurate'
          },
          {
            id: 'diplomatic',
            text: "Attempt to reason calmly with the official about your legal rights",
            impact: "Seek understanding while maintaining dignity",
            historicalAccuracy: 'somewhat-accurate'
          }
        ]
      },
      // Narrative if Gandhi refuses to move
      'refuse': {
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
            historicalAccuracy: 'accurate'
          },
          {
            id: 'organize',
            text: "Begin organizing Indian immigrants to collectively resist discriminatory laws",
            impact: "Start building a movement for collective resistance",
            historicalAccuracy: 'accurate'
          },
          {
            id: 'return',
            text: "Consider returning to India rather than facing such treatment",
            impact: "Retreat from direct confrontation",
            historicalAccuracy: 'creative'
          }
        ]
      },
      // More narrative branches would be added for Gandhi
    },
    // Additional historical figures would be added here
  };

  /**
   * Generate the next part of the narrative based on the character and previous choices
   */
  async generateNarrative(context: StoryContext): Promise<NarrativeResponse> {
    const { characterId, characterType, previousChoices, accuracy } = context;
    
    // For initial narrative (no previous choices)
    const isInitial = previousChoices.length === 0;
    const lastChoice = isInitial ? null : previousChoices[previousChoices.length - 1].choiceId;
    
    // Create a cache key
    const cacheKey = `${characterId}-${isInitial ? 'initial' : lastChoice}`;
    
    // Check cache first
    if (this.narrativeCache.has(cacheKey)) {
      return this.narrativeCache.get(cacheKey)!;
    }
    
    // Try Hugging Face API for narrative generation
    if (this.useHuggingFace) {
      try {
        // Convert context to a prompt for the AI
        const prompt = await this.createPromptFromContext(context);
        
        const response = await axios.post(
          'https://api-inference.huggingface.co/models/gpt2/...',
          {
            inputs: prompt,
            parameters: {
              max_length: 1000,
              temperature: 0.8,
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Parse the response
        try {
          const narrativeResponse: NarrativeResponse = JSON.parse(response.data[0].generated_text);
          // Add timestamps to narrative chunks
          narrativeResponse.narrative = narrativeResponse.narrative.map(chunk => ({
            ...chunk,
            timestamp: new Date()
          }));
          
          // Cache the response
          this.narrativeCache.set(cacheKey, narrativeResponse);
          return narrativeResponse;
        } catch (parseError) {
          console.error('Error parsing Hugging Face response:', parseError);
          // Fall through to next method
        }
      } catch (error) {
        console.error('Error generating narrative from Hugging Face:', error);
        // Fall through to next method
      }
    }
    
    // Try GPT4All local API (if available)
    if (this.useGPT4All) {
      try {
        // Convert context to a prompt for the AI
        const prompt = await this.createPromptFromContext(context);
        
        const response = await axios.post(
          `${GPT4ALL_LOCAL_URL}/v1/completions`,
          {
            model: 'gpt4all-j',
            prompt: prompt,
            max_tokens: 1000,
            temperature: 0.8
          }
        );
        
        // Parse the response
        try {
          const narrativeResponse: NarrativeResponse = JSON.parse(response.data.choices[0].text);
          // Add timestamps to narrative chunks
          narrativeResponse.narrative = narrativeResponse.narrative.map(chunk => ({
            ...chunk,
            timestamp: new Date()
          }));
          
          // Cache the response
          this.narrativeCache.set(cacheKey, narrativeResponse);
          return narrativeResponse;
        } catch (parseError) {
          console.error('Error parsing GPT4All response:', parseError);
          // Fall through to mock data
        }
      } catch (error) {
        console.error('Error generating narrative from GPT4All:', error);
        // Fall through to mock data
      }
    }
    
    // Fallback to mock data
    if (this.mockEnabled) {
      // For historical characters, use predefined narratives if available
      if (characterType === 'historical') {
        if (isInitial && this.mockNarratives[characterId]?.['initial']) {
          const response = this.mockNarratives[characterId]['initial'];
          this.narrativeCache.set(cacheKey, response);
          return response;
        }
        
        if (lastChoice && this.mockNarratives[characterId]?.[lastChoice]) {
          const response = this.mockNarratives[characterId][lastChoice];
          this.narrativeCache.set(cacheKey, response);
          return response;
        }
      }
      
      // For custom characters or if no matching narrative found,
      // generate based on character traits and previous choices
      const genericResponse = await this.generateGenericNarrative(context);
      this.narrativeCache.set(cacheKey, genericResponse);
      return genericResponse;
    }
    
    // If all else fails, return a generic narrative response
    const fallbackResponse = await this.generateGenericNarrative(context);
    this.narrativeCache.set(cacheKey, fallbackResponse);
    return fallbackResponse;
  }
  
  /**
   * Creates a text prompt for AI models based on the story context
   */
  private async createPromptFromContext(context: StoryContext): Promise<string> {
    const { characterId, characterType, previousChoices, accuracy } = context;
    
    // Get character information
    let characterName, characterTraits, characterEra, characterBackground;
    
    if (characterType === 'historical') {
      const character = await characterService.getHistoricalCharacter(characterId);
      characterName = character.name;
      characterTraits = character.traits;
      characterEra = character.era;
      characterBackground = character.biography;
    } else {
      const character = await characterService.getCustomCharacter(characterId);
      characterName = character.name;
      characterTraits = character.traits;
      characterEra = character.era;
      characterBackground = character.background;
    }
    
    // Start with a base prompt about the character
    let prompt = `Generate the next scene in a historical interactive narrative about ${characterName}, who lived in the ${characterEra}.`;
    
    // Add character background and traits
    prompt += `\n\nCharacter background: ${characterBackground || 'Not specified'}`;
    prompt += `\nCharacter traits: ${characterTraits.join(', ')}`;
    
    // Add accuracy mode
    prompt += `\nThe narrative should be ${accuracy === 'accurate' ? 'historically accurate' : 'creatively reimagined with alternative possibilities'}.`;
    
    // Add previous choices context if any
    if (previousChoices.length > 0) {
      prompt += '\n\nPrevious choices made:';
      previousChoices.forEach((choice, index) => {
        prompt += `\n${index + 1}. ${choice.choiceText} (at ${choice.timestamp.toISOString()})`;
      });
      
      // Add most recent choice for special emphasis
      prompt += `\n\nMost recent choice: "${previousChoices[previousChoices.length - 1].choiceText}"`;
    } else {
      prompt += '\n\nThis is the beginning of the narrative.';
    }
    
    // Add current context if available
    if (context.currentYear) {
      prompt += `\nCurrent year: ${context.currentYear}`;
    }
    
    if (context.currentLocation) {
      prompt += `\nCurrent location: ${context.currentLocation}`;
    }
    
    if (context.currentSituation) {
      prompt += `\nCurrent situation: ${context.currentSituation}`;
    }
    
    // Request structured output
    prompt += `\n\nGenerate a response with narrative chunks and choices in the following JSON format:
    {
      "narrative": [
        {"id": "string", "text": "string", "type": "narration|dialogue|thought|historical-fact", "speaker": "string (optional)"},
        ...
      ],
      "choices": [
        {"id": "string", "text": "string", "impact": "string", "historicalAccuracy": "accurate|somewhat-accurate|creative"},
        ...
      ]
    }`;
    
    return prompt;
  }
  
  /**
   * Generates a generic narrative response when no specific narrative is available
   */
  private async generateGenericNarrative(context: StoryContext): Promise<NarrativeResponse> {
    let characterName = 'the historical figure';
    let characterEra = 'historical period';
    
    // Try to get character details
    try {
      if (context.characterType === 'historical') {
        const character = await characterService.getHistoricalCharacter(context.characterId);
        characterName = character.name;
        characterEra = character.era;
      } else {
        const character = await characterService.getCustomCharacter(context.characterId);
        characterName = character.name;
        characterEra = character.era;
      }
    } catch (error) {
      console.error('Error getting character details:', error);
    }
    
    // Generate narrative based on previous choices if available
    let narrative: NarrativeChunk[] = [];
    let situation = '';
    
    if (context.previousChoices.length > 0) {
      const lastChoice = context.previousChoices[context.previousChoices.length - 1];
      
      // Create a narrative that acknowledges the previous choice
      narrative = [
        {
          id: `generic-${Date.now()}-1`,
          text: `As ${characterName}, your decision to ${lastChoice.choiceText.toLowerCase()} has led to new possibilities and challenges.`,
          type: 'narration',
          timestamp: new Date()
        },
        {
          id: `generic-${Date.now()}-2`,
          text: `The ${characterEra} was a time of great change and uncertainty, and your actions could influence the course of events in significant ways.`,
          type: 'narration',
          timestamp: new Date()
        },
        {
          id: `generic-${Date.now()}-3`,
          text: "You consider the implications of your past choices and the path that lies ahead.",
          type: 'thought',
          timestamp: new Date()
        }
      ];
      
      situation = 'continue your journey';
    } else {
      // First narrative in the story
      narrative = [
        {
          id: `generic-${Date.now()}-1`,
          text: `As ${characterName}, you find yourself at a pivotal moment in your life during the ${characterEra}.`,
          type: 'narration',
          timestamp: new Date()
        },
        {
          id: `generic-${Date.now()}-2`,
          text: "The decisions you make now will shape not only your future but potentially the course of history itself.",
          type: 'narration',
          timestamp: new Date()
        },
        {
          id: `generic-${Date.now()}-3`,
          text: "You contemplate the responsibility that weighs upon your shoulders, knowing that your actions will have far-reaching consequences.",
          type: 'thought',
          timestamp: new Date()
        }
      ];
      
      situation = 'begin your journey';
    }
    
    // Generate choices based on the accuracy setting
    return {
      narrative,
      choices: [
        {
          id: 'cautious',
          text: `Take a cautious approach as you ${situation}`,
          impact: "Minimize risk but potentially miss an opportunity",
          historicalAccuracy: 'somewhat-accurate'
        },
        {
          id: 'bold',
          text: `Make a bold decision that could change your destiny`,
          impact: "Potentially change history but at greater personal risk",
          historicalAccuracy: context.accuracy === 'accurate' ? 'creative' : 'somewhat-accurate'
        },
        {
          id: 'diplomatic',
          text: "Seek a diplomatic solution to your current situation",
          impact: "Balance competing interests while maintaining your principles",
          historicalAccuracy: 'somewhat-accurate'
        }
      ]
    };
  }
  
  /**
   * Processes a custom response from the user and generates a contextual reply
   */
  async processCustomResponse(
    customText: string,
    context: StoryContext
  ): Promise<NarrativeChunk[]> {
    // Try AI APIs first with a prompt that includes the custom text
    if (this.useHuggingFace || this.useGPT4All) {
      try {
        // Prepare character info
        let characterName = 'the historical figure';
        if (context.characterType === 'historical') {
          const character = await characterService.getHistoricalCharacter(context.characterId);
          characterName = character.name;
        } else {
          const character = await characterService.getCustomCharacter(context.characterId);
          characterName = character.name;
        }
        
        // Create a prompt for the custom response
        const prompt = `
          As ${characterName}, the user has responded with: "${customText}"
          
          Generate a narrative response to this custom input, considering:
          - Previous choices: ${context.previousChoices.map(c => c.choiceText).join(', ')}
          - Accuracy mode: ${context.accuracy}
          
          Respond in JSON format with narrative chunks:
          [
            {"id": "string", "text": "string", "type": "narration|dialogue|thought|historical-fact", "speaker": "string (optional)"}
          ]
        `;
        
        // Try Hugging Face first
        if (this.useHuggingFace) {
          const response = await axios.post(
            'https://api-inference.huggingface.co/models/gpt2/...',
            {
              inputs: prompt,
              parameters: {
                max_length: 500,
                temperature: 0.8,
              }
            },
            {
              headers: {
                'Authorization': `Bearer ${HUGGING_FACE_API_KEY}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          try {
            const chunks: NarrativeChunk[] = JSON.parse(response.data[0].generated_text);
            return chunks.map(chunk => ({ ...chunk, timestamp: new Date() }));
          } catch (parseError) {
            // Fall through to next method
          }
        }
        
        // Try GPT4All if available
        if (this.useGPT4All) {
          const response = await axios.post(
            `${GPT4ALL_LOCAL_URL}/v1/completions`,
            {
              model: 'gpt4all-j',
              prompt,
              max_tokens: 500,
              temperature: 0.8
            }
          );
          
          try {
            const chunks: NarrativeChunk[] = JSON.parse(response.data.choices[0].text);
            return chunks.map(chunk => ({ ...chunk, timestamp: new Date() }));
          } catch (parseError) {
            // Fall through to generic response
          }
        }
      } catch (error) {
        console.error('Error processing custom response:', error);
      }
    }
    
    // Fallback to a generic response
    return [
      {
        id: `custom-response-${Date.now()}`,
        text: "I understand your perspective. As we move forward with the story, please choose one of the available options to continue your journey.",
        type: 'narration',
        timestamp: new Date()
      }
    ];
  }
  
  /**
   * Saves the current story state
   */
  async saveStory(
    storyId: string,
    characterId: string,
    characterType: 'historical' | 'custom',
    characterName: string,
    title: string,
    context: StoryContext,
    narrative: NarrativeChunk[],
    choices: Choice[]
  ): Promise<boolean> {
    try {
      // Create a story object
      const story: SavedStory = {
        id: storyId,
        characterId,
        characterType,
        characterName,
        title,
        lastPlayed: new Date(),
        progress: this.calculateProgress(context),
        context,
        currentNarrative: narrative,
        currentChoices: choices
      };
      
      // Get existing stories
      const existingStoriesJson = await storageService.getItem('savedStories');
      let savedStories: SavedStory[] = existingStoriesJson ? JSON.parse(existingStoriesJson) : [];
      
      // Find and update existing story or add new one
      const existingIndex = savedStories.findIndex(s => s.id === storyId);
      if (existingIndex >= 0) {
        savedStories[existingIndex] = story;
      } else {
        savedStories.push(story);
      }
      
      // Save updated stories
      await storageService.setItem('savedStories', JSON.stringify(savedStories));
      return true;
    } catch (error) {
      console.error('Error saving story:', error);
      return false;
    }
  }
  
  /**
   * Loads a saved story
   */
  async loadStory(storyId: string): Promise<SavedStory | null> {
    try {
      const savedStoriesJson = await storageService.getItem('savedStories');
      if (!savedStoriesJson) return null;
      
      const savedStories: SavedStory[] = JSON.parse(savedStoriesJson);
      const story = savedStories.find(s => s.id === storyId);
      
      if (story) {
        // Update lastPlayed date
        story.lastPlayed = new Date();
        await this.saveStory(
          story.id,
          story.characterId,
          story.characterType,
          story.characterName,
          story.title,
          story.context,
          story.currentNarrative,
          story.currentChoices
        );
      }
      
      return story || null;
    } catch (error) {
      console.error('Error loading story:', error);
      return null;
    }
  }
  
  /**
   * Gets all saved stories
   */
  async getSavedStories(): Promise<SavedStory[]> {
    try {
      const savedStoriesJson = await storageService.getItem('savedStories');
      return savedStoriesJson ? JSON.parse(savedStoriesJson) : [];
    } catch (error) {
      console.error('Error getting saved stories:', error);
      return [];
    }
  }
  
  /**
   * Deletes a saved story
   */
  async deleteStory(storyId: string): Promise<boolean> {
    try {
      const savedStoriesJson = await storageService.getItem('savedStories');
      if (!savedStoriesJson) return false;
      
      let savedStories: SavedStory[] = JSON.parse(savedStoriesJson);
      savedStories = savedStories.filter(s => s.id !== storyId);
      
      await storageService.setItem('savedStories', JSON.stringify(savedStories));
      return true;
    } catch (error) {
      console.error('Error deleting story:', error);
      return false;
    }
  }
  
  /**
   * Calculates approximate story progress based on number of choices made
   */
  private calculateProgress(context: StoryContext): number {
    // In a real app, you might have a more sophisticated progress calculation
    // based on story arcs, chapters, or key decision points
    
    // Simple implementation based on number of choices made
    const choicesMade = context.previousChoices.length;
    
    // Assuming an average story has about 20 choice points
    const progress = Math.min(Math.round((choicesMade / 20) * 100), 99);
    
    // Cap at 99% until specifically marked as complete
    return progress;
  }
}

export const narrativeService = new NarrativeService();
export default narrativeService;