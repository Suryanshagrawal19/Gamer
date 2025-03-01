import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  Image,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CharacterSelectionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Animation effect for the "or" divider
  const [pulseState, setPulseState] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseState(prev => !prev);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const navigateToHistoricalFigures = () => {
    setLoading(true);
    // Add a small delay for a smoother transition
    setTimeout(() => {
      setLoading(false);
      router.push('/character-creation/historical');
    }, 300);
  };

  const navigateToCustomCharacter = () => {
    setLoading(true);
    // Add a small delay for a smoother transition
    setTimeout(() => {
      setLoading(false);
      router.push('/character-creation/custom');
    }, 300);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Begin Your Journey</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.introText}>
          Embark on a journey through history by stepping into the shoes of famous personalities 
          or creating your own unique character. Your decisions will shape the narrative and 
          reveal how history might have unfolded differently.
        </Text>

        <View style={styles.optionsContainer}>
          {/* Historical Figure Option */}
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={navigateToHistoricalFigures}
            disabled={loading}
          >
            <View style={styles.optionIconContainer}>
              <Ionicons name="people" size={40} color="#6200ee" />
            </View>
            <Text style={styles.optionTitle}>Historical Figure</Text>
            <Text style={styles.optionDescription}>
              Experience life through the eyes of renowned historical personalities like Gandhi, 
              Einstein, Marie Curie, or Leonardo da Vinci.
            </Text>
            
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Historically accurate events</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Make decisions that shaped history</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Learn while experiencing history</Text>
              </View>
            </View>
            
            <View style={styles.figuresPreview}>
              <Image source={{ uri: 'https://via.placeholder.com/60?text=Gandhi' }} style={styles.previewImage} />
              <Image source={{ uri: 'https://via.placeholder.com/60?text=Einstein' }} style={styles.previewImage} />
              <Image source={{ uri: 'https://via.placeholder.com/60?text=Curie' }} style={styles.previewImage} />
              <View style={styles.morePreview}>
                <Text style={styles.morePreviewText}>+20</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={navigateToHistoricalFigures}
              disabled={loading}
            >
              <Text style={styles.selectButtonText}>Choose Historical Figure</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <View style={[styles.dividerCircle, pulseState && styles.dividerCirclePulse]}>
              <Text style={styles.dividerText}>OR</Text>
            </View>
            <View style={styles.dividerLine} />
          </View>

          {/* Custom Character Option */}
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={navigateToCustomCharacter}
            disabled={loading}
          >
            <View style={styles.optionIconContainer}>
              <Ionicons name="create" size={40} color="#6200ee" />
            </View>
            <Text style={styles.optionTitle}>Create Your Own</Text>
            <Text style={styles.optionDescription}>
              Design your unique character and place them in historical scenarios 
              to experience how your choices might have changed history.
            </Text>
            
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Full personalization of traits</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Choose your own time period</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Create alternative histories</Text>
              </View>
            </View>
            
            <View style={styles.createPreview}>
              <View style={styles.createPreviewItem}>
                <Ionicons name="person" size={24} color="#6200ee" />
                <Text style={styles.createPreviewText}>Character</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#666" />
              <View style={styles.createPreviewItem}>
                <Ionicons name="time" size={24} color="#6200ee" />
                <Text style={styles.createPreviewText}>Era</Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color="#666" />
              <View style={styles.createPreviewItem}>
                <Ionicons name="book" size={24} color="#6200ee" />
                <Text style={styles.createPreviewText}>Story</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.selectButton}
              onPress={navigateToCustomCharacter}
              disabled={loading}
            >
              <Text style={styles.selectButtonText}>Create Character</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  introText: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 24,
    lineHeight: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  optionIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 16,
    lineHeight: 20,
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#ccc',
    marginLeft: 10,
  },
  figuresPreview: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginHorizontal: 5,
    backgroundColor: '#333',
  },
  morePreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  morePreviewText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  createPreview: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  createPreviewItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  createPreviewText: {
    color: '#ccc',
    marginTop: 4,
    fontSize: 12,
  },
  selectButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    borderWidth: 1,
    borderColor: '#444',
  },
  dividerCirclePulse: {
    backgroundColor: '#3a2457',
    borderColor: '#6200ee',
  },
  dividerText: {
    color: '#ccc',
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});