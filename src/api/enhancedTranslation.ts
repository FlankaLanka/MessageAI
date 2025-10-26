import { Translation, CulturalHint, Message } from '../types';
import { ragTranslationService, RAGContext, UserPreferences, RAGTranslationResult } from './ragTranslation';
import { simpleTranslationService } from './simpleTranslation';
import { culturalHintsService } from './culturalHints';
import { useStore } from '../store/useStore';

/**
 * Enhanced Translation Service
 * Integrates RAG-based intelligent translation with existing MessageAI translation system
 * Provides seamless fallback and comprehensive translation capabilities
 */

export interface EnhancedTranslationOptions {
  useRAG?: boolean;
  useCulturalHints?: boolean;
  useSimpleTranslation?: boolean;
  contextLimit?: number;
  confidenceThreshold?: number;
}

export interface EnhancedTranslationResult {
  translation: string;
  culturalHints: CulturalHint[];
  intelligentProcessing?: {
    intent: string;
    tone: string;
    topic: string;
    entities: string[];
    language_detected: string;
    confidence?: number;
  };
  method: 'rag' | 'simple' | 'fallback';
  contextUsed?: string[];
}

class EnhancedTranslationService {
  private defaultOptions: EnhancedTranslationOptions = {
    useRAG: true,
    useCulturalHints: true,
    useSimpleTranslation: true,
    contextLimit: 10,
    confidenceThreshold: 0.7
  };

  /**
   * Main translation method with intelligent routing
   */
  async translateMessage(
    message: Message,
    targetLanguage: string,
    options: EnhancedTranslationOptions = {}
  ): Promise<EnhancedTranslationResult> {
    
    const opts = { ...this.defaultOptions, ...options };
    
    // Check cache first
    const store = useStore.getState();
    // For voice messages, use transcription; for text messages, use text
    const messageText = message.transcription || message.text || '';
    
    // Get current translation mode for cache key
    const currentTranslationMode = store.translationMode;
    const textHash = this.createTextHash(messageText, currentTranslationMode);
    const cachedTranslation = store.getCachedTranslation(textHash, targetLanguage);
    const cachedHints = store.getCachedCulturalHints(textHash);
    const cachedProcessing = store.getCachedIntelligentProcessing(textHash);
    
    // Use cached data if available (flexible validation)
    if (cachedTranslation) {
      return {
        translation: cachedTranslation.text,
        culturalHints: cachedHints || [],
        intelligentProcessing: cachedProcessing || null,
        method: 'rag',
        contextUsed: []
      };
    } else {
    }
    
    try {
      // Step 1: Prepare RAG context from conversation history
      const ragContext = await this.prepareRAGContext(message, opts.contextLimit || 10);
      
      // Step 2: Set up user preferences
      const userPreferences: UserPreferences = {
        target_language: targetLanguage,
        tone: 'casual',
        context_awareness: true,
        cultural_hints: opts.useCulturalHints
      };

      // Step 3: Try RAG translation first if enabled
      
      // Check environment variables
      
      if (opts.useRAG) {
        try {
          
          const ragResult = await ragTranslationService.translateWithRAG(
            messageText,
            ragContext,
            userPreferences
          );

          // Check confidence threshold (use lower threshold for better AI analysis)
          if (ragResult.intelligent_processing.confidence && 
              ragResult.intelligent_processing.confidence >= (opts.confidenceThreshold || 0.5)) {
            
            const result = {
              translation: ragResult.translation,
              culturalHints: ragResult.cultural_hints || [],
              intelligentProcessing: ragResult.intelligent_processing,
              method: 'rag' as const,
              contextUsed: ragResult.context_used
            };
            
            // Cache the result
            store.cacheTranslation(textHash, targetLanguage, {
              text: ragResult.translation,
              lang: targetLanguage
            });
            store.cacheCulturalHints(textHash, ragResult.cultural_hints || []);
            store.cacheIntelligentProcessing(textHash, ragResult.intelligent_processing);
            
            return result;
          } else {
          }
        } catch (error) {
          console.warn('RAG translation failed, falling back:', error);
        }
      }

      // Step 4: Fallback to simple translation
      if (opts.useSimpleTranslation) {
        try {
          const simpleResult = await this.performSimpleTranslation(
            message,
            targetLanguage,
            opts.useCulturalHints || false
          );
          
          const result = {
            ...simpleResult,
            method: 'simple' as const
          };
          
          // Cache the result
          store.cacheTranslation(textHash, targetLanguage, {
            text: simpleResult.translation,
            lang: targetLanguage
          });
          store.cacheCulturalHints(textHash, simpleResult.culturalHints);
          
          return result;
        } catch (error) {
          console.warn('Simple translation failed:', error);
        }
      }

      // Step 5: Final fallback
      return this.createFallbackResult(message, targetLanguage);

    } catch (error) {
      console.error('Enhanced translation error:', error);
      return this.createFallbackResult(message, targetLanguage);
    }
  }

  /**
   * Prepare RAG context from conversation history using Supabase Vector
   */
  private async prepareRAGContext(message: Message, limit: number): Promise<RAGContext> {
    try {
      
      // Use Supabase Vector to retrieve relevant conversation context
      const ragTranslationService = (await import('./ragTranslation')).ragTranslationService;
      // For voice messages, use transcription; for text messages, use text
      const messageText = message.transcription || message.text || '';
      const context = await ragTranslationService.retrieveConversationContext(
        message.chatId,
        messageText,
        limit
      );


      return context;
    } catch (error) {
      console.error('🔤 EnhancedTranslationService - Error preparing RAG context:', error);
      return { messages: [] };
    }
  }

  /**
   * Perform simple translation with cultural hints
   */
  private async performSimpleTranslation(
    message: Message,
    targetLanguage: string,
    includeCulturalHints: boolean
  ): Promise<EnhancedTranslationResult> {
    // For voice messages, use transcription; for text messages, use text
    const text = message.transcription || message.text || '';
    
    if (includeCulturalHints) {
      const result = await simpleTranslationService.translateWithCulturalHints(
        text,
        targetLanguage
      );
      
      return {
        translation: result.translation,
        culturalHints: result.culturalHints,
        method: 'simple'
      };
    } else {
      const translation = await simpleTranslationService.translateText(text, targetLanguage);
      
      return {
        translation,
        culturalHints: [],
        method: 'simple'
      };
    }
  }

  /**
   * Create fallback result when all translation methods fail
   */
  private createFallbackResult(message: Message, targetLanguage: string): EnhancedTranslationResult {
    return {
      translation: message.text || '',
      culturalHints: [],
      method: 'fallback'
    };
  }

  /**
   * Translate voice message with transcription
   */
  async translateVoiceMessage(
    message: Message,
    targetLanguage: string,
    options: EnhancedTranslationOptions = {}
  ): Promise<EnhancedTranslationResult> {
    // First, ensure we have transcription
    if (!message.transcription) {
      throw new Error('Voice message transcription not available');
    }

    // Create a text message from transcription for translation
    const textMessage: Message = {
      ...message,
      text: message.transcription
    };

    return this.translateMessage(textMessage, targetLanguage, options);
  }

  /**
   * Batch translate multiple messages
   */
  async translateMessages(
    messages: Message[],
    targetLanguage: string,
    options: EnhancedTranslationOptions = {}
  ): Promise<EnhancedTranslationResult[]> {
    const results: EnhancedTranslationResult[] = [];
    
    for (const message of messages) {
      try {
        const result = await this.translateMessage(message, targetLanguage, options);
        results.push(result);
      } catch (error) {
        console.error(`Translation failed for message ${message.id}:`, error);
        results.push(this.createFallbackResult(message, targetLanguage));
      }
    }
    
    return results;
  }

  /**
   * Get translation statistics
   */
  async getTranslationStats(): Promise<{
    totalTranslations: number;
    ragTranslations: number;
    simpleTranslations: number;
    fallbackTranslations: number;
    averageConfidence: number;
  }> {
    // This would typically query a database for translation statistics
    // For now, return mock data
    return {
      totalTranslations: 0,
      ragTranslations: 0,
      simpleTranslations: 0,
      fallbackTranslations: 0,
      averageConfidence: 0.8
    };
  }

  /**
   * Clear translation cache
   */
  async clearCache(): Promise<void> {
    try {
      await culturalHintsService.clearExpiredCache();
    } catch (error) {
      console.error('Error clearing translation cache:', error);
    }
  }

  /**
   * Check if enhanced translation is available
   */
  isAvailable(): boolean {
    return ragTranslationService.isAvailable() || simpleTranslationService.isAvailable();
  }

  /**
   * Get available languages
   */
  getAvailableLanguages() {
    return ragTranslationService.getAvailableLanguages();
  }

  /**
   * Update translation options
   */
  updateOptions(newOptions: Partial<EnhancedTranslationOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...newOptions };
  }

  /**
   * Get current options
   */
  getOptions(): EnhancedTranslationOptions {
    return { ...this.defaultOptions };
  }

  /**
   * Create a hash for text to use as cache key
   * Includes translation mode to ensure different modes have separate cache entries
   */
  private createTextHash(text: string, translationMode?: string): string {
    // Include translation mode in hash to separate cache entries by mode
    const textWithMode = translationMode ? `${text}|${translationMode}` : text;
    
    // Simple hash function for text
    let hash = 0;
    for (let i = 0; i < textWithMode.length; i++) {
      const char = textWithMode.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }
}

// Export singleton instance
export const enhancedTranslationService = new EnhancedTranslationService();
export default enhancedTranslationService;
