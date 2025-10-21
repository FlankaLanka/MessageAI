import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface BottomTabBarProps {
  activeTab: 'messages' | 'profile';
  onTabPress: (tab: 'messages' | 'profile') => void;
}

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 400;

export default function BottomTabBar({ activeTab, onTabPress }: BottomTabBarProps) {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'messages' && styles.activeTab]}
          onPress={() => onTabPress('messages')}
        >
          <Text style={[styles.tabIcon, activeTab === 'messages' && styles.activeTabIcon]}>
            💬
          </Text>
          <Text style={[styles.tabLabel, activeTab === 'messages' && styles.activeTabLabel]}>
            Messages
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => onTabPress('profile')}
        >
          <Text style={[styles.tabIcon, activeTab === 'profile' && styles.activeTabIcon]}>
            👤
          </Text>
          <Text style={[styles.tabLabel, activeTab === 'profile' && styles.activeTabLabel]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  tabBar: {
    flexDirection: 'row',
    height: isSmallScreen ? 60 : 70,
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    backgroundColor: '#f0f8ff',
  },
  tabIcon: {
    fontSize: isSmallScreen ? 20 : 24,
    marginBottom: 4,
  },
  activeTabIcon: {
    fontSize: isSmallScreen ? 22 : 26,
  },
  tabLabel: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
