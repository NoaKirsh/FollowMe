export const parseFollowers = (followersData) => {
  try {
    if (Array.isArray(followersData)) {
      return followersData.map(item => {
        if (item.string_list_data && item.string_list_data[0]) {
          return {
            username: item.string_list_data[0].value,
            timestamp: item.string_list_data[0].timestamp || null
          };
        }
        return null;
      }).filter(Boolean);
    }
    return [];
  } catch (error) {
    console.error('Error parsing followers:', error);
    return [];
  }
};

export const parseFollowing = (followingData) => {
  try {
    if (followingData.relationships_following) {
      return followingData.relationships_following.map(item => {
        let username = null;
        let timestamp = null;
        
        if (item.title) {
          username = item.title;
          timestamp = item.string_list_data?.[0]?.timestamp || item.timestamp;
        } else if (item.string_list_data && item.string_list_data[0]) {
          username = item.string_list_data[0].value;
          timestamp = item.string_list_data[0].timestamp;
        } else if (typeof item === 'string') {
          username = item;
        }
        
        return username ? { username, timestamp } : null;
      }).filter(Boolean);
    }
    return [];
  } catch (error) {
    console.error('Error parsing following:', error);
    return [];
  }
};

export const compareFollowers = (followers, following) => {
  const normalizeUsername = (username) => {
    if (!username) return '';
    return String(username).toLowerCase().trim();
  };
  
  const followerUsernames = new Set(
    followers.map(f => normalizeUsername(f.username)).filter(u => u)
  );
  const followingUsernames = new Set(
    following.map(f => normalizeUsername(f.username)).filter(u => u)
  );

  const notFollowingBack = followers.filter(
    follower => {
      const normalized = normalizeUsername(follower.username);
      return normalized && !followingUsernames.has(normalized);
    }
  );

  const notFollowersBack = following.filter(
    followed => {
      const normalized = normalizeUsername(followed.username);
      return normalized && !followerUsernames.has(normalized);
    }
  );

  const mutualFollowers = followers.filter(
    follower => {
      const normalized = normalizeUsername(follower.username);
      return normalized && followingUsernames.has(normalized);
    }
  );

  return {
    notFollowingBack,
    notFollowersBack,
    mutualFollowers,
    stats: {
      totalFollowers: followers.length,
      totalFollowing: following.length,
      mutualCount: mutualFollowers.length,
      notFollowingBackCount: notFollowingBack.length,
      notFollowersBackCount: notFollowersBack.length,
    }
  };
};

export const parseJSONSafely = (content) => {
  try {
    return JSON.parse(content);
  } catch (error) {
    try {
      const cleaned = content.replace(/^\uFEFF/, '');
      return JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      return null;
    }
  }
};

export const detectFileType = (data) => {
  if (!data) return null;
  
  if (Array.isArray(data) && data[0]?.string_list_data) {
    return 'followers';
  }
  
  if (data.relationships_following && Array.isArray(data.relationships_following)) {
    return 'following';
  }
  
  return null;
};
