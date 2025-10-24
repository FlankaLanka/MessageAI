import { Translation, CulturalHint } from '../types';
import { culturalHintsService } from './culturalHints';
import { enhancedTranslationService } from './enhancedTranslation';
import { useStore } from '../store/useStore';

/**
 * Simple Translation Service
 * Real-time translation with OpenAI API
 * No complex caching or batch processing
 */

class SimpleTranslationService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
  }

  /**
   * Translate text to target language
   */
  async translateText(text: string, targetLang: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Check cache first
    const store = useStore.getState();
    const textHash = this.createTextHash(text);
    const cached = store.getCachedTranslation(textHash, targetLang);
    if (cached) {
      console.log('Using cached translation for:', text.substring(0, 50));
      return cached.text;
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a professional translator. Translate the following text to ${targetLang}. Return only the translation, no explanations.`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }

      const result = await response.json();
      const translation = result.choices[0].message.content.trim();
      
      // Cache the translation
      store.cacheTranslation(textHash, targetLang, {
        text: translation,
        lang: targetLang
      });
      
      return translation;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  /**
   * Translate text with cultural hints
   */
  async translateWithCulturalHints(
    text: string, 
    targetLang: string, 
    sourceLang?: string
  ): Promise<{ translation: string; culturalHints: CulturalHint[] }> {
    // Get translation
    const translation = await this.translateText(text, targetLang);
    
    // Get cultural hints for both original and translated text
    const [originalHints, translatedHints] = await Promise.all([
      culturalHintsService.getCulturalHints(text, sourceLang || 'EN'),
      culturalHintsService.getCulturalHints(translation, targetLang)
    ]);

    // Combine hints and remove duplicates
    const allHints = [...originalHints, ...translatedHints];
    const uniqueHints = this.removeDuplicateHints(allHints);

    return {
      translation,
      culturalHints: uniqueHints
    };
  }

  /**
   * Enhanced translation with RAG context (if available)
   */
  async translateWithRAG(
    text: string,
    targetLang: string,
    ragContext?: { messages: string[] },
    sourceLang?: string
  ): Promise<{ translation: string; culturalHints: CulturalHint[]; method: string }> {
    // Try enhanced translation first if RAG context is provided
    if (ragContext && ragContext.messages.length > 0) {
      try {
        const mockMessage = {
          id: 'temp-' + Date.now(),
          senderId: 'temp-user',
          text,
          timestamp: Date.now(),
          status: 'sent' as const,
          chatId: 'temp-chat'
        };

        const result = await enhancedTranslationService.translateMessage(
          mockMessage,
          targetLang,
          {
            useRAG: true,
            useCulturalHints: true,
            useSimpleTranslation: true,
            contextLimit: 5,
            confidenceThreshold: 0.6
          }
        );

        return {
          translation: result.translation,
          culturalHints: result.culturalHints,
          method: result.method
        };
      } catch (error) {
        console.warn('RAG translation failed, falling back to simple translation:', error);
      }
    }

    // Fallback to simple translation
    const result = await this.translateWithCulturalHints(text, targetLang, sourceLang);
    return {
      ...result,
      method: 'simple'
    };
  }

  /**
   * Remove duplicate cultural hints
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

  /**
   * Get available languages
   */
  getAvailableLanguages() {
    return [
      { code: 'EN', name: 'English' },
      { code: 'ES', name: 'Spanish' },
      { code: 'FR', name: 'French' },
      { code: 'DE', name: 'German' },
      { code: 'IT', name: 'Italian' },
      { code: 'PT', name: 'Portuguese' },
      { code: 'RU', name: 'Russian' },
      { code: 'ZH', name: 'Chinese' },
      { code: 'JA', name: 'Japanese' },
      { code: 'KO', name: 'Korean' },
      { code: 'AR', name: 'Arabic' },
      { code: 'HI', name: 'Hindi' },
      { code: 'TH', name: 'Thai' },
      { code: 'VI', name: 'Vietnamese' },
      { code: 'TR', name: 'Turkish' }
    ];
  }

  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Create a hash for text to use as cache key
   */
  private createTextHash(text: string): string {
    // Simple hash function for text
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }
}

export const simpleTranslationService = new SimpleTranslationService();
