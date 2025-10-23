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
import { SmartSuggestion, smartSuggestionsService } from '../services/smartSuggestions';
import { Message } from '../types';
import { useLocalization } from '../hooks/useLocalization';

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
  userLanguage
}) => {
  const { t } = useLocalization();
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));

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

      console.log('SmartSuggestions Component Debug:', {
        userLanguage,
        otherUserLanguage,
        isDirectChat,
        context
      });
      
      const newSuggestions = await smartSuggestionsService.generateSuggestions(context);
      console.log('Generated suggestions:', newSuggestions);
      setSuggestions(newSuggestions.slice(0, 3));
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleSuggestionPress = (suggestion: SmartSuggestion) => {
    onSuggestionSelect(suggestion.text);
    onClose();
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
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="bulb" size={16} color="#007AFF" />
            <Text style={styles.headerTitle}>{t('smartSuggestions')}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={16} color="#8E8E93" />
          </TouchableOpacity>
        </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingText}>{t('generatingSuggestions')}</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsContainer}
        >
          {suggestions.map((suggestion) => (
            <View key={suggestion.id} style={styles.suggestionWrapper}>
              <TouchableOpacity
                style={[
                  styles.suggestionChip,
                  { borderColor: getSuggestionColor(suggestion.type) }
                ]}
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
                      { color: getSuggestionColor(suggestion.type) }
                    ]}
                    numberOfLines={3}
                  >
                    {suggestion.text}
                  </Text>
                  {suggestion.confidence > 0.8 && (
                    <View style={styles.confidenceBadge}>
                      <Text style={styles.confidenceText}>
                        {Math.round(suggestion.confidence * 100)}%
                      </Text>
                    </View>
                  )}
                </View>
                {suggestion.context && (
                  <Text style={styles.contextText}>{suggestion.context}</Text>
                )}
                {suggestion.reasoning && (
                  <Text style={styles.reasoningText}>{suggestion.reasoning}</Text>
                )}
              </TouchableOpacity>
              
              {/* Language Options */}
              {suggestion.languageOptions && (
                <View style={styles.languageOptions}>
                  <TouchableOpacity
                    style={styles.languageOption}
                    onPress={() => handleSuggestionPress({ ...suggestion, text: suggestion.languageOptions!.userLanguage })}
                  >
                    <Text style={styles.languageOptionText}>
                      {suggestion.languageOptions.userLanguage}
                    </Text>
                    <Text style={styles.languageLabel}>Your language</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.languageOption}
                    onPress={() => handleSuggestionPress({ ...suggestion, text: suggestion.languageOptions!.otherLanguage })}
                  >
                    <Text style={styles.languageOptionText}>
                      {suggestion.languageOptions.otherLanguage}
                    </Text>
                    <Text style={styles.languageLabel}>Their language</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </Animated.View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F2F2F7',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 6,
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
  confidenceBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contextText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    fontStyle: 'italic',
  },
  reasoningText: {
    fontSize: 11,
    color: '#007AFF',
    marginTop: 2,
    fontWeight: '500',
  },
  suggestionWrapper: {
    marginBottom: 8,
  },
  languageOptions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  languageOption: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  languageOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 4,
  },
  languageLabel: {
    fontSize: 11,
    color: '#6C757D',
    fontWeight: '500',
  },
});

export default SmartSuggestions;
