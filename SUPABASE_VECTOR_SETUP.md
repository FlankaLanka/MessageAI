# 🗄️ Supabase Vector Setup Guide

## Overview

This guide will help you set up Supabase Vector database for the RAG translation system in MessageAI. The system will store conversation context as vector embeddings and retrieve relevant context for intelligent translations.

## 🚀 Quick Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

### 2. Update Environment Variables

Edit your `.env` file and add your Supabase credentials:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-schema.sql` (included in this project)
4. Run the SQL to create the vector database schema

### 4. Test the Integration

1. Start your MessageAI app: `npx expo start`
2. Go to Profile screen
3. Tap "🗄️ Test Supabase Vector"
4. Run the full test to verify everything works

## 📊 Database Schema

The system creates these components:

### Tables
- `conversation_embeddings` - Stores conversation context as vector embeddings

### Functions
- `match_conversations()` - Vector similarity search
- `get_conversation_history()` - Get conversation history
- `clear_conversation_context()` - Clear chat context
- `get_vector_stats()` - Get database statistics

### Indexes
- Vector similarity search optimization
- Chat ID and timestamp indexing
- Metadata JSON indexing

## 🔧 How It Works

### 1. Message Storage
When a user sends a message:
```typescript
// Message is stored in Supabase Vector
await supabaseVectorService.storeMessage(chatId, messageText, {
  senderId: user.uid,
  senderName: user.displayName,
  timestamp: message.timestamp
});
```

### 2. Context Retrieval
When translating a message:
```typescript
// Retrieve relevant context using vector similarity
const context = await supabaseVectorService.retrieveConversationContext(
  chatId, 
  messageText, 
  10 // limit
);
```

### 3. Translation with Context
The RAG system uses the retrieved context to provide more accurate translations:
- **Social gossip context**: "spilled the tea" → "泄露秘密" (revealed secrets)
- **Coffee shop context**: "spilled the tea" → "把茶打翻了" (spilled tea literally)

## 🧪 Testing the System

### Test Interface
Use the "🗄️ Test Supabase Vector" button in Profile screen to:

1. **Test Connection** - Verify Supabase is configured
2. **Store Message** - Store individual messages
3. **Store Conversation** - Store multiple messages as context
4. **Retrieve Context** - Test vector similarity search
5. **Get History** - View stored conversation history
6. **Clear Context** - Remove stored context

### Expected Results
When you run the full test, you should see:
```
🧪 Starting Supabase Vector Full Test...

1. Testing Supabase connection...
✅ Supabase configured: true
✅ Stats - Embeddings: 0, Chats: 0

2. Storing test conversation...
✅ Stored conversation with 5 messages

3. Storing individual message...
✅ Stored message: "Test message at 10:30:45"

4. Getting conversation history...
✅ Got 6 messages from conversation history

5. Testing context retrieval...
✅ Retrieved 5 context messages for query: "How are you doing?"
```

## 🎯 Real-World Usage

### In Chat Messages
1. **Send messages** - They're automatically stored in Supabase Vector
2. **Tap translate** - System retrieves relevant context
3. **See enhanced translations** - Context-aware results with cultural hints

### Example Scenarios

#### Scenario 1: Social Gossip
**Context**: "Alex has been acting weird lately", "Someone spilled the tea about the breakup"
**Message**: "Did you hear what happened with Alex?"
**Translation**: "你听说亚历克斯发生什么事了吗？" (gossip context)

#### Scenario 2: Coffee Shop
**Context**: "The customer spilled the tea on the counter", "We ran out of napkins"
**Message**: "The customer got so angry yesterday"
**Translation**: "昨天顾客非常生气。" (literal context)

## 🔍 Monitoring & Debugging

### Database Statistics
```typescript
const stats = await supabaseVectorService.getStats();
console.log('Total embeddings:', stats.totalEmbeddings);
console.log('Unique chats:', stats.chatCount);
console.log('Average embedding length:', stats.averageEmbeddingLength);
```

### Vector Search Quality
The system uses cosine similarity with a threshold of 0.7:
- **High similarity (>0.8)**: Very relevant context
- **Medium similarity (0.7-0.8)**: Somewhat relevant
- **Low similarity (<0.7)**: Not included in results

### Fallback Mechanisms
If vector search fails, the system falls back to:
1. Simple text search by chat ID
2. Recent message history
3. Empty context (basic translation)

## 🚨 Troubleshooting

### Common Issues

#### 1. "Supabase not configured"
- Check your `.env` file has correct Supabase URL and key
- Restart the app after updating environment variables

#### 2. "Vector search failed"
- Verify the database schema was created correctly
- Check that the `match_conversations` function exists
- Ensure the vector extension is enabled

#### 3. "No context retrieved"
- Check if messages are being stored (use test interface)
- Verify the chat ID matches between storage and retrieval
- Try lowering the similarity threshold

#### 4. "Embedding generation failed"
- Verify OpenAI API key is correct
- Check internet connection
- Ensure OpenAI API has sufficient credits

### Debug Steps
1. **Test connection** - Use the test interface
2. **Check database** - Look at Supabase dashboard for stored data
3. **Verify embeddings** - Check if embeddings are being generated
4. **Test retrieval** - Use the test interface to verify context retrieval

## 📈 Performance Optimization

### Database Indexes
The schema includes optimized indexes for:
- Vector similarity search (ivfflat)
- Chat ID queries
- Timestamp ordering
- Metadata JSON queries

### Caching Strategy
- **Memory cache**: Recent translations
- **SQLite cache**: Cultural hints
- **Vector cache**: Conversation context

### Batch Operations
For better performance:
```typescript
// Store multiple messages at once
await supabaseVectorService.storeConversationContext(chatId, messages, metadata);
```

## 🔒 Security Considerations

### Row Level Security (RLS)
The schema includes RLS policies for development. For production:
1. Implement user-based access control
2. Restrict access to user's own chats
3. Add authentication checks

### API Keys
- Keep Supabase anon key secure
- Use service role key only for server-side operations
- Rotate keys regularly

## 🎉 Success Indicators

You'll know the system is working when:

1. **Test interface shows green results**
2. **Messages are stored in Supabase dashboard**
3. **Translations show different results based on context**
4. **Cultural hints appear for relevant terms**
5. **Confidence scores are displayed**

## 🚀 Next Steps

Once Supabase Vector is working:

1. **Test with real conversations** - Send messages and translate them
2. **Observe context differences** - See how translations change with different contexts
3. **Monitor performance** - Check database statistics
4. **Optimize settings** - Adjust similarity thresholds and context limits

The RAG translation system is now fully functional with Supabase Vector integration! 🎊
