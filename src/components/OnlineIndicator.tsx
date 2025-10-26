import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface OnlineIndicatorProps {
  isOnline: boolean;
  size?: number;
  animated?: boolean;
  showOffline?: boolean; // Show gray dot when offline
}

export default function OnlineIndicator({ 
  isOnline, 
  size = 10, 
  animated = false,
  showOffline = false
}: OnlineIndicatorProps) {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (animated && isOnline) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isOnline) pulse();
        });
      };
      pulse();
    }
  }, [isOnline, animated, pulseAnim]);

  if (!isOnline && !showOffline) return null;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.indicator,
          { 
            width: size, 
            height: size,
            borderRadius: size / 2,
            backgroundColor: isOnline ? '#4CAF50' : '#9E9E9E',
            transform: [{ scale: animated ? pulseAnim : 1 }]
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    borderWidth: 2,
    borderColor: '#fff',
  },
});
