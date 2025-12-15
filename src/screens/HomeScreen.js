import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { parseFollowers, parseFollowing, compareFollowers, parseJSONSafely, detectFileType } from '../utils/instagramParser';

export default function HomeScreen({ navigation }) {
  const [followersFile, setFollowersFile] = useState(null);
  const [followingFile, setFollowingFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickDocument = async (type) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: false,
    });

      if (result.canceled) {
        return;
      }

      if (result.assets && result.assets[0]) {
        const file = result.assets[0];
        if (type === 'followers') {
          setFollowersFile(file);
        } else {
          setFollowingFile(file);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file: ' + error.message);
    }
  };

  const analyzeData = async () => {
    if (!followersFile || !followingFile) {
      Alert.alert('Missing Files', 'Please select both followers and following files');
      return;
    }

    setLoading(true);

    try {
      let followersContent, followingContent;

      if (followersFile.file) {
        followersContent = await followersFile.file.text();
        followingContent = await followingFile.file.text();
      } else {
        followersContent = await FileSystem.readAsStringAsync(followersFile.uri);
        followingContent = await FileSystem.readAsStringAsync(followingFile.uri);
      }

      let followersData = parseJSONSafely(followersContent);
      let followingData = parseJSONSafely(followingContent);

      if (!followersData || !followingData) {
        throw new Error('Failed to parse JSON files. Make sure both files are valid JSON format.');
      }

      const firstFileType = detectFileType(followersData);
      const secondFileType = detectFileType(followingData);

      if (!firstFileType || !secondFileType) {
        throw new Error('Invalid Instagram data format. Make sure you selected the correct export files from Instagram.');
      }

      if (firstFileType === 'following' && secondFileType === 'followers') {
        [followersData, followingData] = [followingData, followersData];
        Alert.alert('Files Auto-Swapped', 'Files were in reverse order. They have been automatically corrected.');
      } else if (firstFileType !== 'followers' || secondFileType !== 'following') {
        throw new Error(`Wrong files selected. First file is ${firstFileType}, second file is ${secondFileType}. Please select followers_1.json first, then following.json.`);
      }

      const followers = parseFollowers(followersData);
      const following = parseFollowing(followingData);

      if (followers.length === 0) {
        throw new Error('No followers found. Make sure you selected the correct followers_1.json file.');
      }

      if (following.length === 0) {
        throw new Error('No following data found. Make sure you selected the correct following.json file.');
      }

      const results = compareFollowers(followers, following);
      navigation.navigate('Results', { results });
    } catch (error) {
      Alert.alert('Error', error.message);
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image 
            source={require('../../logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Instagram Follower Tracker</Text>
          <Text style={styles.headerSubtitle}>
            Track who follows you and who you follow on Instagram
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📥 How to Get Your Instagram Data</Text>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.instructionContent}>
                <Text style={styles.instruction}>Open Instagram app</Text>
              </View>
            </View>
            
            <View style={styles.instructionItem}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.instructionContent}>
                <Text style={styles.instruction}>Settings → Security → Download Data</Text>
              </View>
            </View>
            
            <View style={styles.instructionItem}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <View style={styles.instructionContent}>
                <Text style={styles.instruction}>Request download (format: JSON)</Text>
              </View>
            </View>
            
            <View style={styles.instructionItem}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNumber}>4</Text>
              </View>
              <View style={styles.instructionContent}>
                <Text style={styles.instruction}>Wait for email (4-48 hours)</Text>
              </View>
            </View>
            
            <View style={styles.instructionItem}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNumber}>5</Text>
              </View>
              <View style={styles.instructionContent}>
                <Text style={styles.instruction}>Extract the ZIP file</Text>
              </View>
            </View>
            
            <View style={styles.instructionItem}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNumber}>6</Text>
              </View>
              <View style={styles.instructionContent}>
                <Text style={styles.instruction}>Find these files:</Text>
                <Text style={styles.instructionSub}>• followers_1.json</Text>
                <Text style={styles.instructionSub}>• following.json</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Your Files</Text>

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.button, followersFile && styles.buttonSelected]}
              onPress={() => pickDocument('followers')}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonEmoji}>👥</Text>
                <Text style={styles.buttonTitle}>
                  {followersFile ? '✓ Followers' : 'Followers'}
                </Text>
                {followersFile && (
                  <Text style={styles.buttonSubtitle} numberOfLines={1}>
                    {followersFile.name}
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, followingFile && styles.buttonSelected]}
              onPress={() => pickDocument('following')}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonEmoji}>➕</Text>
                <Text style={styles.buttonTitle}>
                  {followingFile ? '✓ Following' : 'Following'}
                </Text>
                {followingFile && (
                  <Text style={styles.buttonSubtitle} numberOfLines={1}>
                    {followingFile.name}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.analyzeButton,
            (!followersFile || !followingFile || loading) && styles.analyzeButtonDisabled
          ]}
          onPress={analyzeData}
          disabled={!followersFile || !followingFile || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.analyzeButtonText}>Analyze Followers</Text>
          )}
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Your data stays private - all processing happens on your device
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logo: {
    width: 280,
    height: 280,
    marginBottom: 8,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 50%, #FF9800 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: '#9C27B0',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    background: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)',
    backgroundColor: '#E91E63',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructionContent: {
    flex: 1,
  },
  instruction: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    fontWeight: '500',
  },
  instructionSub: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 4,
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 140,
    justifyContent: 'center',
  },
  buttonSelected: {
    borderColor: '#E91E63',
    backgroundColor: '#fce4ec',
    shadowColor: '#E91E63',
    shadowOpacity: 0.2,
  },
  buttonContent: {
    alignItems: 'center',
    width: '100%',
  },
  buttonEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  buttonSubtitle: {
    fontSize: 11,
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
  },
  analyzeButton: {
    background: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 50%, #FF9800 100%)',
    backgroundColor: '#E91E63',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#f3e5f5',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  infoText: {
    fontSize: 14,
    color: '#6A1B9A',
    textAlign: 'center',
  },
});

