import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { TypingData } from '../api/presence';

interface TypingIndicatorProps {
  typingUsers: TypingData[];
  isVisible: boolean;
}

export default function TypingIndicator({ typingUsers, isVisible }: TypingIndicatorProps) {
  const dot1Anim = useRef(new Animated.Value(0.4)).current;
  const dot2Anim = useRef(new Animated.Value(0.4)).current;
  const dot3Anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (isVisible && typingUsers.length > 0) {
      const animateDots = () => {
        Animated.sequence([
          Animated.timing(dot1Anim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Anim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Anim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(dot1Anim, {
              toValue: 0.4,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(dot2Anim, {
              toValue: 0.4,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(dot3Anim, {
              toValue: 0.4,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          if (isVisible && typingUsers.length > 0) {
            animateDots();
          }
        });
      };
      animateDots();
    } else {
      // Reset dots when not visible
      dot1Anim.setValue(0.4);
      dot2Anim.setValue(0.4);
      dot3Anim.setValue(0.4);
    }
  }, [isVisible, typingUsers.length, dot1Anim, dot2Anim, dot3Anim]);

  if (!isVisible || typingUsers.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].userName} is typing`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].userName}, ${typingUsers[1].userName} are typing`;
    } else if (typingUsers.length > 2) {
      return 'Multiple people are typing';
    }
    return '';
  };

  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, { opacity: dot1Anim }]} />
        <Animated.View style={[styles.dot, { opacity: dot2Anim }]} />
        <Animated.View style={[styles.dot, { opacity: dot3Anim }]} />
      </View>
      <Text style={styles.typingText}>{getTypingText()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#666',
    marginHorizontal: 2,
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
