import { CulturalHint } from '../types';

/**
 * Sort cultural hints by their position in the text
 */
export function sortHintsByPosition(
  text: string,
  hints: CulturalHint[]
): (CulturalHint & { index: number })[] {
  return hints
    .map(hint => ({
      ...hint,
      index: text.toLowerCase().indexOf(hint.term.toLowerCase())
    }))
    .filter(hint => hint.index !== -1)
    .sort((a, b) => a.index - b.index);
}

/**
 * Check if two hints overlap in the text
 */
export function hintsOverlap(
  hint1: CulturalHint & { index: number },
  hint2: CulturalHint & { index: number }
): boolean {
  const hint1End = hint1.index + hint1.term.length;
  const hint2End = hint2.index + hint2.term.length;
  
  return (
    (hint1.index >= hint2.index && hint1.index < hint2End) ||
    (hint1End > hint2.index && hint1End <= hint2End) ||
    (hint1.index <= hint2.index && hint1End >= hint2End)
  );
}

/**
 * Resolve overlapping hints by keeping the longer one
 */
export function resolveOverlappingHints(
  text: string,
  hints: CulturalHint[]
): CulturalHint[] {
  const sortedHints = sortHintsByPosition(text, hints);
  const resolvedHints: CulturalHint[] = [];
  
  for (let i = 0; i < sortedHints.length; i++) {
    const currentHint = sortedHints[i];
    let shouldKeep = true;
    
    // Check if this hint overlaps with any already resolved hint
    for (const resolvedHint of resolvedHints) {
      const resolvedHintWithIndex = {
        ...resolvedHint,
        index: text.toLowerCase().indexOf(resolvedHint.term.toLowerCase())
      };
      
      if (hintsOverlap(currentHint, resolvedHintWithIndex)) {
        // Keep the longer hint
        if (currentHint.term.length > resolvedHint.term.length) {
          // Remove the shorter resolved hint and keep current
          const index = resolvedHints.indexOf(resolvedHint);
          resolvedHints.splice(index, 1);
        } else {
          // Keep the resolved hint, skip current
          shouldKeep = false;
          break;
        }
      }
    }
    
    if (shouldKeep) {
      resolvedHints.push({
        term: currentHint.term,
        type: currentHint.type,
        explanation: currentHint.explanation,
        literalMeaning: currentHint.literalMeaning
      });
    }
  }
  
  return resolvedHints;
}

/**
 * Format cultural hint for display
 */
export function formatCulturalHint(hint: CulturalHint): {
  displayTerm: string;
  typeLabel: string;
  explanation: string;
  literalMeaning?: string;
} {
  return {
    displayTerm: `"${hint.term}"`,
    typeLabel: hint.type.toUpperCase(),
    explanation: hint.explanation,
    literalMeaning: hint.literalMeaning
  };
}

/**
 * Get hint type color
 */
export function getHintTypeColor(type: CulturalHint['type']): string {
  switch (type) {
    case 'slang':
      return '#EF4444';
    case 'idiom':
      return '#F59E0B';
    case 'cultural':
      return '#8B5CF6';
    case 'reference':
      return '#06B6D4';
    default:
      return '#6B7280';
  }
}

/**
 * Get hint type background color
 */
export function getHintTypeBackgroundColor(type: CulturalHint['type']): string {
  switch (type) {
    case 'slang':
      return '#FEF2F2';
    case 'idiom':
      return '#FFFBEB';
    case 'cultural':
      return '#F3E8FF';
    case 'reference':
      return '#ECFEFF';
    default:
      return '#F9FAFB';
  }
}

/**
 * Validate cultural hint data
 */
export function validateCulturalHint(hint: any): hint is CulturalHint {
  return (
    typeof hint === 'object' &&
    typeof hint.term === 'string' &&
    typeof hint.type === 'string' &&
    ['slang', 'idiom', 'cultural', 'reference'].includes(hint.type) &&
    typeof hint.explanation === 'string' &&
    (hint.literalMeaning === undefined || typeof hint.literalMeaning === 'string')
  );
}

/**
 * Filter hints by type
 */
export function filterHintsByType(
  hints: CulturalHint[],
  type: CulturalHint['type']
): CulturalHint[] {
  return hints.filter(hint => hint.type === type);
}

/**
 * Get hint statistics
 */
export function getHintStatistics(hints: CulturalHint[]): {
  total: number;
  byType: Record<CulturalHint['type'], number>;
} {
  const byType = hints.reduce((acc, hint) => {
    acc[hint.type] = (acc[hint.type] || 0) + 1;
    return acc;
  }, {} as Record<CulturalHint['type'], number>);

  return {
    total: hints.length,
    byType
  };
}

/**
 * Merge cultural hints from multiple sources
 */
export function mergeCulturalHints(...hintArrays: CulturalHint[][]): CulturalHint[] {
  const allHints = hintArrays.flat();
  const uniqueHints = new Map<string, CulturalHint>();
  
  for (const hint of allHints) {
    const key = hint.term.toLowerCase();
    if (!uniqueHints.has(key) || hint.explanation.length > (uniqueHints.get(key)?.explanation.length || 0)) {
      uniqueHints.set(key, hint);
    }
  }
  
  return Array.from(uniqueHints.values());
}

/**
 * Check if text contains cultural hints
 */
export function hasCulturalHints(text: string, hints: CulturalHint[]): boolean {
  return hints.some(hint => 
    text.toLowerCase().includes(hint.term.toLowerCase())
  );
}

/**
 * Get hints that match text
 */
export function getMatchingHints(text: string, hints: CulturalHint[]): CulturalHint[] {
  return hints.filter(hint => 
    text.toLowerCase().includes(hint.term.toLowerCase())
  );
}
