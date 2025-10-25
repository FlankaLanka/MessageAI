import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Vector Database Service
 * Handles conversation context storage and retrieval using vector embeddings
 */

export interface ConversationEmbedding {
  id?: string;
  chat_id: string;
  content: string;
  embedding: number[];
  metadata?: any;
  created_at?: string;
}

export interface VectorSearchResult {
  content: string;
  similarity: number;
  metadata?: any;
}

class SupabaseVectorService {
  private supabase: any;
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
    this.apiKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (this.baseUrl && this.apiKey) {
      this.supabase = createClient(this.baseUrl, this.apiKey);
    }
  }

  /**
   * Check if Supabase is configured
   */
  isConfigured(): boolean {
    const hasBaseUrl = !!this.baseUrl;
    const hasApiKey = !!this.apiKey;
    const hasSupabase = !!this.supabase;
    
    console.log('🔤 SupabaseVectorService - isConfigured check:');
    console.log('  - hasBaseUrl:', hasBaseUrl);
    console.log('  - hasApiKey:', hasApiKey);
    console.log('  - hasSupabase:', hasSupabase);
    console.log('  - baseUrl:', this.baseUrl);
    console.log('  - apiKey length:', this.apiKey?.length || 0);
    
    return !!(this.baseUrl && this.apiKey && this.supabase);
  }

  /**
   * Generate embedding for text using OpenAI
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    const openaiApiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Embedding generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  /**
   * Store conversation context in Supabase Vector
   */
  async storeConversationContext(
    chatId: string,
    messages: string[],
    metadata?: any
  ): Promise<void> {
    if (!this.isConfigured()) {
      console.warn('Supabase not configured, skipping context storage');
      return;
    }

    try {
      // Combine messages into a single content string
      const content = messages.join(' ');
      
      // Generate embedding for the combined content
      const embedding = await this.generateEmbedding(content);

      // Store in Supabase
      const { error } = await this.supabase
        .from('conversation_embeddings')
        .insert({
          chat_id: chatId,
          content: content,
          embedding: embedding,
          metadata: metadata || {},
          created_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(`Failed to store context: ${error.message}`);
      }

      console.log(`Stored conversation context for chat ${chatId}`);
    } catch (error) {
      console.error('Error storing conversation context:', error);
      throw error;
    }
  }

  /**
   * Retrieve relevant conversation context using vector similarity
   */
  async retrieveConversationContext(
    chatId: string,
    query: string,
    limit: number = 10
  ): Promise<string[]> {
    if (!this.isConfigured()) {
      console.warn('Supabase not configured, returning empty context');
      return [];
    }

    try {
      console.log('🔍 SupabaseVectorService.retrieveConversationContext:');
      console.log('  - chatId:', chatId);
      console.log('  - query:', query);
      console.log('  - limit:', limit);

      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);
      console.log('  - queryEmbedding length:', queryEmbedding.length);

      // Search for similar conversations using vector similarity
      const { data, error } = await this.supabase.rpc('match_conversations', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: limit,
        chat_id: chatId
      });

      console.log('  - RPC result data:', data);
      console.log('  - RPC result error:', error);

      if (error) {
        console.warn('Vector search failed, falling back to simple text search:', error);
        return await this.fallbackTextSearch(chatId, query, limit);
      }

      const results = data?.map((item: any) => item.content) || [];
      console.log('  - Final results:', results);
      return results;
    } catch (error) {
      console.error('Error retrieving conversation context:', error);
      return await this.fallbackTextSearch(chatId, query, limit);
    }
  }

  /**
   * Fallback text search when vector search fails
   */
  private async fallbackTextSearch(
    chatId: string,
    query: string,
    limit: number
  ): Promise<string[]> {
    try {
      console.log('🔍 SupabaseVectorService.fallbackTextSearch:');
      console.log('  - chatId:', chatId);
      console.log('  - query:', query);
      console.log('  - limit:', limit);

      const { data, error } = await this.supabase
        .from('conversation_embeddings')
        .select('content')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(limit);

      console.log('  - Fallback search data:', data);
      console.log('  - Fallback search error:', error);

      if (error) {
        throw new Error(`Fallback search failed: ${error.message}`);
      }

      const results = data?.map((item: any) => item.content) || [];
      console.log('  - Fallback results:', results);
      return results;
    } catch (error) {
      console.error('Fallback text search failed:', error);
      return [];
    }
  }

  /**
   * Store individual message for context
   */
  async storeMessage(
    chatId: string,
    message: string,
    metadata?: any
  ): Promise<void> {
    if (!this.isConfigured()) {
      console.warn('Supabase not configured, skipping message storage');
      return;
    }

    try {
      const embedding = await this.generateEmbedding(message);

      const { error } = await this.supabase
        .from('conversation_embeddings')
        .insert({
          chat_id: chatId,
          content: message,
          embedding: embedding,
          metadata: metadata || {},
          created_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(`Failed to store message: ${error.message}`);
      }
    } catch (error) {
      console.error('Error storing message:', error);
      throw error;
    }
  }

  /**
   * Get conversation history for a chat
   */
  async getConversationHistory(
    chatId: string,
    limit: number = 20
  ): Promise<string[]> {
    if (!this.isConfigured()) {
      return [];
    }

    try {
      const { data, error } = await this.supabase
        .from('conversation_embeddings')
        .select('content')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to get conversation history: ${error.message}`);
      }

      return data?.map((item: any) => item.content) || [];
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }

  /**
   * Clear conversation context for a chat
   */
  async clearConversationContext(chatId: string): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    try {
      const { error } = await this.supabase
        .from('conversation_embeddings')
        .delete()
        .eq('chat_id', chatId);

      if (error) {
        throw new Error(`Failed to clear context: ${error.message}`);
      }

      console.log(`Cleared conversation context for chat ${chatId}`);
    } catch (error) {
      console.error('Error clearing conversation context:', error);
      throw error;
    }
  }

  /**
   * Get vector database statistics
   */
  async getStats(): Promise<{
    totalEmbeddings: number;
    chatCount: number;
    averageEmbeddingLength: number;
  }> {
    if (!this.isConfigured()) {
      return { totalEmbeddings: 0, chatCount: 0, averageEmbeddingLength: 0 };
    }

    try {
      const { data, error } = await this.supabase
        .from('conversation_embeddings')
        .select('chat_id, embedding');

      if (error) {
        throw new Error(`Failed to get stats: ${error.message}`);
      }

      const totalEmbeddings = data?.length || 0;
      const uniqueChats = new Set(data?.map((item: any) => item.chat_id) || []).size;
      const averageLength = data?.reduce((sum: number, item: any) => 
        sum + (item.embedding?.length || 0), 0) / totalEmbeddings || 0;

      return {
        totalEmbeddings,
        chatCount: uniqueChats,
        averageEmbeddingLength: averageLength
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return { totalEmbeddings: 0, chatCount: 0, averageEmbeddingLength: 0 };
    }
  }
}

// Export singleton instance
export const supabaseVectorService = new SupabaseVectorService();
export default supabaseVectorService;
