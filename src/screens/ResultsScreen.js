import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';

export default function ResultsScreen({ route }) {
  const { results } = route.params;
  const [selectedTab, setSelectedTab] = useState('notFollowingBack');

  const renderStatCard = (title, value, color) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const renderUserItem = ({ item, index }) => {
    if (!item || item.isEmpty) {
      return <View style={[styles.userItem, styles.emptyCell]} />;
    }
    
    return (
      <View style={styles.userItem}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {item.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>@{item.username}</Text>
          {item.fullName && (
            <Text style={styles.timestamp}>
              {item.fullName}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const getPaddedListData = () => {
    const data = getListData();
    const numColumns = 6;
    const remainder = data.length % numColumns;
    
    if (remainder === 0) return data;
    
    const emptyCells = numColumns - remainder;
    const paddedData = [...data];
    
    for (let i = 0; i < emptyCells; i++) {
      paddedData.push({ isEmpty: true, username: `empty-${i}` });
    }
    
    return paddedData;
  };

  const getListData = () => {
    switch (selectedTab) {
      case 'notFollowingBack':
        return results.notFollowingBack;
      case 'notFollowersBack':
        return results.notFollowersBack;
      case 'mutual':
        return results.mutualFollowers;
      default:
        return [];
    }
  };

  const getListTitle = () => {
    switch (selectedTab) {
      case 'notFollowingBack':
        return 'They Follow You (You Don\'t Follow Back)';
      case 'notFollowersBack':
        return 'You Follow Them (They Don\'t Follow Back)';
      case 'mutual':
        return 'Mutual Followers';
      default:
        return '';
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
          <Text style={styles.headerTitle}>Your Instagram Analysis</Text>
        </View>

        <View style={styles.summaryStatsContainer}>
          <View style={styles.summaryStatsRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <Text style={styles.summaryText}>
              You have <Text style={styles.bold}>{results.stats.totalFollowers}</Text> followers
            </Text>
            <Text style={styles.summaryText}>
              You follow <Text style={styles.bold}>{results.stats.totalFollowing}</Text> people
            </Text>
            <Text style={styles.summaryText}>
              <Text style={styles.bold}>{results.stats.mutualCount}</Text> mutual connections
            </Text>
            <Text style={styles.summaryText}>
              <Text style={styles.bold}>{results.stats.notFollowersBackCount}</Text> don't follow you back
            </Text>
            <Text style={styles.summaryText}>
              <Text style={styles.bold}>{results.stats.notFollowingBackCount}</Text> you could follow back
            </Text>
          </View>

          <View style={styles.statsColumn}>
            <View style={styles.statsGrid}>
              {renderStatCard('Total Followers', results.stats.totalFollowers, '#9C27B0')}
              {renderStatCard('Total Following', results.stats.totalFollowing, '#E91E63')}
            </View>

            <View style={styles.statsGrid}>
              {renderStatCard('Mutual Friends', results.stats.mutualCount, '#FF9800')}
              {renderStatCard('Not Following Back', results.stats.notFollowersBackCount, '#F44336')}
            </View>
          </View>
        </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'notFollowingBack' && styles.tabActive
            ]}
            onPress={() => setSelectedTab('notFollowingBack')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'notFollowingBack' && styles.tabTextActive
              ]}
            >
              Follow You ({results.stats.notFollowingBackCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'notFollowersBack' && styles.tabActive
            ]}
            onPress={() => setSelectedTab('notFollowersBack')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'notFollowersBack' && styles.tabTextActive
              ]}
            >
              Don't Follow Back ({results.stats.notFollowersBackCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'mutual' && styles.tabActive
            ]}
            onPress={() => setSelectedTab('mutual')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'mutual' && styles.tabTextActive
              ]}
            >
              Mutual ({results.stats.mutualCount})
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.listTitle}>{getListTitle()}</Text>

        <View style={styles.listContainer}>
          {getListData().length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No users in this category</Text>
            </View>
          ) : (
            <FlatList
              data={getPaddedListData()}
              renderItem={renderUserItem}
              keyExtractor={(item, index) => `${item.username}-${index}`}
              scrollEnabled={false}
              numColumns={6}
              columnWrapperStyle={styles.columnWrapper}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  summaryStatsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'stretch',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: 420,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  bold: {
    fontWeight: '700',
    color: '#E91E63',
  },
  statsColumn: {
    justifyContent: 'space-between',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: 140,
    height: 85,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginTop: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    background: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 50%, #FF9800 100%)',
    backgroundColor: '#E91E63',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#fff',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  listContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  columnWrapper: {
    gap: 10,
  },
  userItem: {
    width: '16.666%',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  emptyCell: {
    opacity: 0,
    borderBottomWidth: 0,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    background: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)',
    backgroundColor: '#E91E63',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    alignItems: 'center',
  },
  username: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  timestamp: {
    fontSize: 9,
    color: '#999',
    marginTop: 1,
    textAlign: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
  },
});

