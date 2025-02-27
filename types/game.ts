export interface Game {
    id: number;
    title: string;
    genre: string;
    rating: number;
    coverImage: string;
    description: string;
  }
  
  export interface GameDetails extends Game {
    publisher: string;
    releaseDate: string;
    platforms: string[];
    screenshots: string[];
  }
  
  export interface Category {
    id: string;
    name: string;
  }