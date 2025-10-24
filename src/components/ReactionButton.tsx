import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ReactionButtonProps {
  onPress: () => void;
  isOwn: boolean;
}

export const ReactionButton: React.FC<ReactionButtonProps> = ({ onPress, isOwn }) => {
  return (
    <TouchableOpacity
      style={[
        styles.reactionButton,
        isOwn ? styles.ownReactionButton : styles.otherReactionButton
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons 
        name="add-circle-outline" 
        size={16} 
        color={isOwn ? '#FFFFFF' : '#666666'} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  reactionButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },
  ownReactionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  otherReactionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});
