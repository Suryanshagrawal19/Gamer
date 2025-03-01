import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * A service for handling local storage operations
 * Uses AsyncStorage for persistence
 */
class StorageService {
  /**
   * Store a string value with the given key
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error storing data:', error);
      throw error;
    }
  }

  /**
   * Retrieve a string value for the given key
   */
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error retrieving data:', error);
      throw error;
    }
  }

  /**
   * Remove the value for the given key
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
      throw error;
    }
  }

  /**
   * Store an object value with the given key (converts to JSON)
   */
  async setObject<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error storing object data:', error);
      throw error;
    }
  }

  /**
   * Retrieve an object value for the given key (parses from JSON)
   */
  async getObject<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error retrieving object data:', error);
      throw error;
    }
  }

  /**
   * Get all keys stored in AsyncStorage
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      throw error;
    }
  }

  /**
   * Clear all data from AsyncStorage
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Get multiple items at once
   */
  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      return await AsyncStorage.multiGet(keys);
    } catch (error) {
      console.error('Error retrieving multiple items:', error);
      throw error;
    }
  }

  /**
   * Set multiple items at once
   */
  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    try {
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      console.error('Error storing multiple items:', error);
      throw error;
    }
  }

  /**
   * Remove multiple items at once
   */
  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error removing multiple items:', error);
      throw error;
    }
  }
  
  /**
   * Check if a key exists in storage
   */
  async hasKey(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      console.error('Error checking if key exists:', error);
      throw error;
    }
  }

  /**
   * Get the size of a stored item in bytes
   */
  async getItemSize(key: string): Promise<number> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return 0;
      return new Blob([value]).size;
    } catch (error) {
      console.error('Error getting item size:', error);
      throw error;
    }
  }
  
  /**
   * Save a story state snapshot for auto-recovery
   */
  async saveStorySnapshot(storyId: string, data: any): Promise<void> {
    try {
      const key = `story_snapshot_${storyId}`;
      await this.setObject(key, {
        data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving story snapshot:', error);
      // We don't throw here to prevent disrupting the user experience
      // Just log the error and continue
    }
  }
  
  /**
   * Retrieve a story state snapshot
   */
  async getStorySnapshot<T>(storyId: string): Promise<{ data: T, timestamp: string } | null> {
    try {
      const key = `story_snapshot_${storyId}`;
      return await this.getObject(key);
    } catch (error) {
      console.error('Error retrieving story snapshot:', error);
      return null;
    }
  }
}

export const storageService = new StorageService();
export default storageService;