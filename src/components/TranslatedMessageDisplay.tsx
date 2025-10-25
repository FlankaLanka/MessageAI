import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CulturalHint } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { useStore } from '../store/useStore';

interface TranslatedMessageDisplayProps {
  translation: string;
  language: string;
  isOwn: boolean;
  onClose: () => void;
  culturalHints?: CulturalHint[];
  intelligentProcessing?: {
    intent: string;
    tone: string;
    topic: string;
    entities: string[];
    language_detected: string;
    confidence?: number;
  };
}

export const TranslatedMessageDisplay: React.FC<TranslatedMessageDisplayProps> = ({
  translation,
  language,
  isOwn,
  onClose,
  culturalHints = [],
  intelligentProcessing
}) => {
  const { t } = useLocalization();
  const { translationMode } = useStore();
  const [showDetails, setShowDetails] = useState(false);
  
  
  const hasDetails = (translationMode === 'advanced' || translationMode === 'auto-advanced') && (culturalHints.length > 0 || intelligentProcessing);
  const hasCulturalHints = (translationMode === 'advanced' || translationMode === 'auto-advanced') && culturalHints.length > 0;
  const hasIntelligentProcessing = (translationMode === 'advanced' || translationMode === 'auto-advanced') && intelligentProcessing;
  

  return (
    <View style={[
      styles.container,
      isOwn ? styles.ownContainer : styles.otherContainer,
      !hasCulturalHints && styles.compactContainer
    ]}>
      <View style={styles.header}>
        <View style={styles.languageInfo}>
          <Ionicons 
            name="language" 
            size={12} 
            color={isOwn ? '#BFDBFE' : '#6B7280'} 
          />
          <Text style={[
            styles.languageLabel,
            isOwn ? styles.ownLanguageLabel : styles.otherLanguageLabel
          ]}>
            {language}
          </Text>
          {intelligentProcessing?.confidence && (
            <Text style={[
              styles.confidenceLabel,
              isOwn ? styles.ownConfidenceLabel : styles.otherConfidenceLabel
            ]}>
              {(intelligentProcessing.confidence * 100).toFixed(0)}%
            </Text>
          )}
        </View>
        <View style={styles.headerActions}>
          {hasDetails && (
            <TouchableOpacity 
              onPress={() => setShowDetails(!showDetails)} 
              style={styles.detailsButton}
            >
              <Ionicons 
                name={showDetails ? "chevron-up" : "chevron-down"} 
                size={12} 
                color={isOwn ? '#BFDBFE' : '#6B7280'} 
              />
            </TouchableOpacity>
          )}
          {translationMode !== 'auto' && translationMode !== 'auto-advanced' && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons 
                name="close" 
                size={14} 
                color={isOwn ? '#BFDBFE' : '#6B7280'} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <Text style={[
        styles.translationText,
        isOwn ? styles.ownTranslationText : styles.otherTranslationText
      ]}>
        {translation}
      </Text>

      {showDetails && hasDetails && (
        <ScrollView 
          style={[
            styles.detailsContainer,
            !hasCulturalHints && styles.compactDetailsContainer
          ]} 
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
          scrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {intelligentProcessing && (
            <View style={[
              styles.intelligentProcessing,
              !hasCulturalHints && styles.compactIntelligentProcessing
            ]}>
              <Text style={[
                styles.detailsTitle,
                isOwn ? styles.ownDetailsTitle : styles.otherDetailsTitle
              ]}>
                🧠 {t('aiAnalysis')}
              </Text>
              <View style={[
                styles.processingGrid,
                !hasCulturalHints && styles.compactProcessingGrid
              ]}>
                <View style={[
                  styles.processingItem,
                  !hasCulturalHints && styles.compactProcessingItem
                ]}>
                  <Text style={[
                    styles.processingLabel,
                    isOwn ? styles.ownProcessingLabel : styles.otherProcessingLabel
                  ]}>
                    {t('intent')}:
                  </Text>
                  <Text style={[
                    styles.processingValue,
                    isOwn ? styles.ownProcessingValue : styles.otherProcessingValue
                  ]}>
                    {intelligentProcessing.intent}
                  </Text>
                </View>
                <View style={[
                  styles.processingItem,
                  !hasCulturalHints && styles.compactProcessingItem
                ]}>
                  <Text style={[
                    styles.processingLabel,
                    isOwn ? styles.ownProcessingLabel : styles.otherProcessingLabel
                  ]}>
                    {t('tone')}:
                  </Text>
                  <Text style={[
                    styles.processingValue,
                    isOwn ? styles.ownProcessingValue : styles.otherProcessingValue
                  ]}>
                    {intelligentProcessing.tone}
                  </Text>
                </View>
                <View style={[
                  styles.processingItem,
                  !hasCulturalHints && styles.compactProcessingItem
                ]}>
                  <Text style={[
                    styles.processingLabel,
                    isOwn ? styles.ownProcessingLabel : styles.otherProcessingLabel
                  ]}>
                    {t('topic')}:
                  </Text>
                  <Text style={[
                    styles.processingValue,
                    isOwn ? styles.ownProcessingValue : styles.otherProcessingValue
                  ]}>
                    {intelligentProcessing.topic}
                  </Text>
                </View>
                {intelligentProcessing.entities.length > 0 && (
                  <View style={[
                  styles.processingItem,
                  !hasCulturalHints && styles.compactProcessingItem
                ]}>
                    <Text style={[
                      styles.processingLabel,
                      isOwn ? styles.ownProcessingLabel : styles.otherProcessingLabel
                    ]}>
                      {t('entities')}:
                    </Text>
                    <Text style={[
                      styles.processingValue,
                      isOwn ? styles.ownProcessingValue : styles.otherProcessingValue
                    ]}>
                      {intelligentProcessing.entities.join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {culturalHints.length > 0 && (
            <View style={styles.culturalHints}>
              <Text style={[
                styles.detailsTitle,
                isOwn ? styles.ownDetailsTitle : styles.otherDetailsTitle
              ]}>
                🌍 {t('culturalHints')} ({culturalHints.length})
              </Text>
              <View style={styles.hintsContainer}>
                {culturalHints.map((hint, index) => (
                  <View key={index} style={styles.hintItem}>
                    <View style={styles.hintHeader}>
                      <Text style={[
                        styles.hintTerm,
                        isOwn ? styles.ownHintTerm : styles.otherHintTerm
                      ]}>
                        "{hint.term}"
                      </Text>
                      <Text style={[
                        styles.hintType,
                        isOwn ? styles.ownHintType : styles.otherHintType
                      ]}>
                        ({hint.type})
                      </Text>
                    </View>
                    <Text style={[
                      styles.hintExplanation,
                      isOwn ? styles.ownHintExplanation : styles.otherHintExplanation
                    ]}>
                      {hint.explanation}
                    </Text>
                    {hint.literalMeaning && (
                      <Text style={[
                        styles.hintLiteral,
                        isOwn ? styles.ownHintLiteral : styles.otherHintLiteral
                      ]}>
                        {t('literal')}: {hint.literalMeaning}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    padding: 8, // Increased padding for better spacing
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
    maxWidth: '95%', // Increased max width for more space
    flexShrink: 1, // Allow container to shrink if needed
    minWidth: 200, // Ensure minimum width for content
  },
  ownContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  otherContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  compactContainer: {
    padding: 6, // Reduced padding when no cultural hints
    maxWidth: '85%', // Slightly smaller when compact
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageLabel: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.8,
    textTransform: 'uppercase',
  },
  ownLanguageLabel: {
    color: '#BFDBFE',
  },
  otherLanguageLabel: {
    color: '#6B7280',
  },
  confidenceLabel: {
    marginLeft: 6,
    fontSize: 9,
    fontWeight: 'bold',
    opacity: 0.7,
  },
  ownConfidenceLabel: {
    color: '#BFDBFE',
  },
  otherConfidenceLabel: {
    color: '#6B7280',
  },
  detailsButton: {
    padding: 4,
    marginRight: 4,
  },
  closeButton: {
    padding: 2,
  },
  translationText: {
    fontSize: 13,
    lineHeight: 18,
  },
  ownTranslationText: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  otherTranslationText: {
    color: '#374151',
  },
  // Details container styles
  detailsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    maxHeight: 250, // Increased height to accommodate more content
    minHeight: 0, // Ensure it can shrink
  },
  compactDetailsContainer: {
    maxHeight: 120, // Much smaller height when no cultural hints
    marginTop: 4, // Reduced margin
    paddingTop: 4, // Reduced padding
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  ownDetailsTitle: {
    color: '#BFDBFE',
  },
  otherDetailsTitle: {
    color: '#6B7280',
  },
  // Intelligent processing styles
  intelligentProcessing: {
    marginBottom: 12,
  },
  compactIntelligentProcessing: {
    marginBottom: 6, // Reduced margin when no cultural hints
  },
  processingGrid: {
    gap: 6, // Increased gap for better spacing
  },
  compactProcessingGrid: {
    gap: 3, // Reduced gap when no cultural hints
  },
  processingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    paddingVertical: 2,
  },
  compactProcessingItem: {
    marginBottom: 2, // Reduced margin when no cultural hints
    paddingVertical: 1, // Reduced padding when no cultural hints
  },
  processingLabel: {
    fontSize: 10,
    fontWeight: '600',
    width: 70, // Increased width for labels
    opacity: 0.8,
    flexShrink: 0, // Prevent label from shrinking
  },
  ownProcessingLabel: {
    color: '#BFDBFE',
  },
  otherProcessingLabel: {
    color: '#6B7280',
  },
  processingValue: {
    fontSize: 10,
    flex: 1,
    opacity: 0.9,
    flexWrap: 'wrap',
    lineHeight: 14, // Better line height for readability
  },
  ownProcessingValue: {
    color: '#FFFFFF',
  },
  otherProcessingValue: {
    color: '#374151',
  },
  // Cultural hints styles
  culturalHints: {
    marginTop: 8,
  },
  hintsContainer: {
    // Remove height limitation - let the parent ScrollView handle scrolling
    paddingTop: 4, // Add some top padding for better spacing
  },
  hintItem: {
    marginBottom: 8,
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
  },
  hintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  hintTerm: {
    fontSize: 11,
    fontWeight: 'bold',
    marginRight: 6,
  },
  ownHintTerm: {
    color: '#FFFFFF',
  },
  otherHintTerm: {
    color: '#374151',
  },
  hintType: {
    fontSize: 9,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  ownHintType: {
    color: '#BFDBFE',
  },
  otherHintType: {
    color: '#6B7280',
  },
  hintExplanation: {
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 2,
  },
  ownHintExplanation: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  otherHintExplanation: {
    color: '#374151',
  },
  hintLiteral: {
    fontSize: 9,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  ownHintLiteral: {
    color: '#BFDBFE',
  },
  otherHintLiteral: {
    color: '#6B7280',
  },
});
