import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  // Placeholder data
  const userProfile = {
    username: 'GamerPro',
    level: 42,
    xp: 7800,
    nextLevelXp: 10000,
    gamesPlayed: 128,
    achievements: 87,
    friends: 36,
    avatar: 'https://via.placeholder.com/150',
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{userProfile.username}</Text>
            <View style={styles.levelContainer}>
              <Text style={styles.levelText}>Level {userProfile.level}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* XP Progress */}
        <View style={styles.xpContainer}>
          <View style={styles.xpBar}>
            <View 
              style={[
                styles.xpProgress, 
                { width: `${(userProfile.xp / userProfile.nextLevelXp) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.xpText}>
            {userProfile.xp} / {userProfile.nextLevelXp} XP
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userProfile.gamesPlayed}</Text>
            <Text style={styles.statLabel}>Games</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userProfile.achievements}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userProfile.friends}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.activityItem}>
            <Ionicons name="trophy" size={24} color="#FFD700" style={styles.activityIcon} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Achieved "Master Sniper" in Call of Duty</Text>
              <Text style={styles.activityTime}>2 days ago</Text>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <Ionicons name="game-controller" size={24} color="#6200ee" style={styles.activityIcon} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Played Cyberpunk 2077 for 3 hours</Text>
              <Text style={styles.activityTime}>3 days ago</Text>
            </View>
          </View>
          
          <View style={styles.activityItem}>
            <Ionicons name="person-add" size={24} color="#4CAF50" style={styles.activityIcon} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Added DarkKnight as a friend</Text>
              <Text style={styles.activityTime}>1 week ago</Text>
            </View>
          </View>
        </View>

        {/* Favorite Games */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Favorite Games</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.favGamesScroll}>
            <View style={styles.favGameItem}>
              <Image 
                source={{ uri: 'https://via.placeholder.com/150?text=Game1' }} 
                style={styles.favGameImage} 
              />
              <Text style={styles.favGameTitle}>Cyberpunk 2077</Text>
            </View>
            
            <View style={styles.favGameItem}>
              <Image 
                source={{ uri: 'https://via.placeholder.com/150?text=Game2' }} 
                style={styles.favGameImage} 
              />
              <Text style={styles.favGameTitle}>Elden Ring</Text>
            </View>
            
            <View style={styles.favGameItem}>
              <Image 
                source={{ uri: 'https://via.placeholder.com/150?text=Game3' }} 
                style={styles.favGameImage} 
              />
              <Text style={styles.favGameTitle}>FIFA 23</Text>
            </View>
          </ScrollView>
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
  profileHeader: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  levelContainer: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  levelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  editButton: {
    padding: 8,
    backgroundColor: '#333',
    borderRadius: 20,
  },
  xpContainer: {
    padding: 20,
    backgroundColor: '#1e1e1e',
  },
  xpBar: {
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    overflow: 'hidden',
  },
  xpProgress: {
    height: '100%',
    backgroundColor: '#6200ee',
  },
  xpText: {
    color: '#bbb',
    marginTop: 6,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    paddingBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 4,
  },
  sectionContainer: {
    marginTop: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  activityIcon: {
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 16,
  },
  activityText: {
    color: '#fff',
  },
  activityTime: {
    color: '#bbb',
    marginTop: 4,
    fontSize: 12,
  },
  favGamesScroll: {
    marginTop: 8,
  },
  favGameItem: {
    marginRight: 16,
    width: 120,
  },
  favGameImage: {
    width: 120,
    height: 160,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  favGameTitle: {
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
  },
});