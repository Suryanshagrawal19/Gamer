import { Game, GameDetails, Category } from '../types/game';

// Mock data - in a real app, you would replace these with API calls
const mockFeaturedGames: Game[] = [
  {
    id: 1,
    title: 'Cyberpunk 2077',
    genre: 'RPG',
    rating: 4.2,
    coverImage: 'https://via.placeholder.com/300x450?text=Cyberpunk',
    description: 'An open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.'
  },
  {
    id: 2,
    title: 'Elden Ring',
    genre: 'Action RPG',
    rating: 4.8,
    coverImage: 'https://via.placeholder.com/300x450?text=Elden+Ring',
    description: 'An action RPG game created by FromSoftware in collaboration with George R. R. Martin.'
  },
  {
    id: 3,
    title: 'Horizon Forbidden West',
    genre: 'Action Adventure',
    rating: 4.6,
    coverImage: 'https://via.placeholder.com/300x450?text=Horizon',
    description: 'Join Aloy as she braves the Forbidden West, a deadly frontier that conceals mysterious new threats.'
  },
  {
    id: 4,
    title: 'Call of Duty: Warzone',
    genre: 'FPS',
    rating: 4.1,
    coverImage: 'https://via.placeholder.com/300x450?text=Warzone',
    description: 'A free-to-play battle royale game from the Call of Duty franchise.'
  },
];

const mockRecentlyPlayed: Game[] = [
  {
    id: 5,
    title: 'Assassin\'s Creed Valhalla',
    genre: 'Action RPG',
    rating: 4.3,
    coverImage: 'https://via.placeholder.com/300x450?text=AC+Valhalla',
    description: 'Become Eivor, a legendary Viking raider on a quest for glory.'
  },
  {
    id: 6,
    title: 'FIFA 23',
    genre: 'Sports',
    rating: 4.0,
    coverImage: 'https://via.placeholder.com/300x450?text=FIFA+23',
    description: "Experience the world's game with authentic teams and players."
  },
];

const mockCategories: Category[] = [
  { id: 'all', name: 'All' },
  { id: 'action', name: 'Action' },
  { id: 'adventure', name: 'Adventure' },
  { id: 'rpg', name: 'RPG' },
  { id: 'shooter', name: 'Shooter' },
  { id: 'strategy', name: 'Strategy' },
  { id: 'sports', name: 'Sports' },
  { id: 'simulation', name: 'Simulation' },
];

// Mock API functions with delays to simulate network requests
export const fetchFeaturedGames = (): Promise<Game[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockFeaturedGames);
    }, 800);
  });
};

export const fetchRecentlyPlayed = (): Promise<Game[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockRecentlyPlayed);
    }, 800);
  });
};

export const fetchGameCategories = (): Promise<Category[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCategories);
    }, 500);
  });
};

export const searchGames = (query: string, category: string): Promise<Game[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let results = [...mockFeaturedGames, ...mockRecentlyPlayed];
      
      // Filter by search query if provided
      if (query) {
        const lowerQuery = query.toLowerCase();
        results = results.filter(game => 
          game.title.toLowerCase().includes(lowerQuery) || 
          game.genre.toLowerCase().includes(lowerQuery)
        );
      }
      
      // Filter by category if not 'all'
      if (category && category !== 'all') {
        results = results.filter(game => {
          const gameGenre = game.genre.toLowerCase();
          return gameGenre.includes(category) || category.includes(gameGenre);
        });
      }
      
      resolve(results);
    }, 1000);
  });
};

export const getGameDetails = (gameId: number): Promise<GameDetails> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const allGames = [...mockFeaturedGames, ...mockRecentlyPlayed];
      const game = allGames.find(g => g.id === gameId);
      
      if (game) {
        resolve({
          ...game,
          publisher: 'Epic Games',
          releaseDate: '2023-01-15',
          platforms: ['PC', 'PlayStation 5', 'Xbox Series X'],
          screenshots: [
            'https://via.placeholder.com/800x450?text=Screenshot+1',
            'https://via.placeholder.com/800x450?text=Screenshot+2',
            'https://via.placeholder.com/800x450?text=Screenshot+3',
          ]
        });
      } else {
        reject(new Error('Game not found'));
      }
    }, 800);
  });
};