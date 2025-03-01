import { storageService } from './storageService';
import axios from 'axios';
import Constants from 'expo-constants';

// Types for character data
export interface HistoricalCharacter {
  id: string;
  name: string;
  era: string;
  biography: string;
  keyEvents: HistoricalEvent[];
  traits: string[];
  image?: string;
}

export interface HistoricalEvent {
  date: string;
  title: string;
  description: string;
  significance: string;
}

export interface CustomCharacter {
  id: string;
  name: string;
  era: string;
  background: string;
  traits: string[];
  created: Date;
  lastPlayed?: Date;
}

// Wikidata API endpoint
const WIKIDATA_API = 'https://www.wikidata.org/w/api.php';

// Try to get API key from environment
const HUGGING_FACE_API_KEY = Constants.expoConfig?.extra?.huggingFaceApiKey || '';

/**
 * This service manages character data for both historical figures and custom characters
 */
class CharacterService {
  private historicalCharacterCache: Map<string, HistoricalCharacter> = new Map();
  private customCharacterCache: Map<string, CustomCharacter> = new Map();
  
  // Mock data for historical figures
  private mockHistoricalCharacters: Record<string, HistoricalCharacter> = {
    '1': {
      id: '1',
      name: 'Mahatma Gandhi',
      era: '20th Century',
      biography: 'Mohandas Karamchand Gandhi was an Indian lawyer, anti-colonial nationalist and political ethicist who employed nonviolent resistance to lead the successful campaign for India\'s independence from British rule.',
      traits: ['non-violent', 'determined', 'principled', 'spiritual'],
      keyEvents: [
        {
          date: '1893',
          title: 'Train Incident in South Africa',
          description: 'Gandhi was thrown off a train at Pietermaritzburg after refusing to move from the first-class to a third-class coach while holding a valid first-class ticket.',
          significance: 'This incident was a turning point that began to awaken him to social injustice and inspired his transformation into an activist.'
        },
        {
          date: '1915',
          title: 'Return to India',
          description: 'After 21 years in South Africa, Gandhi returned to India with a reputation as a nationalist, theorist and organizer.',
          significance: 'His return marked the beginning of his leadership in the Indian independence movement.'
        },
        {
          date: '1930',
          title: 'Salt March',
          description: 'Gandhi led a 24-day march to the sea to protest the British salt monopoly.',
          significance: 'This became one of the most significant organized challenges to British authority and a catalyst for the Civil Disobedience Movement.'
        },
        {
          date: '1942',
          title: 'Quit India Movement',
          description: 'Gandhi launched the Quit India Movement calling for immediate independence from British rule.',
          significance: 'This movement intensified the independence struggle and eventually led to British withdrawal from India.'
        },
        {
          date: '1947',
          title: 'India\'s Independence',
          description: 'India gained independence from British rule, but was partitioned into India and Pakistan.',
          significance: 'While independence was achieved, the partition led to massive violence, which deeply distressed Gandhi.'
        },
        {
          date: '1948',
          title: 'Assassination',
          description: 'Gandhi was assassinated by Nathuram Godse, a Hindu nationalist.',
          significance: 'His death led to nationwide mourning and solidified his legacy as a martyr for peace and nonviolence.'
        }
      ],
      image: 'https://via.placeholder.com/150?text=Gandhi'
    },
    '2': {
      id: '2',
      name: 'Marie Curie',
      era: 'Late 19th - Early 20th Century',
      biography: 'Marie Skłodowska Curie was a Polish and naturalized-French physicist and chemist who conducted pioneering research on radioactivity. She was the first woman to win a Nobel Prize, the first person to win the Nobel Prize twice, and the only person to win the Nobel Prize in two scientific fields.',
      traits: ['brilliant', 'dedicated', 'pioneering', 'perseverant'],
      keyEvents: [
        {
          date: '1891',
          title: 'Moved to Paris',
          description: 'Marie moved to Paris to continue her studies in physics, chemistry, and mathematics at the University of Paris.',
          significance: 'This move was crucial for her scientific career, as she had limited opportunities for advanced education in Poland.'
        },
        {
          date: '1895',
          title: 'Marriage to Pierre Curie',
          description: 'Marie married Pierre Curie, a physicist who shared her scientific interests.',
          significance: 'This began their scientific partnership that would lead to groundbreaking discoveries.'
        },
        {
          date: '1898',
          title: 'Discovery of Polonium and Radium',
          description: 'The Curies discovered the elements polonium and radium, isolating them from uraninite.',
          significance: 'These discoveries fundamentally changed our understanding of atomic structure and led to the development of nuclear physics.'
        },
        {
          date: '1903',
          title: 'Nobel Prize in Physics',
          description: 'Marie, Pierre Curie, and Henri Becquerel were awarded the Nobel Prize in Physics for their research on radiation phenomena.',
          significance: 'Marie became the first woman to win a Nobel Prize.'
        },
        {
          date: '1911',
          title: 'Nobel Prize in Chemistry',
          description: 'Marie won her second Nobel Prize, this time in Chemistry, for her discovery of the elements polonium and radium.',
          significance: 'She became the first person to win Nobel Prizes in multiple scientific fields.'
        },
        {
          date: '1914-1918',
          title: 'Mobile X-ray Units in World War I',
          description: 'During World War I, Marie developed mobile X-ray units to provide X-ray services to field hospitals.',
          significance: 'Her work saved the lives of countless soldiers and demonstrated practical applications of her scientific research.'
        }
      ],
      image: 'https://via.placeholder.com/150?text=Curie'
    },
    '3': {
      id: '3',
      name: 'Abraham Lincoln',
      era: '19th Century',
      biography: 'Abraham Lincoln was an American statesman and lawyer who served as the 16th president of the United States from 1861 until his assassination in 1865. Lincoln led the nation through the American Civil War, preserved the Union, abolished slavery, strengthened the federal government, and modernized the U.S. economy.',
      traits: ['determined', 'compassionate', 'strategic', 'eloquent'],
      keyEvents: [
        {
          date: '1834',
          title: 'Elected to Illinois State Legislature',
          description: 'Lincoln began his political career when he was elected to the Illinois state legislature.',
          significance: 'This marked his entry into politics and the beginning of his political career.'
        },
        {
          date: '1836',
          title: 'Admitted to the Bar',
          description: 'Lincoln was admitted to the bar, allowing him to practice law in Illinois.',
          significance: 'His legal career provided him with valuable experience and connections that would later support his political ambitions.'
        },
        {
          date: '1860',
          title: 'Elected President',
          description: 'Lincoln was elected as the 16th President of the United States.',
          significance: 'His election precipitated the secession of several Southern states and eventually led to the Civil War.'
        },
        {
          date: '1863',
          title: 'Emancipation Proclamation',
          description: 'Lincoln issued the Emancipation Proclamation, declaring "that all persons held as slaves" within the rebellious states "are, and henceforward shall be free."',
          significance: 'This was a crucial step toward the abolition of slavery in the United States.'
        },
        {
          date: '1863',
          title: 'Gettysburg Address',
          description: 'Lincoln delivered the Gettysburg Address, one of the most famous speeches in American history.',
          significance: 'The speech redefined the purpose of the Civil War and articulated a vision of America based on equality and democracy.'
        },
        {
          date: '1865',
          title: 'Assassination',
          description: 'Lincoln was assassinated by John Wilkes Booth at Ford\'s Theatre in Washington, D.C.',
          significance: 'His death came just days after the effective end of the Civil War and dramatically altered the course of Reconstruction.'
        }
      ],
      image: 'https://via.placeholder.com/150?text=Lincoln'
    }
    // More historical figures would be added here
  };
  
  /**
   * Gets all available historical characters
   */
  async getAllHistoricalCharacters(): Promise<HistoricalCharacter[]> {
    // Try to get from local storage first
    const storedCharacters = await storageService.getItem('historicalCharacters');
    if (storedCharacters) {
      const characters: HistoricalCharacter[] = JSON.parse(storedCharacters);
      // Update cache
      characters.forEach(character => {
        this.historicalCharacterCache.set(character.id, character);
      });
      return characters;
    }
    
    // Fallback to mock data
    const mockCharacters = Object.values(this.mockHistoricalCharacters);
    
    // Store for future use
    await storageService.setItem('historicalCharacters', JSON.stringify(mockCharacters));
    
    // Update cache
    mockCharacters.forEach(character => {
      this.historicalCharacterCache.set(character.id, character);
    });
    
    return mockCharacters;
  }
  
  /**
   * Gets a specific historical character by ID
   */
  async getHistoricalCharacter(id: string): Promise<HistoricalCharacter> {
    // Check cache first
    if (this.historicalCharacterCache.has(id)) {
      return this.historicalCharacterCache.get(id)!;
    }
    
    // Try to get from local storage
    const storedCharacters = await storageService.getItem('historicalCharacters');
    if (storedCharacters) {
      const characters: HistoricalCharacter[] = JSON.parse(storedCharacters);
      const character = characters.find(c => c.id === id);
      if (character) {
        this.historicalCharacterCache.set(id, character);
        return character;
      }
    }
    
    // Try to get from mock data
    if (this.mockHistoricalCharacters[id]) {
      const character = this.mockHistoricalCharacters[id];
      this.historicalCharacterCache.set(id, character);
      return character;
    }
    
    // If no character is found, try to fetch it from Wikidata
    try {
      const character = await this.fetchHistoricalCharacterFromWikidata(id);
      this.historicalCharacterCache.set(id, character);
      
      // Update stored characters
      const storedCharacters = await storageService.getItem('historicalCharacters');
      const characters: HistoricalCharacter[] = storedCharacters ? JSON.parse(storedCharacters) : [];
      characters.push(character);
      await storageService.setItem('historicalCharacters', JSON.stringify(characters));
      
      return character;
    } catch (error) {
      console.error('Error fetching character from Wikidata:', error);
    }
    
    // If all else fails, return a generic character
    const genericCharacter: HistoricalCharacter = {
      id,
      name: 'Unknown Historical Figure',
      era: 'Unknown Era',
      biography: 'Information not available.',
      traits: ['unknown'],
      keyEvents: []
    };
    
    return genericCharacter;
  }
  
  /**
   * Searches for historical characters by name, era, or traits
   */
  async searchHistoricalCharacters(query: string): Promise<HistoricalCharacter[]> {
    const allCharacters = await this.getAllHistoricalCharacters();
    
    if (!query.trim()) {
      return allCharacters;
    }
    
    const lowerQuery = query.toLowerCase();
    return allCharacters.filter(character => 
      character.name.toLowerCase().includes(lowerQuery) ||
      character.era.toLowerCase().includes(lowerQuery) ||
      character.traits.some(trait => trait.toLowerCase().includes(lowerQuery)) ||
      character.biography.toLowerCase().includes(lowerQuery)
    );
  }
  
  /**
   * Filters historical characters by era
   */
  async filterHistoricalCharactersByEra(era: string): Promise<HistoricalCharacter[]> {
    const allCharacters = await this.getAllHistoricalCharacters();
    
    if (era === 'all') {
      return allCharacters;
    }
    
    return allCharacters.filter(character => 
      character.era.toLowerCase().includes(era.toLowerCase())
    );
  }
  
  /**
   * Creates a new custom character
   */
  async createCustomCharacter(
    name: string,
    era: string,
    background: string,
    traits: string[]
  ): Promise<CustomCharacter> {
    // Generate a unique ID
    const id = `custom-${Date.now()}`;
    
    // Create the character object
    const character: CustomCharacter = {
      id,
      name,
      era,
      background,
      traits,
      created: new Date()
    };
    
    // Save to local storage
    const storedCharacters = await storageService.getItem('customCharacters');
    const characters: CustomCharacter[] = storedCharacters ? JSON.parse(storedCharacters) : [];
    characters.push(character);
    await storageService.setItem('customCharacters', JSON.stringify(characters));
    
    // Update cache
    this.customCharacterCache.set(id, character);
    
    return character;
  }
  
  /**
   * Gets all custom characters
   */
  async getAllCustomCharacters(): Promise<CustomCharacter[]> {
    const storedCharacters = await storageService.getItem('customCharacters');
    return storedCharacters ? JSON.parse(storedCharacters) : [];
  }
  
  /**
   * Gets a specific custom character by ID
   */
  async getCustomCharacter(id: string): Promise<CustomCharacter> {
    // Check cache first
    if (this.customCharacterCache.has(id)) {
      return this.customCharacterCache.get(id)!;
    }
    
    // Try to get from local storage
    const storedCharacters = await storageService.getItem('customCharacters');
    if (storedCharacters) {
      const characters: CustomCharacter[] = JSON.parse(storedCharacters);
      const character = characters.find(c => c.id === id);
      if (character) {
        this.customCharacterCache.set(id, character);
        return character;
      }
    }
    
    // If character not found, throw an error
    throw new Error(`Custom character with ID ${id} not found`);
  }
  
  /**
   * Updates a custom character
   */
  async updateCustomCharacter(character: CustomCharacter): Promise<CustomCharacter> {
    const storedCharacters = await storageService.getItem('customCharacters');
    if (!storedCharacters) {
      throw new Error('No custom characters found');
    }
    
    const characters: CustomCharacter[] = JSON.parse(storedCharacters);
    const index = characters.findIndex(c => c.id === character.id);
    
    if (index === -1) {
      throw new Error(`Custom character with ID ${character.id} not found`);
    }
    
    // Update the character
    characters[index] = {
      ...character,
      // Preserve creation date
      created: characters[index].created
    };
    
    // Save to local storage
    await storageService.setItem('customCharacters', JSON.stringify(characters));
    
    // Update cache
    this.customCharacterCache.set(character.id, characters[index]);
    
    return characters[index];
  }
  
  /**
   * Deletes a custom character
   */
  async deleteCustomCharacter(id: string): Promise<boolean> {
    const storedCharacters = await storageService.getItem('customCharacters');
    if (!storedCharacters) {
      return false;
    }
    
    const characters: CustomCharacter[] = JSON.parse(storedCharacters);
    const filteredCharacters = characters.filter(c => c.id !== id);
    
    if (filteredCharacters.length === characters.length) {
      return false; // Character wasn't found
    }
    
    // Save to local storage
    await storageService.setItem('customCharacters', JSON.stringify(filteredCharacters));
    
    // Remove from cache
    this.customCharacterCache.delete(id);
    
    return true;
  }
  
  /**
   * Updates last played date for a character
   */
  async updateLastPlayed(id: string, type: 'historical' | 'custom'): Promise<void> {
    if (type === 'custom') {
      try {
        const character = await this.getCustomCharacter(id);
        character.lastPlayed = new Date();
        await this.updateCustomCharacter(character);
      } catch (error) {
        console.error('Error updating last played date:', error);
      }
    }
    // For historical characters, we don't need to track last played
  }
  
  /**
   * Attempts to fetch a historical character from Wikidata
   * Note: This is a simplified implementation
   */
  private async fetchHistoricalCharacterFromWikidata(id: string): Promise<HistoricalCharacter> {
    try {
      // In a real implementation, you would query Wikidata API 
      // using SPARQL or other appropriate query mechanism
      
      // For now, we'll simulate an API call and return mock data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      // If we have a matching mock character, use that
      if (this.mockHistoricalCharacters[id]) {
        return this.mockHistoricalCharacters[id];
      }
      
      // Otherwise, generate a generic character
      throw new Error('Character not found in Wikidata');
    } catch (error) {
      console.error('Error fetching from Wikidata:', error);
      throw error;
    }
  }
  
  /**
   * Uses Hugging Face API to generate character details
   * This is a placeholder for potential AI-based character generation
   */
  private async generateCharacterDetails(
    name: string, 
    era: string
  ): Promise<{ biography: string, traits: string[], keyEvents: HistoricalEvent[] }> {
    if (!HUGGING_FACE_API_KEY) {
      throw new Error('Hugging Face API key not available');
    }
    
    try {
      const prompt = `
        Generate a biographical summary, key personality traits, and important life events for ${name}, who lived during the ${era}.
        Format the response as JSON with the following structure:
        {
          "biography": "A paragraph about the person's life",
          "traits": ["trait1", "trait2", "trait3", "trait4"],
          "keyEvents": [
            {
              "date": "YYYY",
              "title": "Event Title",
              "description": "Description of the event",
              "significance": "Why this event was important"
            }
          ]
        }
      `;
      
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/gpt2/...',
        {
          inputs: prompt,
          parameters: {
            max_length: 1000,
            temperature: 0.7,
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
      const result = JSON.parse(response.data[0].generated_text);
      return result;
    } catch (error) {
      console.error('Error generating character details:', error);
      
      // Return default values
      return {
        biography: `${name} was a notable figure from the ${era}.`,
        traits: ['determined', 'intelligent', 'creative', 'resourceful'],
        keyEvents: [
          {
            date: era.split(' ')[0], // Extract the first part of the era as a rough date
            title: 'Major Life Event',
            description: 'A significant event in the character\'s life.',
            significance: 'This event shaped the character\'s future path.'
          }
        ]
      };
    }
  }
}

export const characterService = new CharacterService();
export default characterService;