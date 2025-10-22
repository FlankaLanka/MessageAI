# User Flows & Interactions

## Primary User Flows

### Flow 1: Reading Messages in Default Language
**Goal**: User views conversation in their native language

```
1. User opens the messaging app
2. Messages load with:
   - Original text/audio in sender's language (top tier)
   - Translation in user's default language (bottom tier - English in demo)
3. User can immediately understand all messages
4. Timestamp shows when each message was sent
5. Avatar and name indicate who sent each message
6. Underlined terms indicate cultural context available
```

**Success Criteria**: 
- All messages display with original + translation
- User's default language (EN) is pre-selected
- No action required to view basic translations
- Cultural context indicators visible but non-intrusive

---

### Flow 2: Understanding Cultural Context (Text Message)
**Goal**: User wants to understand the cultural meaning of slang/idiom

```
1. User sees a message with underlined terms
2. User notices a dotted underline on "break the ice"
3. Small ⓘ icon appears next to the underlined term
4. User clicks on the ⓘ icon
5. Hover card appears showing:
   - Term: "break the ice"
   - Type badge: "idiom"
   - Literal meaning: "N/A - figurative expression"
   - Explanation: "English idiom meaning to make people feel more relaxed..."
6. User reads the explanation
7. User clicks away or hovers off to dismiss
8. User now understands the cultural context
```

**Interactive Elements**:
- Underlined term: Dotted decoration, 2px offset
- Info button: 16px circular button, sender-colored
- Hover card: 320px wide, appears above text
- Type badge: Blue rounded pill
- Explanation text: 14px, gray-700

**Visual Feedback**:
- Hover state on info button: Slightly lighter color
- Hover card shadow and border
- Smooth fade-in animation

**Error States**:
- If hint fails to load: Show generic "Context unavailable" message
- If term not found: No underline or button shown

---

### Flow 3: Cultural Context in Translations
**Goal**: User switches language and sees culture-specific hints

```
1. User views message in English (default)
2. Original: "Let's break the ice" (with cultural hint)
3. Translation (EN→ZH): "让我们打破僵局" (with hint on Chinese idiom)
4. User clicks ZH language code to switch
5. Translation updates with different cultural hints
6. User clicks ⓘ on "打破僵局"
7. Sees explanation specific to Chinese idiom
8. Understands both source and target cultural context
```

**Key Insight**: Cultural hints adapt per language, explaining target culture's expressions

---

### Flow 4: Voice Message Cultural Context
**Goal**: User wants to understand cultural context in voice message

```
1. User sees voice message with waveform
2. Small ⓘ icon appears at end of original audio row
3. User clicks the ⓘ icon
4. Hover card opens showing:
   - Transcription: "大家加油！我们一定能做好这个项目。"
   - Cultural hint for "加油":
     - Type: cultural
     - Literal: "add oil/fuel"
     - Explanation: "Common Chinese encouragement phrase..."
5. User understands context without playing audio
6. User can then play audio with full understanding
```

**Difference from Text Messages**:
- Voice messages show **aggregated** hover card
- Includes transcription at top
- Shows all cultural hints together
- One info button per audio track (not inline)

---

### Flow 5: Switching Translation Language (Text Message)
**Goal**: User wants to view a message in a different language

```
1. User sees a translated message (currently showing EN)
2. User notices the language code "EN" with a chevron icon ▼
3. User clicks on the language code area
4. Popover opens showing available languages:
   - EN ✓ (currently selected, with checkmark)
   - ES
   - FR
   - ZH
5. User clicks "ES" to view Spanish translation
6. Popover closes automatically
7. Translation updates to Spanish immediately
8. Cultural hints update to Spanish-specific context
9. Language code changes to "ES ▼"
10. Other messages remain unchanged
```

**Interactive Elements**:
- Clickable area: Entire translation row (language code + text)
- Hover state: 80% opacity on hover
- Visual feedback: Checkmark shows current selection
- Popover positioning: Right-aligned for user messages, left-aligned for others

---

### Flow 6: Discovering Multiple Idioms in One Message
**Goal**: User understands multiple cultural references in single message

```
1. User sees: "Let's break the ice and hit the ground running!"
2. Two underlined terms: "break the ice" and "hit the ground running"
3. Each has its own ⓘ icon
4. User clicks first icon:
   - Sees explanation for "break the ice"
5. User closes hover card
6. User clicks second icon:
   - Sees different explanation for "hit the ground running"
7. User now understands both idioms in context
```

**Technical Handling**:
- Terms sorted by position (left to right)
- No overlap handling needed (different buttons)
- Each hover card independent
- Can have multiple open simultaneously

---

### Flow 7: Playing Voice Messages
**Goal**: User wants to listen to a voice message

```
1. User sees voice message bubble
2. User clicks play button (▶️) on original audio (top tier)
3. Button changes to pause (⏸)
4. Waveform begins pulsing animation
5. Audio plays (simulated in demo)
6. User clicks pause button
7. Button changes back to play
8. Waveform stops animating

--- Separate action ---

9. User clicks play button on translated audio (bottom tier)
10. Translation audio plays independently
11. Original audio is unaffected
```

**States**:
- `playingOriginal: false` → Play icon, static waveform
- `playingOriginal: true` → Pause icon, animated waveform
- `playingTranslated: false` → Play icon, static waveform
- `playingTranslated: true` → Pause icon, animated waveform

**Event Propagation**:
- Play button click stops propagation
- Info button click stops propagation
- Prevents accidentally opening language selector

---

### Flow 8: Identifying Senders in Group Chat
**Goal**: User wants to know who sent each message

```
1. User scans the conversation
2. Visual identification:
   - Blue bubbles (right-aligned) = User's own messages
   - Gray bubbles (left-aligned) = Li Wei's messages
   - Green bubbles (left-aligned) = María's messages
   - Purple bubbles (left-aligned) = Pierre's messages
3. Additional context:
   - Sender name appears above each message (except user's)
   - Avatar shows profile picture
   - Avatar fallback shows initials if image unavailable
   - Info button colors match sender theme
```

**Design Pattern**: Messenger/WhatsApp style
- User's messages always on right
- Others' messages always on left
- Color coding provides quick visual scanning
- Names reduce ambiguity

---

## Edge Cases & Handling

### Edge Case 1: Term Not Found in Text
**Scenario**: Cultural hint term doesn't match text exactly

```
Behavior:
- System searches case-insensitively
- If not found, hint is skipped
- No broken UI or error shown
- Other hints still render normally
```

**Implementation**:
```typescript
const termIndex = text.toLowerCase().indexOf(hint.term.toLowerCase());
if (termIndex === -1) return; // Skip this hint
```

---

### Edge Case 2: Overlapping Terms
**Scenario**: Two cultural hints reference overlapping text portions

```
Example: "hit the road" and "road running"

Behavior:
- Hints sorted by position
- First match takes precedence
- Second hint only processes remaining text
- Prevents duplicate rendering
```

**Algorithm**:
- Track lastIndex after each hint
- Only process text from lastIndex forward
- Natural left-to-right flow

---

### Edge Case 3: Very Long Explanations
**Scenario**: Cultural explanation exceeds hover card space

```
Behavior:
- Hover card has max-width: 320px (w-80)
- Text wraps naturally
- Card height adjusts automatically
- Scrolling not needed (explanations should be concise)
```

**Best Practice**: Keep explanations under 100 words

---

### Edge Case 4: No Cultural Hints Available
**Scenario**: Message has no slang, idioms, or cultural references

```
Behavior:
- No underlines shown
- No info buttons rendered
- Message appears as normal text
- No performance impact
- Function returns plain text span
```

---

### Edge Case 5: Cultural Hint in Voice Transcription
**Scenario**: Voice message transcription contains cultural context

```
Behavior:
- Info button appears at end of waveform
- Click shows transcription + all hints
- Transcription shown at top of hover card
- Each hint listed below
- User can understand context before playing
```

---

### Edge Case 6: Multiple Messages with Same Idiom
**Scenario**: Same idiom appears in different messages

```
Behavior:
- Each message has independent hints
- Same explanation shown for each
- No shared state between messages
- User can explore each independently
```

**Future Enhancement**: "You've seen this before" indicator

---

### Edge Case 7: Message with Only Cultural Content
**Scenario**: Entire message is an idiom (e.g., "加油!")

```
Behavior:
- Entire message underlined
- Info button at end
- User clicks to see full explanation
- Translation shows equivalent expression
```

---

### Edge Case 8: User Switches Language During Hover
**Scenario**: User opens cultural hint, then switches translation language

```
Behavior:
- Hover card closes automatically
- Translation updates
- New cultural hints for new language
- User can re-open hint for new language
```

---

## Interaction Patterns Summary

### Click Targets

| Element | Click Action | Visual Feedback |
|---------|-------------|-----------------|
| Translation text/language code | Open language selector | Hover opacity 80% |
| Language option in popover | Select language, close popover | Blue background on current |
| Play button (original) | Toggle original audio playback | Icon changes |
| Play button (translated) | Toggle translated audio playback | Icon changes |
| Info button (inline text) | Show cultural hint hover card | Button color lightens |
| Info button (voice message) | Show all hints + transcription | Button color lightens |
| Message bubble background | None (not clickable) | None |
| Underlined term | Visual indicator only | Dotted decoration |

### Keyboard Navigation

**Tab Order**:
1. First message translation selector
2. First message cultural hint buttons (if present)
3. First message play buttons (if voice)
4. Second message translation selector
5. Second message cultural hint buttons (if present)
6. Continue through all messages

**Keyboard Shortcuts**:
- `Tab`: Navigate to next interactive element
- `Enter`: Activate focused button (play, info, language selector)
- `Esc`: Close open hover card or popover
- `Arrow keys`: Navigate within popover language options

---

## Accessibility User Flows

### Screen Reader Flow
```
1. "Message from Li Wei, sent at 2:45 PM"
2. "Original message in Chinese: 你好大家！"
3. "Cultural context available for this message"
4. "Button: View cultural hint for 加油"
5. [User activates button]
6. "Cultural hint: 加油, type: cultural"
7. "Literal meaning: add oil or fuel"
8. "Explanation: Common Chinese expression of encouragement..."
9. "Translated to English: Hello everyone!"
10. "Button: Select translation language, currently English"
```

### Keyboard-Only Flow (Cultural Hints)
```
1. Tab to translation text
2. Tab to first info button (if hints present)
3. Press Enter to open hover card
4. Read cultural hint with screen reader
5. Press Esc to close hover card
6. Tab to next info button (if multiple hints)
7. Continue through message
```

---

## Mobile vs Desktop Differences

### Mobile-Specific Considerations
- Touch targets: Minimum 44x44pt (iOS) / 48x48dp (Android)
- Info buttons: 16px icon but 44px touch area (padding)
- Hover cards: May appear as bottom sheet on small screens
- Tap vs hover: Always require tap to open hover card
- Font sizes may scale up for readability
- Underline decoration more pronounced (better visibility)

### Desktop-Specific Features
- Hover states on interactive elements
- Cursor changes (pointer on clickable areas)
- Hover card can be triggered by hover OR click
- Potential for keyboard shortcuts
- Larger hover card (more explanation space)

---

## Animation Timing

### Waveform Animation
- Type: Tailwind's `animate-pulse`
- Duration: ~2s cycle
- Easing: Ease-in-out
- Trigger: When `isPlaying === true`

### Hover Card Animation
- Open: Fade + scale from 95% to 100%
- Duration: 150ms
- Close: Fade + scale to 95%
- Duration: 100ms
- Provided by Radix UI primitives

### Info Button Hover
- Transition: `transition-colors`
- Duration: 150ms
- Easing: Ease-in-out

### Popover Animation
- Open: Fade + scale from 95% to 100%
- Duration: 150ms
- Close: Fade + scale to 95%
- Duration: 100ms

---

## Cultural Context Type Behaviors

### Slang
- **Example**: "crush it", "卷" (juǎn)
- **Explanation focus**: Modern usage, informal context
- **May include**: Age group, region, online vs offline

### Idiom
- **Example**: "break the ice", "C'est du gâteau"
- **Explanation focus**: Figurative meaning, origin if relevant
- **May include**: Literal translation, equivalent expressions

### Cultural
- **Example**: "加油" (jiā yóu), holiday references
- **Explanation focus**: Cultural significance, when/how used
- **May include**: Historical context, social norms

### Reference
- **Example**: Pop culture, historical events
- **Explanation focus**: What it references, why it matters
- **May include**: Links to learn more, context era

---

## Future User Flows

### AI-Powered Hint Detection (Future)
```
1. User types message in original language
2. AI detects potential idioms/slang
3. System suggests adding cultural hints
4. User reviews and confirms hints
5. Message sends with hints attached
6. Recipients see hints automatically
```

### Community-Contributed Hints (Future)
```
1. User sees message without cultural hint
2. User clicks "Add hint" button
3. Form appears: term, type, explanation
4. User submits hint
5. Hint pending review/vote
6. After approval, shows for all users
```

### Language Learning Mode (Future)
```
1. User enables "Learning Mode"
2. System highlights ALL potentially confusing terms
3. More detailed explanations shown
4. Quiz/flashcard mode for review
5. Tracks which hints user has seen
```
