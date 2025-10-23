import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { MessageReaction } from '../types';

interface ReactionDisplayProps {
  reactions: MessageReaction[];
  currentUserId: string;
  onReactionPress?: (emoji: string) => void;
  maxDisplay?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export default function ReactionDisplay({
  reactions,
  currentUserId,
  onReactionPress,
  maxDisplay = 3
}: ReactionDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, MessageReaction[]>);

  const reactionEntries = Object.entries(groupedReactions);
  const displayReactions = reactionEntries.slice(0, maxDisplay);
  const hasMore = reactionEntries.length > maxDisplay;

  const handleReactionPress = (emoji: string) => {
    if (onReactionPress) {
      onReactionPress(emoji);
    } else {
      setShowDetails(true);
    }
  };

  const renderReactionButton = ([emoji, emojiReactions]: [string, MessageReaction[]]) => {
    const userReaction = emojiReactions.find(r => r.userId === currentUserId);
    const count = emojiReactions.length;
    
    return (
      <TouchableOpacity
        key={emoji}
        style={[
          styles.reactionButton,
          userReaction && styles.userReactionButton
        ]}
        onPress={() => handleReactionPress(emoji)}
        activeOpacity={0.7}
      >
        <Text style={styles.reactionEmoji}>{emoji}</Text>
        <Text style={[
          styles.reactionCount,
          userReaction && styles.userReactionCount
        ]}>
          {count}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderUserItem = ({ item }: { item: MessageReaction }) => (
    <View style={styles.userItem}>
      {item.userPhotoURL ? (
        <Image source={{ uri: item.userPhotoURL }} style={styles.userAvatar} />
      ) : (
        <View style={[styles.userAvatar, styles.placeholderAvatar]}>
          <Text style={styles.placeholderText}>
            {item.userName.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <Text style={styles.userName}>{item.userName}</Text>
    </View>
  );

  const renderReactionDetails = () => (
    <Modal
      visible={showDetails}
      transparent
      animationType="slide"
      onRequestClose={() => setShowDetails(false)}
    >
      <TouchableOpacity
        style={styles.detailsOverlay}
        activeOpacity={1}
        onPress={() => setShowDetails(false)}
      >
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Reactions</Text>
          {reactionEntries.map(([emoji, emojiReactions]) => (
            <View key={emoji} style={styles.emojiSection}>
              <View style={styles.emojiHeader}>
                <Text style={styles.emojiText}>{emoji}</Text>
                <Text style={styles.emojiCount}>{emojiReactions.length}</Text>
              </View>
              <FlatList
                data={emojiReactions}
                keyExtractor={(item) => `${item.userId}-${item.timestamp}`}
                renderItem={renderUserItem}
                style={styles.usersList}
              />
            </View>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  if (reactions.length === 0) return null;

  return (
    <>
      <View style={styles.container}>
        {displayReactions.map(renderReactionButton)}
        {hasMore && (
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => setShowDetails(true)}
          >
            <Text style={styles.moreText}>+{reactionEntries.length - maxDisplay}</Text>
          </TouchableOpacity>
        )}
      </View>
      {renderReactionDetails()}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
    marginBottom: 2,
  },
  userReactionButton: {
    backgroundColor: '#007AFF',
  },
  reactionEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  reactionCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  userReactionCount: {
    color: '#fff',
  },
  moreButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
    marginBottom: 2,
  },
  moreText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  detailsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    maxHeight: screenWidth * 0.8,
    width: screenWidth * 0.8,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  emojiSection: {
    marginBottom: 16,
  },
  emojiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emojiText: {
    fontSize: 20,
    marginRight: 8,
  },
  emojiCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  usersList: {
    maxHeight: 120,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  placeholderAvatar: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 14,
    color: '#333',
  },
});
