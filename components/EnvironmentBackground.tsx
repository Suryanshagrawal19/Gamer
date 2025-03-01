// In a new component file: /components/EnvironmentBackground.tsx

import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { environmentService } from '../services/environmentService';

interface EnvironmentBackgroundProps {
  location: string;
  timePeriod: string;
  situation: string;
  children?: React.ReactNode;
}

const EnvironmentBackground: React.FC<EnvironmentBackgroundProps> = ({
  location,
  timePeriod,
  situation,
  children
}) => {
  const [backgroundUri, setBackgroundUri] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadEnvironment = async () => {
      try {
        setLoading(true);
        
        // Get image in background
        environmentService.generateEnvironment(location, timePeriod, situation)
          .then(uri => setBackgroundUri(uri))
          .catch(error => console.error('Error generating environment image:', error));
        
        // Get description
        const desc = await environmentService.generateEnvironmentDescription(
          location, timePeriod
        );
        setDescription(desc);
      } catch (error) {
        console.error('Error loading environment:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadEnvironment();
  }, [location, timePeriod, situation]);
  
  return (
    <View style={styles.container}>
      {backgroundUri ? (
        <Image 
          source={{ uri: backgroundUri }} 
          style={styles.backgroundImage} 
          resizeMode="cover"
        />
      ) : (
        <View style={styles.fallbackBackground} />
      )}
      
      <View style={styles.overlay}>
        {description && !loading && (
          <Text style={styles.description}>{description}</Text>
        )}
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4, // Dim the background to ensure text is readable
  },
  fallbackBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#121212',
  },
  overlay: {
    flex: 1,
    padding: 16,
  },
  description: {
    color: '#ccc',
    fontStyle: 'italic',
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default EnvironmentBackground;