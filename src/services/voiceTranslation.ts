import { Message } from '../types';
import { transcriptionService, TranscriptionResult } from './transcription';
import { enhancedTranslationService } from './enhancedTranslation';
import { simpleTranslationService } from './simpleTranslation';
import { culturalHintsService } from './culturalHints';
import { useStore } from '../store/useStore';

export interface VoiceTranslationResult {
  transcription: string;
  translation: string;
  culturalHints?: any[];
  intelligentProcessing?: any;
  originalLanguage?: string;
  targetLanguage: string;
  method: 'enhanced' | 'simple' | 'fallback';
}

export class VoiceTranslationService {
  private static instance: VoiceTranslationService;
  
  private constructor() {}
  
  static getInstance(): VoiceTranslationService {
    if (!VoiceTranslationService.instance) {
      VoiceTranslationService.instance = new VoiceTranslationService();
    }
    return VoiceTranslationService.instance;
  }

  /**
   * Complete voice message translation pipeline:
   * 1. Transcribe audio to text
   * 2. Apply same translation pipeline as regular text
   * 3. Support cultural hints and AI analysis
   */
  async translateVoiceMessage(
    message: Message,
    targetLanguage: string,
    options: {
      useCulturalHints?: boolean;
      useRAG?: boolean;
      useSimpleTranslation?: boolean;
    } = {}
  ): Promise<VoiceTranslationResult> {
    try {
      console.log('Starting voice message translation pipeline for message:', message.id);
      
      // Step 1: Get or create transcription
      let transcription: string;
      let originalLanguage: string | undefined;
      
      if (message.transcription && message.transcription.trim().length > 0) {
        // Use existing transcription
        transcription = message.transcription;
        originalLanguage = message.originalLang;
        console.log('Using existing transcription:', transcription);
      } else {
        // Transcribe the audio
        if (!message.audioUrl) {
          throw new Error('No audio URL available for transcription');
        }
        
        console.log('Transcribing audio from URL:', message.audioUrl);
        
        // For Firebase Storage URLs, we need to download the file first
        let audioUri = message.audioUrl;
        if (message.audioUrl.startsWith('https://firebasestorage.googleapis.com/')) {
          // Download the audio file from Firebase Storage
          const { MediaService } = await import('./media');
          audioUri = await MediaService.downloadVoiceMessage(message.audioUrl);
        }
        
        const transcriptionResult = await transcriptionService.transcribeWithLanguageDetection(audioUri);
        transcription = transcriptionResult.text;
        originalLanguage = transcriptionResult.language;
        
        if (!transcription || transcription.trim().length === 0) {
          throw new Error('Transcription returned empty text');
        }
        
        // Update the message with transcription
        await this.updateMessageTranscription(message.id, transcription, originalLanguage, message.chatId);
      }

      if (!transcription || transcription.trim().length === 0) {
        throw new Error('No transcription available for voice message');
      }

      console.log('Transcription completed:', transcription);
      console.log('Original language detected:', originalLanguage);

      // Step 2: Create a text message from transcription for translation
      const textMessage: Message = {
        ...message,
        text: transcription,
        originalLang: originalLanguage,
      };

      // Step 3: Apply translation pipeline based on options
      let translationResult: VoiceTranslationResult;

      if (options.useCulturalHints && enhancedTranslationService.isAvailable()) {
        // Use enhanced translation with cultural hints and AI analysis
        console.log('Using enhanced translation with cultural hints');
        const enhancedResult = await enhancedTranslationService.translateMessage(
          textMessage,
          targetLanguage,
          {
            useRAG: options.useRAG ?? true,
            useCulturalHints: true,
            useSimpleTranslation: false,
            contextLimit: 10,
            confidenceThreshold: 0.6
          }
        );

        translationResult = {
          transcription,
          translation: enhancedResult.translation,
          culturalHints: enhancedResult.culturalHints,
          intelligentProcessing: enhancedResult.intelligentProcessing,
          originalLanguage,
          targetLanguage,
          method: 'enhanced'
        };
      } else if (options.useCulturalHints && simpleTranslationService.isAvailable()) {
        // Use simple translation with cultural hints
        console.log('Using simple translation with cultural hints');
        const simpleResult = await simpleTranslationService.translateWithCulturalHints(
          transcription,
          targetLanguage,
          originalLanguage
        );

        translationResult = {
          transcription,
          translation: simpleResult.translation,
          culturalHints: simpleResult.culturalHints,
          originalLanguage,
          targetLanguage,
          method: 'simple'
        };
      } else {
        // Use basic translation
        console.log('Using basic translation');
        const basicResult = await simpleTranslationService.translateText(transcription, targetLanguage);

        translationResult = {
          transcription,
          translation: basicResult,
          originalLanguage,
          targetLanguage,
          method: 'fallback'
        };
      }

      console.log('Voice translation completed successfully');
      return translationResult;

      } catch (error) {
        console.error('Error in voice translation pipeline:', error);
        
        // If transcription failed, try to provide a helpful error message
        if (error instanceof Error && error.message.includes('transcribe')) {
          throw new Error('Voice transcription failed. Please check your internet connection and try again.');
        }
        
        throw new Error(`Voice translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
  }

  /**
   * Update message with transcription data
   */
  private async updateMessageTranscription(
    messageId: string,
    transcription: string,
    originalLanguage?: string,
    chatId?: string
  ): Promise<void> {
    try {
      // Update in local SQLite cache first (this always works)
      const { sqliteService } = await import('./sqlite');
      await sqliteService.updateMessageTranscription(messageId, transcription, originalLanguage);

      // Update in Firestore if we have chatId
      if (chatId) {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { firestore } = await import('./firebase');
        
        const messageRef = doc(firestore, 'messages', chatId, 'threads', messageId);
        await updateDoc(messageRef, {
          transcription,
          originalLang: originalLanguage,
          updatedAt: Date.now()
        });
        console.log('Updated message transcription in Firestore');
      } else {
        console.log('Updated message transcription in SQLite only (no chatId provided)');
      }
    } catch (error) {
      console.error('Error updating message transcription:', error);
      // Don't throw - transcription was successful, just database update failed
    }
  }

  /**
   * Check if voice message has transcription
   */
  hasTranscription(message: Message): boolean {
    return transcriptionService.hasTranscription(message);
  }

  /**
   * Get transcription from voice message
   */
  getTranscription(message: Message): string | null {
    return transcriptionService.getTranscription(message);
  }

  /**
   * Transcribe voice message without translation
   */
  async transcribeVoiceMessage(message: Message): Promise<TranscriptionResult> {
    console.log('🎤 VoiceTranslationService.transcribeVoiceMessage called:');
    console.log('  - message.id:', message.id);
    console.log('  - message.transcription exists:', !!message.transcription);
    console.log('  - message.audioUrl exists:', !!message.audioUrl);
    
    if (message.transcription && message.transcription.trim().length > 0) {
      console.log('🎤 Using existing transcription:', message.transcription);
      return {
        text: message.transcription,
        language: message.originalLang,
        confidence: 0.9
      };
    }

    if (!message.audioUrl) {
      throw new Error('No audio URL available for transcription');
    }

    const result = await transcriptionService.transcribeWithLanguageDetection(message.audioUrl);
    
    // Update the message with transcription
    await this.updateMessageTranscription(message.id, result.text, result.language, message.chatId);
    
    return result;
  }

  /**
   * Auto-translate voice message based on user's translation mode
   */
  async autoTranslateVoiceMessage(
    message: Message,
    userTranslationMode: 'manual' | 'auto' | 'advanced' | 'auto-advanced',
    targetLanguage: string
  ): Promise<VoiceTranslationResult | null> {
    // Only auto-translate for 'auto' and 'auto-advanced' modes
    if (userTranslationMode !== 'auto' && userTranslationMode !== 'auto-advanced') {
      return null;
    }

    try {
      const useCulturalHints = userTranslationMode === 'advanced' || userTranslationMode === 'auto-advanced';
      
      return await this.translateVoiceMessage(message, targetLanguage, {
        useCulturalHints,
        useRAG: useCulturalHints,
        useSimpleTranslation: true
      });
    } catch (error) {
      console.error('Error in auto-translate voice message:', error);
      return null;
    }
  }
}

// Export singleton instance
export const voiceTranslationService = VoiceTranslationService.getInstance();
