-- Fix the conversation_embeddings table structure
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Drop the existing table completely
DROP TABLE IF EXISTS conversation_embeddings CASCADE;

-- Step 2: Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 3: Create the table with the correct structure
CREATE TABLE conversation_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create indexes
CREATE INDEX idx_conversation_embeddings_chat_id ON conversation_embeddings(chat_id);
CREATE INDEX idx_conversation_embeddings_created_at ON conversation_embeddings(created_at);

-- Step 5: Create vector similarity search function
CREATE OR REPLACE FUNCTION match_conversations (
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10,
  chat_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    conversation_embeddings.id,
    conversation_embeddings.content,
    1 - (conversation_embeddings.embedding <=> query_embedding) AS similarity,
    conversation_embeddings.metadata,
    conversation_embeddings.created_at
  FROM conversation_embeddings
  WHERE 
    (chat_id IS NULL OR conversation_embeddings.chat_id = match_conversations.chat_id)
    AND 1 - (conversation_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY conversation_embeddings.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Step 6: Create function to get conversation history
CREATE OR REPLACE FUNCTION get_conversation_history (
  p_chat_id TEXT,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    conversation_embeddings.content,
    conversation_embeddings.created_at,
    conversation_embeddings.metadata
  FROM conversation_embeddings
  WHERE conversation_embeddings.chat_id = p_chat_id
  ORDER BY conversation_embeddings.created_at DESC
  LIMIT p_limit;
$$;

-- Step 7: Create function to get vector database statistics
CREATE OR REPLACE FUNCTION get_vector_stats ()
RETURNS TABLE (
  total_embeddings BIGINT,
  unique_chats BIGINT,
  average_embedding_length NUMERIC
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    COUNT(*) as total_embeddings,
    COUNT(DISTINCT chat_id) as unique_chats,
    1536 as average_embedding_length
  FROM conversation_embeddings;
$$;

-- Step 8: Set up Row Level Security
ALTER TABLE conversation_embeddings ENABLE ROW LEVEL SECURITY;

-- Step 9: Create policy for development
CREATE POLICY "Allow all operations on conversation_embeddings" ON conversation_embeddings
  FOR ALL USING (true);

-- Step 10: Test the table with a sample insert
INSERT INTO conversation_embeddings (chat_id, content, metadata) VALUES
('test-chat-1', 'Test message to verify table structure', '{"test": true, "timestamp": "2024-01-01T10:00:00Z"}');

-- Step 11: Verify the table works
SELECT * FROM conversation_embeddings WHERE chat_id = 'test-chat-1';
