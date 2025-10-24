import { create } from 'zustand';
import { User, Message, Chat, Group, Translation, CulturalHint } from '../types';
import { localizationService } from '../services/localization';

interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Chat state
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  
  // Groups state
  groups: Group[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Translation state
  translationPreferences: Map<string, string>; // messageId -> selected language
  defaultTranslationLanguage: string;
  translationMode: 'manual' | 'auto' | 'advanced' | 'auto-advanced'; // Translation mode selection
  translationCache: Map<string, Translation[]>; // text hash -> translations
  culturalHintCache: Map<string, CulturalHint[]>; // text hash -> hints
  intelligentProcessingCache: Map<string, any>; // text hash -> intelligent processing data
  translationCacheEnabled: boolean; // Whether to use translation cache
  translatingMessages: Set<string>; // Set of message IDs being translated
  translationErrors: Map<string, string>; // messageId -> error message
  
  // Smart Suggestions state
  smartSuggestionsUseRAG: boolean; // Whether to use RAG context or recent messages
  smartSuggestionsIncludeOtherLanguage: boolean; // Whether to include suggestions in other person's language
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setChats: (chats: Chat[]) => void;
  setCurrentChat: (chat: Chat | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  updateChatLastMessage: (chatId: string, message: Message) => void;
  setGroups: (groups: Group[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Translation actions
  setTranslationLanguage: (messageId: string, language: string) => void;
  setDefaultTranslationLanguage: (language: string) => void;
  setTranslationMode: (mode: 'manual' | 'auto' | 'advanced' | 'auto-advanced') => void;
  
  // Smart Suggestions actions
  setSmartSuggestionsUseRAG: (useRAG: boolean) => void;
  setSmartSuggestionsIncludeOtherLanguage: (includeOtherLanguage: boolean) => void;
  addTranslation: (messageId: string, translation: Translation) => void;
  addCulturalHints: (messageId: string, hints: CulturalHint[]) => void;
  setTranslating: (messageId: string, isTranslating: boolean) => void;
  setTranslationError: (messageId: string, error: string | null) => void;
  cacheTranslation: (textHash: string, language: string, translation: Translation) => void;
  cacheCulturalHints: (textHash: string, hints: CulturalHint[]) => void;
  cacheIntelligentProcessing: (textHash: string, processing: any) => void;
  getCachedTranslation: (textHash: string, language: string) => Translation | null;
  getCachedCulturalHints: (textHash: string) => CulturalHint[] | null;
  getCachedIntelligentProcessing: (textHash: string) => any | null;
  setTranslationCacheEnabled: (enabled: boolean) => void;
  clearTranslationCache: () => void;
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  chats: [],
  currentChat: null,
  messages: [],
  groups: [],
  isLoading: false,
  error: null,
  
  // Translation initial state
  translationPreferences: new Map(),
  defaultTranslationLanguage: 'EN',
  translationMode: 'manual',
  translationCache: new Map(),
  culturalHintCache: new Map(),
  intelligentProcessingCache: new Map(),
  translationCacheEnabled: true,
  translatingMessages: new Set(),
  translationErrors: new Map(),
  
  // Smart Suggestions initial state
  smartSuggestionsUseRAG: false, // Default to recent messages for speed
  smartSuggestionsIncludeOtherLanguage: false, // Default to user's language only
  
  // Actions
  setUser: (user) => {
    console.log('Store: Setting user with language preference:', user?.defaultLanguage);
    set({ user });
    // Update localization service with user's language preference
    localizationService.setUser(user);
    
    // Update translation language to match user's language preference
    if (user?.defaultLanguage) {
      console.log('Store: Setting defaultTranslationLanguage to:', user.defaultLanguage);
      set({ defaultTranslationLanguage: user.defaultLanguage });
    } else {
      console.log('Store: No defaultLanguage found in user profile');
    }
    
    // Update translation mode from user profile
    if (user?.translationMode) {
      console.log('Store: Setting translationMode to:', user.translationMode);
      set({ translationMode: user.translationMode });
    } else {
      console.log('Store: No translationMode found in user profile, using default');
    }
  },
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setChats: (chats) => set({ chats }),
  setCurrentChat: (currentChat) => set({ currentChat }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  updateMessage: (messageId, updates) => set((state) => ({
    messages: state.messages.map(msg => 
      msg.id === messageId ? { ...msg, ...updates } : msg
    )
  })),
  updateChatLastMessage: (chatId, message) => set((state) => ({
    chats: state.chats.map(chat => 
      chat.id === chatId 
        ? { 
            ...chat, 
            lastMessage: {
              text: message.text,
              senderId: message.senderId,
              senderName: message.senderName,
              timestamp: message.timestamp
            },
            lastMessageTime: message.timestamp,
            updatedAt: Date.now()
          }
        : chat
    )
  })),
  setGroups: (groups) => set({ groups }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  
  // Translation actions
  setTranslationLanguage: (messageId, language) => set((state) => {
    const newPreferences = new Map(state.translationPreferences);
    newPreferences.set(messageId, language);
    return { translationPreferences: newPreferences };
  }),
  
  setDefaultTranslationLanguage: (language) => set({ defaultTranslationLanguage: language }),
  
  setTranslationMode: (mode) => set({ translationMode: mode }),
  
  addTranslation: (messageId, translation) => set((state) => ({
    messages: state.messages.map(msg => 
      msg.id === messageId 
        ? { 
            ...msg, 
            translations: [...(msg.translations || []), translation] 
          }
        : msg
    )
  })),
  
  addCulturalHints: (messageId, hints) => set((state) => ({
    messages: state.messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, culturalHints: hints }
        : msg
    )
  })),
  
  setTranslating: (messageId, isTranslating) => set((state) => {
    const newTranslating = new Set(state.translatingMessages);
    if (isTranslating) {
      newTranslating.add(messageId);
    } else {
      newTranslating.delete(messageId);
    }
    return { translatingMessages: newTranslating };
  }),
  
  setTranslationError: (messageId, error) => set((state) => {
    const newErrors = new Map(state.translationErrors);
    if (error) {
      newErrors.set(messageId, error);
    } else {
      newErrors.delete(messageId);
    }
    return { translationErrors: newErrors };
  }),
  
  cacheTranslation: (textHash, language, translation) => set((state) => {
    // Only cache if cache is enabled
    if (!state.translationCacheEnabled) return state;
    
    const newCache = new Map(state.translationCache);
    const existing = newCache.get(textHash) || [];
    const updated = existing.filter(t => t.lang !== language);
    updated.push({ ...translation, lang: language });
    newCache.set(textHash, updated);
    return { translationCache: newCache };
  }),
  
  cacheCulturalHints: (textHash, hints) => set((state) => {
    // Only cache if cache is enabled
    if (!state.translationCacheEnabled) return state;
    
    const newCache = new Map(state.culturalHintCache);
    newCache.set(textHash, hints);
    return { culturalHintCache: newCache };
  }),
  
  cacheIntelligentProcessing: (textHash, processing) => set((state) => {
    // Only cache if cache is enabled
    if (!state.translationCacheEnabled) return state;
    
    const newCache = new Map(state.intelligentProcessingCache);
    newCache.set(textHash, processing);
    return { intelligentProcessingCache: newCache };
  }),
  
  getCachedTranslation: (textHash, language) => {
    const state = useStore.getState();
    // Return null if cache is disabled
    if (!state.translationCacheEnabled) return null;
    
    const cached = state.translationCache.get(textHash);
    return cached?.find(t => t.lang === language) || null;
  },
  
  getCachedCulturalHints: (textHash) => {
    const state = useStore.getState();
    // Return null if cache is disabled
    if (!state.translationCacheEnabled) return null;
    
    return state.culturalHintCache.get(textHash) || null;
  },
  
  getCachedIntelligentProcessing: (textHash) => {
    const state = useStore.getState();
    // Return null if cache is disabled
    if (!state.translationCacheEnabled) return null;
    
    return state.intelligentProcessingCache.get(textHash) || null;
  },
  
  setTranslationCacheEnabled: (enabled) => set((state) => {
    // If disabling cache, clear existing cache
    if (!enabled) {
      return { 
        translationCacheEnabled: enabled,
        translationCache: new Map(),
        culturalHintCache: new Map(),
        intelligentProcessingCache: new Map()
      };
    }
    return { translationCacheEnabled: enabled };
  }),
  
  clearTranslationCache: () => set({
    translationCache: new Map(),
    culturalHintCache: new Map(),
    intelligentProcessingCache: new Map()
  }),
  
  // Smart Suggestions actions
  setSmartSuggestionsUseRAG: (useRAG) => set({ smartSuggestionsUseRAG: useRAG }),
  setSmartSuggestionsIncludeOtherLanguage: (includeOtherLanguage) => set({ smartSuggestionsIncludeOtherLanguage: includeOtherLanguage }),
}));
