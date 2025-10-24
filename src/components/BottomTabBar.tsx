import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../hooks/useLocalization';

interface BottomTabBarProps {
  activeTab: 'messages' | 'profile';
  onTabPress: (tab: 'messages' | 'profile') => void;
}

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 400;

export default function BottomTabBar({ activeTab, onTabPress }: BottomTabBarProps) {
  const { t } = useLocalization();
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'messages' && styles.activeTab]}
          onPress={() => onTabPress('messages')}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name={activeTab === 'messages' ? 'chatbubbles' : 'chatbubbles-outline'}
              size={isSmallScreen ? 22 : 24}
              color={activeTab === 'messages' ? '#007AFF' : '#8E8E93'}
            />
          </View>
          <Text style={[styles.tabLabel, activeTab === 'messages' && styles.activeTabLabel]}>
            {t('messages')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => onTabPress('profile')}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name={activeTab === 'profile' ? 'person' : 'person-outline'}
              size={isSmallScreen ? 22 : 24}
              color={activeTab === 'profile' ? '#007AFF' : '#8E8E93'}
            />
          </View>
          <Text style={[styles.tabLabel, activeTab === 'profile' && styles.activeTabLabel]}>
            {t('profile')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBar: {
    flexDirection: 'row',
    height: isSmallScreen ? 65 : 75,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#F0F8FF',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: isSmallScreen ? 11 : 12,
    color: '#8E8E93',
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  activeTabLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
