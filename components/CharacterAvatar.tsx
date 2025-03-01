// In a new component file: /components/CharacterAvatar.tsx

import React, { useEffect, useState } from 'react';
import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { avatarService } from '../services/avatarService';

interface CharacterAvatarProps {
  name: string;
  era: string;
  description: string;
  size?: number;
}

const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  name,
  era,
  description,
  size = 80
}) => {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const uri = await avatarService.generateAvatar(name, era, description);
        setAvatarUri(uri);
      } catch (error) {
        console.error('Error loading avatar:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAvatar();
  }, [name, era, description]);
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {loading ? (
        <ActivityIndicator color="#6200ee" />
      ) : avatarUri ? (
        <Image 
          source={{ uri: avatarUri }} 
          style={[styles.avatar, { width: size, height: size }]} 
        />
      ) : (
        <View style={[styles.placeholder, { width: size, height: size }]}>
          <Text style={styles.placeholderText}>
            {name.substring(0, 2).toUpperCase()}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 9999,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    borderRadius: 9999,
  },
  placeholder: {
    backgroundColor: '#3a2457',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 9999,
  },
  placeholderText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default CharacterAvatar;