# Design Specifications

## Visual Design System

### Color Palette

#### Message Bubble Colors

**User Messages (Right-aligned)**
- Background: `#3B82F6` (blue-600)
- Text: `#FFFFFF` (white)
- Language labels: `#BFDBFE` (blue-200)
- Translated text: `#DBEAFE` (blue-100)
- Divider lines: `#60A5FA` (blue-400)
- Play button bg: `#FFFFFF` (white)
- Play button icon: `#3B82F6` (blue-600)
- Waveform bars: `#BFDBFE` (blue-200)
- **Info button bg**: `#3B82F6` (blue-500)
- **Info button hover**: `#60A5FA` (blue-400)

**Contact 1 Messages (Li Wei - Left-aligned)**
- Background: `#F3F4F6` (gray-100)
- Text: `#111827` (gray-900)
- Language labels: `#6B7280` (gray-500)
- Translated text: `#4B5563` (gray-600)
- Divider lines: `#D1D5DB` (gray-300)
- Play button bg: `#3B82F6` (blue-600)
- Play button icon: `#FFFFFF` (white)
- Waveform bars: `#9CA3AF` (gray-400)
- **Info button bg**: `#4B5563` (gray-600)
- **Info button hover**: `#6B7280` (gray-500)

**Contact 2 Messages (María - Left-aligned)**
- Background: `#DCFCE7` (green-100)
- Text: `#111827` (gray-900)
- Language labels: `#16A34A` (green-600)
- Translated text: `#4B5563` (gray-600)
- Divider lines: `#4ADE80` (green-400)
- Play button bg: `#16A34A` (green-600)
- Play button icon: `#FFFFFF` (white)
- Waveform bars: `#4ADE80` (green-400)
- **Info button bg**: `#16A34A` (green-600)
- **Info button hover**: `#22C55E` (green-500)

**Contact 3 Messages (Pierre - Left-aligned)**
- Background: `#E9D5FF` (purple-100)
- Text: `#111827` (gray-900)
- Language labels: `#9333EA` (purple-600)
- Translated text: `#4B5563` (gray-600)
- Divider lines: `#C084FC` (purple-400)
- Play button bg: `#9333EA` (purple-600)
- Play button icon: `#FFFFFF` (white)
- Waveform bars: `#C084FC` (purple-400)
- **Info button bg**: `#9333EA` (purple-600)
- **Info button hover**: `#A855F7` (purple-500)

#### Cultural Context UI Colors

**Underlined Terms**
- Decoration: Dotted underline
- Color: Inherits from text color
- Offset: 2px (`underline-offset-2`)

**Info Button**
- Background: Matches sender color (see above)
- Icon color: `#FFFFFF` (white)
- Size: 16px × 16px (h-4 w-4)
- Icon size: 10px (h-2.5 w-2.5)

**Hover Card**
- Background: `#FFFFFF` (white)
- Border: `#E5E7EB` (gray-200)
- Shadow: `shadow-lg`
- Width: 320px (w-80)
- Padding: 16px (p-4)

**Type Badge**
- Background: `#EFF6FF` (blue-50)
- Text: `#1D4ED8` (blue-700)
- Border radius: Full (rounded-full)
- Padding: 2px 8px (px-2 py-0.5)
- Font size: 12px (text-xs)

**Hover Card Text**
- Title (term): `#111827` (gray-900), 14px (text-sm)
- Literal label: `#6B7280` (gray-500), 12px (text-xs)
- Literal value: `#374151` (gray-700), 12px (text-xs), italic
- Explanation: `#374151` (gray-700), 14px (text-sm)

#### UI Element Colors

**Timestamps**
- Color: `#6B7280` (gray-500)

**Sender Names**
- Color: `#4B5563` (gray-600)

**Popover**
- Background: `#FFFFFF` (white)
- Border: `#E5E7EB` (gray-200)
- Hover: `#F3F4F6` (gray-100)
- Selected: `#EFF6FF` (blue-50)
- Text: `#111827` (gray-900)
- Label text: `#6B7280` (gray-500)
- Checkmark: `#3B82F6` (blue-600)

**Background**
- App background: `#F9FAFB` (gray-50)
- Chat area: `#FFFFFF` (white)
- Info boxes: `#EFF6FF` (blue-50), `#F0FDF4` (green-50), `#F5F3FF` (purple-50)

---

### Typography

#### Font Stack
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
```

#### Font Sizes & Weights

**Message Text (Original & Translated)**
- Size: Default (1rem / 16px)
- Weight: Default (400)
- Line height: Default (1.5)

**Language Labels**
- Size: `text-xs` (0.75rem / 12px)
- Weight: Default (400)
- Transform: Uppercase
- Letter spacing: Slight

**Sender Names**
- Size: `text-xs` (0.75rem / 12px)
- Weight: Default (400)

**Timestamps**
- Size: `text-xs` (0.75rem / 12px)
- Weight: Default (400)

**Cultural Hint - Term Name**
- Size: `text-sm` (0.875rem / 14px)
- Weight: Default (400)
- Color: `#111827` (gray-900)

**Cultural Hint - Type Badge**
- Size: `text-xs` (0.75rem / 12px)
- Weight: Default (400)

**Cultural Hint - Literal Label**
- Size: `text-xs` (0.75rem / 12px)
- Weight: Default (400)
- Color: `#6B7280` (gray-500)

**Cultural Hint - Literal Value**
- Size: `text-xs` (0.75rem / 12px)
- Weight: Default (400)
- Style: Italic
- Color: `#374151` (gray-700)

**Cultural Hint - Explanation**
- Size: `text-sm` (0.875rem / 14px)
- Weight: Default (400)
- Color: `#374151` (gray-700)
- Line height: 1.5

**Headings (Info sections)**
- H1: Default size
- Weight: Default
- Margin: `mb-2`

**Body Text (Info sections)**
- Size: Default or `text-sm` (0.875rem / 14px)
- Weight: Default (400)

**Note**: This design intentionally avoids custom font sizing to use system defaults

---

### Spacing & Layout

#### Message Bubble Spacing
```css
/* Internal padding */
padding: 0.5rem 1rem; /* py-2 px-4 */

/* Gap between elements inside bubble */
gap: 0.25rem; /* gap-1 */

/* Gap between messages */
gap: 1rem; /* gap-4 */

/* Maximum width */
max-width: 28rem; /* max-w-md / 448px */

/* Border radius */
border-radius: 1.5rem; /* rounded-3xl */
```

#### Cultural Context Spacing
```css
/* Gap between term and info button */
gap: 0.25rem; /* gap-1 */

/* Info button size */
height: 1rem; /* h-4 / 16px */
width: 1rem; /* w-4 / 16px */

/* Info icon size */
height: 0.625rem; /* h-2.5 / 10px */
width: 0.625rem; /* w-2.5 / 10px */

/* Hover card width */
width: 20rem; /* w-80 / 320px */

/* Hover card padding */
padding: 1rem; /* p-4 / 16px */

/* Hover card spacing */
space-y: 0.5rem; /* space-y-2 / 8px between elements */
space-y: 0.75rem; /* space-y-3 / 12px for voice message hints */

/* Underline offset */
underline-offset: 0.125rem; /* underline-offset-2 / 2px */
```

#### Avatar Spacing
```css
/* Size */
height: 1.75rem; /* h-7 / 28px */
width: 1.75rem; /* w-7 / 28px */

/* Margin from bubble */
margin-left: 0.5rem; /* ml-2 for user */
margin-right: 0.5rem; /* mr-2 for contacts */

/* Flex behavior */
flex-shrink: 0; /* Don't shrink */
```

#### Timestamp Spacing
```css
/* Top margin from bubble */
margin-top: 0.25rem; /* mt-1 */

/* Side margin */
margin-right: 0.5rem; /* mr-2 for user messages */
margin-left: 2.25rem; /* ml-9 for contact messages (accounts for avatar) */
```

#### Sender Name Spacing
```css
/* Bottom margin to bubble */
margin-bottom: 0.25rem; /* mb-1 */

/* Side margin */
margin-left: 2.25rem; /* ml-9 (accounts for avatar) */
```

#### Container Spacing
```css
/* Chat container */
padding: 1.5rem; /* p-6 */
height: 37.5rem; /* h-[600px] */

/* Card wrapper */
padding: 2rem; /* p-8 */
max-width: 48rem; /* max-w-3xl / 768px */
```

---

### Component Dimensions

#### Buttons (Voice Message Play/Pause)
```css
height: 1.5rem; /* h-6 / 24px */
width: 1.5rem; /* w-6 / 24px */
border-radius: 9999px; /* rounded-full */

/* Icon inside */
height: 0.75rem; /* h-3 / 12px */
width: 0.75rem; /* w-3 / 12px */
margin-left: 0.125rem; /* ml-0.5 for Play icon only */
```

#### Cultural Info Button
```css
height: 1rem; /* h-4 / 16px */
width: 1rem; /* w-4 / 16px */
border-radius: 9999px; /* rounded-full */

/* Icon inside */
height: 0.625rem; /* h-2.5 / 10px */
width: 0.625rem; /* w-2.5 / 10px */

/* Touch target (mobile) */
min-width: 2.75rem; /* 44px with padding */
min-height: 2.75rem; /* 44px with padding */
```

#### Language Icons
```css
/* Languages icon (divider) */
height: 0.75rem; /* h-3 / 12px */
width: 0.75rem; /* w-3 / 12px */

/* ChevronDown icon */
height: 0.75rem; /* h-3 / 12px */
width: 0.75rem; /* w-3 / 12px */

/* Info icon */
height: 0.625rem; /* h-2.5 / 10px */
width: 0.625rem; /* w-2.5 / 10px */
```

#### Waveform Bars
```css
/* Individual bar */
width: 0.125rem; /* w-0.5 / 2px */
border-radius: 9999px; /* rounded-full */

/* Gap between bars */
gap: 0.125rem; /* gap-0.5 */

/* Heights (pixels) */
heights: [8, 12, 16, 10, 14, 18, 12, 8, 16, 14, 10, 12, 18, 16, 8, 12, 14, 10, 16, 12]

/* Total bars */
count: 20
```

#### Divider Line
```css
height: 1px; /* h-px */
flex: 1 1 0%; /* flex-1 */
opacity: 0.4;
```

#### Hover Card
```css
width: 20rem; /* w-80 / 320px */
max-height: auto; /* Adjusts to content */
border-radius: 0.5rem; /* rounded-lg */
padding: 1rem; /* p-4 */
```

#### Type Badge
```css
padding: 0.125rem 0.5rem; /* px-2 py-0.5 */
border-radius: 9999px; /* rounded-full */
font-size: 0.75rem; /* text-xs / 12px */
```

---

### Animation & Transitions

#### Waveform Pulse Animation
```css
animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

#### Hover Transitions
```css
transition-property: opacity;
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
transition-duration: 150ms;

/* Hover state */
opacity: 0.9; /* hover:opacity-90 */
opacity: 0.8; /* hover:opacity-80 */
```

#### Button Transitions (including Info Button)
```css
transition-property: background-color, border-color, color, fill, stroke;
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
transition-duration: 150ms;
```

#### Hover Card Animations
```css
/* Defined by Radix UI HoverCard primitive */
/* Open: fade-in + scale from 95% */
/* Close: fade-out + scale to 95% */
/* Duration: ~150ms */
/* Delay before open: ~700ms (configurable) */
```

#### Popover Animations
```css
/* Defined by Radix UI Popover primitive */
/* Open: fade-in + scale from 95% */
/* Close: fade-out + scale to 95% */
/* Duration: ~150ms */
```

---

### Accessibility Specifications

#### Color Contrast Ratios

**Text on Background**
- White on blue-600: 4.54:1 (AA compliant)
- Gray-900 on gray-100: 13.5:1 (AAA compliant)
- Gray-900 on green-100: 12.8:1 (AAA compliant)
- Gray-900 on purple-100: 11.2:1 (AAA compliant)

**Small Text**
- Gray-500 on white: 4.57:1 (AA compliant)
- Blue-200 on blue-600: 4.38:1 (AA compliant for large text)

**Cultural Context**
- White on blue-500 (info button): 4.7:1 (AA compliant)
- White on green-600 (info button): 4.5:1 (AA compliant)
- White on purple-600 (info button): 4.6:1 (AA compliant)
- Gray-900 on white (hover card): 21:1 (AAA compliant)

#### Minimum Touch Targets
- Buttons: 24px × 24px (exceeds mobile requirement when including padding)
- Info buttons: 16px visual + padding = 44px+ touch target (mobile)
- Translation selector: Full translation row (larger than 44px tall)
- Language options in popover: 48px+ tall with padding

#### Focus Indicators
- Inherited from shadcn/ui components
- Typically: 2px solid ring with offset
- Color: Blue-600 or system accent
- Applies to: Info buttons, play buttons, language selector

---

### Responsive Breakpoints

#### Mobile (< 640px)
```css
/* Adjustments needed */
- Reduce max-width of chat container
- Potentially larger touch targets (info buttons 44px+)
- Consider bottom sheet instead of hover card
- Smaller waveform bars
- Adjust padding on message bubbles
- Info button: Always 44px touch target
```

#### Tablet (640px - 1024px)
```css
/* Current design works well */
- Full max-w-md on message bubbles
- Standard touch targets
- Hover card positioning as-is
- Info button hover states
```

#### Desktop (> 1024px)
```css
/* Current design works well */
- Consider max-width on overall container
- Potential for keyboard shortcuts
- Hover states fully functional
- Hover card on hover or click
```

---

### Layout Structure

#### Flexbox Hierarchy

```
App Container (flex col, items-center, justify-center)
└── Card (max-w-3xl)
    ├── Header Section
    │   ├── Title (h1)
    │   ├── Description (p)
    │   └── Info Box (bg-blue-50)
    │
    ├── ScrollArea (h-[600px])
    │   └── Message List (flex col, gap-4)
    │       └── Message Item (flex col)
    │           ├── Sender Name (if not user)
    │           ├── Message Row (flex)
    │           │   ├── Avatar (if contact, mr-2)
    │           │   ├── Bubble (flex col, gap-1)
    │           │   │   ├── Original Layer (flex)
    │           │   │   │   ├── Lang code
    │           │   │   │   └── Text with cultural hints
    │           │   │   │       ├── Text segment
    │           │   │   │       ├── Underlined term + info button
    │           │   │   │       └── Text segment
    │           │   │   ├── Divider (flex)
    │           │   │   └── Translation Layer (flex)
    │           │   │       ├── Lang code + chevron
    │           │   │       └── Text with cultural hints
    │           │   └── Avatar (if user, ml-2)
    │           └── Timestamp
    │
    └── Footer Section
        └── Info Boxes (bg-green-50, bg-purple-50)
```

---

### Z-Index Layers

```css
/* Base layer */
z-index: 0; /* Message bubbles, avatars, text */

/* Hover card overlay */
z-index: 50; /* Radix UI default for hover cards */

/* Hover card content */
z-index: 50; /* Radix UI default for content */

/* Popover overlay */
z-index: 50; /* Radix UI default for overlays */

/* Popover content */
z-index: 50; /* Radix UI default for content */
```

**Note**: Radix UI handles z-index automatically for popovers and hover cards

---

### Border & Shadow Specifications

#### Message Bubbles
```css
border: none;
box-shadow: none;
/* Flat design aesthetic */
```

#### Card Container
```css
border: 1px solid #E5E7EB; /* border (gray-200) */
border-radius: 0.5rem; /* rounded-lg */
box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); /* Default card shadow */
```

#### Hover Card
```css
border: 1px solid #E5E7EB; /* gray-200 */
border-radius: 0.5rem; /* rounded-lg */
box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1),
            0 4px 6px -4px rgb(0 0 0 / 0.1); /* shadow-lg */
```

#### Popover
```css
border: 1px solid #E5E7EB; /* gray-200 */
border-radius: 0.5rem; /* rounded-lg */
box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1),
            0 4px 6px -4px rgb(0 0 0 / 0.1); /* shadow-lg */
```

#### ScrollArea
```css
border: 1px solid #E5E7EB; /* border gray-200 */
border-radius: 0.5rem; /* rounded-lg */
```

#### Info Button
```css
border: none;
box-shadow: none;
/* Flat design, color provides distinction */
```

---

### Icon Specifications

All icons from `lucide-react`:

- **Languages**: Translation divider icon
- **Play**: Voice message play button
- **Pause**: Voice message pause button
- **ChevronDown**: Language selector indicator
- **Info**: Cultural context indicator (NEW)

**Style**: 
- Stroke width: 2px (default)
- Style: Outlined (not filled)
- Alignment: Centered in containers

**Info Icon Specifics**:
- Size: 10px (h-2.5 w-2.5)
- Color: White (on colored button)
- Stroke width: 2px
- Always paired with circular button background

---

### State Indicators

#### Selected Language in Popover
```css
background-color: #EFF6FF; /* bg-blue-50 */
/* Plus checkmark (✓) on right side */
color: #3B82F6; /* text-blue-600 */
font-size: 0.75rem; /* text-xs */
```

#### Playing Audio
```css
/* Play button shows Pause icon */
/* Waveform bars animate with pulse */
/* No color change - only animation */
```

#### Active Cultural Hint
```css
/* Hover card open */
/* Info button may appear slightly lighter (hover state) */
/* No persistent state indicator */
```

#### Underlined Terms with Hints
```css
text-decoration: underline;
text-decoration-style: dotted;
text-decoration-thickness: auto;
text-underline-offset: 2px; /* underline-offset-2 */
/* Color inherits from text */
```

#### Hover States
```css
/* Translation selector */
opacity: 0.8; /* hover:opacity-80 */
cursor: pointer;

/* Popover options */
background-color: #F3F4F6; /* hover:bg-gray-100 */

/* Info buttons */
background-color: /* Slightly lighter variant */
/* e.g., bg-blue-500 -> hover:bg-blue-400 */

/* Hover card trigger */
background-color: /* Slightly lighter variant */
```

---

## Design Tokens Reference

### Spacing Scale (Tailwind)
```
0.5 = 0.125rem = 2px
1   = 0.25rem  = 4px
2   = 0.5rem   = 8px
2.5 = 0.625rem = 10px (for small icons)
3   = 0.75rem  = 12px
4   = 1rem     = 16px
5   = 1.25rem  = 20px
6   = 1.5rem   = 24px
7   = 1.75rem  = 28px
8   = 2rem     = 32px
9   = 2.25rem  = 36px
80  = 20rem    = 320px (hover card width)
```

### Border Radius Scale
```
rounded-lg   = 0.5rem   = 8px
rounded-3xl  = 1.5rem   = 24px
rounded-full = 9999px   = Perfect circle
```

### Opacity Scale
```
opacity-40 = 0.4
opacity-50 = 0.5
opacity-80 = 0.8
opacity-90 = 0.9
```

---

## Brand Guidelines

### Voice & Tone
- **Friendly**: Approachable language in UI text
- **Clear**: Unambiguous labels and instructions
- **Concise**: Minimal text, maximum meaning
- **International**: Culturally neutral design
- **Educational**: Cultural hints are informative, not condescending

### Emoji Usage
- Country flags in participant list (optional)
- Checkmark (✓) for selected state
- Lightbulb (💡) for tips/hints
- Sparkles (✨) for feature highlights
- Globe (🌍) for cultural context type indicator

### Microcopy Examples
- "Select language:" - Popover header
- "Cultural context available" - Screen reader text
- Language selector with dropdown (4+ languages)
- "You (John)" - User identification
- Participant names without titles
- "slang", "idiom", "cultural", "reference" - Type badges
- "Literal:" - Label for literal meanings
- "Transcription:" - Label for voice transcriptions

---

## Design Philosophy

### Principles
1. **Original First**: Always show original message prominently
2. **Choice**: Let users pick their preferred translation
3. **Consistency**: Same interaction pattern for text and voice
4. **Clarity**: Visual hierarchy guides attention
5. **Efficiency**: Direct selection over cycling
6. **Cultural Sensitivity**: Explain, don't judge
7. **Discoverability**: Visual cues without clutter
8. **Accessibility**: Context available to all users

### Inspirations
- **Messenger**: Bubble layout, avatar positioning
- **WhatsApp**: Message alignment, timestamp placement
- **Google Translate**: Two-tier translation structure
- **Discord**: Color-coded users in group chats
- **Duolingo**: Educational tone for language explanations
- **Wikipedia**: Hover cards for additional context

### Unique Features
- Clickable translation layer (not whole bubble)
- Independent audio playback for original + translation
- Visual waveforms in message bubbles
- Per-message language selection (not global)
- **Inline cultural context hints with detailed explanations**
- **Dotted underlines for discoverable context**
- **Sender-colored info buttons for visual consistency**
- **Aggregated hover cards for voice message context**
