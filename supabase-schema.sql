-- Supabase Vector Database Schema for MessageAI RAG Translation
-- Run this SQL in your Supabase SQL editor to set up the vector database

-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the conversation_embeddings table
CREATE TABLE IF NOT EXISTS conversation_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small produces 1536-dimensional vectors
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on chat_id for faster queries
CREATE INDEX IF NOT EXISTS idx_conversation_embeddings_chat_id ON conversation_embeddings(chat_id);

-- Create an index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_conversation_embeddings_created_at ON conversation_embeddings(created_at);

-- Create a vector similarity search function
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

-- Create a function to get conversation history
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

-- Create a function to clear conversation context
CREATE OR REPLACE FUNCTION clear_conversation_context (
  p_chat_id TEXT
)
RETURNS INT
LANGUAGE SQL
AS $$
  DELETE FROM conversation_embeddings WHERE chat_id = p_chat_id;
  SELECT 1;
$$;

-- Create a function to get vector database statistics
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

-- Set up Row Level Security (RLS) policies
-- Enable RLS on the table
ALTER TABLE conversation_embeddings ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (adjust based on your security needs)
-- For development/testing, this allows full access
-- For production, you should implement proper user-based access control
CREATE POLICY "Allow all operations on conversation_embeddings" ON conversation_embeddings
  FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversation_embeddings_embedding_cosine 
ON conversation_embeddings USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Create a composite index for chat_id and created_at
CREATE INDEX IF NOT EXISTS idx_conversation_embeddings_chat_created 
ON conversation_embeddings(chat_id, created_at DESC);

-- Create a GIN index on metadata for JSON queries
CREATE INDEX IF NOT EXISTS idx_conversation_embeddings_metadata 
ON conversation_embeddings USING GIN (metadata);

-- Insert some sample data for testing (optional)
-- You can remove this section if you don't want sample data
INSERT INTO conversation_embeddings (chat_id, content, metadata) VALUES
('test-chat-1', 'How are you doing today?', '{"sender": "user1", "timestamp": "2024-01-01T10:00:00Z"}'),
('test-chat-1', 'I am working on a new project', '{"sender": "user2", "timestamp": "2024-01-01T10:01:00Z"}'),
('test-chat-1', 'That sounds exciting! What kind of project?', '{"sender": "user1", "timestamp": "2024-01-01T10:02:00Z"}'),
('test-chat-2', 'The customer got so angry yesterday', '{"sender": "user1", "timestamp": "2024-01-01T11:00:00Z"}'),
('test-chat-2', 'The customer spilled the tea on the counter', '{"sender": "user2", "timestamp": "2024-01-01T11:01:00Z"}'),
('test-chat-2', 'We ran out of napkins', '{"sender": "user1", "timestamp": "2024-01-01T11:02:00Z"}');

-- Note: The embeddings will be generated when the app runs and stores messages
-- The sample data above is just for testing the database structure
