# Implementation Guide

## Prerequisites

### Required Dependencies
```json
{
  "dependencies": {
    "react": "^18.x",
    "lucide-react": "latest",
    "@radix-ui/react-popover": "latest",
    "@radix-ui/react-avatar": "latest",
    "@radix-ui/react-scroll-area": "latest",
    "@radix-ui/react-hover-card": "latest"
  }
}
```

### Tailwind CSS Configuration
- Tailwind v4.0+ (configured via globals.css)
- No custom config file needed
- Uses default design tokens from styles/globals.css

### shadcn/ui Components Required
- Avatar (`components/ui/avatar.tsx`)
- Button (`components/ui/button.tsx`)
- Card (`components/ui/card.tsx`)
- Popover (`components/ui/popover.tsx`)
- ScrollArea (`components/ui/scroll-area.tsx`)
- **HoverCard** (`components/ui/hover-card.tsx`) - **NEW for cultural context**

---

## File Structure

```
src/
├── App.tsx                                    # Main application
├── components/
│   ├── TranslatedMessageBox.tsx              # Text message component
│   ├── TranslatedVoiceMessageBox.tsx         # Voice message component
│   └── ui/                                    # shadcn/ui components
│       ├── avatar.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── popover.tsx
│       ├── scroll-area.tsx
│       └── hover-card.tsx                     # NEW
├── docs/                                      # Documentation (this folder)
└── styles/
    └── globals.css                            # Global styles & Tailwind
```

---

## Step-by-Step Implementation

### Step 1: Create Base Interfaces

```typescript
// Shared types - can be in a types.ts file or exported from components
export interface Translation {
  lang: string;
  text: string;
  culturalHints?: CulturalHint[];
}

export interface CulturalHint {
  term: string;
  type: 'slang' | 'idiom' | 'cultural' | 'reference';
  explanation: string;
  literalMeaning?: string;
}

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
```

### Step 2: Set Up State Management

```typescript
// In App.tsx
const [translationIndices, setTranslationIndices] = useState<{
  [key: string]: number;
}>({});

const selectTranslation = (messageId: string, index: number) => {
  setTranslationIndices((prev) => ({
    ...prev,
    [messageId]: index,
  }));
};
```

### Step 3: Create Sample Message Data with Cultural Hints

```typescript
const messages: Message[] = [
  {
    id: '1',
    type: 'text',
    originalText: 'Let\'s break the ice and hit the ground running!',
    originalLang: 'EN',
    translations: [
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
    ],
    sender: 'user',
    avatarUrl: 'https://example.com/avatar1.jpg',
    avatarFallback: 'JD',
    timestamp: new Date(),
    culturalHints: [
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
    ],
  },
  // ... more messages
];
```

### Step 4: Render Messages with Cultural Hints

```typescript
<ScrollArea className="h-[600px] rounded-lg border bg-white p-6">
  <div className="flex flex-col gap-4">
    {messages.map((message) => {
      const currentIndex = translationIndices[message.id] || 0;
      
      if (message.type === 'voice') {
        return (
          <TranslatedVoiceMessageBox
            key={message.id}
            duration={message.duration}
            originalLang={message.originalLang}
            translations={message.translations}
            currentTranslationIndex={currentIndex}
            onSelectTranslation={(index) => selectTranslation(message.id, index)}
            sender={message.sender}
            avatarUrl={message.avatarUrl}
            avatarFallback={message.avatarFallback}
            senderName={message.senderName}
            timestamp={message.timestamp}
            transcription={message.transcription}
            culturalHints={message.culturalHints}
          />
        );
      }

      return (
        <TranslatedMessageBox
          key={message.id}
          originalText={message.originalText!}
          originalLang={message.originalLang}
          translations={message.translations}
          currentTranslationIndex={currentIndex}
          onSelectTranslation={(index) => selectTranslation(message.id, index)}
          sender={message.sender}
          avatarUrl={message.avatarUrl}
          avatarFallback={message.avatarFallback}
          senderName={message.senderName}
          timestamp={message.timestamp}
          culturalHints={message.culturalHints}
        />
      );
    })}
  </div>
</ScrollArea>
```

---

## Key Implementation Details

### Cultural Hint Rendering Function

Core function that processes text and inserts cultural hint UI:

```tsx
const renderTextWithHints = (text: string, hints: CulturalHint[], isTranslation: boolean = false) => {
  if (!hints || hints.length === 0) {
    return <span>{text}</span>;
  }

  const parts: JSX.Element[] = [];
  let lastIndex = 0;

  // Sort hints by their position in the text
  const sortedHints = [...hints].sort((a, b) => {
    const indexA = text.toLowerCase().indexOf(a.term.toLowerCase());
    const indexB = text.toLowerCase().indexOf(b.term.toLowerCase());
    return indexA - indexB;
  });

  sortedHints.forEach((hint, hintIndex) => {
    const termIndex = text.toLowerCase().indexOf(hint.term.toLowerCase());
    
    if (termIndex !== -1 && termIndex >= lastIndex) {
      // Add text before the term
      if (termIndex > lastIndex) {
        parts.push(
          <span key={`text-${hintIndex}`}>{text.substring(lastIndex, termIndex)}</span>
        );
      }

      // Add the term with hint indicator
      const actualTerm = text.substring(termIndex, termIndex + hint.term.length);
      parts.push(
        <span key={`hint-${hintIndex}`} className="inline-flex items-center gap-1">
          <span className="underline decoration-dotted underline-offset-2">{actualTerm}</span>
          <HoverCard>
            <HoverCardTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className={`inline-flex h-4 w-4 items-center justify-center rounded-full transition-colors ${
                  isUser
                    ? 'bg-blue-500 text-white hover:bg-blue-400'
                    : sender === 'third'
                    ? 'bg-green-600 text-white hover:bg-green-500'
                    : sender === 'fourth'
                    ? 'bg-purple-600 text-white hover:bg-purple-500'
                    : 'bg-gray-600 text-white hover:bg-gray-500'
                }`}
              >
                <Info className="h-2.5 w-2.5" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80" side="top" align="start">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm text-gray-900">{hint.term}</h4>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                    {hint.type}
                  </span>
                </div>
                {hint.literalMeaning && (
                  <div className="text-xs">
                    <span className="text-gray-500">Literal: </span>
                    <span className="italic text-gray-700">{hint.literalMeaning}</span>
                  </div>
                )}
                <p className="text-sm text-gray-700">{hint.explanation}</p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </span>
      );

      lastIndex = termIndex + hint.term.length;
    }
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(
      <span key="text-end">{text.substring(lastIndex)}</span>
    );
  }

  return <>{parts}</>;
};
```

### Voice Message Cultural Hints

For voice messages, use an aggregated hover card approach:

```tsx
{hasOriginalHints && (
  <HoverCard>
    <HoverCardTrigger asChild>
      <button
        onClick={(e) => e.stopPropagation()}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full..."
      >
        <Info className="h-2.5 w-2.5" />
      </button>
    </HoverCardTrigger>
    <HoverCardContent className="w-80" side="top" align="start">
      <div className="space-y-3">
        {transcription && (
          <div className="border-b border-gray-200 pb-2">
            <p className="text-xs text-gray-500">Transcription:</p>
            <p className="text-sm text-gray-700">{transcription}</p>
          </div>
        )}
        {culturalHints?.map((hint, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm text-gray-900">{hint.term}</h4>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                {hint.type}
              </span>
            </div>
            {hint.literalMeaning && (
              <div className="text-xs">
                <span className="text-gray-500">Literal: </span>
                <span className="italic text-gray-700">{hint.literalMeaning}</span>
              </div>
            )}
            <p className="text-sm text-gray-700">{hint.explanation}</p>
          </div>
        ))}
      </div>
    </HoverCardContent>
  </HoverCard>
)}
```

### Language Selector Popover

The popover appears when clicking on the translation language code:

```tsx
<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
  <PopoverTrigger asChild>
    <div className="flex cursor-pointer items-start gap-2 hover:opacity-80">
      <span className="flex items-center gap-0.5 text-xs">
        {currentTranslation.lang}
        {translations.length > 1 && <ChevronDown className="h-3 w-3" />}
      </span>
      <div className="flex-1">
        {renderTextWithHints(currentTranslation.text, translationHints, true)}
      </div>
    </div>
  </PopoverTrigger>
  {translations.length > 1 && (
    <PopoverContent align={isUser ? 'end' : 'start'} side="bottom">
      <div className="flex flex-col gap-1">
        <div className="px-2 py-1 text-xs text-gray-500">Select language:</div>
        {translations.map((translation, index) => (
          <button
            key={index}
            onClick={() => {
              onSelectTranslation?.(index);
              setPopoverOpen(false);
            }}
            className={`rounded px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100 ${
              index === currentTranslationIndex ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span>{translation.lang}</span>
              {index === currentTranslationIndex && (
                <span className="text-xs text-blue-600">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </PopoverContent>
  )}
</Popover>
```

---

## Styling Guidelines

### Cultural Hint Styling

```tsx
// Underlined term
<span className="underline decoration-dotted underline-offset-2">
  {term}
</span>

// Info button (color varies by sender)
<button className={`inline-flex h-4 w-4 items-center justify-center rounded-full transition-colors ${
  isUser
    ? 'bg-blue-500 text-white hover:bg-blue-400'
    : sender === 'third'
    ? 'bg-green-600 text-white hover:bg-green-500'
    : sender === 'fourth'
    ? 'bg-purple-600 text-white hover:bg-purple-500'
    : 'bg-gray-600 text-white hover:bg-gray-500'
}`}>
  <Info className="h-2.5 w-2.5" />
</button>

// Hover card content
<HoverCardContent className="w-80" side="top" align="start">
  <div className="space-y-2">
    {/* Type badge */}
    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
      {hint.type}
    </span>
    {/* Content */}
  </div>
</HoverCardContent>
```

### Message Bubble Alignment

```tsx
<div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
    {/* Content */}
  </div>
</div>
```

---

## Testing Considerations

### Unit Tests
- Test cultural hint term matching (case-insensitive)
- Test hint sorting by position
- Test overlapping term handling
- Test hint rendering without breaking text flow
- Test language selection updates state correctly
- Test play/pause toggle behavior
- Test popover open/close logic

### Integration Tests
- Test message rendering for all sender types
- Test voice and text message interactions
- Test language switching updates cultural hints
- Test cultural hint hover card interactions
- Test info button click doesn't trigger language selector

### Visual Regression Tests
- Test all 4 sender color schemes
- Test message alignment (left vs right)
- Test popover positioning
- Test hover card positioning
- Test waveform animations
- Test info button styling across themes
- Test underline decoration on terms

---

## Performance Optimizations

### Memoization
```tsx
import { memo, useMemo } from 'react';

export const TranslatedMessageBox = memo(function TranslatedMessageBox({
  // props
}: TranslatedMessageBoxProps) {
  // Memoize hint rendering
  const renderedText = useMemo(
    () => renderTextWithHints(originalText, culturalHints || []),
    [originalText, culturalHints]
  );
  
  // component implementation
});
```

### Lazy Loading Cultural Hints
```tsx
// Only load cultural hints when user interacts
const [hintsLoaded, setHintsLoaded] = useState(false);

const loadHints = async (messageId: string) => {
  if (!hintsLoaded) {
    const hints = await fetchCulturalHints(messageId);
    setHintsLoaded(true);
    // Update message with hints
  }
};
```

### Virtualization (for large chats)
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: messages.length,
  getScrollElement: () => scrollAreaRef.current,
  estimateSize: () => 100,
});
```

---

## Common Pitfalls

### ❌ Don't forget to stop event propagation on info buttons
```tsx
// Wrong
<button onClick={() => showHint()}>

// Correct
<button onClick={(e) => {
  e.stopPropagation();
  showHint();
}}>
```

### ❌ Don't hardcode translation index
```tsx
// Wrong
<TranslatedMessageBox currentTranslationIndex={0} />

// Correct
<TranslatedMessageBox 
  currentTranslationIndex={translationIndices[message.id] || 0} 
/>
```

### ❌ Don't forget case-insensitive term matching
```tsx
// Wrong
const termIndex = text.indexOf(hint.term);

// Correct
const termIndex = text.toLowerCase().indexOf(hint.term.toLowerCase());
```

### ❌ Don't nest hover cards inside clickable areas without stopping propagation
```tsx
// Wrong - clicking hint will trigger language selector
<PopoverTrigger>
  <div>
    <HoverCardTrigger>
      <button>Info</button>
    </HoverCardTrigger>
  </div>
</PopoverTrigger>

// Correct
<HoverCardTrigger>
  <button onClick={(e) => e.stopPropagation()}>Info</button>
</HoverCardTrigger>
```

---

## Extending the Design

### Adding New Cultural Hint Types
1. Update `CulturalHint` type union
2. Add new badge color for type
3. Optionally add type-specific icon

```typescript
type: 'slang' | 'idiom' | 'cultural' | 'reference' | 'meme' | 'historical';
```

### Real-time Cultural Hint Detection
```typescript
const detectCulturalHints = async (text: string, targetLang: string) => {
  const response = await fetch('/api/detect-hints', {
    method: 'POST',
    body: JSON.stringify({ text, targetLang }),
  });
  return response.json();
};
```

### User-Submitted Hints
```typescript
const submitHint = async (messageId: string, hint: CulturalHint) => {
  await fetch('/api/hints', {
    method: 'POST',
    body: JSON.stringify({ messageId, hint }),
  });
  // Update local state
};
```

### Community Voting on Hints
```typescript
interface CulturalHint {
  // ... existing fields
  votes?: number;
  submittedBy?: string;
}
```
