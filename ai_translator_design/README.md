# Multilingual Messaging App - Documentation

This documentation package provides comprehensive, AI-readable specifications for the multilingual messaging application design with cultural context detection implemented in this project.

## 📁 Documentation Structure

### [DESIGN_OVERVIEW.md](./DESIGN_OVERVIEW.md)
**Purpose**: High-level product vision and features  
**Best for**: Understanding the "what" and "why"  
**Contains**:
- Product vision and goals
- Core features breakdown (including cultural context detection)
- Visual design system overview
- User experience principles
- Technical architecture summary
- Key design decisions with rationale
- Future enhancement ideas

**Use this when**: Starting a new implementation, creating PRDs, or explaining the concept to stakeholders.

---

### [COMPONENT_API.md](./COMPONENT_API.md)
**Purpose**: Detailed component interfaces and usage  
**Best for**: Understanding the "how" of implementation  
**Contains**:
- Complete TypeScript interfaces (including CulturalHint type)
- Props documentation with types and defaults
- Usage examples with code
- Styling rules and variations
- Interactive behavior specifications
- Cultural hint rendering system documentation
- State management patterns
- Helper function implementations
- shadcn/ui component dependencies

**Use this when**: Implementing components, debugging issues, or extending functionality.

---

### [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
**Purpose**: Step-by-step technical implementation  
**Best for**: Building the application from scratch  
**Contains**:
- Prerequisites and dependencies (including HoverCard)
- File structure organization
- Step-by-step implementation workflow
- Code examples for key features
- Cultural hint rendering implementation
- Styling guidelines and patterns
- Testing considerations
- Performance optimization tips
- Common pitfalls and solutions
- Extension patterns

**Use this when**: Building the app, setting up a new project, or refactoring existing code.

---

### [USER_FLOWS.md](./USER_FLOWS.md)
**Purpose**: Interaction patterns and user journeys  
**Best for**: Understanding user experience and edge cases  
**Contains**:
- Primary user flows with steps
- Cultural context discovery flows
- Interaction patterns for all features
- Edge case handling (term matching, overlapping hints, etc.)
- Success criteria for each flow
- Mobile vs desktop differences
- Animation timing specifications
- Accessibility user flows
- Future enhancement flows

**Use this when**: Designing interactions, testing UX, or creating user stories.

---

### [DESIGN_SPECIFICATIONS.md](./DESIGN_SPECIFICATIONS.md)
**Purpose**: Precise visual design specifications  
**Best for**: Pixel-perfect implementation and design consistency  
**Contains**:
- Complete color palette with hex codes (including cultural context UI)
- Typography specifications
- Spacing and layout measurements
- Component dimensions (including info buttons, hover cards)
- Animation and transition details
- Accessibility specifications (contrast ratios, touch targets)
- Responsive breakpoints
- Layout hierarchy
- Z-index management
- Design tokens reference
- Brand guidelines

**Use this when**: Implementing UI, ensuring design consistency, or conducting visual QA.

---

## 🚀 Quick Start Guides

### For AI/LLM Prompting

If you're using Cursor, GitHub Copilot, or similar AI coding assistants:

**For PRD Generation**:
```
Read the following documentation:
- docs/DESIGN_OVERVIEW.md (complete)
- docs/USER_FLOWS.md (sections 1-8)

Generate a Product Requirements Document for a multilingual messaging app
with cultural context detection. Include user stories for slang/idiom 
explanations and acceptance criteria.
```

**For Implementation**:
```
Read the following documentation:
- docs/COMPONENT_API.md (complete - including Cultural Hint Rendering System)
- docs/IMPLEMENTATION_GUIDE.md (complete)
- docs/DESIGN_SPECIFICATIONS.md (Cultural Context UI Colors and Spacing sections)

Implement the TranslatedMessageBox component with inline cultural hints
following the specifications in these docs.
```

**For UX/UI Design**:
```
Read the following documentation:
- docs/DESIGN_SPECIFICATIONS.md (complete)
- docs/USER_FLOWS.md (Flows 2, 3, 4, 6)

Create high-fidelity mockups for the messaging interface with cultural 
context hints following these specs. Include hover states for info buttons.
```

---

### For Human Developers

**New to the project?**
1. Start with [DESIGN_OVERVIEW.md](./DESIGN_OVERVIEW.md) - get the big picture
2. Read [USER_FLOWS.md](./USER_FLOWS.md) - understand user interactions (especially Flows 2-4)
3. Explore [COMPONENT_API.md](./COMPONENT_API.md) - see the code structure
4. Reference [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) as you build

**Implementing a feature?**
1. Check [USER_FLOWS.md](./USER_FLOWS.md) for the expected behavior
2. Look up component APIs in [COMPONENT_API.md](./COMPONENT_API.md)
3. Follow patterns in [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
4. Match styling from [DESIGN_SPECIFICATIONS.md](./DESIGN_SPECIFICATIONS.md)

**Fixing a bug?**
1. Review [USER_FLOWS.md](./USER_FLOWS.md) for edge cases
2. Check [COMPONENT_API.md](./COMPONENT_API.md) for correct prop usage
3. Consult [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for common pitfalls

---

## 🎯 Key Features Documented

### 1. Two-Tier Message Structure
- Original message always visible (top)
- Selectable translation below (bottom)
- Visual language divider
- Docs: DESIGN_OVERVIEW.md, USER_FLOWS.md (Flow 1)

### 2. Cultural Context Detection ⭐ NEW
- Smart detection of slang, idioms, cultural references
- Underlined terms with info buttons
- Detailed hover cards with explanations
- Literal meanings when applicable
- Works for both original and translated text
- Docs: DESIGN_OVERVIEW.md, USER_FLOWS.md (Flows 2-4, 6), COMPONENT_API.md

### 3. Smart Language Selection
- Direct selection via dropdown (4+ languages)
- No cycling through options
- Per-message preference storage
- Cultural hints update per language
- Docs: COMPONENT_API.md, USER_FLOWS.md (Flow 5)

### 4. Voice Message Support
- Play/pause controls
- Animated waveforms
- Independent original/translation playback
- Aggregated cultural context display
- Transcription preview in hover card
- Docs: COMPONENT_API.md (TranslatedVoiceMessageBox), USER_FLOWS.md (Flows 4, 7)

### 5. Group Chat UI
- Color-coded senders (blue, gray, green, purple)
- Avatar and name display
- Messenger-style layout
- Sender-themed info buttons
- Docs: DESIGN_OVERVIEW.md, DESIGN_SPECIFICATIONS.md, USER_FLOWS.md (Flow 8)

### 6. Accessibility
- WCAG AA compliant contrast
- Keyboard navigation (tab to info buttons)
- Screen reader support
- Touch target compliance (44px+)
- Cultural context keyboard accessible
- Docs: DESIGN_SPECIFICATIONS.md, USER_FLOWS.md (Accessibility section)

---

## 📊 Technical Stack

**Framework**: React 18+ with TypeScript  
**Styling**: Tailwind CSS v4.0  
**Components**: shadcn/ui (Radix UI primitives)  
**Icons**: lucide-react  
**State**: React useState (can extend to Zustand/Redux)  
**NEW**: HoverCard component for cultural context

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for complete dependencies.

---

## 🔍 Finding Information

### "How do I...?"

| Question | Document | Section |
|----------|----------|---------|
| Understand the overall concept? | DESIGN_OVERVIEW.md | Product Vision, Core Features |
| Know what props a component takes? | COMPONENT_API.md | Component-specific section |
| Implement language selection? | IMPLEMENTATION_GUIDE.md | Language Selector Popover |
| **Implement cultural hints?** | IMPLEMENTATION_GUIDE.md | Cultural Hint Rendering Function |
| **Render terms with info buttons?** | COMPONENT_API.md | renderTextWithHints() |
| Handle edge cases? | USER_FLOWS.md | Edge Cases & Handling |
| Match exact colors? | DESIGN_SPECIFICATIONS.md | Color Palette, Cultural Context UI Colors |
| Get spacing measurements? | DESIGN_SPECIFICATIONS.md | Spacing & Layout, Cultural Context Spacing |
| Understand user interactions? | USER_FLOWS.md | Flows 1-8 |
| **Understand cultural context UX?** | USER_FLOWS.md | Flows 2, 3, 4, 6 |
| Add new features? | IMPLEMENTATION_GUIDE.md | Extending the Design |
| Ensure accessibility? | DESIGN_SPECIFICATIONS.md | Accessibility Specifications |

---

## 🧩 Data Structures

### Core Types

```typescript
// Message type
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
  culturalHints?: CulturalHint[];  // NEW
  transcription?: string;          // NEW (for voice)
}

// Translation type
interface Translation {
  lang: string;
  text: string;
  culturalHints?: CulturalHint[];  // NEW
}

// Cultural hint type (NEW)
interface CulturalHint {
  term: string;
  type: 'slang' | 'idiom' | 'cultural' | 'reference';
  explanation: string;
  literalMeaning?: string;
}
```

See [COMPONENT_API.md](./COMPONENT_API.md) for complete type definitions.

---

## 🎨 Design System Quick Reference

### Colors
- User: Blue (#3B82F6)
- Contact 1: Gray (#F3F4F6)
- Contact 2: Green (#DCFCE7)
- Contact 3: Purple (#E9D5FF)
- **Info buttons**: Match sender colors
- **Hover card**: White background, gray border

### Spacing
- Message gap: 1rem (gap-4)
- Bubble padding: 0.5rem 1rem (py-2 px-4)
- Avatar size: 1.75rem (h-7 w-7)
- **Info button size**: 1rem (h-4 w-4, 16px)
- **Hover card width**: 20rem (w-80, 320px)

### Typography
- Message text: Default (1rem)
- Labels: 0.75rem (text-xs)
- Timestamps: 0.75rem (text-xs)
- **Cultural hint term**: 0.875rem (text-sm)
- **Cultural hint explanation**: 0.875rem (text-sm)

Full details in [DESIGN_SPECIFICATIONS.md](./DESIGN_SPECIFICATIONS.md).

---

## 📝 Example Prompts for AI Tools

### Generate a PRD
```
Using the documentation in docs/DESIGN_OVERVIEW.md and docs/USER_FLOWS.md,
create a comprehensive Product Requirements Document for this multilingual
messaging application with cultural context detection. Include user stories
for slang/idiom explanations, acceptance criteria, and technical requirements.
Focus on the cultural context feature (Flows 2-4).
```

### Implement a Component
```
Using docs/COMPONENT_API.md and docs/IMPLEMENTATION_GUIDE.md, implement
the TranslatedMessageBox component with inline cultural hint rendering in 
React with TypeScript. Follow the exact prop interface and the 
renderTextWithHints() function specification.
```

### Create Test Cases
```
Using docs/USER_FLOWS.md (Edge Cases section), create a comprehensive test 
suite for the cultural hint feature. Include tests for: term matching 
(case-insensitive), overlapping terms, missing terms, multiple hints per 
message, and info button interactions.
```

### Design Mockups
```
Using docs/DESIGN_SPECIFICATIONS.md (Cultural Context UI Colors and Spacing
sections), create Figma mockups for the messaging interface with cultural 
hints. Show: underlined terms, info buttons, hover card states, and type 
badges. Use the exact colors and measurements specified.
```

---

## 🚧 Implementation Status

Current implementation includes:
- ✅ TranslatedMessageBox component
- ✅ TranslatedVoiceMessageBox component
- ✅ Language selection with popover
- ✅ Voice playback controls and animations
- ✅ Group chat with 4 users
- ✅ Color-coded senders
- ✅ Responsive layout
- ✅ Accessibility features
- ✅ **Cultural context detection (inline hints)**
- ✅ **Info buttons with hover cards**
- ✅ **Term underlining and highlighting**
- ✅ **Type badges (slang, idiom, cultural, reference)**
- ✅ **Literal meanings display**
- ✅ **Voice message transcription preview**

See individual docs for extension opportunities.

---

## 📚 Additional Resources

### File Locations
- Components: `/components/TranslatedMessageBox.tsx`, `/components/TranslatedVoiceMessageBox.tsx`
- Main app: `/App.tsx`
- Styles: `/styles/globals.css`
- UI components: `/components/ui/` (including `hover-card.tsx`)

### External Dependencies
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)

---

## 💡 Tips for Best Results

### When Prompting AI
1. **Be specific**: Reference exact document sections
2. **Provide context**: Explain what you're trying to accomplish
3. **Include examples**: Reference existing code patterns from docs
4. **Iterate**: Start with overview docs, then drill into specifics
5. **Mention cultural hints**: This is a unique feature, specify if relevant

### When Implementing
1. **Read top-down**: Start with DESIGN_OVERVIEW.md
2. **Reference frequently**: Keep COMPONENT_API.md open while coding
3. **Check specifications**: Verify styling against DESIGN_SPECIFICATIONS.md
4. **Test flows**: Use USER_FLOWS.md to validate behavior
5. **Test edge cases**: Review Edge Cases section for cultural hints

### When Designing
1. **Start with specs**: DESIGN_SPECIFICATIONS.md has all measurements
2. **Understand context**: USER_FLOWS.md explains the "why"
3. **Stay consistent**: Use the exact color palette and spacing scale
4. **Think holistically**: Consider all user flows, not just happy path
5. **Cultural sensitivity**: Explanations should inform, not judge

---

## 🤝 Contributing

When adding new features or modifications:

1. **Update relevant docs**: Keep documentation in sync with code
2. **Follow patterns**: Match existing code style and conventions
3. **Document decisions**: Add rationale for significant changes
4. **Test thoroughly**: Cover edge cases documented in USER_FLOWS.md
5. **Consider cultural nuance**: Test with real idioms from multiple cultures

---

## 🌟 Unique Selling Points

What makes this design special:

1. **Cultural Context Detection**: Only messaging app that explains slang and idioms inline
2. **Non-intrusive**: Hints available but don't clutter the interface
3. **Educational**: Helps users learn about different cultures
4. **Adaptive**: Cultural hints change based on selected language
5. **Accessible**: Keyboard and screen reader support for all hints
6. **Voice Support**: Even voice messages can have cultural context

---

## 📞 Questions?

These docs are designed to be comprehensive and AI-readable. If you find gaps or ambiguities:

1. Check if the information exists in another document
2. Review the "Finding Information" table above
3. Look for similar examples in IMPLEMENTATION_GUIDE.md
4. Consider if it's a new feature (may need new docs)
5. Check USER_FLOWS.md Edge Cases section for specific scenarios

---

## 📄 License & Attribution

This documentation is part of the Multilingual Messaging App project.  
See `/Attributions.md` for third-party attributions.

---

**Last Updated**: October 2025  
**Documentation Version**: 2.0 (Cultural Context Feature Added)  
**Implementation Version**: v2.0 - Cultural Context Release
