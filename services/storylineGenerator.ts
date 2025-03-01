import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Constants from 'expo-constants';
import { characterService, HistoricalCharacter, CustomCharacter } from './characterService';
import { storageService } from './storageService';

// Constants for API configuration
const USE_HUGGING_FACE = Constants.expoConfig?.extra?.useHuggingFace === 'true';
const HUGGING_FACE_API_KEY = Constants.expoConfig?.extra?.huggingFaceApiKey || '';
const USE_OPENAI = Constants.expoConfig?.extra?.useOpenAI === 'true';
const OPENAI_API_KEY = Constants.expoConfig?.extra?.openAIApiKey || '';
const USE_MOCK_DATA = true; // Always have mock data as a fallback

// Types for storyline generation
export interface StoryNode {
  id: string;
  text: string;
  type: 'narration' | 'dialogue' | 'thought' | 'historical-fact' | 'decision-point';
  speaker?: string;
  timestamp: Date;
  choices?: Choice[];
  metadata?: {
    location?: string;
    year?: string;
    historicalEvent?: string;
    emotionalTone?: 'neutral' | 'tense' | 'hopeful' | 'somber' | 'triumphant';
    isKeyMoment?: boolean;
    isEnding?: boolean;
    contextualBackground?: string;
  };
}

export interface Choice {
  id: string;
  text: string;
  impact: string;
  historicalAccuracy: 'accurate' | 'somewhat-accurate' | 'creative';
  consequences: {
    immediate?: string;
    longTerm?: string;
    affectsRelationships?: {[key: string]: number}; // Character names and impact values (-10 to 10)
    affectsAttributes?: {[key: string]: number}; // Character attributes and impact values
  };
  leadsTo?: string; // ID of the next story node
}

export interface StoryContext {
  characterId: string;
  characterType: 'historical' | 'custom';
  accuracy: 'accurate' | 'creative';
  previousNodes: string[]; // IDs of previously visited nodes
  previousChoices: {
    choiceId: string;
    choiceText: string;
    nodeId: string;
    timestamp: Date;
  }[];
  currentYear?: string;
  currentLocation?: string;
  currentSituation?: string;
  relationships?: {[key: string]: number}; // Character relationships (-100 to 100)
  attributes?: {[key: string]: number}; // Character attributes (0 to 100)
  visitedEvents?: string[]; // Key historical events visited
}

export interface StorylineData {
  id: string;
  title: string;
  character: {
    id: string;
    type: 'historical' | 'custom';
    name: string;
  };
  nodes: {[key: string]: StoryNode};
  startNodeId: string;
  context: StoryContext;
  created: Date;
  lastUpdated: Date;
}
// The main service class
class StorylineGenerator {
  private storylineCache: Map<string, StorylineData> = new Map();

  /**
   * Initializes or continues a storyline for a character
   */
  async getOrCreateStoryline(
    characterId: string,
    characterType: 'historical' | 'custom',
    accuracy: 'accurate' | 'creative',
    existingStorylineId?: string
  ): Promise<StorylineData> {
    // Check if we're loading an existing storyline
    if (existingStorylineId) {
      const existingStoryline = await this.getStorylineById(existingStorylineId);
      if (existingStoryline) {
        return existingStoryline;
      }
    }

    // Check cache for a storyline for this character
    const cacheKey = `${characterType}_${characterId}_${accuracy}`;
    if (this.storylineCache.has(cacheKey)) {
      return this.storylineCache.get(cacheKey)!;
    }

    // Create a new storyline
    const character = await this.getCharacterDetails(characterId, characterType);
    const storylineId = uuidv4();

    // Generate starting story node
    const startNode = await this.generateStartingNode(character, characterType, accuracy);

    // Create the initial storyline data
    const storyline: StorylineData = {
      id: storylineId,
      title: `${character.name}'s Journey`,
      character: {
        id: characterId,
        type: characterType,
        name: character.name
      },
      nodes: {
        [startNode.id]: startNode
      },
      startNodeId: startNode.id,
      context: {
        characterId,
        characterType,
        accuracy,
        previousNodes: [],
        previousChoices: [],
        relationships: {},
        attributes: this.generateInitialAttributes(character),
        visitedEvents: []
      },
      created: new Date(),
      lastUpdated: new Date()
    };

    // Set initial year and location if available in the start node
    if (startNode.metadata?.year) {
      storyline.context.currentYear = startNode.metadata.year;
    }

    if (startNode.metadata?.location) {
      storyline.context.currentLocation = startNode.metadata.location;
    }

    // Cache the storyline
    this.storylineCache.set(cacheKey, storyline);

    // Save to storage
    await this.saveStoryline(storyline);

    return storyline;
  }

  /**
   * Get character details from characterService
   */
  private async getCharacterDetails(id: string, type: 'historical' | 'custom'): Promise<HistoricalCharacter | CustomCharacter> {
    if (type === 'historical') {
      return await characterService.getHistoricalCharacter(id);
    } else {
      return await characterService.getCustomCharacter(id);
    }
  }

  /**
   * Generate initial character attributes based on traits
   */
  private generateInitialAttributes(character: HistoricalCharacter | CustomCharacter): {[key: string]: number} {
    const attributes: {[key: string]: number} = {
      // Base attributes
      influence: 50,
      resolve: 50,
      intellect: 50,
      charisma: 50,
      compassion: 50
    };

    // Adjust based on character traits
    character.traits.forEach(trait => {
      switch(trait.toLowerCase()) {
        case 'determined':
        case 'resilient':
        case 'principled':
          attributes.resolve += 20;
          break;
        case 'intelligent':
        case 'analytical':
        case 'brilliant':
          attributes.intellect += 20;
          break;
        case 'charismatic':
        case 'diplomatic':
        case 'inspiring':
          attributes.charisma += 20;
          break;
        case 'compassionate':
        case 'spiritual':
        case 'empathetic':
          attributes.compassion += 20;
          break;
        case 'influential':
        case 'powerful':
        case 'strategic':
          attributes.influence += 20;
          break;
      }
    });

    // Normalize values to be between 0 and 100
    Object.keys(attributes).forEach(key => {
      attributes[key] = Math.max(0, Math.min(100, attributes[key]));
    });

    return attributes;
  }
  /**
   * Generate a starting story node for a character
   */
  private async generateStartingNode(
    character: HistoricalCharacter | CustomCharacter,
    characterType: 'historical' | 'custom',
    accuracy: 'accurate' | 'creative'
  ): Promise<StoryNode> {
    // For historical characters, we can use a key event as the starting point
    if (characterType === 'historical' && 'keyEvents' in character && character.keyEvents.length > 0) {
      // Sort events chronologically and find an early significant event
      const sortedEvents = [...character.keyEvents].sort((a, b) => {
        const yearA = parseInt(a.date.match(/\d{4}/)?.[0] || '0');
        const yearB = parseInt(b.date.match(/\d{4}/)?.[0] || '0');
        return yearA - yearB;
      });

      // Choose an early, but significant event (not necessarily the first)
      const startEvent = sortedEvents[0]; // Use first event for simplicity, but could be more sophisticated

      return await this.generateNodeFromEvent(startEvent, character.name, accuracy);
    }

    // For custom characters or historical characters without key events,
    // generate a starting node based on the character's era and traits
    return await this.generateGenericStartingNode(character, accuracy);
  }

  /**
   * Generate a story node from a historical event
   */
  private async generateNodeFromEvent(
    event: any,
    characterName: string,
    accuracy: 'accurate' | 'creative'
  ): Promise<StoryNode> {
    // Extract year from the event date if possible
    const yearMatch = event.date.match(/\d{4}/);
    const year = yearMatch ? yearMatch[0] : event.date;

    // Try to extract a location from the event description or title
    let location = 'unknown location';
    const commonLocations = ['India', 'America', 'England', 'France', 'Germany', 'Russia', 'China', 'Japan'];
    for (const loc of commonLocations) {
      if (event.description.includes(loc) || event.title.includes(loc)) {
        location = loc;
        break;
      }
    }

    // Use AI to generate the node if available
    if ((USE_HUGGING_FACE && HUGGING_FACE_API_KEY) || (USE_OPENAI && OPENAI_API_KEY)) {
      try {
        return await this.generateNodeWithAI(characterName, event, year, location, accuracy);
      } catch (error) {
        console.error('Error generating node with AI:', error);
        // Fall through to mock data if AI fails
      }
    }

    // Use mock data as a fallback
    if (USE_MOCK_DATA) {
      return this.generateMockHistoricalNode(characterName, event, year, location, accuracy);
    }

    // Final fallback is a very basic node
    return {
      id: uuidv4(),
      text: `${year}: ${event.description}`,
      type: 'narration',
      timestamp: new Date(),
      choices: this.generateGenericChoices(accuracy),
      metadata: {
        year,
        location,
        historicalEvent: event.title,
        isKeyMoment: true
      }
    };
  }

  /**
   * Generate a generic starting node for a character
   */
  private async generateGenericStartingNode(
    character: HistoricalCharacter | CustomCharacter,
    accuracy: 'accurate' | 'creative'
  ): Promise<StoryNode> {
    // Extract era information
    const era = character.era;

    // Get a rough year from the era if possible
    let year = '';
    const yearMatch = era.match(/\d{4}/);
    if (yearMatch) {
      year = yearMatch[0];
    } else if (era.includes('Ancient')) {
      year = '500 BCE';
    } else if (era.includes('Medieval')) {
      year = '1200 CE';
    } else if (era.includes('Renaissance')) {
      year = '1500 CE';
    } else if (era.includes('19th Century')) {
      year = '1850 CE';
    } else if (era.includes('20th Century')) {
      year = '1920 CE';
    } else {
      year = 'unknown year';
    }

    // Use AI to generate the node if available
    if ((USE_HUGGING_FACE && HUGGING_FACE_API_KEY) || (USE_OPENAI && OPENAI_API_KEY)) {
      try {
        return await this.generateGenericNodeWithAI(character, year, accuracy);
      } catch (error) {
        console.error('Error generating generic node with AI:', error);
        // Fall through to mock data if AI fails
      }
    }

    // Use mock data as a fallback
    if (USE_MOCK_DATA) {
      return this.generateMockGenericNode(character, year, accuracy);
    }

    // Final fallback is a very basic node
    return {
      id: uuidv4(),
      text: `You are ${character.name}, living in the ${era}. Your journey begins now.`,
      type: 'narration',
      timestamp: new Date(),
      choices: this.generateGenericChoices(accuracy),
      metadata: {
        year,
        location: 'unknown location',
        isKeyMoment: true
      }
    };
  }
  /**
   * Generate choices based on a specific node
   */
  async getChoicesForNode(nodeId: string, storylineId: string): Promise<Choice[]> {
    const storyline = await this.getStorylineById(storylineId);
    if (!storyline || !storyline.nodes[nodeId]) {
      throw new Error(`Node ${nodeId} not found in storyline ${storylineId}`);
    }

    const node = storyline.nodes[nodeId];

    // If the node already has choices, return them
    if (node.choices && node.choices.length > 0) {
      return node.choices;
    }

    // Otherwise, generate new choices
    const choices = await this.generateChoicesForNode(node, storyline);

    // Update the node with the new choices
    storyline.nodes[nodeId] = {
      ...node,
      choices
    };

    // Save the updated storyline
    await this.saveStoryline(storyline);

    return choices;
  }

  /**
   * Generate a new story node based on a choice
   */
  async generateNextNode(
    choiceId: string,
    currentNodeId: string,
    storylineId: string
  ): Promise<StoryNode> {
    const storyline = await this.getStorylineById(storylineId);
    if (!storyline) {
      throw new Error(`Storyline ${storylineId} not found`);
    }

    const currentNode = storyline.nodes[currentNodeId];
    if (!currentNode) {
      throw new Error(`Node ${currentNodeId} not found in storyline ${storylineId}`);
    }

    const choice = currentNode.choices?.find(c => c.id === choiceId);
    if (!choice) {
      throw new Error(`Choice ${choiceId} not found in node ${currentNodeId}`);
    }

    // If the choice already leads to a node, return that node
    if (choice.leadsTo && storyline.nodes[choice.leadsTo]) {
      return storyline.nodes[choice.leadsTo];
    }

    // Update storyline context with the choice
    storyline.context.previousNodes.push(currentNodeId);
    storyline.context.previousChoices.push({
      choiceId,
      choiceText: choice.text,
      nodeId: currentNodeId,
      timestamp: new Date()
    });

    // Update any attributes or relationships affected by the choice
    if (choice.consequences.affectsAttributes) {
      Object.entries(choice.consequences.affectsAttributes).forEach(([attr, value]) => {
        const currentValue = storyline.context.attributes?.[attr] || 50;
        storyline.context.attributes = {
          ...storyline.context.attributes,
          [attr]: Math.max(0, Math.min(100, currentValue + value))
        };
      });
    }

    if (choice.consequences.affectsRelationships) {
      Object.entries(choice.consequences.affectsRelationships).forEach(([character, value]) => {
        const currentValue = storyline.context.relationships?.[character] || 0;
        storyline.context.relationships = {
          ...storyline.context.relationships,
          [character]: Math.max(-100, Math.min(100, currentValue + value))
        };
      });
    }

    // Generate the next node based on the choice and current context
    let nextNode: StoryNode;

    // Try to use AI to generate the next node
    if ((USE_HUGGING_FACE && HUGGING_FACE_API_KEY) || (USE_OPENAI && OPENAI_API_KEY)) {
      try {
        nextNode = await this.generateNextNodeWithAI(choice, currentNode, storyline);
      } catch (error) {
        console.error('Error generating next node with AI:', error);
        nextNode = this.generateMockNextNode(choice, currentNode, storyline);
      }
    } else {
      // Use mock data if AI is not available
      nextNode = this.generateMockNextNode(choice, currentNode, storyline);
    }

    // Update the storyline with the new node
    storyline.nodes[nextNode.id] = nextNode;

    // Update the choice to point to the new node
    const updatedChoice = { ...choice, leadsTo: nextNode.id };

    // Update the current node with the updated choice
    const updatedChoices = currentNode.choices?.map(c => 
      c.id === choiceId ? updatedChoice : c
    ) || [];

    storyline.nodes[currentNodeId] = {
      ...currentNode,
      choices: updatedChoices
    };

    // Update metadata in context if available in the new node
    if (nextNode.metadata?.year) {
      storyline.context.currentYear = nextNode.metadata.year;
    }

    if (nextNode.metadata?.location) {
      storyline.context.currentLocation = nextNode.metadata.location;
    }

    if (nextNode.metadata?.historicalEvent && 
        nextNode.metadata.isKeyMoment && 
        !storyline.context.visitedEvents?.includes(nextNode.metadata.historicalEvent)) {
      storyline.context.visitedEvents = [
        ...(storyline.context.visitedEvents || []),
        nextNode.metadata.historicalEvent
      ];
    }

    // Save the updated storyline
    storyline.lastUpdated = new Date();
    await this.saveStoryline(storyline);

    return nextNode;
  }
  /**
   * Generate a node using AI services
   */
  private async generateNodeWithAI(
    characterName: string,
    event: any,
    year: string,
    location: string,
    accuracy: 'accurate' | 'creative'
  ): Promise<StoryNode> {
    let response;

    // Construct a prompt for the AI
    const prompt = `
    Generate a detailed historical narrative scene about ${characterName} during the event: "${event.title}" in ${year} at ${location}.

    Event description: ${event.description}
    Event significance: ${event.significance}
    Accuracy mode: ${accuracy === 'accurate' ? 'historically accurate' : 'creative with alternative possibilities'}

    The scene should include narrative description, dialogue, the character's thoughts, and historical context.
    Format the response as a detailed JSON object with:
    {
      "scenes": [
        {
          "type": "narration|dialogue|thought|historical-fact",
          "text": "Detailed text content",
          "speaker": "Character name (only for dialogue)",
        }
      ],
      "metadata": {
        "year": "${year}",
        "location": "Specific location",
        "emotionalTone": "neutral|tense|hopeful|somber|triumphant",
        "historicalEvent": "${event.title}",
        "isKeyMoment": true,
        "contextualBackground": "Brief historical context"
      }
    }
    `;

    // Try using OpenAI if available
    if (USE_OPENAI && OPENAI_API_KEY) {
      try {
        response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 1500
          },
          {
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        // Parse the response
        const content = response.data.choices[0].message.content;
        const parsed = JSON.parse(content);

        // Convert to StoryNode format
        return this.convertAIResponseToNode(parsed);
      } catch (error) {
        console.error('Error with OpenAI:', error);
        throw error; // Rethrow to try other methods
      }
    }

    // Try using Hugging Face if available
    if (USE_HUGGING_FACE && HUGGING_FACE_API_KEY) {
      try {
        response = await axios.post(
          'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
          {
            inputs: prompt,
            parameters: {
              max_length: 1500,
              temperature: 0.7,
              return_full_text: false
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
        const content = response.data[0].generated_text;
        // Extract JSON from the response (Hugging Face might return non-JSON content)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          const parsed = JSON.parse(jsonStr);
          
          // Convert to StoryNode format
          return this.convertAIResponseToNode(parsed);
        }

        throw new Error('Failed to parse JSON from Hugging Face response');
      } catch (error) {
        console.error('Error with Hugging Face:', error);
        throw error; // Rethrow to try other methods
      }
    }

    throw new Error('No AI service available');
  }

  /**
   * Convert AI response to StoryNode format
   */
  private convertAIResponseToNode(aiResponse: any): StoryNode {
    const nodeId = uuidv4();

    // Extract scenes from the AI response
    const scenes = aiResponse.scenes || [];

    // Combine all narration scenes into a single text
    let combinedText = '';
    scenes.forEach((scene: any) => {
      if (scene.type === 'narration') {
        if (combinedText) combinedText += '\n\n';
        combinedText += scene.text;
      }
    });

    // If no narration scenes, use the first scene
    if (!combinedText && scenes.length > 0) {
      combinedText = scenes[0].text;
    }

    // Create the main narration node
    const mainNode: StoryNode = {
      id: nodeId,
      text: combinedText || 'You find yourself at a pivotal moment in history.',
      type: 'narration',
      timestamp: new Date(),
      metadata: aiResponse.metadata || {}
    };

    return mainNode;
  }

  /**
   * Generate a generic node with AI
   */
  private async generateGenericNodeWithAI(
    character: HistoricalCharacter | CustomCharacter,
    year: string,
    accuracy: 'accurate' | 'creative'
  ): Promise<StoryNode> {
    // Implementation similar to generateNodeWithAI but for generic cases
    // For brevity, use mock data in this example
    return this.generateMockGenericNode(character, year, accuracy);
  }
  /**
   * Generate next node with AI based on a choice
   */
  private async generateNextNodeWithAI(
    choice: Choice,
    currentNode: StoryNode,
    storyline: StorylineData
  ): Promise<StoryNode> {
    const characterName = storyline.character.name;
    const accuracy = storyline.context.accuracy;

    // Current context
    const year = currentNode.metadata?.year || storyline.context.currentYear || 'unknown year';
    const location = currentNode.metadata?.location || storyline.context.currentLocation || 'unknown location';

    // Construct a prompt for generating the next node
    const prompt = `
    Generate the next scene in a historical narrative where ${characterName} has chosen: "${choice.text}"

    PREVIOUS SCENARIO:
    ${currentNode.text}

    PLAYER'S CHOICE:
    ${choice.text}

    IMMEDIATE CONSEQUENCES:
    ${choice.consequences.immediate || 'Unknown'}

    CONTEXT:
    Year: ${year}
    Location: ${location}
    ${currentNode.metadata?.historicalEvent ? `Historical Event: ${currentNode.metadata.historicalEvent}` : ''}
    Accuracy mode: ${accuracy === 'accurate' ? 'historically accurate' : 'creative with alternative possibilities'}

    CHARACTER ATTRIBUTES:
    ${Object.entries(storyline.context.attributes || {})
      .map(([attr, value]) => `${attr}: ${value}`)
      .join(', ')}

    Format the response as a detailed JSON object with:
    {
      "scenes": [
        {
          "type": "narration|dialogue|thought|historical-fact",
          "text": "Detailed text content",
          "speaker": "Character name (only for dialogue)"
        }
      ],
      "metadata": {
        "year": "${year}",
        "location": "Specific location",
        "emotionalTone": "neutral|tense|hopeful|somber|triumphant",
        ${currentNode.metadata?.historicalEvent ? `"historicalEvent": "${currentNode.metadata.historicalEvent}",` : ''}
        "isKeyMoment": boolean,
        "contextualBackground": "Brief historical context"
      }
    }
    `;

    let response;

    // Try using OpenAI if available
    if (USE_OPENAI && OPENAI_API_KEY) {
      try {
        response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 1500
          },
          {
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Parse the response
        const content = response.data.choices[0].message.content;
        const parsed = JSON.parse(content);
        
        // Convert to StoryNode format
        return this.convertAIResponseToNode(parsed);
      } catch (error) {
        console.error('Error with OpenAI:', error);
        throw error;
      }
    }

    // Try using Hugging Face if available
    if (USE_HUGGING_FACE && HUGGING_FACE_API_KEY) {
      try {
        response = await axios.post(
          'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
          {
            inputs: prompt,
            parameters: {
              max_length: 1500,
              temperature: 0.7,
              return_full_text: false
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
        const content = response.data[0].generated_text;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const jsonStr = jsonMatch[0];
          const parsed = JSON.parse(jsonStr);
          
          // Convert to StoryNode format
          return this.convertAIResponseToNode(parsed);
        }
        
        throw new Error('Failed to parse JSON from Hugging Face response');
      } catch (error) {
        console.error('Error with Hugging Face:', error);
        throw error;
      }
    }

    // Use local processing if available (can be added for a fully offline mode)
    // This would be the place to add integration with a local LLM like GPT4All or LLama.cpp

    // If no AI service is available, use mock data
    if (USE_MOCK_DATA) {
      return this.generateMockNextNode(choice, currentNode, storyline);
    }

    throw new Error('No story generation method available');
  }
  /**
   * Generate choices for a node
   */
  private async generateChoicesForNode(
    node: StoryNode,
    storyline: StorylineData
  ): Promise<Choice[]> {
    // Try to use AI to generate choices
    if ((USE_HUGGING_FACE && HUGGING_FACE_API_KEY) || (USE_OPENAI && OPENAI_API_KEY)) {
      try {
        return await this.generateChoicesWithAI(node, storyline);
      } catch (error) {
        console.error('Error generating choices with AI:', error);
        // Fall through to mock data if AI fails
      }
    }

    // Use mock data as a fallback
    return this.generateMockChoices(node, storyline);
  }

  /**
   * Generate mock choices for a node
   */
  private generateMockChoices(node: StoryNode, storyline: StorylineData): Choice[] {
    const accuracy = storyline.context.accuracy;
    const characterName = storyline.character.name;

    // Gandhi-specific choices for the train incident
    if (characterName === 'Mahatma Gandhi' && 
        node.metadata?.historicalEvent?.includes('Train Incident')) {
      return [
        {
          id: uuidv4(),
          text: "Comply with the official and move to the third-class carriage",
          impact: "Avoid immediate conflict but feel the burn of injustice",
          historicalAccuracy: 'somewhat-accurate',
          consequences: {
            immediate: "You quietly move to the third-class carriage, avoiding confrontation",
            longTerm: "The humiliation deepens your resolve to fight systematic discrimination",
            affectsAttributes: { "resolve": 5, "influence": -2 }
          }
        },
        {
          id: uuidv4(),
          text: "Refuse to move, citing your valid first-class ticket",
          impact: "Stand up for your rights at personal risk",
          historicalAccuracy: 'accurate',
          consequences: {
            immediate: "You are forcibly removed from the train",
            longTerm: "This pivotal experience shapes your commitment to civil resistance",
            affectsAttributes: { "resolve": 10, "influence": 5 }
          }
        },
        {
          id: uuidv4(),
          text: "Attempt to reason calmly with the official about your legal rights",
          impact: "Seek understanding while maintaining dignity",
          historicalAccuracy: 'somewhat-accurate',
          consequences: {
            immediate: "The official listens briefly but insists you must move",
            longTerm: "You begin formulating ideas about peaceful resistance",
            affectsAttributes: { "intellect": 5, "charisma": 3 }
          }
        }
      ];
    }

    // Marie Curie-specific choices if applicable
    if (characterName === 'Marie Curie' && node.metadata?.year?.includes('1891')) {
      return [
        {
          id: uuidv4(),
          text: "Focus entirely on your studies in physics",
          impact: "Prioritize academic excellence in your primary field",
          historicalAccuracy: 'somewhat-accurate',
          consequences: {
            immediate: "You excel in your physics courses",
            longTerm: "Your dedication to physics provides a strong foundation for your future work",
            affectsAttributes: { "intellect": 8, "resolve": 5 }
          }
        },
        {
          id: uuidv4(),
          text: "Divide your attention between physics and chemistry",
          impact: "Develop an interdisciplinary approach to science",
          historicalAccuracy: 'accurate',
          consequences: {
            immediate: "You make connections between the fields that others miss",
            longTerm: "This interdisciplinary knowledge becomes crucial in your radioactivity research",
            affectsAttributes: { "intellect": 10, "resolve": 3 }
          }
        },
        {
          id: uuidv4(),
          text: "Seek a mentor to guide your scientific career",
          impact: "Form important professional relationships",
          historicalAccuracy: 'somewhat-accurate',
          consequences: {
            immediate: "You connect with established scientists in Paris",
            longTerm: "These connections help advance your research",
            affectsRelationships: { "Scientific Community": 8 },
            affectsAttributes: { "influence": 5 }
          }
        }
      ];
    }

    // Abraham Lincoln-specific choices if applicable
    if (characterName === 'Abraham Lincoln' && node.metadata?.historicalEvent?.includes('Civil War')) {
      return [
        {
          id: uuidv4(),
          text: "Prioritize preserving the Union above all else",
          impact: "Focus on military strategy to defeat the Confederacy",
          historicalAccuracy: 'accurate',
          consequences: {
            immediate: "You rally Northern support for the war effort",
            longTerm: "Your single-minded focus helps prevent the permanent division of the country",
            affectsAttributes: { "resolve": 8, "influence": 5 }
          }
        },
        {
          id: uuidv4(),
          text: "Make abolition of slavery the central war aim",
          impact: "Transform the conflict into a moral crusade against slavery",
          historicalAccuracy: 'accurate',
          consequences: {
            immediate: "This polarizes opinion but energizes abolitionists",
            longTerm: "The war gains a powerful moral dimension",
            affectsAttributes: { "compassion": 10, "charisma": 5 }
          }
        },
        {
          id: uuidv4(),
          text: "Seek diplomatic solutions to end the conflict quickly",
          impact: "Attempt to reduce bloodshed through negotiation",
          historicalAccuracy: 'creative',
          consequences: {
            immediate: "Negotiation attempts are viewed skeptically by both sides",
            longTerm: "History remembers your peace efforts, but with mixed results",
            affectsAttributes: { "charisma": 3, "influence": -5 }
          }
        }
      ];
    }

    // Default generic choices if nothing specific matches
    return this.generateGenericChoices(accuracy);
  }

  /**
   * Generate generic choices for any scenario
   */
  private generateGenericChoices(accuracy: 'accurate' | 'creative'): Choice[] {
    return [
      {
        id: uuidv4(),
        text: "Take a cautious, measured approach",
        impact: "Minimize risk but potentially miss opportunities",
        historicalAccuracy: 'somewhat-accurate',
        consequences: {
          immediate: "You proceed carefully and avoid immediate danger",
          longTerm: "Your cautious approach builds a reputation for reliability",
          affectsAttributes: { "resolve": 3, "influence": -2 }
        }
      },
      {
        id: uuidv4(),
        text: "Take bold, decisive action",
        impact: "Potentially create significant change at personal risk",
        historicalAccuracy: accuracy === 'accurate' ? 'somewhat-accurate' : 'creative',
        consequences: {
          immediate: "Your bold move attracts immediate attention",
          longTerm: "Your willingness to take risks becomes well-known",
          affectsAttributes: { "resolve": 8, "influence": 5 }
        }
      },
      {
        id: uuidv4(),
        text: "Seek advice and build consensus before acting",
        impact: "Gain support but delay immediate action",
        historicalAccuracy: 'somewhat-accurate',
        consequences: {
          immediate: "You gather valuable perspectives but progress is slow",
          longTerm: "You develop a network of allies for future challenges",
          affectsAttributes: { "charisma": 5, "influence": 3 }
        }
      }
    ];
  }
  /**
   * Generate a mock historical node for testing
   */
  private generateMockHistoricalNode(
    characterName: string,
    event: any,
    year: string,
    location: string,
    accuracy: 'accurate' | 'creative'
  ): StoryNode {
    // Gandhi-specific narrative for train incident
    if (characterName === 'Mahatma Gandhi' && event.title.includes('Train Incident')) {
      return {
        id: uuidv4(),
        text: "South Africa, 1893. You are Mohandas Gandhi, a 24-year-old lawyer who has recently arrived in South Africa to work on a legal case. The train to Pretoria stops at Pietermaritzburg station. Despite having a first-class ticket, a railway official orders you to move to the third-class carriage.",
        type: 'narration',
        timestamp: new Date(),
        metadata: {
          year: '1893',
          location: 'Pietermaritzburg, South Africa',
          historicalEvent: 'Train Incident in South Africa',
          emotionalTone: 'tense',
          isKeyMoment: true,
          contextualBackground: "This incident was a turning point that began to awaken Gandhi to social injustice and inspired his transformation into an activist."
        }
      };
    }

    // Marie Curie-specific narrative
    if (characterName === 'Marie Curie' && event.title.includes('Moved to Paris')) {
      return {
        id: uuidv4(),
        text: "Paris, 1891. You are Marie Skłodowska, a determined young woman who has just arrived in Paris to pursue your studies at the University of Paris. After years of working as a governess to save money and facing the limitations imposed on women's education in Poland, you finally have the opportunity to follow your scientific passions. The city buzzes with intellectual energy, but as a foreign woman in the male-dominated world of science, you know you will face significant challenges.",
        type: 'narration',
        timestamp: new Date(),
        metadata: {
          year: '1891',
          location: 'Paris, France',
          historicalEvent: 'Marie Curie Moves to Paris',
          emotionalTone: 'hopeful',
          isKeyMoment: true,
          contextualBackground: "Women were rare in scientific fields at this time, and Marie's move to Paris was crucial for her scientific career, as she had limited opportunities for advanced education in Poland."
        }
      };
    }

    // Lincoln-specific narrative
    if (characterName === 'Abraham Lincoln' && event.title.includes('Civil War')) {
      return {
        id: uuidv4(),
        text: "Washington D.C., 1861. You are Abraham Lincoln, newly inaugurated as the 16th President of the United States during the nation's greatest crisis. Seven Southern states have already seceded from the Union, and more threaten to follow. The fate of the nation rests on your shoulders as tensions escalate toward armed conflict. Your advisors are divided on how to respond to the rebellion, and every decision you make will have profound consequences for the future of the country.",
        type: 'narration',
        timestamp: new Date(),
        metadata: {
          year: '1861',
          location: 'Washington D.C., United States',
          historicalEvent: 'Beginning of the American Civil War',
          emotionalTone: 'tense',
          isKeyMoment: true,
          contextualBackground: "Lincoln became president just as the nation was splitting apart over the issues of states' rights and slavery, leading to the deadliest conflict in American history."
        }
      };
    }

    // Generic historical node if nothing specific matches
    return {
      id: uuidv4(),
      text: `${location}, ${year}. You are ${characterName}, and you find yourself at a pivotal moment. ${event.description}`,
      type: 'narration',
      timestamp: new Date(),
      metadata: {
        year,
        location,
        historicalEvent: event.title,
        emotionalTone: 'neutral',
        isKeyMoment: true,
        contextualBackground: event.significance || "This is an important historical moment."
      }
    };
  }

  /**
   * Generate a mock generic starting node
   */
  private generateMockGenericNode(
    character: HistoricalCharacter | CustomCharacter,
    year: string,
    accuracy: 'accurate' | 'creative'
  ): StoryNode {
    // Get a likely location based on the era
    let location = 'unknown location';
    if (character.era.includes('Ancient')) {
      location = 'Rome';
    } else if (character.era.includes('Medieval')) {
      location = 'a European kingdom';
    } else if (character.era.includes('Renaissance')) {
      location = 'Florence';
    } else if (character.era.includes('19th Century')) {
      location = 'London';
    } else if (character.era.includes('20th Century')) {
      location = 'New York';
    }

    return {
      id: uuidv4(),
      text: `${location}, ${year}. You are ${character.name}, a ${character.traits.join(', ')} individual living in the ${character.era}. Today, you face important decisions that will shape your future and potentially history itself.`,
      type: 'narration',
      timestamp: new Date(),
      metadata: {
        year,
        location,
        emotionalTone: 'neutral',
        isKeyMoment: false,
        contextualBackground: `The ${character.era} was a time of significant changes and challenges.`
      }
    };
  }

  /**
   * Generate a mock next node based on a choice
   */
  private generateMockNextNode(
    choice: Choice,
    currentNode: StoryNode,
    storyline: StorylineData
  ): StoryNode {
    const characterName = storyline.character.name;

    // Gandhi's train incident follow-up
    if (characterName === 'Mahatma Gandhi' && 
        currentNode.metadata?.historicalEvent?.includes('Train Incident')) {

      if (choice.text.includes('Refuse to move')) {
        return {
          id: uuidv4(),
          text: "\"I have a first-class ticket and the right to be here,\" you state firmly, showing your ticket. The railway official's face hardens. He calls for a police constable who forcibly removes you from the train. You're thrown off with your belongings. As the train departs, you're left alone on the cold platform at Pietermaritzburg station. Sitting in the waiting room through the freezing night, you contemplate the injustice of racial prejudice. A transformative realization begins to form in your mind.",
          type: 'narration',
          timestamp: new Date(),
          metadata: {
            year: '1893',
            location: 'Pietermaritzburg Station, South Africa',
            historicalEvent: 'Train Incident in South Africa',
            emotionalTone: 'somber',
            isKeyMoment: true,
            contextualBackground: "This night spent in the cold waiting room was later described by Gandhi as the most creative night of his life, when he decided to fight against racial prejudice."
          }
        };
      } else if (choice.text.includes('Comply with the official')) {
        return {
          id: uuidv4(),
          text: "You reluctantly gather your belongings and move to the third-class carriage, feeling a deep sense of humiliation but avoiding immediate conflict. The cramped, uncomfortable carriage is a stark contrast to your first-class seat. As you sit among the other Indian passengers, you observe their resigned expressions, suggesting this treatment is all too familiar. Throughout the journey, the burning sense of injustice grows within you, and you begin to contemplate the systematic discrimination faced by Indians in South Africa.",
          type: 'narration',
          timestamp: new Date(),
          metadata: {
            year: '1893',
            location: 'Train to Pretoria, South Africa',
            historicalEvent: 'Train Incident in South Africa',
            emotionalTone: 'somber',
            isKeyMoment: false,
            contextualBackground: "While Gandhi historically was removed from the train, this alternative explores how the experience of discrimination might still have affected him even if he had complied."
          }
        };
      } else {
        return {
          id: uuidv4(),
          text: "You attempt to reason with the official, calmly explaining that you have a valid first-class ticket and the legal right to travel in the carriage. The official listens impassively but remains unmoved. \"The rules are different in this country,\" he states coldly. \"Indians travel third-class.\" Despite your logical arguments and appeals to fairness, the conversation ends with you being given an ultimatum: move to third-class or be removed from the train.",
          type: 'narration',
          timestamp: new Date(),
          metadata: {
            year: '1893',
            location: 'Train at Pietermaritzburg Station, South Africa',
            historicalEvent: 'Train Incident in South Africa',
            emotionalTone: 'tense',
            isKeyMoment: false,
            contextualBackground: "Gandhi's experience with discrimination in South Africa would eventually lead him to develop his philosophy of satyagraha (truth-force), based on nonviolent resistance to injustice."
          }
        };
      }
    }
    // Marie Curie follow-up
    if (characterName === 'Marie Curie' && currentNode.metadata?.year?.includes('1891')) {
      if (choice.text.includes('Divide your attention')) {
        return {
          id: uuidv4(),
          text: "You decide to pursue both physics and chemistry, recognizing the valuable connections between the fields. Despite the heavy workload, you excel in your studies, fueled by your passion for science. During a physics lecture, you're introduced to the concept of magnetism and electricity, while your chemistry courses delve into atomic theory. Late at night, studying in your small, cold apartment, you begin to see connections that your peers miss. \"The properties of elements and the forces that govern them are interconnected,\" you note in your journal.",
          type: 'narration',
          timestamp: new Date(),
          metadata: {
            year: '1891',
            location: 'University of Paris, France',
            emotionalTone: 'determined',
            isKeyMoment: true,
            contextualBackground: "This interdisciplinary approach would later prove crucial in Marie Curie's groundbreaking work on radioactivity."
          }
        };
      }
    }

    // Generic follow-up for any choice if no specific one is defined
    return {
      id: uuidv4(),
      text: `Following your decision to ${choice.text.toLowerCase()}, ${choice.consequences.immediate || 'you face new challenges and opportunities'}. ${currentNode.metadata?.location || 'Your surroundings'} seem to respond to your choice, as if history itself is being shaped by your actions.`,
      type: 'narration',
      timestamp: new Date(),
      metadata: {
        year: currentNode.metadata?.year || storyline.context.currentYear,
        location: currentNode.metadata?.location || storyline.context.currentLocation,
        emotionalTone: 'neutral',
        isKeyMoment: false,
        contextualBackground: choice.consequences.longTerm || "The consequences of this choice will echo through time."
      }
    };
  }

  /**
   * Get a specific storyline by ID
   */
  async getStorylineById(storylineId: string): Promise<StorylineData | null> {
    // Check cache first
    if (this.storylineCache.has(storylineId)) {
      return this.storylineCache.get(storylineId)!;
    }

    // Try to get from local storage
    try {
      const storylineData = await storageService.getItem(`storyline_${storylineId}`);
      if (storylineData) {
        const storyline: StorylineData = JSON.parse(storylineData);
        this.storylineCache.set(storylineId, storyline);
        return storyline;
      }
    } catch (error) {
      console.error('Error loading storyline from storage:', error);
    }

    return null;
  }

  /**
   * Save a storyline to storage
   */
  async saveStoryline(storyline: StorylineData): Promise<boolean> {
    try {
      // Update the last updated timestamp
      storyline.lastUpdated = new Date();

      // Save to local storage
      await storageService.setItem(`storyline_${storyline.id}`, JSON.stringify(storyline));

      // Update the storyline list
      await this.updateStorylineList(storyline);

      // Update cache
      this.storylineCache.set(storyline.id, storyline);

      return true;
    } catch (error) {
      console.error('Error saving storyline:', error);
      return false;
    }
  }

  /**
   * Update the list of saved storylines
   */
  private async updateStorylineList(storyline: StorylineData): Promise<void> {
    try {
      // Get current list
      const storylineListJson = await storageService.getItem('storyline_list');
      let storylineList = storylineListJson ? JSON.parse(storylineListJson) : [];

      // Check if storyline already exists in the list
      const existingIndex = storylineList.findIndex((s: any) => s.id === storyline.id);
      
      // Create a list entry with minimal information
      const listEntry = {
        id: storyline.id,
        title: storyline.title,
        character: {
          id: storyline.character.id,
          type: storyline.character.type,
          name: storyline.character.name
        },
        created: storyline.created,
        lastUpdated: storyline.lastUpdated
      };

      // Update or add the storyline
      if (existingIndex >= 0) {
        storylineList[existingIndex] = listEntry;
      } else {
        storylineList.push(listEntry);
      }

      // Sort by last updated (most recent first)
      storylineList.sort((a: any, b: any) => 
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );

      // Save the updated list
      await storageService.setItem('storyline_list', JSON.stringify(storylineList));
    } catch (error) {
      console.error('Error updating storyline list:', error);
    }
  }

  /**
   * Delete a storyline
   */
  async deleteStoryline(storylineId: string): Promise<boolean> {
    try {
      // Remove from local storage
      await storageService.removeItem(`storyline_${storylineId}`);

      // Remove from cache
      this.storylineCache.delete(storylineId);

      // Update the storyline list
      const storylineListJson = await storageService.getItem('storyline_list');
      if (storylineListJson) {
        let storylineList = JSON.parse(storylineListJson);
        storylineList = storylineList.filter((s: any) => s.id !== storylineId);
        await storageService.setItem('storyline_list', JSON.stringify(storylineList));
      }

      return true;
    } catch (error) {
      console.error('Error deleting storyline:', error);
      return false;
    }
  }

  /**
   * Get all saved storylines
   */
  async getAllSavedStorylines(): Promise<any[]> {
    try {
      const storylineListJson = await storageService.getItem('storyline_list');
      return storylineListJson ? JSON.parse(storylineListJson) : [];
    } catch (error) {
      console.error('Error getting saved storylines:', error);
      return [];
    }
  }

  /**
   * Generate a transcript of the story so far
   */
  async generateStoryTranscript(storylineId: string): Promise<string> {
    const storyline = await this.getStorylineById(storylineId);
    if (!storyline) {
      throw new Error(`Storyline ${storylineId} not found`);
    }

    // Collect all visited nodes in order
    const visitedNodeIds = [storyline.startNodeId, ...storyline.context.previousNodes];
    const nodes = visitedNodeIds.map(id => storyline.nodes[id]).filter(Boolean);

    // Generate a transcript
    let transcript = `# ${storyline.title}\n\n`;
    transcript += `Character: ${storyline.character.name}\n\n`;

    // Add each scene
    nodes.forEach(node => {
      if (node.metadata?.year || node.metadata?.location) {
        transcript += `**${node.metadata.location || ''} ${node.metadata.year ? `(${node.metadata.year})` : ''}**\n\n`;
      }

      transcript += `${node.text}\n\n`;

      // Add selected choice if available
      const nodeId = node.id;
      const choice = storyline.context.previousChoices.find(c => c.nodeId === nodeId);
      if (choice) {
        transcript += `*${storyline.character.name} decided to: ${choice.choiceText}*\n\n`;
      }
    });

    return transcript;
  }

  /**
   * Check if a storyline is complete
   */
  isStorylineComplete(storyline: StorylineData): boolean {
    // A story is considered complete if it has reached a node with no choices
    // or if it has a specific ending flag set
    
    // Get the last visited node
    const lastNodeId = storyline.context.previousNodes.length > 0 ? 
      storyline.context.previousNodes[storyline.context.previousNodes.length - 1] : 
      storyline.startNodeId;
    
    const lastNode = storyline.nodes[lastNodeId];
    
    // Check if the node is an ending
    if (lastNode?.metadata?.isEnding) {
      return true;
    }
    
    // Check if there are no choices
    return !lastNode?.choices || lastNode.choices.length === 0;
  }

  /**
   * Get the completion percentage of a storyline
   */
  getStorylineCompletion(storyline: StorylineData): number {
    if (this.isStorylineComplete(storyline)) {
      return 100;
    }
    
    // Based on number of choices made
    const choicesMade = storyline.context.previousChoices.length;
    
    // Assuming an average story has about 20 choice points
    const progress = Math.min(Math.round((choicesMade / 20) * 100), 99);
    
    // Cap at 99% until specifically marked as complete
    return progress;
  }
}

export const storylineGenerator = new StorylineGenerator();
export default storylineGenerator;