import { CulturalHint } from '../types';
import { sqliteService } from './sqlite';
import { useStore } from '../store/useStore';

export interface CulturalHintCache {
  text: string;
  language: string;
  hints: CulturalHint[];
  timestamp: number;
}

class CulturalHintsService {
  private cache: Map<string, CulturalHintCache> = new Map();
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Get cultural hints from cache or generate new ones
   */
  async getCulturalHints(
    text: string,
    language: string,
    forceRefresh: boolean = false
  ): Promise<CulturalHint[]> {
    const cacheKey = this.getCacheKey(text, language);
    
    // Check global cache first
    const store = useStore.getState();
    const globalCached = store.getCachedCulturalHints(cacheKey);
    if (globalCached && !forceRefresh) {
      console.log('Using global cached cultural hints for:', text.substring(0, 50));
      return globalCached;
    }
    
    // Check memory cache first
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.CACHE_EXPIRY) {
        return cached.hints;
      }
    }

    // Check SQLite cache
    try {
      const cachedHints = await this.getCachedHints(text, language);
      if (cachedHints && !forceRefresh) {
        this.cache.set(cacheKey, {
          text,
          language,
          hints: cachedHints,
          timestamp: Date.now()
        });
        return cachedHints;
      }
    } catch (error) {
      console.error('Error getting cached hints:', error);
    }

    // Generate new hints using AI and pattern matching
    try {
      const hints = await this.generateCulturalHints(text, language);
      await this.cacheCulturalHints(text, language, hints);
      return hints;
    } catch (error) {
      console.error('Error generating cultural hints:', error);
      return [];
    }
  }

  /**
   * Cache cultural hints for future use
   */
  async cacheCulturalHints(
    text: string,
    language: string,
    hints: CulturalHint[]
  ): Promise<void> {
    const cacheKey = this.getCacheKey(text, language);
    
    // Update global cache
    const store = useStore.getState();
    store.cacheCulturalHints(cacheKey, hints);
    
    // Update memory cache
    this.cache.set(cacheKey, {
      text,
      language,
      hints,
      timestamp: Date.now()
    });

    // Update SQLite cache
    try {
      await this.saveCachedHints(text, language, hints);
    } catch (error) {
      console.error('Error saving cached hints:', error);
    }
  }

  /**
   * Get cached hints from SQLite
   */
  private async getCachedHints(
    text: string,
    language: string
  ): Promise<CulturalHint[] | null> {
    try {
      const result = await sqliteService.db?.getFirstAsync(
        `SELECT hints FROM cultural_hints_cache 
         WHERE text = ? AND language = ? AND timestamp > ?`,
        [text, language, Date.now() - this.CACHE_EXPIRY]
      );

      if (result && (result as any).hints) {
        return JSON.parse((result as any).hints);
      }
      return null;
    } catch (error) {
      console.error('Error getting cached hints from SQLite:', error);
      return null;
    }
  }

  /**
   * Save hints to SQLite cache
   */
  private async saveCachedHints(
    text: string,
    language: string,
    hints: CulturalHint[]
  ): Promise<void> {
    try {
      await sqliteService.db?.runAsync(
        `INSERT OR REPLACE INTO cultural_hints_cache 
         (text, language, hints, timestamp) 
         VALUES (?, ?, ?, ?)`,
        [text, language, JSON.stringify(hints), Date.now()]
      );
    } catch (error) {
      console.error('Error saving hints to SQLite:', error);
    }
  }

  /**
   * Create cache key for text and language
   */
  private getCacheKey(text: string, language: string): string {
    return `${language}:${text.toLowerCase().trim()}`;
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredCache(): Promise<void> {
    try {
      await sqliteService.db?.runAsync(
        `DELETE FROM cultural_hints_cache WHERE timestamp < ?`,
        [Date.now() - this.CACHE_EXPIRY]
      );
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }

  /**
   * Get user interface language for cultural hints localization
   */
  private getUserInterfaceLanguage(): string {
    try {
      const { useStore } = require('../store/useStore');
      const { defaultTranslationLanguage } = useStore.getState();
      
      console.log('CulturalHints: Getting user interface language:', defaultTranslationLanguage);
      
      // Map language codes to full names
      const languageMap: Record<string, string> = {
        'EN': 'English',
        'ES': 'Spanish', 
        'ZH': 'Chinese'
      };
      
      const userLanguage = languageMap[defaultTranslationLanguage] || 'English';
      console.log('CulturalHints: Mapped to user language:', userLanguage);
      
      return userLanguage;
    } catch (error) {
      console.warn('Could not get user interface language, defaulting to English:', error);
      return 'English';
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    memoryCacheSize: number;
    sqliteCacheSize: number;
  }> {
    const memoryCacheSize = this.cache.size;
    
    let sqliteCacheSize = 0;
    try {
      const result = await sqliteService.db?.getFirstAsync(
        `SELECT COUNT(*) as count FROM cultural_hints_cache`
      );
      sqliteCacheSize = (result as any)?.count || 0;
    } catch (error) {
      console.error('Error getting cache stats:', error);
    }

    return {
      memoryCacheSize,
      sqliteCacheSize
    };
  }

  /**
   * Generate cultural hints using AI and pattern matching
   */
  private async generateCulturalHints(
    text: string,
    language: string
  ): Promise<CulturalHint[]> {
    const hints: CulturalHint[] = [];

    // First, try AI-powered detection
    try {
      const aiHints = await this.generateAIHints(text, language);
      hints.push(...aiHints);
    } catch (error) {
      console.error('AI hints generation failed:', error);
    }

    // Then, apply pattern matching for common terms
    const patternHints = this.detectPatternHints(text, language);
    hints.push(...patternHints);

    // Remove duplicates and return
    return this.removeDuplicateHints(hints);
  }

  /**
   * Generate cultural hints using OpenAI
   */
  private async generateAIHints(
    text: string,
    language: string
  ): Promise<CulturalHint[]> {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a cultural context expert. Analyze the following text and identify slang, idioms, cultural references, and expressions that might need explanation for someone learning the language or from a different culture.

CRITICAL LANGUAGE REQUIREMENT: 
- All explanations must be written in the user's interface language
- If user language is Chinese, write explanations in Chinese characters
- If user language is Spanish, write explanations in Spanish
- If user language is English, write explanations in English
- The explanation field should be localized to match the user's language

Return your analysis as a JSON array of objects with this exact structure:
[
  {
    "term": "exact phrase from text",
    "type": "slang|idiom|cultural|reference",
    "explanation": "detailed cultural context and meaning in user's language",
    "literalMeaning": "literal translation if applicable"
  }
]

Focus on:
- Slang and informal expressions
- Idioms and figurative language
- Cultural references (movies, songs, events, people)
- Regional expressions
- Humor and sarcasm
- Social context and implications

Only include terms that are actually present in the text. Be precise and helpful.`
          },
          {
            role: 'user',
            content: `Analyze this text in ${language}:\n\n"${text}"\n\nIMPORTANT: Write all explanations in the user's interface language: ${this.getUserInterfaceLanguage()}\n\nDEBUG: User interface language is ${this.getUserInterfaceLanguage()}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`AI hints generation failed: ${response.statusText}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content.trim();
    
    try {
      // Check if the response indicates no slang/cultural content
      if (content.toLowerCase().includes('no slang') || 
          content.toLowerCase().includes('no cultural') ||
          content.toLowerCase().includes('no idioms') ||
          content.toLowerCase().includes('no terms to analyze') ||
          content.toLowerCase().includes('does not contain any')) {
        console.log('AI detected no slang/cultural content, returning empty hints');
        return [];
      }
      
      // Clean the content to extract JSON
      let jsonContent = content;
      
      // Remove any markdown formatting
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Remove any leading/trailing whitespace and newlines
      jsonContent = jsonContent.trim();
      
      // Find JSON array in the response - be more flexible
      const jsonMatch = jsonContent.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }
      
      // Additional cleaning for common issues
      jsonContent = jsonContent
        .replace(/,\s*]/g, ']') // Remove trailing commas
        .replace(/,\s*}/g, '}') // Remove trailing commas in objects
        .replace(/\n/g, ' ') // Replace newlines with spaces
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      console.log('Cleaned JSON content:', jsonContent);
      
      // Try to parse the cleaned JSON
      const hints = JSON.parse(jsonContent);
      return Array.isArray(hints) ? hints : [];
    } catch (error) {
      console.log('Failed to parse AI hints response (likely no slang detected):', error instanceof Error ? error.message : String(error));
      console.log('Raw content:', content);
      
      // If the response indicates no cultural content, return empty array gracefully
      if (content.toLowerCase().includes('no slang') || 
          content.toLowerCase().includes('no cultural') ||
          content.toLowerCase().includes('no idioms') ||
          content.toLowerCase().includes('no terms to analyze') ||
          content.toLowerCase().includes('does not contain any')) {
        return [];
      }
      
      // Fallback: try to extract hints manually
      try {
        const fallbackHints = this.extractHintsFromText(content);
        return fallbackHints;
      } catch (fallbackError) {
        console.log('Fallback hint extraction failed, returning empty hints');
        return [];
      }
    }
  }

  /**
   * Extract hints from text when JSON parsing fails
   */
  private extractHintsFromText(text: string): CulturalHint[] {
    const hints: CulturalHint[] = [];
    
    // Look for common patterns in the text
    const lines = text.split('\n');
    
    for (const line of lines) {
      // Look for patterns like "term: explanation" or "term - explanation"
      const match = line.match(/["']([^"']+)["']\s*[:\-]\s*(.+)/);
      if (match) {
        const term = match[1].trim();
        const explanation = match[2].trim();
        
        if (term && explanation) {
          hints.push({
            term,
            explanation,
            type: 'idiom', // Default type
            literalMeaning: undefined
          });
        }
      }
    }
    
    return hints;
  }

  /**
   * Detect cultural hints using pattern matching
   */
  private detectPatternHints(text: string, language: string): CulturalHint[] {
    const hints: CulturalHint[] = [];
    const lowerText = text.toLowerCase();

    // Language-specific pattern databases
    const patterns = this.getLanguagePatterns(language);
    
    for (const pattern of patterns) {
      if (lowerText.includes(pattern.term.toLowerCase())) {
        hints.push({
          term: pattern.term,
          type: pattern.type,
          explanation: pattern.explanation,
          literalMeaning: pattern.literalMeaning
        });
      }
    }

    return hints;
  }

  /**
   * Get language-specific patterns for common cultural terms
   */
  private getLanguagePatterns(language: string): CulturalHint[] {
    const patterns: Record<string, CulturalHint[]> = {
      'EN': [
        {
          term: 'break a leg',
          type: 'idiom',
          explanation: 'A way to wish someone good luck, especially before a performance. Ironically, it means the opposite of what it literally says.',
          literalMeaning: 'To break one\'s leg'
        },
        {
          term: 'it\'s raining cats and dogs',
          type: 'idiom',
          explanation: 'An idiom meaning it\'s raining very heavily.',
          literalMeaning: 'Cats and dogs are falling from the sky'
        },
        {
          term: 'spill the tea',
          type: 'slang',
          explanation: 'Slang meaning to share gossip or reveal secrets, especially juicy or scandalous information.',
          literalMeaning: 'To pour out tea'
        },
        {
          term: 'ghost',
          type: 'slang',
          explanation: 'To suddenly stop all communication with someone without explanation, especially in dating or friendships.',
          literalMeaning: 'A spirit of a dead person'
        }
      ],
      'ES': [
        {
          term: 'estar en las nubes',
          type: 'idiom',
          explanation: 'Spanish idiom meaning to be daydreaming or not paying attention.',
          literalMeaning: 'To be in the clouds'
        },
        {
          term: 'costar un ojo de la cara',
          type: 'idiom',
          explanation: 'Spanish idiom meaning something is very expensive.',
          literalMeaning: 'To cost an eye from the face'
        }
      ],
      'FR': [
        {
          term: 'avoir le cafard',
          type: 'idiom',
          explanation: 'French idiom meaning to feel depressed or down.',
          literalMeaning: 'To have the cockroach'
        },
        {
          term: 'c\'est la vie',
          type: 'cultural',
          explanation: 'French expression meaning "that\'s life" - accepting life\'s ups and downs with resignation.',
          literalMeaning: 'That\'s life'
        }
      ]
    };

    return patterns[language] || [];
  }

  /**
   * Remove duplicate hints based on term similarity
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
   * Initialize cache table if it doesn't exist
   */
  async initializeCacheTable(): Promise<void> {
    try {
      await sqliteService.db?.execAsync(`
        CREATE TABLE IF NOT EXISTS cultural_hints_cache (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text TEXT NOT NULL,
          language TEXT NOT NULL,
          hints TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          UNIQUE(text, language)
        );
      `);

      // Create index for faster lookups
      await sqliteService.db?.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_cultural_hints_lookup 
        ON cultural_hints_cache(text, language, timestamp);
      `);
    } catch (error) {
      console.error('Error initializing cultural hints cache table:', error);
    }
  }
}

// Export singleton instance
export const culturalHintsService = new CulturalHintsService();
export default culturalHintsService;
