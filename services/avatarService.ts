// In services/avatarService.ts

import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { storageService } from './storageService';

class AvatarService {
  private API_KEY = ''; // Your API key from environment variables
  
  async generateAvatar(name: string, era: string, description: string): Promise<string> {
    try {
      // Check cache first
      const cacheKey = `avatar_${name.replace(/\s+/g, '_').toLowerCase()}`;
      const cachedAvatar = await storageService.getItem(cacheKey);
      
      if (cachedAvatar) return cachedAvatar;
      
      // Create the prompt for image generation
      const prompt = `Portrait of ${name}, ${era}, ${description}, detailed, realistic, historical figure`;
      
      // Call image generation API (example using Replicate)
      const response = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: "stable-diffusion-xl-1024-v1-0",
          input: {
            prompt: prompt,
            negative_prompt: "deformed, distorted, modern clothing, anachronistic",
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
      
      // Cache the avatar path
      await storageService.setItem(cacheKey, fileUri);
      
      return fileUri;
    } catch (error) {
      console.error('Error generating avatar:', error);
      return this.getFallbackAvatar(name);
    }
  }
  
  private getFallbackAvatar(name: string): string {
    return `https://via.placeholder.com/150?text=${name.substring(0, 1)}`;
  }
}

export const avatarService = new AvatarService();
export default avatarService;