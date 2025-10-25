import { supabaseVectorService } from './supabaseVector';
import { Message } from '../types';

export interface SmartSuggestion {
  id: string;
  text: string;
  confidence: number;
  type: 'completion' | 'response' | 'question' | 'reaction';
  context?: string;
  reasoning?: string;
  languageOptions?: {
    userLanguage: string;
    otherLanguage: string;
  };
}

export interface SuggestionContext {
  chatId: string;
  currentMessage: string;
  recentMessages: Message[];
  currentUserId: string;
  currentUserName: string;
  userPreferences: {
    language: string;
    tone: 'casual' | 'formal' | 'friendly' | 'professional';
    style: 'concise' | 'detailed' | 'conversational';
  };
  otherUserLanguage?: string;
  isDirectChat?: boolean;
}

class SmartSuggestionsService {
  private apiKey: string;
  private baseUrl: string;
  private cache: Map<string, SmartSuggestion[]> = new Map();
  private readonly CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
  
  // Debouncing properties
  private debounceTimers = new Map<string, NodeJS.Timeout>();
  private readonly DEBOUNCE_DELAY = 1000; // 1 second debounce

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1';
  }

  /**
   * Generate smart message suggestions using optimized single API call with debouncing
   */
  async generateSuggestions(context: SuggestionContext, useRAG: boolean = false, includeOtherLanguage: boolean = false): Promise<SmartSuggestion[]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const cacheKey = this.getCacheKey(context);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached[0]?.timestamp < this.CACHE_EXPIRY) {
        return cached;
      }
    }

    // Clear existing debounce timer for this context
    if (this.debounceTimers.has(cacheKey)) {
      clearTimeout(this.debounceTimers.get(cacheKey)!);
    }

    // Return a promise that will be resolved after debounce delay
    return new Promise((resolve, reject) => {
      const timer = setTimeout(async () => {
        try {
          // Get context from conversation history (RAG or recent messages based on settings)
          const ragContext = await this.getRAGContext(context, useRAG);
          
          // Generate suggestions using optimized single API call
          const suggestions = await this.generateOptimizedSuggestions(context, ragContext, includeOtherLanguage);
          
          // Cache the results
          this.cache.set(cacheKey, suggestions);
          
          resolve(suggestions);
        } catch (error) {
          console.error('Smart suggestions error:', error);
          resolve(this.getFallbackSuggestions(context));
        } finally {
          this.debounceTimers.delete(cacheKey);
        }
      }, this.DEBOUNCE_DELAY);
      
      this.debounceTimers.set(cacheKey, timer);
    });
  }

  /**
   * Analyze conversation context to understand what has been discussed
   */
  private async analyzeConversationContext(
    ragContext: string[], 
    currentUserId: string, 
    currentUserName: string
  ): Promise<string> {
    if (ragContext.length === 0) {
      return "No previous conversation context available.";
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
              content: `Analyze this conversation and provide a summary focusing on:

1. WHO is speaking (identify speakers and their roles/relationships)
2. WHAT has been discussed (main topics, events, information shared)
3. SPEAKER PERSPECTIVES (what each person's role/context is)
4. CONVERSATION FLOW (who said what, when, and why)
5. RESOLVED vs OPEN topics (what's been answered vs what's still open)

CRITICAL: Identify the current speaker (${currentUserName}) and their perspective/role in the conversation.
Be specific about what has already been covered to avoid suggesting redundant questions or topics.`
            },
            {
              role: 'user',
              content: `Analyze this conversation context:

CURRENT SPEAKER: ${currentUserName} (User ID: ${currentUserId})

CONVERSATION:
${ragContext.map((msg, i) => `${i + 1}. ${msg}`).join('\n')}

Provide a concise analysis focusing on:
- Who is speaking and their role/relationship
- What has been discussed from each person's perspective
- What would be appropriate next steps for ${currentUserName} specifically`
            }
          ],
          temperature: 0.3,
          max_tokens: 400
        }),
      });

      if (!response.ok) {
        throw new Error('Conversation analysis failed');
      }

      const result = await response.json();
      return result.choices[0].message.content.trim();
    } catch (error) {
      console.error('Conversation analysis error:', error);
      return "Unable to analyze conversation context.";
    }
  }

  /**
   * Get context from conversation history (RAG or recent messages based on settings)
   */
  private async getRAGContext(context: SuggestionContext, useRAG: boolean): Promise<string[]> {
    if (!useRAG) {
      // Use only recent messages for faster performance
      return context.recentMessages
        .slice(-5)
        .map(msg => `${msg.senderName}: ${msg.text}`);
    }

    try {
      // Get recent conversation context from Supabase Vector
      const contextMessages = await supabaseVectorService.retrieveConversationContext(
        context.chatId,
        context.currentMessage,
        10
      );

      // Also use recent messages from the current session
      const recentMessages = context.recentMessages
        .slice(-5)
        .map(msg => `${msg.senderName}: ${msg.text}`);

      return [...contextMessages, ...recentMessages];
    } catch (error) {
      console.warn('RAG context retrieval failed:', error);
      return context.recentMessages.slice(-3).map(msg => msg.text || '');
    }
  }

  /**
   * Generate suggestions using optimized single API call
   */
  private async generateOptimizedSuggestions(
    context: SuggestionContext,
    ragContext: string[],
    includeOtherLanguage: boolean = false
  ): Promise<SmartSuggestion[]> {
    
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
            content: `You are a smart messaging assistant. Analyze this conversation and generate 3 contextually relevant message suggestions.

CRITICAL REQUIREMENTS:
- User language: ${context.userPreferences.language}
- Generate ALL suggestions in ${context.userPreferences.language} language
- Consider WHO is speaking and their role in the conversation
- Avoid redundant topics already discussed
- Focus on natural conversation flow
- Provide suggestions that make sense for ${context.currentUserName} to say

IMPORTANT: Return ONLY a valid JSON object, no markdown formatting, no code blocks, no extra text. Use this exact format:
{
  "suggestions": [
    {
      "text": "suggestion text here",
      "type": "response",
      "confidence": 0.9,
      "reasoning": "why this makes sense"
    }
  ]
}`
          },
          {
            role: 'user',
            content: `Generate smart message suggestions for this context:

CURRENT SPEAKER: ${context.currentUserName} (User ID: ${context.currentUserId})
Current message: "${context.currentMessage}"
Chat ID: ${context.chatId}
Language: ${context.userPreferences.language}
Tone: ${context.userPreferences.tone}
Style: ${context.userPreferences.style}

RECENT CONVERSATION CONTEXT:
${ragContext.map((msg, i) => `${i + 1}. ${msg}`).join('\n')}

IMPORTANT: 
- Base suggestions on what has actually been discussed
- Don't suggest questions about topics already covered
- Consider ${context.currentUserName}'s perspective and role
- Generate ALL suggestions in ${context.userPreferences.language} language
- Return valid JSON format only`
          }
        ],
        temperature: 0.7,
        max_tokens: 400 // Reduced from 1000 for faster response
      }),
    });

    if (!response.ok) {
      throw new Error(`Suggestion generation failed: ${response.statusText}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content.trim();
    
    try {
      // Clean the content to remove markdown code blocks
      let cleanContent = content.trim();
      
      // Remove markdown code blocks if present
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Parse JSON response
      const parsed = JSON.parse(cleanContent);
      const suggestions = parsed.suggestions.map((suggestion: any, index: number) => ({
        id: `suggestion-${Date.now()}-${index}`,
        text: suggestion.text,
        type: suggestion.type || 'response',
        confidence: suggestion.confidence || 0.8,
        context: suggestion.context,
        reasoning: suggestion.reasoning
      }));

      // For 1-on-1 chats: add other language suggestions if enabled
      // For group chats: only return original suggestions (user language only)
      if (includeOtherLanguage && context.isDirectChat && context.otherUserLanguage) {
        return await this.addOtherLanguageSuggestions(suggestions, context);
      }

      return suggestions;
    } catch (parseError) {
      console.error('Failed to parse suggestions JSON:', parseError);
      console.error('Content that failed to parse:', content);
      // Fallback to simple text parsing
      return this.parseSuggestionsFromText(content, context);
    }
  }

  /**
   * Add suggestions in the other person's language with dual-button structure
   */
  private async addOtherLanguageSuggestions(
    suggestions: SmartSuggestion[], 
    context: SuggestionContext
  ): Promise<SmartSuggestion[]> {
    try {
      // Import translation service
      const { simpleTranslationService } = await import('./simpleTranslation');
      
      const enhancedSuggestions: SmartSuggestion[] = [];
      
      for (const suggestion of suggestions) {
        // Translate to other user's language
        let translatedText = suggestion.text;
        try {
          translatedText = await simpleTranslationService.translateText(
            suggestion.text,
            context.otherUserLanguage!
          );
          
          // Create enhanced suggestion with language options
          enhancedSuggestions.push({
            ...suggestion,
            languageOptions: {
              userLanguage: suggestion.text,
              otherLanguage: translatedText
            }
          });
        } catch (translationError) {
          console.warn('Failed to translate suggestion:', translationError);
          // If translation fails, just add the original suggestion without language options
          enhancedSuggestions.push(suggestion);
        }
      }
      
      return enhancedSuggestions;
    } catch (error) {
      console.error('Error adding other language suggestions:', error);
      return suggestions; // Return original suggestions if translation fails
    }
  }

  /**
   * Fallback method to parse suggestions from text when JSON parsing fails
   */
  private parseSuggestionsFromText(
    content: string, 
    context: SuggestionContext
  ): SmartSuggestion[] {
    // Try to extract suggestions from JSON-like structure
    const suggestions: SmartSuggestion[] = [];
    
    // Look for text fields in the content
    const textMatches = content.match(/"text":\s*"([^"]+)"/g);
    if (textMatches && textMatches.length > 0) {
      textMatches.forEach((match, index) => {
        const textMatch = match.match(/"text":\s*"([^"]+)"/);
        if (textMatch && textMatch[1]) {
          suggestions.push({
            id: `suggestion-${Date.now()}-${index}`,
            text: textMatch[1],
            type: 'response',
            confidence: 0.7,
            context: 'Fallback JSON parsing',
            reasoning: 'Extracted from JSON structure'
          });
        }
      });
    }
    
    // If no JSON structure found, fall back to simple line parsing
    if (suggestions.length === 0) {
      const lines = content.split('\n').filter(line => line.trim());
      for (let i = 0; i < Math.min(3, lines.length); i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('{') && !line.startsWith('}') && !line.startsWith('```')) {
          suggestions.push({
            id: `suggestion-${Date.now()}-${i}`,
            text: line,
            type: 'response',
            confidence: 0.7,
            context: 'Fallback line parsing',
            reasoning: 'Generated from text fallback'
          });
        }
      }
    }
    
    return suggestions;
  }


  /**
   * Get language code from language name
   */
  private getLanguageCodeFromName(languageName: string): string {
    const languageMap: Record<string, string> = {
      'English': 'EN',
      'Spanish': 'ES',
      'Chinese': 'ZH'
    };
    return languageMap[languageName] || 'EN';
  }

  /**
   * Get fallback suggestions when AI fails
   */
  private getFallbackSuggestions(context: SuggestionContext): SmartSuggestion[] {
    const currentMessage = context.currentMessage.toLowerCase();
    
    // Simple pattern-based fallback suggestions
    const fallbackSuggestions: SmartSuggestion[] = [];

    if (currentMessage.length === 0) {
      fallbackSuggestions.push(
        { 
          id: 'fallback-1', 
          text: 'How are you?', 
          type: 'question', 
          confidence: 0.6,
          reasoning: 'Generic greeting when no message is typed'
        },
        { 
          id: 'fallback-2', 
          text: 'What\'s up?', 
          type: 'question', 
          confidence: 0.6,
          reasoning: 'Casual greeting alternative'
        },
        { 
          id: 'fallback-3', 
          text: 'Thanks!', 
          type: 'response', 
          confidence: 0.5,
          reasoning: 'Polite response option'
        }
      );
    } else if (currentMessage.includes('thank')) {
      fallbackSuggestions.push(
        { 
          id: 'fallback-1', 
          text: 'You\'re welcome!', 
          type: 'response', 
          confidence: 0.8,
          reasoning: 'Natural response to thanks'
        },
        { 
          id: 'fallback-2', 
          text: 'No problem!', 
          type: 'response', 
          confidence: 0.7,
          reasoning: 'Casual response to thanks'
        }
      );
    } else if (currentMessage.includes('how')) {
      fallbackSuggestions.push(
        { 
          id: 'fallback-1', 
          text: 'I\'m doing well, thanks!', 
          type: 'response', 
          confidence: 0.7,
          reasoning: 'Positive response to how are you'
        },
        { 
          id: 'fallback-2', 
          text: 'Great, how about you?', 
          type: 'response', 
          confidence: 0.6,
          reasoning: 'Reciprocal question response'
        }
      );
    } else {
      // Generic completions
      fallbackSuggestions.push(
        { 
          id: 'fallback-1', 
          text: 'That sounds good', 
          type: 'response', 
          confidence: 0.5,
          reasoning: 'Generic positive response'
        },
        { 
          id: 'fallback-2', 
          text: 'I agree', 
          type: 'response', 
          confidence: 0.5,
          reasoning: 'Generic agreement response'
        }
      );
    }

    return fallbackSuggestions.slice(0, 3);
  }

  /**
   * Generate contextual quick replies
   */
  async generateQuickReplies(context: SuggestionContext): Promise<SmartSuggestion[]> {
    try {
      const ragContext = await this.getRAGContext(context);
      
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
              content: `Generate quick reply suggestions (1-3 words) for the current conversation context. 
              Focus on common responses like "Yes", "No", "Thanks", "OK", "Sure", etc.`
            },
            {
              role: 'user',
              content: `Generate quick replies for this conversation:

Current message: "${context.currentMessage}"
Recent context: ${ragContext.slice(-3).join(' | ')}`
            }
          ],
          temperature: 0.5,
          max_tokens: 200
        }),
      });

      if (!response.ok) {
        throw new Error('Quick replies generation failed');
      }

      const result = await response.json();
      const content = result.choices[0].message.content.trim();
      
      // Parse the response and create suggestions
      const replies = content.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && line.length < 20)
        .slice(0, 3);

      return replies.map((reply, index) => ({
        id: `quick-${Date.now()}-${index}`,
        text: reply,
        type: 'response' as const,
        confidence: 0.7
      }));
    } catch (error) {
      console.error('Quick replies error:', error);
      return [
        { id: 'quick-1', text: 'Yes', type: 'response', confidence: 0.6 },
        { id: 'quick-2', text: 'No', type: 'response', confidence: 0.6 },
        { id: 'quick-3', text: 'Thanks', type: 'response', confidence: 0.6 }
      ];
    }
  }

  /**
   * Get cache key for suggestions
   */
  private getCacheKey(context: SuggestionContext): string {
    return `${context.chatId}-${context.currentMessage.slice(0, 20)}-${context.userPreferences.language}`;
  }

  /**
   * Clear suggestion cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get suggestion statistics
   */
  getStats(): {
    cacheSize: number;
    cacheHitRate: number;
  } {
    return {
      cacheSize: this.cache.size,
      cacheHitRate: 0.8 // Placeholder - would need to track actual hits
    };
  }
}

// Export singleton instance
export const smartSuggestionsService = new SmartSuggestionsService();
export default smartSuggestionsService;
