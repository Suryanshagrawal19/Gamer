import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [textSize, setTextSize] = useState('medium');
  const [aiResponseTime, setAiResponseTime] = useState('normal');
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.settingGroup}>
          <Text style={styles.settingGroupTitle}>Interface</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="moon" size={20} color="#6200ee" />
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#444', true: '#6200ee' }}
              thumbColor="#fff"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="text" size={20} color="#6200ee" />
              <Text style={styles.settingLabel}>Text Size</Text>
            </View>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  textSize === 'small' && styles.activeSegment
                ]}
                onPress={() => setTextSize('small')}
              >
                <Text style={[
                  styles.segmentText,
                  textSize === 'small' && styles.activeSegmentText
                ]}>
                  Small
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  textSize === 'medium' && styles.activeSegment
                ]}
                onPress={() => setTextSize('medium')}
              >
                <Text style={[
                  styles.segmentText,
                  textSize === 'medium' && styles.activeSegmentText
                ]}>
                  Medium
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  textSize === 'large' && styles.activeSegment
                ]}
                onPress={() => setTextSize('large')}
              >
                <Text style={[
                  styles.segmentText,
                  textSize === 'large' && styles.activeSegmentText
                ]}>
                  Large
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.settingGroup}>
          <Text style={styles.settingGroupTitle}>Experience</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="volume-high" size={20} color="#6200ee" />
              <Text style={styles.settingLabel}>Sound Effects</Text>
            </View>
            <Switch
              value={soundEffects}
              onValueChange={setSoundEffects}
              trackColor={{ false: '#444', true: '#6200ee' }}
              thumbColor="#fff"
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="hourglass" size={20} color="#6200ee" />
              <Text style={styles.settingLabel}>AI Response Time</Text>
            </View>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  aiResponseTime === 'fast' && styles.activeSegment
                ]}
                onPress={() => setAiResponseTime('fast')}
              >
                <Text style={[
                  styles.segmentText,
                  aiResponseTime === 'fast' && styles.activeSegmentText
                ]}>
                  Fast
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  aiResponseTime === 'normal' && styles.activeSegment
                ]}
                onPress={() => setAiResponseTime('normal')}
              >
                <Text style={[
                  styles.segmentText,
                  aiResponseTime === 'normal' && styles.activeSegmentText
                ]}>
                  Normal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  aiResponseTime === 'realistic' && styles.activeSegment
                ]}
                onPress={() => setAiResponseTime('realistic')}
              >
                <Text style={[
                  styles.segmentText,
                  aiResponseTime === 'realistic' && styles.activeSegmentText
                ]}>
                  Realistic
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.settingGroup}>
          <Text style={styles.settingGroupTitle}>Data</Text>
          
          <TouchableOpacity style={styles.dataButton}>
            <Ionicons name="cloud-download" size={20} color="#fff" />
            <Text style={styles.dataButtonText}>Export Saved Stories</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.dataButton}>
            <Ionicons name="cloud-upload" size={20} color="#fff" />
            <Text style={styles.dataButtonText}>Import Saved Stories</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.dataButton, styles.dangerButton]}>
            <Ionicons name="trash" size={20} color="#ff5252" />
            <Text style={[styles.dataButtonText, styles.dangerText]}>Clear All Data</Text>
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
  settingGroup: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  settingGroupTitle: {
    color: '#6200ee',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segmentButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  activeSegment: {
    backgroundColor: '#6200ee',
  },
  segmentText: {
    color: '#ccc',
    fontSize: 14,
  },
  activeSegmentText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  dataButtonText: {
    color: '#fff',
    marginLeft: 12,
  },
  dangerButton: {
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderWidth: 1,
    borderColor: '#ff5252',
  },
  dangerText: {
    color: '#ff5252',
  },
});