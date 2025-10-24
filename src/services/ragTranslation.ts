import { CulturalHint } from '../types';
import { supabaseVectorService } from './supabaseVector';
import { useStore } from '../store/useStore';

/**
 * RAG-based Intelligent Translation Service
 * Provides context-aware, culturally accurate translations using Supabase Vector
 * with structured meaning extraction and semantic continuity
 */

export interface RAGContext {
  messages: string[];
  metadata?: {
    chatId?: string;
    participants?: string[];
    timestamp?: number;
  };
}

export interface IntelligentProcessing {
  intent: string;
  tone: string;
  topic: string;
  entities: string[];
  language_detected: string;
  confidence?: number;
}

export interface RAGTranslationResult {
  translation: string;
  intelligent_processing: IntelligentProcessing;
  cultural_hints?: CulturalHint[];
  context_used?: string[];
}

export interface UserPreferences {
  target_language: string;
  tone?: 'casual' | 'formal' | 'professional' | 'friendly';
  context_awareness?: boolean;
  cultural_hints?: boolean;
}

class RAGTranslationService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
    this.supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
    this.supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  }

  /**
   * Main translation method with RAG context
   */
  async translateWithRAG(
    userMessage: string,
    ragContext: RAGContext,
    userPreferences: UserPreferences
  ): Promise<RAGTranslationResult> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Check cache first
    const store = useStore.getState();
    const textHash = this.createTextHash(userMessage);
    const cachedTranslation = store.getCachedTranslation(textHash, userPreferences.target_language);
    const cachedHints = store.getCachedCulturalHints(textHash);
    const cachedProcessing = store.getCachedIntelligentProcessing(textHash);
    
    if (cachedTranslation && cachedHints && cachedProcessing) {
      console.log('Using cached RAG translation for:', userMessage.substring(0, 50));
      return {
        translation: cachedTranslation.text,
        cultural_hints: cachedHints,
        intelligent_processing: cachedProcessing,
        context_used: []
      };
    }

    try {
      // Step 1: Analyze context relevance and extract meaningful snippets
      const relevantContext = await this.extractRelevantContext(userMessage, ragContext);
      
      // Step 2: Generate context-aware translation with structured analysis
      const translationResult = await this.generateContextAwareTranslation(
        userMessage,
        relevantContext,
        userPreferences
      );

      // Step 3: Extract cultural hints if enabled
      let culturalHints: CulturalHint[] = [];
      if (userPreferences.cultural_hints) {
        culturalHints = await this.extractCulturalHints(
          userMessage,
          translationResult.translation,
          userPreferences.target_language,
          userPreferences
        );
      }

      const result = {
        translation: translationResult.translation,
        intelligent_processing: translationResult.intelligent_processing,
        cultural_hints: culturalHints,
        context_used: relevantContext
      };
      
      // Cache the result
      store.cacheTranslation(textHash, userPreferences.target_language, {
        text: translationResult.translation,
        lang: userPreferences.target_language
      });
      store.cacheCulturalHints(textHash, culturalHints);
      store.cacheIntelligentProcessing(textHash, translationResult.intelligent_processing);
      
      return result;
    } catch (error) {
      console.error('RAG Translation error:', error);
      // Fallback to simple translation
      return this.fallbackTranslation(userMessage, userPreferences);
    }
  }

  /**
   * Extract relevant context from RAG context using semantic similarity
   */
  private async extractRelevantContext(
    userMessage: string,
    ragContext: RAGContext
  ): Promise<string[]> {
    if (!ragContext.messages.length) {
      return [];
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
              content: `You are a context analysis expert. Given a user message and a list of conversation snippets, identify which snippets are most relevant for understanding the user's message.

Return ONLY a JSON array of the most relevant message snippets (maximum 5). If no context is relevant, return an empty array.

Focus on:
- Recent conversation topics
- Shared references or entities
- Emotional context
- Continuation of ongoing discussions
- Cultural or contextual clues

Format: ["snippet1", "snippet2", ...]`
            },
            {
              role: 'user',
              content: `User message: "${userMessage}"

Available context:
${ragContext.messages.map((msg, i) => `${i + 1}. "${msg}"`).join('\n')}`
            }
          ],
          temperature: 0.1,
          max_tokens: 500
        }),
      });

      if (!response.ok) {
        throw new Error(`Context analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      const content = result.choices[0].message.content.trim();
      
      try {
        const relevantSnippets = JSON.parse(content);
        return Array.isArray(relevantSnippets) ? relevantSnippets : [];
      } catch (error) {
        console.error('Failed to parse context analysis:', error);
        return [];
      }
    } catch (error) {
      console.error('Context extraction error:', error);
      return [];
    }
  }

  /**
   * Generate context-aware translation with structured meaning extraction
   */
  private async generateContextAwareTranslation(
    userMessage: string,
    relevantContext: string[],
    userPreferences: UserPreferences
  ): Promise<{ translation: string; intelligent_processing: IntelligentProcessing }> {
    const contextString = relevantContext.length > 0 
      ? `\n\nRelevant conversation context:\n${relevantContext.map((ctx, i) => `${i + 1}. "${ctx}"`).join('\n')}`
      : '';

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
            content: `You are an intelligent multilingual translation agent for a global messenger app.

Your purpose is to provide context-aware, culturally accurate translations using RAG (Retrieval-Augmented Generation) context.

## CORE CAPABILITIES

### 1. Translation
- Translate each message into the target language with full contextual awareness.
- Detect idioms, slang, and figurative expressions; decide when to translate literally or by meaning.
- Always preserve the original tone and emotional intent.

### 2. RAG Context Retrieval
- **CRITICAL**: Use the provided context to interpret ambiguous messages correctly.
- **PRIORITIZE CONTEXT**: If the context clearly indicates a specific meaning, use that meaning.
- **CONTEXT OVERRIDE**: Context takes precedence over general knowledge or common usage.
- If context is irrelevant, safely ignore it.

### 3. Structured Meaning Extraction
Along with the translation, output a structured JSON object for intelligent processing:

\`\`\`json
{
  "translation": "translated text",
  "intelligent_processing": {
     "intent": "string",
     "tone": "string", 
     "topic": "string",
     "entities": ["string"],
     "language_detected": "string"
  }
}
\`\`\`

### 4. Memory & State
- Use retrieved conversation snippets to maintain semantic continuity.
- Stay consistent in terminology across turns (e.g. same names, topics, tones).

### 5. Error Handling
- If the translation or context is unclear, make the best possible guess and continue.
- Never output undefined fields; if missing data, use "unknown".

## LANGUAGE REQUIREMENTS
- **CRITICAL**: All analysis fields (intent, tone, topic, entities) must be in the user's language
- If user language is Chinese, write analysis in Chinese characters
- If user language is Spanish, write analysis in Spanish
- If user language is English, write analysis in English
- The intelligent_processing fields should be localized to match the user's interface language

## RULES
- **CONTEXT IS PARAMOUNT**: Use RAG context to disambiguate idioms or phrases.
- **EXAMPLES**:
  - If context shows "coffee shop" and message is "spilled the tea" → translate literally (tea was spilled)
  - If context shows "gossip" and message is "spilled the tea" → translate figuratively (revealed secret)
- The translation must match the *intended meaning* given the conversation history.
- Do not translate literally if it changes the meaning.
- Always detect the original language automatically.
- Return ONLY the JSON object, no other text.
- The JSON must be valid and parseable.
- Do not include any markdown formatting or code blocks.
- Start your response with { and end with }`
          },
          {
            role: 'user',
            content: `### CONVERSATION CONTEXT (CRITICAL - USE THIS TO INTERPRET THE MESSAGE)
${relevantContext.map((ctx, i) => `${i + 1}. "${ctx}"`).join('\n')}

### MESSAGE TO TRANSLATE
"${userMessage}"

### TRANSLATION INSTRUCTIONS
- **CONTEXT IS KEY**: Use the conversation context above to determine the correct meaning
- **CONTEXT OVERRIDES**: If context suggests a literal meaning, translate literally
- **CONTEXT OVERRIDES**: If context suggests a figurative meaning, translate figuratively
- Target language: ${userPreferences.target_language}
- Tone: ${userPreferences.tone || 'casual'}

### LANGUAGE REQUIREMENTS FOR ANALYSIS
- **CRITICAL**: All intelligent_processing fields (intent, tone, topic, entities) must be in the user's interface language
- User's interface language: ${this.getUserInterfaceLanguage(userPreferences)}
- Write all analysis in the user's language, not in English`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.statusText}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content.trim();
    
    try {
      // Clean the content to extract JSON
      let jsonContent = content;
      
      // Remove any markdown formatting
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Find JSON object in the response
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }
      
      // Try to parse the cleaned JSON
      const parsed = JSON.parse(jsonContent);
      return {
        translation: parsed.translation || userMessage,
        intelligent_processing: {
          intent: parsed.intelligent_processing?.intent || 'unknown',
          tone: parsed.intelligent_processing?.tone || 'neutral',
          topic: parsed.intelligent_processing?.topic || 'general',
          entities: Array.isArray(parsed.intelligent_processing?.entities) 
            ? parsed.intelligent_processing.entities 
            : [],
          language_detected: parsed.intelligent_processing?.language_detected || 'unknown',
          confidence: parsed.intelligent_processing?.confidence || 0.8
        }
      };
    } catch (error) {
      console.log('Failed to parse translation result (likely no translation needed):', error instanceof Error ? error.message : String(error));
      console.log('Raw content:', content);
      
      // If the response indicates no translation needed, return original message
      if (content.toLowerCase().includes('no translation needed') ||
          content.toLowerCase().includes('already in target language') ||
          content.toLowerCase().includes('no changes required')) {
        return {
          translation: userMessage,
          intelligent_processing: {
            intent: 'unknown',
            tone: 'neutral',
            topic: 'general',
            entities: [],
            language_detected: 'unknown',
            confidence: 0.5
          }
        };
      }
      
      // Fallback: try to extract translation manually
      try {
        const fallbackTranslation = this.extractTranslationFromText(content, userMessage);
        return {
          translation: fallbackTranslation,
          intelligent_processing: {
            intent: 'unknown',
            tone: 'neutral',
            topic: 'general',
            entities: [],
            language_detected: 'unknown',
            confidence: 0.5
          }
        };
      } catch (fallbackError) {
        console.log('Fallback translation extraction failed, returning original message');
        return {
          translation: userMessage,
          intelligent_processing: {
            intent: 'unknown',
            tone: 'neutral',
            topic: 'general',
            entities: [],
            language_detected: 'unknown',
            confidence: 0.5
          }
        };
      }
    }
  }

  /**
   * Extract translation from text when JSON parsing fails
   */
  private extractTranslationFromText(text: string, fallback: string): string {
    // Look for common patterns in the text
    const lines = text.split('\n');
    
    for (const line of lines) {
      // Look for patterns like "translation": "text" or "translated text"
      const translationMatch = line.match(/["']([^"']+)["']/);
      if (translationMatch) {
        const potentialTranslation = translationMatch[1].trim();
        if (potentialTranslation && potentialTranslation !== fallback) {
          return potentialTranslation;
        }
      }
      
      // Look for lines that might contain the translation
      if (line.includes('translation') || line.includes('translated')) {
        const colonMatch = line.match(/:\s*["']([^"']+)["']/);
        if (colonMatch) {
          return colonMatch[1].trim();
        }
      }
    }
    
    // If no translation found, return the original text
    return fallback;
  }

  /**
   * Extract cultural hints for both original and translated text
   */
  private async extractCulturalHints(
    originalText: string,
    translatedText: string,
    targetLanguage: string,
    userPreferences: UserPreferences
  ): Promise<CulturalHint[]> {
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
              content: `You are a cultural context expert. Analyze the following texts and identify slang, idioms, cultural references, and expressions that might need explanation.

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
              content: `Analyze these texts:

Original: "${originalText}"
Translated: "${translatedText}"

Target language: ${targetLanguage}

IMPORTANT: Write all explanations in the user's interface language: ${this.getUserInterfaceLanguage(userPreferences)}`
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        }),
      });

      if (!response.ok) {
        throw new Error(`Cultural hints generation failed: ${response.statusText}`);
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
        
        console.log('RAG Translation - Cleaned JSON content:', jsonContent);
        
        // Try to parse the cleaned JSON
        const hints = JSON.parse(jsonContent);
        return Array.isArray(hints) ? hints : [];
      } catch (error) {
        console.log('Failed to parse RAG cultural hints response:', error instanceof Error ? error.message : String(error));
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
    } catch (error) {
      console.error('Cultural hints extraction error:', error);
      return [];
    }
  }

  /**
   * Fallback translation when RAG context fails
   */
  private async fallbackTranslation(
    userMessage: string,
    userPreferences: UserPreferences
  ): Promise<RAGTranslationResult> {
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
              content: `You are a professional translator. Translate the following text to ${userPreferences.target_language}. Return only the translation, no explanations.`
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        }),
      });

      if (!response.ok) {
        throw new Error(`Fallback translation failed: ${response.statusText}`);
      }

      const result = await response.json();
      const translation = result.choices[0].message.content.trim();

      return {
        translation,
        intelligent_processing: {
          intent: 'unknown',
          tone: 'neutral',
          topic: 'general',
          entities: [],
          language_detected: 'unknown',
          confidence: 0.5
        }
      };
    } catch (error) {
      console.error('Fallback translation error:', error);
      return {
        translation: userMessage,
        intelligent_processing: {
          intent: 'unknown',
          tone: 'neutral',
          topic: 'general',
          entities: [],
          language_detected: 'unknown',
          confidence: 0.0
        }
      };
    }
  }

  /**
   * Store conversation context in Supabase Vector (for future RAG retrieval)
   */
  async storeConversationContext(
    chatId: string,
    messages: string[],
    metadata?: any
  ): Promise<void> {
    try {
      await supabaseVectorService.storeConversationContext(chatId, messages, metadata);
      console.log(`Stored conversation context for chat ${chatId}`);
    } catch (error) {
      console.error('Context storage error:', error);
    }
  }

  /**
   * Retrieve conversation context from Supabase Vector
   */
  async retrieveConversationContext(
    chatId: string,
    query: string,
    limit: number = 10
  ): Promise<RAGContext> {
    try {
      const messages = await supabaseVectorService.retrieveConversationContext(chatId, query, limit);
      return { 
        messages,
        metadata: { 
          chatId
        }
      };
    } catch (error) {
      console.error('Context retrieval error:', error);
      return { messages: [] };
    }
  }

  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
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
   * Extract hints from text when JSON parsing fails
   */
  private extractHintsFromText(content: string): CulturalHint[] {
    try {
      // Try to find any JSON-like structures in the text
      const jsonMatches = content.match(/\[[\s\S]*?\]/g);
      if (jsonMatches) {
        for (const match of jsonMatches) {
          try {
            const parsed = JSON.parse(match);
            if (Array.isArray(parsed)) {
              return parsed;
            }
          } catch (e) {
            // Continue to next match
          }
        }
      }
      
      // If no JSON found, return empty array
      return [];
    } catch (error) {
      console.log('Error in extractHintsFromText:', error);
      return [];
    }
  }

  /**
   * Get user interface language for analysis localization
   */
  private getUserInterfaceLanguage(userPreferences: UserPreferences): string {
    // Get the user's interface language from the store
    try {
      const { useStore } = require('../store/useStore');
      const { defaultTranslationLanguage } = useStore.getState();
      
      console.log('RAGTranslation: Getting user interface language:', defaultTranslationLanguage);
      
      // Map language codes to full names
      const languageMap: Record<string, string> = {
        'EN': 'English',
        'ES': 'Spanish', 
        'ZH': 'Chinese'
      };
      
      const userLanguage = languageMap[defaultTranslationLanguage] || 'English';
      console.log('RAGTranslation: Mapped to user language:', userLanguage);
      
      return userLanguage;
    } catch (error) {
      console.warn('Could not get user interface language, defaulting to English:', error);
      return 'English';
    }
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

// Export singleton instance
export const ragTranslationService = new RAGTranslationService();
export default ragTranslationService;
