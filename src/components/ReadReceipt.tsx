import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { ReadReceipt as ReadReceiptType } from '../api/readReceipts';

interface ReadReceiptProps {
  readReceipts: ReadReceiptType[];
  isOwnMessage: boolean;
  maxAvatars?: number;
}

export default function ReadReceipt({ readReceipts, isOwnMessage, maxAvatars = 3 }: ReadReceiptProps) {
  // Show read receipts for own messages, or for any message in group chats
  if (readReceipts.length === 0) {
    return null;
  }

  const visibleReceipts = readReceipts.slice(0, maxAvatars);
  const remainingCount = readReceipts.length - maxAvatars;

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        {visibleReceipts.map((receipt, index) => (
          <View
            key={receipt.userId}
            style={[
              styles.avatarWrapper,
              { zIndex: visibleReceipts.length - index }
            ]}
          >
            {receipt.userPhotoURL ? (
              <Image
                source={{ uri: receipt.userPhotoURL }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.defaultAvatar]}>
                <Text style={styles.avatarText}>
                  {receipt.userName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        ))}
        
        {remainingCount > 0 && (
          <View style={[styles.avatarWrapper, { zIndex: 0 }]}>
            <View style={[styles.avatar, styles.moreAvatar]}>
              <Text style={styles.moreText}>+{remainingCount}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');
const avatarSize = 16;
const overlap = 4;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 2,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    marginLeft: -overlap,
    position: 'relative',
  },
  avatar: {
    width: avatarSize,
    height: avatarSize,
    borderRadius: avatarSize / 2,
    borderWidth: 1,
    borderColor: '#fff',
  },
  defaultAvatar: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreAvatar: {
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  moreText: {
    color: '#8E8E93',
    fontSize: 8,
    fontWeight: '600',
  },
});
