export interface TranscriptionResult {
  text: string;
  language?: string;
  confidence?: number;
}

export class TranscriptionService {
  private static instance: TranscriptionService;
  
  private constructor() {
    // OpenAI client will be created when needed to avoid import issues
  }
  
  static getInstance(): TranscriptionService {
    if (!TranscriptionService.instance) {
      TranscriptionService.instance = new TranscriptionService();
    }
    return TranscriptionService.instance;
  }

  /**
   * Transcribe audio file using OpenAI Whisper
   */
  async transcribeAudio(audioUri: string): Promise<TranscriptionResult> {
    try {
      console.log('🎤 Starting transcription for audio:', audioUri);
      
      // Check if OpenAI API key is available
      const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not found. Please set EXPO_PUBLIC_OPENAI_API_KEY in your environment.');
      }
      
      // Create form data for OpenAI API
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'audio.m4a',
      } as any);
      formData.append('model', 'whisper-1');
      // Don't specify language parameter - let Whisper auto-detect
      formData.append('response_format', 'json');

      console.log('🎤 Calling OpenAI Whisper API...');
      // Call OpenAI Whisper API
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI Whisper API error:', response.status, errorText);
        throw new Error(`Transcription failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('🎤 Transcription result:', result);

      return {
        text: result.text || '',
        language: result.language,
        confidence: 0.9, // Whisper doesn't provide confidence scores
      };
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Transcribe audio with language detection
   */
  async transcribeWithLanguageDetection(audioUri: string): Promise<TranscriptionResult> {
    
    try {
      const result = await this.transcribeAudio(audioUri);
      
      // If language wasn't detected, try to detect it from the text
      if (!result.language && result.text) {
        result.language = await this.detectLanguage(result.text);
      }
      
      return result;
    } catch (error) {
      console.error('🎤 Error in transcribeWithLanguageDetection:', error);
      throw error;
    }
  }

  /**
   * Detect language from text using OpenAI API directly
   */
  private async detectLanguage(text: string): Promise<string> {
    try {
      console.log('🌍 Detecting language for text:', text.substring(0, 50) + '...');
      
      const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      if (!apiKey) {
        console.log('🌍 No OpenAI API key, defaulting to English');
        return 'en';
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
              content: 'You are a language detection expert. Given a text, return only the ISO 639-1 language code (e.g., "en", "es", "zh"). Return "en" if you cannot determine the language.'
            },
            {
              role: 'user',
              content: `Detect the language of this text: "${text}"`
            }
          ],
          max_tokens: 10,
          temperature: 0,
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🌍 Language detection API error:', response.status, errorText);
        return 'en';
      }

      const result = await response.json();
      const detectedLanguage = result.choices[0]?.message?.content?.trim().toLowerCase();
      
      console.log('🌍 Detected language:', detectedLanguage);
      
      // Validate the language code
      const validLanguageCodes = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'ar', 'hi', 'pt', 'ru', 'it', 'nl', 'sv', 'da', 'no', 'fi', 'pl', 'tr', 'th', 'vi', 'id', 'ms', 'tl', 'uk', 'bg', 'hr', 'cs', 'sk', 'hu', 'ro', 'el', 'he', 'fa', 'ur', 'bn', 'ta', 'te', 'ml', 'kn', 'gu', 'pa', 'or', 'as', 'ne', 'si', 'my', 'km', 'lo', 'ka', 'am', 'sw', 'zu', 'af', 'sq', 'az', 'be', 'bs', 'ca', 'cy', 'et', 'eu', 'fo', 'gl', 'is', 'kk', 'ky', 'lv', 'lt', 'mk', 'mt', 'mn', 'sr', 'tg', 'tk', 'uz', 'vi', 'xh', 'yo', 'zu'];
      
      if (detectedLanguage && validLanguageCodes.includes(detectedLanguage)) {
        return detectedLanguage;
      }
      
      return 'en'; // Default to English
    } catch (error) {
      console.error('🌍 Error detecting language:', error);
      return 'en'; // Default to English on error
    }
  }

  /**
   * Check if transcription is available for a message
   */
  hasTranscription(message: any): boolean {
    return !!(message?.transcription && message.transcription.trim().length > 0);
  }

  /**
   * Get transcription text from message
   */
  getTranscription(message: any): string | null {
    return message?.transcription || null;
  }
}

// Export singleton instance
export const transcriptionService = TranscriptionService.getInstance();
