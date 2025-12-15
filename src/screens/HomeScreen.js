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
  const [errorMessage, setErrorMessage] = useState(null);

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
      setErrorMessage(error.message);
      setTimeout(() => setErrorMessage(null), 5000);
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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

        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>How to Get Your Instagram Data</Text>
            <View style={styles.instructionsGrid}>
            <View style={styles.instructionColumn}>
              <View style={styles.instructionItem}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNumber}>1</Text>
                </View>
                <View style={styles.instructionContent}>
                  <Text style={styles.instruction}>Profile → Menu → Download Data</Text>
                </View>
              </View>
              
              <View style={styles.instructionItem}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNumber}>2</Text>
                </View>
                <View style={styles.instructionContent}>
                  <Text style={styles.instruction}>Request Download (JSON format)</Text>
                </View>
              </View>
            </View>

            <View style={styles.instructionColumn}>
              <View style={styles.instructionItem}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNumber}>3</Text>
                </View>
                <View style={styles.instructionContent}>
                  <Text style={styles.instruction}>Wait for email (4-48 hours)</Text>
                </View>
              </View>
              
              <View style={styles.instructionItem}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNumber}>4</Text>
                </View>
                <View style={styles.instructionContent}>
                  <Text style={styles.instruction}>Download ZIP and extract</Text>
                </View>
              </View>
            </View>

            <View style={styles.instructionColumn}>
              <View style={styles.instructionItem}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNumber}>5</Text>
                </View>
                <View style={styles.instructionContent}>
                  <Text style={styles.instruction}>Open followers_and_following folder</Text>
                </View>
              </View>
              
              <View style={styles.instructionItem}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNumber}>6</Text>
                </View>
                <View style={styles.instructionContent}>
                  <Text style={styles.instruction}>Upload followers_1.json + following.json</Text>
                </View>
              </View>
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
              onMouseEnter={(e) => {
                if (!followersFile) {
                  e.currentTarget.style.borderColor = '#9C27B0';
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(156, 39, 176, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!followersFile) {
                  e.currentTarget.style.borderColor = '#E91E63';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 6px 10px rgba(233, 30, 99, 0.25)';
                }
              }}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonEmoji}>👤</Text>
                <Text style={[styles.buttonTitle, followersFile && styles.buttonTitleSelected]}>
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
              onMouseEnter={(e) => {
                if (!followingFile) {
                  e.currentTarget.style.borderColor = '#9C27B0';
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(156, 39, 176, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!followingFile) {
                  e.currentTarget.style.borderColor = '#E91E63';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 6px 10px rgba(233, 30, 99, 0.25)';
                }
              }}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonEmoji}>➡️</Text>
                <Text style={[styles.buttonTitle, followingFile && styles.buttonTitleSelected]}>
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

        <View style={styles.analyzeContainer}>
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
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Your data stays private - all processing happens on your device
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 Noa Kirsh. All rights reserved.</Text>
        </View>
      </View>
      </ScrollView>
      
      {errorMessage && (
        <View style={styles.errorTooltip}>
          <Text style={styles.errorText}>❌ {errorMessage}</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    background: 'linear-gradient(to bottom, #fff5f8 0%, #fafafa 100%)',
    backgroundColor: '#fff5f8',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 12,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E91E63',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  cardContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 3,
    borderColor: '#E91E63',
    maxWidth: 700,
    width: '100%',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E91E63',
    marginBottom: 24,
    textAlign: 'center',
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#fce4ec',
  },
  instructionsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  instructionColumn: {
    flex: 1,
    gap: 14,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 32,
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
    flexWrap: 'wrap',
  },
  instruction: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
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
    fontSize: 22,
    fontWeight: '700',
    color: '#E91E63',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  button: {
    width: 180,
    background: 'linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%)',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E91E63',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    minHeight: 140,
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  buttonSelected: {
    borderColor: '#9C27B0',
    backgroundColor: '#f3e5f5',
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    transform: 'translateY(-4px) scale(1.03)',
    elevation: 8,
  },
  buttonContent: {
    alignItems: 'center',
    width: '100%',
  },
  buttonEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  buttonTitleSelected: {
    color: '#9C27B0',
  },
  buttonSubtitle: {
    fontSize: 11,
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
  },
  analyzeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  analyzeButton: {
    width: 240,
    background: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 50%, #FF9800 100%)',
    backgroundColor: '#E91E63',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
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
  footer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
  errorTooltip: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#f44336',
    borderRadius: 12,
    padding: 16,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

