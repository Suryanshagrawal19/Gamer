import { storylineGenerator, StoryNode, Choice, StorylineData } from './storylineGenerator';
import { characterService } from './characterService';
import { storageService } from './storageService';
import { v4 as uuidv4 } from 'uuid';
import { Alert } from 'react-native';
import { avatarService } from './avatarService';
import { environmentService } from './environmentService';

/**
 * Types for story progress and player stats
 */
export interface StoryProgress {
  currentNodeId: string;
  visitedNodes: string[];
  choiceHistory: {
    nodeId: string;
    choiceId: string;
    choiceText: string;
    timestamp: Date;
  }[];
  attributes: {[key: string]: number};
  relationships: {[key: string]: number};
  achievements: string[];
}

export interface PlayerStat {
  name: string;
  value: number;
  icon: string; // Ionicons name
  description: string;
}

/**
 * This controller manages the story flow and provides an interface
 * between the UI and the storyline generation logic
 */
class StoryController {
  private currentStorylineId: string | null = null;
  private currentNodeId: string | null = null;
  private storyHistory: string[] = [];
  private loadingState: boolean = false;
  
  // Event listeners
  private nodeUpdateListeners: ((node: StoryNode) => void)[] = [];
  private choicesUpdateListeners: ((choices: Choice[]) => void)[] = [];
  private loadingStateListeners: ((loading: boolean) => void)[] = [];
  private errorListeners: ((error: string) => void)[] = [];
  private progressUpdateListeners: ((progress: StoryProgress) => void)[] = [];
  
  /**
   * Initialize or load a story for a character
   */
  async initializeStory(
    characterId: string,
    characterType: 'historical' | 'custom',
    accuracy: 'accurate' | 'creative',
    existingStorylineId?: string
  ): Promise<boolean> {
    try {
      this.setLoading(true);
      
      // Get or create the storyline
      const storyline = await storylineGenerator.getOrCreateStoryline(
        characterId,
        characterType,
        accuracy,
        existingStorylineId
      );
      
      // Set current state
      this.currentStorylineId = storyline.id;
      this.currentNodeId = storyline.startNodeId;
      this.storyHistory = [storyline.startNodeId];
      
      // Get the current node
      const currentNode = storyline.nodes[this.currentNodeId];
      
      // Notify listeners
      this.notifyNodeUpdate(currentNode);
      
      // Get choices if needed
      if (!currentNode.choices || currentNode.choices.length === 0) {
        const choices = await storylineGenerator.getChoicesForNode(this.currentNodeId, this.currentStorylineId);
        this.notifyChoicesUpdate(choices);
      } else {
        this.notifyChoicesUpdate(currentNode.choices);
      }
      
      // Notify about initial progress
      this.notifyProgressUpdate(await this.getStoryProgress());
      
      this.setLoading(false);
      return true;
    } catch (error) {
      console.error('Error initializing story:', error);
      this.notifyError('Failed to initialize story. Please try again.');
      this.setLoading(false);
      return false;
    }
  }
  
  /**
   * Make a choice and progress the story
   */
  async makeChoice(choiceId: string): Promise<boolean> {
    if (!this.currentStorylineId || !this.currentNodeId) {
      this.notifyError('No active storyline. Please start a new story.');
      return false;
    }
    
    try {
      this.setLoading(true);
      
      // Generate the next node based on the choice
      const nextNode = await storylineGenerator.generateNextNode(
        choiceId,
        this.currentNodeId,
        this.currentStorylineId
      );
      
      // Update current state
      this.currentNodeId = nextNode.id;
      this.storyHistory.push(nextNode.id);
      
      // Notify listeners
      this.notifyNodeUpdate(nextNode);
      
      // Get choices for the new node if needed
      if (!nextNode.choices || nextNode.choices.length === 0) {
        const choices = await storylineGenerator.getChoicesForNode(nextNode.id, this.currentStorylineId);
        this.notifyChoicesUpdate(choices);
      } else {
        this.notifyChoicesUpdate(nextNode.choices);
      }
      
      // Notify about updated progress
      this.notifyProgressUpdate(await this.getStoryProgress());
      
      this.setLoading(false);
      return true;
    } catch (error) {
      console.error('Error making choice:', error);
      this.notifyError('Failed to process your choice. Please try again.');
      this.setLoading(false);
      return false;
    }
  }
  
  /**
   * Get the current story progress
   */
  async getStoryProgress(): Promise<StoryProgress> {
    if (!this.currentStorylineId) {
      throw new Error('No active storyline');
    }
    
    const storyline = await storylineGenerator.getStorylineById(this.currentStorylineId);
    if (!storyline) {
      throw new Error(`Storyline ${this.currentStorylineId} not found`);
    }
    
    return {
      currentNodeId: this.currentNodeId || storyline.startNodeId,
      visitedNodes: this.storyHistory,
      choiceHistory: storyline.context.previousChoices,
      attributes: storyline.context.attributes || {},
      relationships: storyline.context.relationships || {},
      achievements: this.calculateAchievements(storyline)
    };
  }
  
  /**
   * Calculate achievements based on storyline progress
   */
  private calculateAchievements(storyline: StorylineData): string[] {
    const achievements: string[] = [];
    const characterName = storyline.character.name;
    
    // Gandhi-specific achievements
    if (characterName === 'Mahatma Gandhi') {
      // Check if the train incident was experienced
      const visitedTrainIncident = storyline.context.visitedEvents?.some(
        event => event.includes('Train Incident')
      );
      
      if (visitedTrainIncident) {
        achievements.push('Pivotal Moment: Experienced the train incident in South Africa');
      }
      
      // Check for high resolve attribute
      if (storyline.context.attributes?.resolve && storyline.context.attributes.resolve > 80) {
        achievements.push('Unwavering Spirit: Demonstrated exceptional determination');
      }
    }
    
    // Marie Curie-specific achievements
    if (characterName === 'Marie Curie') {
      // Check for high intellect
      if (storyline.context.attributes?.intellect && storyline.context.attributes.intellect > 80) {
        achievements.push('Scientific Brilliance: Demonstrated exceptional scientific intellect');
      }
    }
    
    // Lincoln-specific achievements
    if (characterName === 'Abraham Lincoln') {
      // Check for events related to emancipation
      const emancipationEvent = storyline.context.visitedEvents?.some(
        event => event.includes('Emancipation')
      );
      
      if (emancipationEvent) {
        achievements.push('Great Emancipator: Took steps toward abolishing slavery');
      }
    }
    
    // Generic achievements
    const nodesVisited = storyline.context.previousNodes.length;
    
    if (nodesVisited >= 5) {
      achievements.push('Journey Begun: Experienced 5 story moments');
    }
    
    if (nodesVisited >= 10) {
      achievements.push('Historian: Experienced 10 story moments');
    }
    
    return achievements;
  }
  
  /**
   * Get player stats for display
   */
  async getPlayerStats(): Promise<PlayerStat[]> {
    if (!this.currentStorylineId) {
      return [];
    }
    
    const storyline = await storylineGenerator.getStorylineById(this.currentStorylineId);
    if (!storyline) {
      return [];
    }
    
    const stats: PlayerStat[] = [];
    const attributes = storyline.context.attributes || {};
    
    // Add core attributes if they exist
    if (attributes.influence !== undefined) {
      stats.push({
        name: 'Influence',
        value: attributes.influence,
        icon: 'people',
        description: 'Your ability to impact others and events around you'
      });
    }
    
    if (attributes.resolve !== undefined) {
      stats.push({
        name: 'Resolve',
        value: attributes.resolve,
        icon: 'shield',
        description: 'Your determination and strength of will'
      });
    }
    
    if (attributes.intellect !== undefined) {
      stats.push({
        name: 'Intellect',
        value: attributes.intellect,
        icon: 'brain',
        description: 'Your mental capacity and problem-solving ability'
      });
    }
    
    if (attributes.charisma !== undefined) {
      stats.push({
        name: 'Charisma',
        value: attributes.charisma,
        icon: 'chatbubbles',
        description: 'Your personal charm and persuasiveness'
      });
    }
    
    if (attributes.compassion !== undefined) {
      stats.push({
        name: 'Compassion',
        value: attributes.compassion,
        icon: 'heart',
        description: 'Your empathy and care for others'
      });
    }
    
    return stats;
  }
  
  /**
   * Get relationships for display
   */
  async getRelationships(): Promise<{name: string, value: number}[]> {
    if (!this.currentStorylineId) {
      return [];
    }
    
    const storyline = await storylineGenerator.getStorylineById(this.currentStorylineId);
    if (!storyline) {
      return [];
    }
    
    const relationships = storyline.context.relationships || {};
    
    return Object.entries(relationships).map(([name, value]) => ({
      name,
      value
    }));
  }
  
  /**
   * Save the current storyline with a custom title
   */
  async saveStory(title?: string): Promise<boolean> {
    if (!this.currentStorylineId) {
      this.notifyError('No active storyline to save');
      return false;
    }
    
    try {
      const storyline = await storylineGenerator.getStorylineById(this.currentStorylineId);
      if (!storyline) {
        this.notifyError('Storyline not found');
        return false;
      }
      
      // Update the title if provided
      if (title) {
        storyline.title = title;
      }
      
      // Save the storyline
      await storylineGenerator.saveStoryline(storyline);
      
      return true;
    } catch (error) {
      console.error('Error saving story:', error);
      this.notifyError('Failed to save story');
      return false;
    }
  }
  
  /**
   * Load a saved storyline
   */
  async loadStory(storylineId: string): Promise<boolean> {
    try {
      const storyline = await storylineGenerator.getStorylineById(storylineId);
      if (!storyline) {
        this.notifyError('Storyline not found');
        return false;
      }
      
      // Set current state
      this.currentStorylineId = storyline.id;
      
      // Find the latest node (the one with choices that hasn't been responded to yet)
      let latestNodeId = storyline.startNodeId;
      for (const choice of storyline.context.previousChoices) {
        // Find the node that this choice led to
        for (const [nodeId, node] of Object.entries(storyline.nodes)) {
          const leadingChoice = node.choices?.find(c => c.id === choice.choiceId);
          if (leadingChoice && leadingChoice.leadsTo) {
            latestNodeId = leadingChoice.leadsTo;
            break;
          }
        }
      }
      
      this.currentNodeId = latestNodeId;
      this.storyHistory = storyline.context.previousNodes.concat(latestNodeId);
      
      // Get the current node
      const currentNode = storyline.nodes[this.currentNodeId];
      
      // Notify listeners
      this.notifyNodeUpdate(currentNode);
      
      // Get choices if needed
      if (!currentNode.choices || currentNode.choices.length === 0) {
        const choices = await storylineGenerator.getChoicesForNode(this.currentNodeId, this.currentStorylineId);
        this.notifyChoicesUpdate(choices);
      } else {
        this.notifyChoicesUpdate(currentNode.choices);
      }
      
      // Notify about progress
      this.notifyProgressUpdate(await this.getStoryProgress());
      
      return true;
    } catch (error) {
      console.error('Error loading story:', error);
      this.notifyError('Failed to load story');
      return false;
    }
  }
  
  /**
   * Get all saved storylines
   */
  async getSavedStorylines(): Promise<{
    id: string;
    title: string;
    character: { id: string; type: string; name: string; };
    created: Date;
    lastUpdated: Date;
  }[]> {
    try {
      const storylineListJson = await storageService.getItem('storyline_list');
      if (!storylineListJson) {
        return [];
      }
      
      return JSON.parse(storylineListJson);
    } catch (error) {
      console.error('Error getting saved storylines:', error);
      return [];
    }
  }
  
  /**
   * Delete a saved storyline
   */
  async deleteStoryline(storylineId: string): Promise<boolean> {
    try {
      const success = await storylineGenerator.deleteStoryline(storylineId);
      
      // If the deleted storyline was the current one, clear current state
      if (success && this.currentStorylineId === storylineId) {
        this.currentStorylineId = null;
        this.currentNodeId = null;
        this.storyHistory = [];
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting storyline:', error);
      return false;
    }
  }
  
  /**
   * Listen for node updates
   */
  onNodeUpdate(callback: (node: StoryNode) => void): () => void {
    this.nodeUpdateListeners.push(callback);
    return () => {
      this.nodeUpdateListeners = this.nodeUpdateListeners.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Listen for choices updates
   */
  onChoicesUpdate(callback: (choices: Choice[]) => void): () => void {
    this.choicesUpdateListeners.push(callback);
    return () => {
      this.choicesUpdateListeners = this.choicesUpdateListeners.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Listen for loading state changes
   */
  onLoadingStateChange(callback: (loading: boolean) => void): () => void {
    this.loadingStateListeners.push(callback);
    return () => {
      this.loadingStateListeners = this.loadingStateListeners.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Listen for errors
   */
  onError(callback: (error: string) => void): () => void {
    this.errorListeners.push(callback);
    return () => {
      this.errorListeners = this.errorListeners.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Listen for progress updates
   */
  onProgressUpdate(callback: (progress: StoryProgress) => void): () => void {
    this.progressUpdateListeners.push(callback);
    return () => {
      this.progressUpdateListeners = this.progressUpdateListeners.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Notify all node update listeners
   */
  private notifyNodeUpdate(node: StoryNode): void {
    this.nodeUpdateListeners.forEach(listener => listener(node));
  }
  
  /**
   * Notify all choices update listeners
   */
  private notifyChoicesUpdate(choices: Choice[]): void {
    this.choicesUpdateListeners.forEach(listener => listener(choices));
  }
  
  /**
   * Notify all loading state listeners
   */
  private setLoading(loading: boolean): void {
    this.loadingState = loading;
    this.loadingStateListeners.forEach(listener => listener(loading));
  }
  
  /**
   * Notify all error listeners
   */
  private notifyError(error: string): void {
    this.errorListeners.forEach(listener => listener(error));
  }
  
  /**
   * Notify all progress update listeners
   */
  private notifyProgressUpdate(progress: StoryProgress): void {
    this.progressUpdateListeners.forEach(listener => listener(progress));
  }

  async getNodeVisuals(nodeId: string): Promise<{
    avatar: string;
    environment: string;
  }> {
    if (!this.currentStorylineId) {
      throw new Error('No active storyline');
    }

    const storyline = await storylineGenerator.getStorylineById(this.currentStorylineId);
    if (!storyline) {
      throw new Error(`Storyline ${this.currentStorylineId} not found`);
    }

    const node = storyline.nodes[nodeId];
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    // Character info
    const character = await this.getCharacterInfo();

    // Get node context
    const location = node.metadata?.location || storyline.context.currentLocation || 'unknown location';
    const year = node.metadata?.year || storyline.context.currentYear || 'unknown time';
    const situation = node.metadata?.historicalEvent || 'historical scene';

    // Generate avatar and environment
    const avatar = await avatarService.generateAvatar(
      character.name,
      character.era,
      character.traits.join(', ')
    );

    const environment = await environmentService.generateEnvironment(
      location,
      year,
      situation
    );

    return { avatar, environment };
  }

  private async getCharacterInfo() {
    if (!this.currentStorylineId) {
      throw new Error('No active storyline');
    }

    const storyline = await storylineGenerator.getStorylineById(this.currentStorylineId);
    if (!storyline) {
      throw new Error(`Storyline ${this.currentStorylineId} not found`);
    }

    if (storyline.character.type === 'historical') {
      return await characterService.getHistoricalCharacter(storyline.character.id);
    } else {
      return await characterService.getCustomCharacter(storyline.character.id);
    }
  }
}

export const storyController = new StoryController();
export default storyController;