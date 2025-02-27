import { Game } from '../types/game';

// Interface for game recommendations
export interface GameRecommendation {
  game: Game;
  score: number;
  reason: string;
}

// User preference data type
export interface UserPreferences {
  favoriteGenres: string[];
  recentlyPlayed: number[];
  playStyle: string;
  playTime: number; // Average play time in hours per week
}

// Mock ML recommendation engine
export const getPersonalizedRecommendations = async (
  userPreferences: UserPreferences
): Promise<GameRecommendation[]> => {
  // In a real app, this would call a backend ML service
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock recommendations based on user preferences
      const mockRecommendations: GameRecommendation[] = [
        {
          game: {
            id: 8,
            title: 'The Witcher 3',
            genre: 'RPG',
            rating: 4.9,
            coverImage: 'https://via.placeholder.com/300x450?text=Witcher3',
            description: 'An epic RPG with a compelling story and rich, open world.'
          },
          score: 0.95,
          reason: 'Based on your preference for RPG games and your play style'
        },
        {
          game: {
            id: 9,
            title: 'Red Dead Redemption 2',
            genre: 'Action Adventure',
            rating: 4.8,
            coverImage: 'https://via.placeholder.com/300x450?text=RDR2',
            description: 'An epic tale of life in America\'s unforgiving heartland.'
          },
          score: 0.92,
          reason: 'Matches your preference for story-rich open world games'
        },
        {
          game: {
            id: 10,
            title: 'Hades',
            genre: 'Roguelike',
            rating: 4.7,
            coverImage: 'https://via.placeholder.com/300x450?text=Hades',
            description: 'A god-like rogue-like dungeon crawler that combines the best aspects of Supergiant\'s critically acclaimed titles.'
          },
          score: 0.89,
          reason: 'Our algorithm detected you might enjoy roguelike games based on your play patterns'
        }
      ];
      
      resolve(mockRecommendations);
    }, 1500);
  });
};

// Mock agent chat functionality
export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

export const chatWithGamingAgent = async (
  message: string,
  history: ChatMessage[]
): Promise<ChatMessage> => {
  // In a real app, this would call a backend AI service
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate AI response based on user message
      let response = '';
      
      if (message.toLowerCase().includes('recommend')) {
        response = "Based on your gaming history, I'd recommend trying 'Ghost of Tsushima'. It has an excellent open world and combat system that seems to align with your preferences.";
      } else if (message.toLowerCase().includes('difficulty')) {
        response = "If you're finding the game too challenging, try adjusting the difficulty settings or looking up specific strategies for the section you're stuck on. I can help with tips for specific boss fights or levels.";
      } else if (message.toLowerCase().includes('multiplayer')) {
        response = "For multiplayer gaming, I see you enjoy FPS games. Have you tried Apex Legends? It has a great team-based system and the learning curve isn't too steep.";
      } else {
        response = "I'm your gaming assistant! I can help with game recommendations, walkthroughs, tips and tricks, or just chat about gaming. What specific help do you need today?";
      }
      
      resolve({
        id: Date.now().toString(),
        sender: 'agent',
        text: response,
        timestamp: new Date()
      });
    }, 1000);
  });
};