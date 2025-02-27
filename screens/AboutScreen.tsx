import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AboutScreen() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>About</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.gameInfo}>
          <Text style={styles.gameTitle}>Interactive Narrative</Text>
          <Text style={styles.gameVersion}>Version 1.0.0</Text>
        </View>
        
        <Text style={styles.description}>
          Interactive Narrative is a text-based adventure game powered by AI. The game creates dynamic, branching storylines that adapt to your choices, creating a unique experience with each playthrough.
        </Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureItem}>
            <Ionicons name="person" size={20} color="#6200ee" />
            <Text style={styles.featureText}>Character creation with famous personalities or custom characters</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="git-branch" size={20} color="#6200ee" />
            <Text style={styles.featureText}>Branching narrative paths based on your decisions</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="chatbubbles" size={20} color="#6200ee" />
            <Text style={styles.featureText}>Dynamic dialogue generation using AI</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="analytics" size={20} color="#6200ee" />
            <Text style={styles.featureText}>Simulation of consequences for your choices</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technologies</Text>
          <Text style={styles.techText}>
            This application uses advanced AI and machine learning technologies, including natural language processing for dynamic dialogue generation and scenario simulation.
          </Text>
          <Text style={styles.techText}>
            Built with React Native and Expo for mobile platforms, with a backend powered by Node.js and Python for AI integration.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Credits</Text>
          <Text style={styles.credits}>
            Design and Development: Your Name{'\n'}
            AI Integration: Your Team{'\n'}
            Narrative Design: Creative Writers
          </Text>
        </View>
        
        <View style={styles.contactButtons}>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="globe" size={20} color="#fff" />
            <Text style={styles.contactButtonText}>Website</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="mail" size={20} color="#fff" />
            <Text style={styles.contactButtonText}>Contact</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="logo-github" size={20} color="#fff" />
            <Text style={styles.contactButtonText}>GitHub</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  gameInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  gameTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  gameVersion: {
    color: '#aaa',
    marginTop: 4,
  },
  description: {
    color: '#ccc',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  featureText: {
    color: '#ccc',
    marginLeft: 12,
    flex: 1,
  },
  techText: {
    color: '#ccc',
    marginBottom: 12,
    lineHeight: 20,
  },
  credits: {
    color: '#ccc',
    lineHeight: 24,
  },
  contactButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 40,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  contactButtonText: {
    color: '#fff',
    marginLeft: 8,
  },
});