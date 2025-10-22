# Multilingual Messaging App - Design Overview

## Product Vision
A messaging application designed for international communication that displays both original messages and their translations in a two-tier structure. The app provides intelligent cultural context detection, identifying slang, idioms, and cultural references that may not translate directly, helping users understand the true meaning and cultural nuances behind messages.

## Core Features

### 1. Two-Tier Message Structure
- **Top Tier**: Always displays the original message in the sender's native language
- **Bottom Tier**: Shows the translation in the viewer's selected language
- Messages maintain their original context while providing instant translation
- Visual separator with language icon between the two tiers

### 2. Cultural Context Detection & Explanation
- **Smart Detection**: Automatically identifies slang, idioms, cultural references, and figurative language
- **Visual Indicators**: Underlined dotted text marks terms with cultural context
- **Info Buttons**: Clickable ⓘ icons appear next to detected terms
- **Detailed Explanations**: Hover/click reveals:
  - Term type (slang, idiom, cultural, reference)
  - Literal meaning (when applicable)
  - Cultural explanation and context
  - Why direct translation may not capture full meaning
- **Works in Both Tiers**: Context hints available for both original and translated text
- **Voice Message Support**: Cultural hints for voice transcriptions with aggregated view

### 3. Message Types
- **Text Messages**: Standard chat bubbles with original + translated text, inline cultural hints
- **Voice Messages**: Audio playback with play/pause controls, animated waveforms, duration display, and cultural context button
- Both message types support the same translation and cultural context structure

### 4. Multilingual Group Chat Support
- Supports 4+ participants speaking different languages
- Current implementation: English (EN), Chinese (ZH), Spanish (ES), French (FR)
- Each participant has a distinct color scheme for visual identification
- Sender names displayed above messages from other participants

### 5. Dynamic Language Selection
- Click on translation language code to open dropdown selector
- Direct language selection (no cycling required for 4+ languages)
- Checkmark indicates currently selected translation
- Remembers language preference per message
- Smooth popover UI for language selection

## Visual Design System

### Cultural Context UI Elements
- **Underlined Terms**: Dotted underline (2px offset) marks terms with context
- **Info Button**: Small circular button (16px) with Info icon
- **Button Colors**: Match sender color scheme (blue for user, gray/green/purple for contacts)
- **Hover Card**: 320px wide card with term details
- **Type Badge**: Colored pill showing hint type (slang, idiom, cultural, reference)
- **Layout**: Term name, type badge, optional literal meaning, explanation

### Color Schemes by Sender
- **User (You)**: Blue (#3B82F6) - Right-aligned bubbles
- **Contact 1 (Li Wei)**: Gray (#F3F4F6) - Left-aligned bubbles
- **Contact 2 (María)**: Green (#DCFCE7) - Left-aligned bubbles
- **Contact 3 (Pierre)**: Purple (#E9D5FF) - Left-aligned bubbles

### Typography
- Original message: Standard text weight
- Translated message: Slightly lighter/muted color
- Language codes: Small, uppercase, colored by sender theme
- Timestamps: Small, gray, positioned below messages
- Cultural hints: Dotted underline decoration

### Layout
- Messenger-style bubble layout
- Avatars (7x7) positioned outside bubbles
- Maximum bubble width: 28rem (max-w-md)
- 4px gap between messages
- Rounded-3xl corners for bubbles
- Inline info buttons within text flow

### Interactive Elements
- Hover states on clickable translation area
- Play/pause buttons for voice messages
- Animated waveforms during voice playback
- Dropdown chevron icon on translation language code
- Popover appears below the message bubble
- Info buttons with hover effects
- Hover cards for cultural explanations

## User Experience

### Cultural Context Discovery Flow
1. User sees a message with underlined terms
2. Small ⓘ icon appears next to underlined term
3. User clicks or hovers over the icon
4. Hover card appears with explanation
5. User reads term type, literal meaning, and cultural context
6. User gains deeper understanding of message intent
7. Works for both original and translated text

### Language Selection Flow
1. User views message with default translation (their native language)
2. User clicks on translation language code (with chevron icon)
3. Popover opens showing all available languages
4. User selects desired language from list
5. Translation updates immediately
6. Selection persists for that specific message
7. Cultural hints update to match selected language

### Voice Message Cultural Context
1. User sees voice message with ⓘ button
2. Click opens hover card showing:
   - Transcription of audio (if available)
   - All cultural hints found in transcription
   - Type, literal meaning, and explanation for each
3. Provides context without playing audio
4. Separate hints for original vs translated audio

## Technical Architecture

### Component Structure
```
App.tsx (Main container)
├── TranslatedMessageBox (Text messages)
│   ├── Avatar
│   ├── Message bubble
│   │   ├── Original text layer (with inline cultural hints)
│   │   ├── Language divider
│   │   └── Translation layer (with inline cultural hints + popover)
│   └── Timestamp
└── TranslatedVoiceMessageBox (Voice messages)
    ├── Avatar
    ├── Message bubble
    │   ├── Original audio controls + waveform + cultural hint button
    │   ├── Language divider
    │   └── Translation audio controls + waveform + cultural hint button (with popover)
    └── Timestamp
```

### State Management
- `translationIndices`: Object mapping messageId to selected translation index
- `playingOriginal`: Boolean state for original audio playback
- `playingTranslated`: Boolean state for translated audio playback
- `popoverOpen`: Boolean state for language selector visibility
- Cultural hints: Stateless, passed as props per message/translation

### Data Structure
```typescript
interface Message {
  id: string;
  type: 'text' | 'voice';
  originalText?: string;
  originalLang: string;
  translations: Translation[];
  sender: 'user' | 'contact' | 'third' | 'fourth';
  avatarUrl: string;
  avatarFallback: string;
  senderName?: string;
  timestamp: Date;
  duration?: string;
  culturalHints?: CulturalHint[];  // For original text/audio
  transcription?: string;          // For voice messages
}

interface Translation {
  lang: string;
  text: string;
  culturalHints?: CulturalHint[];  // For translated text
}

interface CulturalHint {
  term: string;                    // The term/phrase to highlight
  type: 'slang' | 'idiom' | 'cultural' | 'reference';
  explanation: string;              // Detailed cultural context
  literalMeaning?: string;         // Optional literal translation
}
```

## Key Design Decisions

### Why Cultural Context Detection?
- Idioms and slang rarely translate directly
- Cultural references are often lost in translation
- Users need context to understand true intent
- Bridges cultural gaps in international communication
- Educational value for language learners

### Why Inline Info Buttons?
- Minimizes distraction (only appears when relevant)
- User can choose to explore or ignore
- Maintains message readability
- Clear visual association with specific terms
- Accessible on both desktop and mobile

### Why Hover Cards?
- Provides detailed information without cluttering UI
- Doesn't interrupt conversation flow
- Can show rich content (multiple hints, literal meanings)
- Familiar interaction pattern
- Easy to dismiss

### Why Popover for 4+ Languages?
- Cycling through languages is inefficient with many options
- Direct selection improves user experience
- Visual feedback with checkmark for current selection
- Compact UI that doesn't clutter the message bubble

### Why Color-Code Senders?
- Quick visual identification in group chats
- Reduces cognitive load when scanning conversation
- Complements sender name labels
- Maintains accessibility with sufficient contrast

### Why Separate Audio Controls?
- Users may want to hear original vs translation
- Independent playback allows comparison
- Maintains consistency with text message structure
- Each audio track maintains same visual treatment

## Accessibility Considerations
- High contrast text colors
- Sufficient button sizes (16px info button, 24px play buttons)
- Clear visual indicators for interactive elements
- Language codes use standard ISO codes
- Timestamps formatted in user's locale
- Dotted underlines for terms with hints
- Hover cards accessible via keyboard
- Screen reader support for cultural hints

## Real-World Use Cases

### Business Communication
- "Let's touch base next week" → Explains business jargon
- "加油" (jiā yóu) → Explains Chinese encouragement phrase
- "C'est du gâteau" → Explains French idiom for "easy"

### Casual Chat
- "That's lit!" → Explains modern slang
- "卷" (juǎn) → Explains Chinese hustle culture term
- "No pasa nada" → Explains Spanish casual expression

### Cultural References
- Holiday references (Lunar New Year, Cinco de Mayo)
- Historical events understood differently across cultures
- Pop culture references specific to regions
- Food and tradition explanations

## Future Enhancements
- AI-powered automatic cultural hint detection
- User-submitted cultural explanations
- Community voting on best explanations
- Language-specific hint databases
- Integration with cultural learning resources
- Video/image examples for complex concepts
- Regional dialect detection and hints
- Historical context for older phrases
- Crowdsourced translation improvements
- Real-time translation with cultural analysis
- Smart suggestion of equivalent idioms across languages
