# Component API Documentation

## TranslatedMessageBox

A message bubble component for displaying text messages with original content, selectable translations, and inline cultural context hints.

### Props

```typescript
interface TranslatedMessageBoxProps {
  // Content
  originalText: string;                    // The original message text
  originalLang?: string;                   // Language code (default: 'EN')
  translations: Translation[];             // Array of available translations
  
  // State
  currentTranslationIndex: number;         // Index of currently displayed translation
  
  // Callbacks
  onSelectTranslation?: (index: number) => void;  // Called when user selects a language
  
  // Sender info
  sender: 'user' | 'contact' | 'third' | 'fourth';  // Determines styling
  avatarUrl?: string;                      // Avatar image URL
  avatarFallback?: string;                 // Avatar fallback text (default: 'U')
  senderName?: string;                     // Display name (shown for non-user)
  
  // Metadata
  timestamp?: Date;                        // Message timestamp
  
  // Cultural context
  culturalHints?: CulturalHint[];          // Hints for original text
}

interface Translation {
  lang: string;                 // Language code (e.g., 'EN', 'ZH', 'ES', 'FR')
  text: string;                 // Translated text
  culturalHints?: CulturalHint[];  // Hints for translated text
}

interface CulturalHint {
  term: string;                 // The term/phrase to highlight
  type: 'slang' | 'idiom' | 'cultural' | 'reference';  // Type of cultural context
  explanation: string;          // Detailed explanation
  literalMeaning?: string;      // Optional literal translation
}
```

### Usage Example

```tsx
<TranslatedMessageBox
  originalText="Let's break the ice and hit the ground running!"
  originalLang="EN"
  translations={[
    { 
      lang: 'ZH', 
      text: '让我们打破僵局，立即开始吧！',
      culturalHints: [
        {
          term: '打破僵局',
          type: 'idiom',
          explanation: 'Chinese idiom meaning to break through an awkward situation.',
          literalMeaning: 'break the rigid situation'
        }
      ]
    },
    { lang: 'ES', text: '¡Rompamos el hielo y pongámonos manos a la obra!' },
  ]}
  currentTranslationIndex={0}
  onSelectTranslation={(index) => handleLanguageChange(messageId, index)}
  sender="user"
  avatarUrl="https://example.com/avatar.jpg"
  avatarFallback="JD"
  timestamp={new Date()}
  culturalHints={[
    {
      term: 'break the ice',
      type: 'idiom',
      explanation: 'English idiom meaning to make people feel more relaxed.',
      literalMeaning: 'N/A - figurative expression'
    },
    {
      term: 'hit the ground running',
      type: 'idiom',
      explanation: 'American business idiom meaning to start with great energy.',
      literalMeaning: 'start running immediately upon landing'
    }
  ]}
/>
```

### Cultural Context Rendering

The component automatically:
1. Detects terms in `culturalHints` array
2. Applies dotted underline to matching terms
3. Inserts info button (ⓘ) next to term
4. Creates hover card with explanation on click/hover

**Term Matching**:
- Case-insensitive matching
- Sorts hints by position in text
- Handles overlapping terms gracefully
- Preserves original text casing

### Styling Rules

- **User messages**: Right-aligned, blue background (#3B82F6)
- **Contact messages**: Left-aligned, gray background (#F3F4F6)
- **Third user**: Left-aligned, green background (#DCFCE7)
- **Fourth user**: Left-aligned, purple background (#E9D5FF)
- **Info buttons**: Match sender color scheme
- **Underlined terms**: Dotted decoration, 2px offset

### Interactive Behavior

1. **Translation selection**: Click on translation language code to open popover
2. **Cultural hints**: Click info button to see explanation
3. **Hover card positioning**: Above text by default, adjusts for screen edges
4. **Click propagation**: Info button stops event propagation to prevent language selector
5. **Visual feedback**: Hover opacity change (90%), checkmark for selected language

---

## TranslatedVoiceMessageBox

A message bubble component for displaying voice messages with playback controls, selectable translations, and cultural context explanations.

### Props

```typescript
interface TranslatedVoiceMessageBoxProps {
  // Audio metadata
  duration?: string;                       // Audio duration (default: '0:15')
  
  // Content
  originalLang?: string;                   // Language code (default: 'EN')
  translations: Translation[];             // Array of available translations
  
  // State
  currentTranslationIndex: number;         // Index of currently displayed translation
  
  // Callbacks
  onSelectTranslation?: (index: number) => void;  // Called when user selects a language
  
  // Sender info
  sender: 'user' | 'contact' | 'third' | 'fourth';  // Determines styling
  avatarUrl?: string;                      // Avatar image URL
  avatarFallback?: string;                 // Avatar fallback text (default: 'U')
  senderName?: string;                     // Display name (shown for non-user)
  
  // Metadata
  timestamp?: Date;                        // Message timestamp
  
  // Cultural context
  transcription?: string;                  // Transcription of audio (for context)
  culturalHints?: CulturalHint[];          // Hints for original audio
}
```

### Usage Example

```tsx
<TranslatedVoiceMessageBox
  duration="0:18"
  originalLang="ZH"
  translations={[
    { 
      lang: 'EN', 
      text: '',
      culturalHints: [
        {
          term: '加油',
          type: 'cultural',
          explanation: 'Common Chinese expression of encouragement.',
          literalMeaning: 'add oil/fuel'
        }
      ]
    },
    { lang: 'ES', text: '' },
  ]}
  currentTranslationIndex={0}
  onSelectTranslation={(index) => handleLanguageChange(messageId, index)}
  sender="contact"
  avatarUrl="https://example.com/avatar.jpg"
  avatarFallback="LW"
  senderName="Li Wei"
  timestamp={new Date()}
  transcription="大家加油！我们一定能做好这个项目。"
  culturalHints={[
    {
      term: '加油',
      type: 'cultural',
      explanation: 'Literally "add oil", similar to "go for it!" in English.',
      literalMeaning: 'add oil/fuel'
    }
  ]}
/>
```

### Voice Message Cultural Context

Unlike text messages, voice message cultural context is shown in an **aggregated hover card**:
- Info button appears at end of waveform row
- Clicking shows all cultural hints for that audio
- Includes transcription (if available) at top
- Each hint shown with term, type badge, literal meaning, and explanation

### Internal State

- `playingOriginal`: Boolean - Controls original audio playback animation
- `playingTranslated`: Boolean - Controls translated audio playback animation
- `popoverOpen`: Boolean - Controls language selector visibility
- Hover cards: Managed by Radix UI HoverCard component

### Audio Controls

- **Play button**: Circular button with Play icon (shifts right for visual balance)
- **Pause button**: Same button toggles to Pause icon during playback
- **Button styling**: 
  - User messages: White bg, blue icon
  - Other messages: Colored bg matching sender theme, white icon
- **Click behavior**: Stops propagation to prevent triggering language selector

### Waveform Component

- **Bars**: 20 bars with varying heights
- **Colors**: Match sender theme (blue-200 for user, green-400 for third, etc.)
- **Animation**: `animate-pulse` class when playing
- **Heights**: Predefined array for consistent visual pattern

### Interactive Behavior

1. **Play/Pause**: Click button to toggle audio playback
2. **Language selection**: Click anywhere else in bubble (except buttons) to open language selector
3. **Waveform animation**: Automatically animates when respective audio is playing
4. **Independent controls**: Original and translated audio play independently
5. **Cultural hints**: Click info button to see all hints and transcription

---

## Cultural Hint Rendering System

### renderTextWithHints()

Internal method in `TranslatedMessageBox` that processes text and inserts cultural hint UI elements.

**Algorithm**:
1. If no hints, return plain text
2. Sort hints by position in text (left to right)
3. Split text into segments: [before term] [term with hint UI] [after term]
4. For each hint:
   - Find term position (case-insensitive)
   - Add text before term
   - Add term with underline + info button
   - Track position for next hint
5. Add remaining text after last hint
6. Return JSX with all segments

**Visual Output**:
```jsx
<span>
  "Let's "
  <span className="inline-flex items-center gap-1">
    <span className="underline decoration-dotted">break the ice</span>
    <button>
      <Info icon />
    </button>
  </span>
  " and start!"
</span>
```

---

## Shared UI Components Used

### HoverCard (from shadcn/ui)
```tsx
<HoverCard>
  <HoverCardTrigger asChild>
    <button>
      <Info className="h-2.5 w-2.5" />
    </button>
  </HoverCardTrigger>
  <HoverCardContent className="w-80" side="top">
    {/* Cultural hint details */}
  </HoverCardContent>
</HoverCard>
```

### Popover (from shadcn/ui)
```tsx
<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
  <PopoverTrigger asChild>
    {/* Clickable area */}
  </PopoverTrigger>
  <PopoverContent align={isUser ? 'end' : 'start'} side="bottom">
    {/* Language options */}
  </PopoverContent>
</Popover>
```

### Avatar (from shadcn/ui)
```tsx
<Avatar className="h-7 w-7">
  <AvatarImage src={avatarUrl} />
  <AvatarFallback>{avatarFallback}</AvatarFallback>
</Avatar>
```

### Button (from shadcn/ui)
```tsx
<Button
  variant="ghost"
  size="icon"
  className="h-6 w-6 rounded-full"
  onClick={handleClick}
>
  <Play className="h-3 w-3" />
</Button>
```

---

## Helper Functions

### formatTime
```typescript
const formatTime = (date?: Date) => {
  if (!date) return '';
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
};
```

### Color Helper Functions

```typescript
// Background color based on sender
const getBgColor = () => {
  if (sender === 'user') return 'bg-blue-600 text-white';
  if (sender === 'third') return 'bg-green-100 text-gray-900';
  if (sender === 'fourth') return 'bg-purple-100 text-gray-900';
  return 'bg-gray-100 text-gray-900';
};

// Language label color
const getLangColor = () => {
  if (isUser) return 'text-blue-200';
  if (sender === 'third') return 'text-green-600';
  if (sender === 'fourth') return 'text-purple-600';
  return 'text-gray-500';
};

// Divider color
const getDividerColor = () => {
  if (isUser) return 'bg-blue-400';
  if (sender === 'third') return 'bg-green-400';
  if (sender === 'fourth') return 'bg-purple-400';
  return 'bg-gray-300';
};
```

---

## State Management Pattern

### App Level State

```typescript
// Track translation index per message
const [translationIndices, setTranslationIndices] = useState<{ 
  [key: string]: number 
}>({});

// Update translation for specific message
const selectTranslation = (messageId: string, index: number) => {
  setTranslationIndices((prev) => ({
    ...prev,
    [messageId]: index,
  }));
};

// Get current index (defaults to 0)
const currentIndex = translationIndices[message.id] || 0;
```

### Component Level State (Voice only)

```typescript
const [playingOriginal, setPlayingOriginal] = useState(false);
const [playingTranslated, setPlayingTranslated] = useState(false);
const [popoverOpen, setPopoverOpen] = useState(false);
```

### Cultural Hints (Stateless)

Cultural hints are passed as props and don't require state management:
```typescript
// In message data
culturalHints: [
  {
    term: 'break the ice',
    type: 'idiom',
    explanation: '...',
    literalMeaning: '...'
  }
]

// Passed to component
<TranslatedMessageBox culturalHints={message.culturalHints} />
```

---

## Responsive Behavior

- Messages are constrained to `max-w-md` (28rem / 448px)
- Layout automatically adjusts for mobile viewports
- Avatars remain visible at all screen sizes
- Popover positioning adapts based on available space
- ScrollArea provides smooth scrolling for long conversations
- Hover cards adjust position to stay on screen
- Info buttons are touch-friendly (16px minimum)

---

## Accessibility Features

- Semantic HTML structure
- ARIA labels inherited from shadcn/ui components
- Keyboard navigation support in popovers and hover cards
- Sufficient color contrast ratios
- Clear focus indicators
- Screen reader friendly timestamps
- Icon-only buttons include proper ARIA attributes
- Dotted underlines indicate interactive terms
- Info button accessible via keyboard (tab navigation)
- Hover cards can be triggered via keyboard focus
