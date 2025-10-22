import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { simpleTranslationService } from '../services/simpleTranslation';
import { enhancedTranslationService } from '../services/enhancedTranslation';
import { useLocalization } from '../hooks/useLocalization';
import { useStore } from '../store/useStore';
import { Message } from '../types';

interface TranslationButtonProps {
  messageId: string;
  originalText: string;
  onTranslationComplete: (messageId: string, translation: string, language: string, culturalHints?: any[], intelligentProcessing?: any) => void;
  isOwn: boolean;
  message?: Message;
  chatMessages?: Message[];
}

export const TranslationButton: React.FC<TranslationButtonProps> = ({
  messageId,
  originalText,
  onTranslationComplete,
  isOwn,
  message,
  chatMessages = []
}) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLocalization();
  const { defaultTranslationLanguage } = useStore();

  const handleTranslate = async () => {
    if (isTranslating) return;

    setIsTranslating(true);
    setError(null);

    try {
      // Try enhanced RAG translation first if we have context
      if (message && chatMessages.length > 0 && enhancedTranslationService.isAvailable()) {
        try {
          const result = await enhancedTranslationService.translateMessage(
            message,
            defaultTranslationLanguage,
            {
              useRAG: true,
              useCulturalHints: true,
              useSimpleTranslation: true,
              contextLimit: 10,
              confidenceThreshold: 0.6
            }
          );

          onTranslationComplete(
            messageId, 
            result.translation, 
            defaultTranslationLanguage,
            result.culturalHints,
            result.intelligentProcessing
          );
          return;
        } catch (ragError) {
          console.warn('RAG translation failed, falling back to simple translation:', ragError);
        }
      }

      // Fallback to simple translation
      const translation = await simpleTranslationService.translateText(originalText, defaultTranslationLanguage);
      onTranslationComplete(messageId, translation, defaultTranslationLanguage);
    } catch (err) {
      console.error('Translation error:', err);
      setError(t('translationFailed'));
    } finally {
      setIsTranslating(false);
    }
  };

  // Don't show translate button for user's own messages
  if (isOwn) {
    return null;
  }

  if (!simpleTranslationService.isAvailable()) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[
        styles.inlineButton,
        isOwn ? styles.ownInlineButton : styles.otherInlineButton,
        isTranslating && styles.disabledButton
      ]}
      onPress={handleTranslate}
      disabled={isTranslating}
    >
      {isTranslating ? (
        <ActivityIndicator 
          size="small" 
          color={isOwn ? '#FFFFFF' : '#3B82F6'} 
        />
      ) : (
        <Ionicons 
          name="language" 
          size={14} 
          color={isOwn ? '#FFFFFF' : '#3B82F6'} 
        />
      )}
      <Text style={[
        styles.inlineButtonText,
        isOwn ? styles.ownInlineButtonText : styles.otherInlineButtonText
      ]}>
        {isTranslating ? t('translating') : t('translate')}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  inlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  ownInlineButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  otherInlineButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  disabledButton: {
    opacity: 0.6,
  },
  inlineButtonText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '500',
  },
  ownInlineButtonText: {
    color: '#FFFFFF',
  },
  otherInlineButtonText: {
    color: '#3B82F6',
  },
});
