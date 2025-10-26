import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SmartSuggestion, smartSuggestionsService } from '../api/smartSuggestions';
import { Message } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { useStore } from '../store/useStore';

interface SmartSuggestionsProps {
  currentMessage: string;
  chatId: string;
  recentMessages: Message[];
  currentUserId: string;
  currentUserName: string;
  onSuggestionSelect: (suggestion: string) => void;
  onClose: () => void;
  visible: boolean;
  otherUserLanguage?: string;
  isDirectChat?: boolean;
  userLanguage?: string;
  isSuggestionsMode?: boolean;
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  currentMessage,
  chatId,
  recentMessages,
  currentUserId,
  currentUserName,
  onSuggestionSelect,
  onClose,
  visible,
  otherUserLanguage,
  isDirectChat,
  userLanguage,
  isSuggestionsMode = false
}) => {
  const { t } = useLocalization();
  const { smartSuggestionsUseRAG, smartSuggestionsIncludeOtherLanguage } = useStore();
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));

  // Helper function to get language code from language name
  const getLanguageCode = (languageName?: string): string => {
    if (!languageName) return 'EN';
    
    const languageMap: Record<string, string> = {
      'English': 'EN',
      'Spanish': 'ES', 
      'Chinese': 'ZH',
      'EN': 'EN',
      'ES': 'ES',
      'ZH': 'ZH'
    };
    
    return languageMap[languageName] || 'EN';
  };

  useEffect(() => {
    if (visible) {
      loadSuggestions();
    }
  }, [visible, chatId]);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      const context = {
        chatId,
        currentMessage: '', // Always start with empty message for top 3 suggestions
        recentMessages: recentMessages.slice(-10),
        currentUserId,
        currentUserName,
        userPreferences: {
          language: getLanguageName(userLanguage),
          tone: 'casual' as const,
          style: 'conversational' as const
        },
        otherUserLanguage,
        isDirectChat
      };
      
      // For 1-on-1 chats: use other language setting
      // For group chats: always use user language only
      const shouldIncludeOtherLanguage = isDirectChat && smartSuggestionsIncludeOtherLanguage;
      
      const newSuggestions = await smartSuggestionsService.generateSuggestions(
        context, 
        smartSuggestionsUseRAG, 
        shouldIncludeOtherLanguage
      );
      setSuggestions(newSuggestions.slice(0, 3));
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleSuggestionPress = (suggestion: SmartSuggestion) => {
    onSuggestionSelect(suggestion.text);
  };

  const getLanguageName = (languageCode?: string): string => {
    const languageMap: Record<string, string> = {
      'EN': 'English',
      'ES': 'Spanish', 
      'ZH': 'Chinese'
    };
    return languageCode ? languageMap[languageCode] || 'English' : 'English';
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'completion':
        return 'arrow-forward';
      case 'response':
        return 'chatbubble';
      case 'question':
        return 'help-circle';
      case 'reaction':
        return 'heart';
      default:
        return 'bulb';
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'completion':
        return '#007AFF';
      case 'response':
        return '#34C759';
      case 'question':
        return '#FF9500';
      case 'reaction':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  if (!visible) return null;

  const displaySuggestions = suggestions;

    return (
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: isSuggestionsMode ? '#F8F9FA' : '#F2F2F7',
            paddingVertical: isSuggestionsMode ? 0 : 12,
            paddingHorizontal: isSuggestionsMode ? 0 : 16,
            maxHeight: isSuggestionsMode ? 350 : 300,
            minHeight: isSuggestionsMode ? 300 : 0,
            position: 'relative',
            borderTopWidth: isSuggestionsMode ? 1 : 1,
            borderTopColor: isSuggestionsMode ? '#E5E7EB' : '#E5E5EA',
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
            opacity: slideAnim,
          },
        ]}
      >
        {!isSuggestionsMode && (
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="bulb" size={16} color="#007AFF" />
              <Text style={styles.headerTitle}>{t('smartSuggestions')}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={16} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        )}
        

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>{t('generatingSuggestions')}</Text>
        </View>
      ) : (
         <View style={{ flex: 1 }} pointerEvents="box-none">
           <ScrollView
             showsVerticalScrollIndicator={false}
             contentContainerStyle={[
               styles.suggestionsContainer,
               isSuggestionsMode && { 
                 paddingHorizontal: 12, 
                 paddingVertical: 12,
                 paddingBottom: 20
               }
             ]}
             pointerEvents="box-none"
             keyboardShouldPersistTaps="handled"
             keyboardDismissMode="none"
           >
          
          {suggestions.map((suggestion) => (
            <View key={suggestion.id} style={[
              styles.suggestionWrapper,
              isSuggestionsMode && { marginBottom: 8 }
            ]}>
              {suggestion.languageOptions ? (
                // Vertical dual-button structure for 1-on-1 chats with language options
                <View style={styles.suggestionGroup}>
                  <View style={styles.verticalButtonContainer}>
                    <TouchableOpacity
                      style={[styles.languageButton, styles.userLanguageButton]}
                      activeOpacity={0.7}
                      onPress={() => handleSuggestionPress({ ...suggestion, text: suggestion.languageOptions!.userLanguage })}
                    >
                      <Text style={styles.languageButtonText}>
                        {suggestion.languageOptions.userLanguage}
                      </Text>
                      <View style={styles.languageIndicator}>
                        <Text style={styles.languageIndicatorText}>
                          {getLanguageCode(userLanguage)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    
                    <View style={styles.verticalDivider}>
                      <View style={styles.verticalDividerLine} />
                      <Ionicons name="swap-vertical" size={16} color="#9CA3AF" />
                      <View style={styles.verticalDividerLine} />
                    </View>
                    
                    <TouchableOpacity
                      style={[styles.languageButton, styles.otherLanguageButton]}
                      activeOpacity={0.7}
                      onPress={() => handleSuggestionPress({ ...suggestion, text: suggestion.languageOptions!.otherLanguage })}
                    >
                      <Text style={styles.languageButtonText}>
                        {suggestion.languageOptions.otherLanguage}
                      </Text>
                      <View style={styles.languageIndicator}>
                        <Text style={styles.languageIndicatorText}>
                          {getLanguageCode(otherUserLanguage)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                // Single button for group chats or when language options not available
                <TouchableOpacity
                  style={[
                    styles.suggestionChip,
                    { 
                      borderColor: isSuggestionsMode ? '#D1D5DB' : getSuggestionColor(suggestion.type),
                      backgroundColor: isSuggestionsMode ? '#F9FAFB' : '#FFFFFF',
                      marginBottom: isSuggestionsMode ? 6 : 8,
                      paddingVertical: isSuggestionsMode ? 12 : 12,
                      paddingHorizontal: isSuggestionsMode ? 16 : 16,
                      borderRadius: isSuggestionsMode ? 8 : 12,
                      borderWidth: isSuggestionsMode ? 1 : 1,
                      shadowColor: isSuggestionsMode ? '#000' : '#000',
                      shadowOffset: isSuggestionsMode ? { width: 0, height: 1 } : { width: 0, height: 1 },
                      shadowOpacity: isSuggestionsMode ? 0.1 : 0.1,
                      shadowRadius: isSuggestionsMode ? 2 : 2,
                      elevation: isSuggestionsMode ? 2 : 2,
                    }
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleSuggestionPress(suggestion)}
                >
                  <View style={styles.suggestionContent}>
                    <Ionicons
                      name={getSuggestionIcon(suggestion.type)}
                      size={16}
                      color={getSuggestionColor(suggestion.type)}
                    />
                    <Text
                      style={[
                        styles.suggestionText,
                        { 
                          color: isSuggestionsMode ? '#374151' : getSuggestionColor(suggestion.type),
                          fontSize: isSuggestionsMode ? 16 : 16,
                          fontWeight: isSuggestionsMode ? '500' : '500',
                        }
                      ]}
                    >
                      {suggestion.text}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ))}
          </ScrollView>
        </View>
      )}
    </Animated.View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 3,
    borderTopColor: '#3B82F6',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
    marginTop: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  suggestionsContainer: {
    paddingHorizontal: 4,
  },
  suggestionChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
    lineHeight: 22,
  },
  suggestionWrapper: {
    marginBottom: 8,
  },
  suggestionGroup: {
    backgroundColor: '#FEFEFE',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  verticalButtonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  languageButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  userLanguageButton: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
    borderWidth: 2,
  },
  otherLanguageButton: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
  },
  languageIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  languageIndicatorText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  verticalDivider: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
  },
  verticalDividerLine: {
    flex: 1,
    width: 1,
    backgroundColor: '#D1D5DB',
  },
  languageButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default SmartSuggestions;
