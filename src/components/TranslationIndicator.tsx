import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalization } from '../hooks/useLocalization';

interface TranslationIndicatorProps {
  isOwn: boolean;
  isTranslating?: boolean;
  isAdvanced?: boolean;
}

export const TranslationIndicator: React.FC<TranslationIndicatorProps> = ({
  isOwn,
  isTranslating = false,
  isAdvanced = false
}) => {
  const { t } = useLocalization();

  if (!isTranslating) return null;

  return (
    <View style={[
      styles.container,
      isOwn ? styles.ownContainer : styles.otherContainer
    ]}>
      <ActivityIndicator 
        size="small" 
        color={isOwn ? '#BFDBFE' : '#6B7280'} 
        style={styles.spinner}
      />
      <Text style={[
        styles.text,
        isOwn ? styles.ownText : styles.otherText
      ]}>
        {isAdvanced ? t('analyzingWithAI') : t('translating')}...
      </Text>
      <Ionicons 
        name="language" 
        size={12} 
        color={isOwn ? '#BFDBFE' : '#6B7280'} 
        style={styles.icon}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  ownContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  otherContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  spinner: {
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  ownText: {
    color: '#BFDBFE',
  },
  otherText: {
    color: '#6B7280',
  },
  icon: {
    marginLeft: 2,
  },
});
