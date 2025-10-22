import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CulturalHint } from '../types';

export interface RenderedTextSegment {
  type: 'text' | 'hint';
  content: string;
  hint?: CulturalHint;
  startIndex: number;
  endIndex: number;
}

/**
 * Parse text and identify cultural hint terms
 */
export function parseTextWithHints(
  text: string,
  hints: CulturalHint[]
): RenderedTextSegment[] {
  if (!hints.length) {
    return [{
      type: 'text',
      content: text,
      startIndex: 0,
      endIndex: text.length
    }];
  }

  // Sort hints by position in text
  const sortedHints = hints
    .map(hint => ({
      ...hint,
      index: text.toLowerCase().indexOf(hint.term.toLowerCase())
    }))
    .filter(hint => hint.index !== -1)
    .sort((a, b) => a.index - b.index);

  if (sortedHints.length === 0) {
    return [{
      type: 'text',
      content: text,
      startIndex: 0,
      endIndex: text.length
    }];
  }

  const segments: RenderedTextSegment[] = [];
  let lastIndex = 0;

  sortedHints.forEach((hint) => {
    // Add text before hint
    if (hint.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.substring(lastIndex, hint.index),
        startIndex: lastIndex,
        endIndex: hint.index
      });
    }

    // Add hint segment
    segments.push({
      type: 'hint',
      content: text.substring(hint.index, hint.index + hint.term.length),
      hint,
      startIndex: hint.index,
      endIndex: hint.index + hint.term.length
    });

    lastIndex = hint.index + hint.term.length;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.substring(lastIndex),
      startIndex: lastIndex,
      endIndex: text.length
    });
  }

  return segments;
}

/**
 * Render text with cultural hints as React components
 */
export function renderTextWithHints(
  text: string,
  hints: CulturalHint[],
  onHintPress: (hint: CulturalHint) => void,
  isOriginal: boolean = true
): React.ReactNode {
  const segments = parseTextWithHints(text, hints);

  return segments.map((segment, index) => {
    if (segment.type === 'text') {
      return (
        <Text key={`text-${index}`} style={styles.messageText}>
          {segment.content}
        </Text>
      );
    }

    // Render hint with underline and info button
    return (
      <View key={`hint-${index}`} style={styles.hintContainer}>
        <Text style={[styles.messageText, styles.underlinedText]}>
          {segment.content}
        </Text>
        <TouchableOpacity
          style={[
            styles.infoButton,
            isOriginal ? styles.infoButtonOriginal : styles.infoButtonTranslation
          ]}
          onPress={() => onHintPress(segment.hint!)}
        >
          <Ionicons name="information-circle" size={12} color="white" />
        </TouchableOpacity>
      </View>
    );
  });
}

/**
 * Get hint type styling
 */
export function getHintTypeStyle(type: CulturalHint['type']) {
  switch (type) {
    case 'slang':
      return { color: '#EF4444', backgroundColor: '#FEF2F2' };
    case 'idiom':
      return { color: '#F59E0B', backgroundColor: '#FFFBEB' };
    case 'cultural':
      return { color: '#8B5CF6', backgroundColor: '#F3E8FF' };
    case 'reference':
      return { color: '#06B6D4', backgroundColor: '#ECFEFF' };
    default:
      return { color: '#6B7280', backgroundColor: '#F9FAFB' };
  }
}

/**
 * Get hint type icon
 */
export function getHintTypeIcon(type: CulturalHint['type']): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'slang':
      return 'chatbubble-outline';
    case 'idiom':
      return 'book-outline';
    case 'cultural':
      return 'people-outline';
    case 'reference':
      return 'link-outline';
    default:
      return 'information-circle-outline';
  }
}

const styles = {
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    color: '#111827',
  },
  hintContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    display: 'inline-flex' as const,
  },
  underlinedText: {
    textDecorationLine: 'underline' as const,
    textDecorationStyle: 'dotted' as const,
  },
  infoButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginLeft: 4,
  },
  infoButtonOriginal: {
    backgroundColor: '#3B82F6',
  },
  infoButtonTranslation: {
    backgroundColor: '#6B7280',
  },
};
