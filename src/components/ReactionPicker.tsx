import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

interface ReactionPickerProps {
  visible: boolean;
  onReactionSelect: (emoji: string) => void;
  onClose: () => void;
  messageId: string;
  currentReactions?: string[]; // User's current reactions to highlight
}

const { width: screenWidth } = Dimensions.get('window');

// Common emoji reactions
const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥'];

export default function ReactionPicker({
  visible,
  onReactionSelect,
  onClose,
  messageId,
  currentReactions = []
}: ReactionPickerProps) {
  const handleReactionPress = async (emoji: string) => {
    // Add haptic feedback
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onReactionSelect(emoji);
    onClose();
  };

  const renderReactionButton = (emoji: string) => {
    const isSelected = currentReactions.includes(emoji);
    
    return (
      <TouchableOpacity
        key={emoji}
        style={[
          styles.reactionButton,
          isSelected && styles.selectedReactionButton
        ]}
        onPress={() => handleReactionPress(emoji)}
        activeOpacity={0.7}
      >
        <Text style={styles.reactionEmoji}>{emoji}</Text>
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          <BlurView intensity={20} style={styles.pickerContainer}>
            <View style={styles.reactionsRow}>
              {REACTION_EMOJIS.map(renderReactionButton)}
            </View>
          </BlurView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    position: 'absolute',
    bottom: 100, // Position above keyboard
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pickerContainer: {
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  reactionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    minWidth: screenWidth * 0.7,
  },
  reactionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedReactionButton: {
    backgroundColor: '#007AFF',
    transform: [{ scale: 1.1 }],
  },
  reactionEmoji: {
    fontSize: 24,
  },
});
