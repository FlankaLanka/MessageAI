import { CulturalHint } from '../types';
import { culturalHintsService } from './culturalHints';

/**
 * Enhanced Cultural Hints Detection Service
 * Provides advanced cultural context detection for slangs, idioms, and cultural references
 */

export interface CulturalAnalysis {
  text: string;
  language: string;
  hints: CulturalHint[];
  confidence: number;
  analysisTime: number;
}

export interface CulturalContext {
  slang: CulturalHint[];
  idioms: CulturalHint[];
  cultural: CulturalHint[];
  references: CulturalHint[];
}

class EnhancedCulturalHintsService {
  private readonly MIN_CONFIDENCE = 0.7;
  private readonly MAX_HINTS_PER_TEXT = 10;

  /**
   * Analyze text for cultural hints with enhanced detection
   */
  async analyzeText(
    text: string,
    language: string,
    options: {
      includeSlang?: boolean;
      includeIdioms?: boolean;
      includeCultural?: boolean;
      includeReferences?: boolean;
      maxHints?: number;
    } = {}
  ): Promise<CulturalAnalysis> {
    const startTime = Date.now();
    
    const {
      includeSlang = true,
      includeIdioms = true,
      includeCultural = true,
      includeReferences = true,
      maxHints = this.MAX_HINTS_PER_TEXT
    } = options;

    try {
      // Get cultural hints using the enhanced service
      const hints = await culturalHintsService.getCulturalHints(text, language);
      
      // Filter hints based on options
      const filteredHints = hints.filter(hint => {
        switch (hint.type) {
          case 'slang': return includeSlang;
          case 'idiom': return includeIdioms;
          case 'cultural': return includeCultural;
          case 'reference': return includeReferences;
          default: return true;
        }
      });

      // Limit number of hints
      const limitedHints = filteredHints.slice(0, maxHints);

      // Calculate confidence based on hint quality and quantity
      const confidence = this.calculateConfidence(limitedHints, text);

      const analysisTime = Date.now() - startTime;

      return {
        text,
        language,
        hints: limitedHints,
        confidence,
        analysisTime
      };
    } catch (error) {
      console.error('Enhanced cultural analysis failed:', error);
      return {
        text,
        language,
        hints: [],
        confidence: 0,
        analysisTime: Date.now() - startTime
      };
    }
  }

  /**
   * Get cultural context organized by type
   */
  async getCulturalContext(
    text: string,
    language: string
  ): Promise<CulturalContext> {
    const analysis = await this.analyzeText(text, language);
    
    return {
      slang: analysis.hints.filter(h => h.type === 'slang'),
      idioms: analysis.hints.filter(h => h.type === 'idiom'),
      cultural: analysis.hints.filter(h => h.type === 'cultural'),
      references: analysis.hints.filter(h => h.type === 'reference')
    };
  }

  /**
   * Detect slang terms in text
   */
  async detectSlang(text: string, language: string): Promise<CulturalHint[]> {
    const analysis = await this.analyzeText(text, language, {
      includeSlang: true,
      includeIdioms: false,
      includeCultural: false,
      includeReferences: false
    });
    
    return analysis.hints;
  }

  /**
   * Detect idioms in text
   */
  async detectIdioms(text: string, language: string): Promise<CulturalHint[]> {
    const analysis = await this.analyzeText(text, language, {
      includeSlang: false,
      includeIdioms: true,
      includeCultural: false,
      includeReferences: false
    });
    
    return analysis.hints;
  }

  /**
   * Detect cultural references in text
   */
  async detectCulturalReferences(text: string, language: string): Promise<CulturalHint[]> {
    const analysis = await this.analyzeText(text, language, {
      includeSlang: false,
      includeIdioms: false,
      includeCultural: true,
      includeReferences: true
    });
    
    return analysis.hints;
  }

  /**
   * Get hints for specific terms
   */
  async getHintsForTerms(
    text: string,
    language: string,
    terms: string[]
  ): Promise<CulturalHint[]> {
    const analysis = await this.analyzeText(text, language);
    
    return analysis.hints.filter(hint => 
      terms.some(term => 
        hint.term.toLowerCase().includes(term.toLowerCase()) ||
        term.toLowerCase().includes(hint.term.toLowerCase())
      )
    );
  }

  /**
   * Calculate confidence score for cultural hints
   */
  private calculateConfidence(hints: CulturalHint[], text: string): number {
    if (hints.length === 0) return 0;

    let confidence = 0;
    
    // Base confidence on hint quality
    for (const hint of hints) {
      let hintConfidence = 0.5; // Base confidence
      
      // Higher confidence for longer explanations
      if (hint.explanation.length > 100) hintConfidence += 0.2;
      if (hint.explanation.length > 200) hintConfidence += 0.1;
      
      // Higher confidence for hints with literal meanings
      if (hint.literalMeaning) hintConfidence += 0.1;
      
      // Higher confidence for specific hint types
      switch (hint.type) {
        case 'idiom': hintConfidence += 0.2; break;
        case 'cultural': hintConfidence += 0.15; break;
        case 'slang': hintConfidence += 0.1; break;
        case 'reference': hintConfidence += 0.05; break;
      }
      
      confidence += Math.min(hintConfidence, 1.0);
    }
    
    // Average confidence
    confidence = confidence / hints.length;
    
    // Adjust based on text length (longer texts might have more context)
    const textLengthFactor = Math.min(text.length / 100, 1.0);
    confidence = confidence * (0.7 + 0.3 * textLengthFactor);
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Get hint statistics
   */
  getHintStatistics(hints: CulturalHint[]): {
    total: number;
    byType: Record<CulturalHint['type'], number>;
    averageExplanationLength: number;
    hintsWithLiteralMeaning: number;
  } {
    const byType = hints.reduce((acc, hint) => {
      acc[hint.type] = (acc[hint.type] || 0) + 1;
      return acc;
    }, {} as Record<CulturalHint['type'], number>);

    const averageExplanationLength = hints.length > 0 
      ? hints.reduce((sum, hint) => sum + hint.explanation.length, 0) / hints.length
      : 0;

    const hintsWithLiteralMeaning = hints.filter(hint => hint.literalMeaning).length;

    return {
      total: hints.length,
      byType,
      averageExplanationLength,
      hintsWithLiteralMeaning
    };
  }

  /**
   * Validate cultural hint quality
   */
  validateHintQuality(hint: CulturalHint): {
    isValid: boolean;
    score: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 1.0;

    // Check term presence
    if (!hint.term || hint.term.trim().length === 0) {
      issues.push('Missing term');
      score -= 0.3;
    }

    // Check explanation quality
    if (!hint.explanation || hint.explanation.trim().length < 20) {
      issues.push('Explanation too short');
      score -= 0.2;
    }

    if (hint.explanation && hint.explanation.length > 500) {
      issues.push('Explanation too long');
      score -= 0.1;
    }

    // Check type validity
    if (!['slang', 'idiom', 'cultural', 'reference'].includes(hint.type)) {
      issues.push('Invalid hint type');
      score -= 0.2;
    }

    // Check literal meaning if provided
    if (hint.literalMeaning && hint.literalMeaning.length < 5) {
      issues.push('Literal meaning too short');
      score -= 0.1;
    }

    return {
      isValid: issues.length === 0,
      score: Math.max(score, 0),
      issues
    };
  }

  /**
   * Get enhanced cultural hints for translation
   */
  async getEnhancedHintsForTranslation(
    originalText: string,
    translatedText: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<{
    originalHints: CulturalHint[];
    translatedHints: CulturalHint[];
    combinedHints: CulturalHint[];
  }> {
    const [originalAnalysis, translatedAnalysis] = await Promise.all([
      this.analyzeText(originalText, sourceLanguage),
      this.analyzeText(translatedText, targetLanguage)
    ]);

    // Combine hints and remove duplicates
    const combinedHints = this.removeDuplicateHints([
      ...originalAnalysis.hints,
      ...translatedAnalysis.hints
    ]);

    return {
      originalHints: originalAnalysis.hints,
      translatedHints: translatedAnalysis.hints,
      combinedHints
    };
  }

  /**
   * Remove duplicate hints
   */
  private removeDuplicateHints(hints: CulturalHint[]): CulturalHint[] {
    const uniqueHints = new Map<string, CulturalHint>();
    
    for (const hint of hints) {
      const key = hint.term.toLowerCase().trim();
      if (!uniqueHints.has(key) || hint.explanation.length > (uniqueHints.get(key)?.explanation.length || 0)) {
        uniqueHints.set(key, hint);
      }
    }
    
    return Array.from(uniqueHints.values());
  }
}

// Export singleton instance
export const enhancedCulturalHintsService = new EnhancedCulturalHintsService();
export default enhancedCulturalHintsService;
