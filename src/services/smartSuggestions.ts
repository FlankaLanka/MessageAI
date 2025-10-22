import { supabaseVectorService } from './supabaseVector';
import { Message } from '../types';

export interface SmartSuggestion {
  id: string;
  text: string;
  confidence: number;
  type: 'completion' | 'response' | 'question' | 'reaction';
  context?: string;
  reasoning?: string;
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
}

class SmartSuggestionsService {
  private apiKey: string;
  private baseUrl: string;
  private cache: Map<string, SmartSuggestion[]> = new Map();
  private readonly CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1';
  }

  /**
   * Generate smart message suggestions using LLM with function calling
   */
  async generateSuggestions(context: SuggestionContext): Promise<SmartSuggestion[]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      // Check cache first
      const cacheKey = this.getCacheKey(context);
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!;
        if (Date.now() - cached[0]?.timestamp < this.CACHE_EXPIRY) {
          return cached;
        }
      }

      // Get RAG context from conversation history
      const ragContext = await this.getRAGContext(context);
      
      // Generate suggestions using function calling
      const suggestions = await this.generateSuggestionsWithFunctions(context, ragContext);
      
      // Cache the results
      this.cache.set(cacheKey, suggestions);
      
      return suggestions;
    } catch (error) {
      console.error('Smart suggestions error:', error);
      return this.getFallbackSuggestions(context);
    }
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
   * Get RAG context from conversation history
   */
  private async getRAGContext(context: SuggestionContext): Promise<string[]> {
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
   * Generate suggestions using OpenAI function calling
   */
  private async generateSuggestionsWithFunctions(
    context: SuggestionContext,
    ragContext: string[]
  ): Promise<SmartSuggestion[]> {
    // Analyze conversation context first with speaker information
    const conversationAnalysis = await this.analyzeConversationContext(
      ragContext, 
      context.currentUserId, 
      context.currentUserName
    );
    
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
            content: `You are a smart messaging assistant that provides the TOP 3 most likely responses a user might send.

CRITICAL: Generate the 3 most probable responses the current speaker would naturally send next, based on conversation context.

Your analysis should consider:
- WHO is currently speaking and their role/relationship in the conversation
- What has already been discussed in the conversation
- What the conversation flow and context is
- What would be the most natural next responses FROM THE CURRENT SPEAKER'S PERSPECTIVE

AVOID suggesting questions or topics that have already been covered in the conversation.
AVOID suggesting responses that don't make sense from the current speaker's perspective.

Provide the TOP 3 suggestions that are:
- The most likely responses the speaker would send
- Contextually relevant to the current conversation flow
- Natural continuations of what's being discussed
- Appropriate for the current speaker's role and perspective in the conversation`
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

CONVERSATION ANALYSIS:
${conversationAnalysis}

RECENT CONVERSATION CONTEXT:
${ragContext.map((msg, i) => `${i + 1}. ${msg}`).join('\n')}

IMPORTANT: 
- Base your suggestions on what has actually been discussed
- Don't suggest questions about topics that have already been covered
- Consider ${context.currentUserName}'s perspective and role in the conversation
- Provide suggestions that make sense for ${context.currentUserName} to say`
          }
        ],
        functions: [
          {
            name: 'generate_message_suggestions',
            description: 'Generate smart message suggestions based on conversation context. CRITICAL: Only suggest responses that are contextually relevant, don\'t repeat already discussed topics, and are appropriate for the current speaker\'s perspective and role.',
            parameters: {
              type: 'object',
              properties: {
                suggestions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      text: {
                        type: 'string',
                        description: 'The suggested message text that is contextually relevant to the current conversation'
                      },
                      type: {
                        type: 'string',
                        enum: ['completion', 'response', 'question', 'reaction'],
                        description: 'Type of suggestion'
                      },
                      confidence: {
                        type: 'number',
                        minimum: 0,
                        maximum: 1,
                        description: 'Confidence score for this suggestion based on conversation relevance'
                      },
                      context: {
                        type: 'string',
                        description: 'Brief explanation of why this suggestion is relevant to the current conversation context'
                      },
                      reasoning: {
                        type: 'string',
                        description: 'Why this suggestion makes sense given what has been discussed'
                      }
                    },
                    required: ['text', 'type', 'confidence', 'reasoning']
                  }
                }
              },
              required: ['suggestions']
            }
          }
        ],
        function_call: { name: 'generate_message_suggestions' },
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`Suggestion generation failed: ${response.statusText}`);
    }

    const result = await response.json();
    const functionCall = result.choices[0].message.function_call;
    
      if (functionCall && functionCall.name === 'generate_message_suggestions') {
        const args = JSON.parse(functionCall.arguments);
        return args.suggestions.map((suggestion: any, index: number) => ({
          id: `suggestion-${Date.now()}-${index}`,
          text: suggestion.text,
          type: suggestion.type,
          confidence: suggestion.confidence,
          context: suggestion.context,
          reasoning: suggestion.reasoning
        }));
      }

    throw new Error('Invalid function call response');
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
