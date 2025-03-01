// In services/environmentService.ts

import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { storageService } from './storageService';

class EnvironmentService {
  private API_KEY = ''; // Your API key
  
  async generateEnvironment(location: string, year: string, situation: string): Promise<string> {
    try {
      // Check cache first
      const cacheKey = `env_${location.replace(/\s+/g, '_')}_${year.replace(/\s+/g, '_')}`;
      const cachedEnv = await storageService.getItem(cacheKey);
      
      if (cachedEnv) return cachedEnv;
      
      // Create prompt for environment generation
      const prompt = `Historical scene of ${location} during ${year}, ${situation}, wide view, detailed, historical setting`;
      
      // Call image generation API
      const response = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: "stable-diffusion-xl-1024-v1-0",
          input: {
            prompt: prompt,
            negative_prompt: "people, faces, text, modern buildings, cars, anachronistic elements",
            num_outputs: 1
          }
        },
        {
          headers: {
            'Authorization': `Token ${this.API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Download the image
      const imageUrl = response.data.output[0];
      const fileUri = `${FileSystem.cacheDirectory}${cacheKey}.jpg`;
      
      await FileSystem.downloadAsync(imageUrl, fileUri);
      
      // Cache the environment path
      await storageService.setItem(cacheKey, fileUri);
      
      return fileUri;
    } catch (error) {
      console.error('Error generating environment:', error);
      return this.getFallbackEnvironment(location);
    }
  }
  
  private getFallbackEnvironment(location: string): string {
    const environments = {
      'India': 'https://via.placeholder.com/800x400?text=Historical+India',
      'South Africa': 'https://via.placeholder.com/800x400?text=South+Africa',
      'Washington': 'https://via.placeholder.com/800x400?text=Washington',
      'Paris': 'https://via.placeholder.com/800x400?text=Paris',
      // Add more default environments
    };
    
    // Return specific environment or generic one
    for (const [key, value] of Object.entries(environments)) {
      if (location.includes(key)) return value;
    }
    
    return 'https://via.placeholder.com/800x400?text=Historical+Scene';
  }
}

export const environmentService = new EnvironmentService();
export default environmentService;