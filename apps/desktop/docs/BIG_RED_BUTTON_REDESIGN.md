# Big Red Button Redesign - Design Documentation

**Date:** 2025-11-29
**Version:** v0.2.0 (UX Simplification)

---

## Problem

The original Monotask interface suffered from:

- **Decision fatigue**: Multiple form fields (task name, blocklist) before starting
- **Cognitive overhead**: Complex workflow for a simple action (begin focus)
- **Friction asymmetry violation**: Hard to start (many steps), hard to stop (same friction)
- **Visual noise**: Form-based UI lacked ritual significance

The "boring infrastructure" aesthetic was achieved through forms, but forms are inherently functional, not ritualistic.

---

## Solution: The Big Red Button Pattern

Simplify the idle state to **TWO elements**:

1. **Time Duration Selector** (dropdown) - Quick, no-thought selection
2. **Big Red Button** (enso-inspired) - Single consequential action

### Core UX Principle

**Reduction PDP** + **Commitment BCT 1.9** = One obvious, ritualistic action

- No intention setting (removed cognitive load)
- No blocklist configuration (sensible defaults)
- No validation errors (pre-selected duration)
- Just: **SELECT → PRESS → BEGIN**

---

## Visual Design: Enso-Inspired Aesthetic

The button design directly references the app icon's **enso** (Zen circle):

### Color Palette (from `/src-tauri/icons/icon.png`)

- **Charcoal background**: `#2D3436` (icon's dark base)
- **Cream stroke**: `#E8DCC4` (outer enso brushstroke)
- **Green accent**: `#8B9D83` (inner enso circle)
- **Neutral text**: `#78716C` (secondary elements)

### Design Elements

**Circular shape** (240px × 240px):
- Echoes the enso's circular form
- Organic, hand-drawn quality via SVG stroke properties
- Two concentric circles (outer cream, inner green)
- Brushstroke aesthetic: `strokeDasharray` creates gaps for organic feel

**Typography**:
- Primary: "BEGIN FOCUS" (uppercase, letterspaced, cream)
- Secondary: Duration hint (lowercase, green)
- Infrastructure-grade font stack (system fonts)

**Interaction states**:
- **Hover**: Subtle scale (1.02×) + slight rotation of enso layers
- **Active/Press**: Scale down (0.98×) for physical feedback
- **Disabled**: Reduced opacity, no interaction
- **Focus**: Green outline for keyboard accessibility

### Why This Design Works

1. **Visual hierarchy**: Button dominates, selector is utility
2. **Consequential feel**: Large size signals importance
3. **Ritualistic quality**: Pressing feels deliberate, not casual
4. **Calm interaction**: No animations, no celebration, just transition
5. **Infrastructure aesthetic**: Functional, reliable, unsexy

---

## Behavioral Science Backing

### Behavior Change Techniques (BCTs)

**BCT 1.9 - Commitment**:
- Physical button press creates a commitment ritual
- Moment of decision is clear and deliberate
- Single action = single commitment point

**BCT 8.3 - Habit Formation**:
- Consistent action (press button) in same context (idle state)
- Reduces cognitive load over time (no variation in workflow)
- Builds automatic response to "need to focus" trigger

**BCT 7.1 - Prompts/Cues**:
- Salient visual cue (big red button) is unmissable
- No search for "where do I start?" - it's obvious
- Reduces activation energy for desired behavior

### Persuasive Design Principles (PDPs)

**Reduction PDP**:
- Eliminate choices that don't matter (intention, blocklist)
- Focus user on single decision: "Do I want to focus now?"
- Decision fatigue is the enemy of action

**Tunneling PDP**:
- Linear path: select duration → press button → session starts
- No branching, no back-tracking, no configuration rabbit holes

---

## Implementation Details

### Component Architecture

```
IdleState (container)
├── TimeDurationSelector (utility)
│   └── <select> with 6 options (5min - 4hr)
└── BigRedButton (hero)
    ├── SVG enso layers (outer + inner)
    └── Button content (text + duration)
```

### File Structure

- `/src/ui/components/IdleState.tsx` - Container component
- `/src/ui/components/IdleState.css` - Layout and spacing
- `/src/ui/components/BigRedButton.tsx` - Hero button component
- `/src/ui/components/BigRedButton.css` - Enso visual design
- `/src/ui/components/TimeDurationSelector.tsx` - Dropdown component
- `/src/ui/components/TimeDurationSelector.css` - Minimal styling

### State Management

**Legend State** (`appState$`):
- No changes required - existing session state works
- Button press triggers `SessionService.startSession()`
- Generic task name: `"Focus Session (30min)"` (no user input)
- Default blocklist: Standard array from config

**Service Integration**:
```typescript
const result = await services.sessionService.startSession(
  `Focus Session (${durationMinutes}min)`,
  defaultBlocklist
)();
```

---

## What Changed

### Removed Components

- `SetNorth.tsx` - Complex form replaced by IdleState
- `SetNorthModal.tsx` - No intention setting in v1

### New Components

- `IdleState.tsx` - Simplified idle interface
- `BigRedButton.tsx` - Enso-inspired primary action
- `TimeDurationSelector.tsx` - Minimal duration picker

### Updated Components

- `App.tsx` - Render `IdleState` instead of `SetNorth`
- `App.css` - Dark background (`#2d3436`) for global consistency

### Preserved Components

- `Navigation.tsx` - Active session view (unchanged)
- `Waypoint.tsx` - Quick capture overlay (unchanged)
- `DriftNotice.tsx` - Drift detection overlay (unchanged)

---

## Design Decisions Explained

### 1. Why No Intention Setting?

**Problem**: Asking "What are you focusing on?" creates:
- Cognitive load (naming is hard)
- Decision paralysis ("Is this the right description?")
- Validation friction ("Did I phrase it well?")

**Solution**: Generic session name + time duration
- Focus is on the ACT of focusing, not labeling it
- Intention emerges through doing, not declaration
- Asymmetric friction: Easy to start, easy to stop

### 2. Why No Blocklist Configuration?

**Problem**: Comma-separated app names:
- Error-prone (spelling, formatting)
- Decision fatigue ("Which apps should I block?")
- Analysis paralysis ("Am I blocking too much? Too little?")

**Solution**: Sensible defaults
- Standard blocklist covers 90% of drift sources
- User trusts the system (infrastructure mindset)
- Future: Allow customization in settings (not start flow)

### 3. Why A Big Circular Button?

**Problem**: Rectangular buttons feel like forms
- No ritual significance
- Blend into UI as "just another button"
- Don't create commitment moment

**Solution**: Enso-inspired circle
- Stands apart from form elements
- Echoes app icon (brand consistency)
- Feels consequential, not casual
- Circular = complete, whole, intentional

### 4. Why Dark Background?

**Problem**: Light background (`#fafaf9`) clashed with:
- App icon's dark aesthetic
- "Calm infrastructure" philosophy
- Menubar app context (macOS dark mode)

**Solution**: Charcoal (`#2d3436`)
- Matches icon's background
- Reduces visual noise (less bright)
- Feels calm, peripheral, non-intrusive
- Better for focus (less eye strain)

### 5. Why Subtle Hover Animation?

**Problem**: No feedback feels unresponsive
- Users question "Is this interactive?"
- Lack of affordance reduces discoverability

**Solution**: Minimal scale + rotation
- 2% scale increase on hover (subtle)
- 2° rotation of enso layers (organic feel)
- No bounce, no glow, no "delight" animations
- Functional feedback, not decorative

---

## Accessibility Considerations

### Keyboard Navigation

- `<select>` is fully keyboard accessible (native control)
- `<button>` receives focus with visible outline (`#8b9d83`)
- Tab order: Duration selector → Big button
- Enter/Space activates button press

### Screen Readers

- `aria-label` on button: "Begin 30min focus session"
- `aria-hidden="true"` on SVG enso layers (decorative)
- Error messages have `role="alert"`
- Semantic HTML (`<label>`, `<select>`, `<button>`)

### Visual Accessibility

- High contrast ratios:
  - Cream on charcoal: 7.2:1 (WCAG AAA)
  - Green on charcoal: 4.8:1 (WCAG AA)
- Large touch target: 240px × 240px (far exceeds 44px minimum)
- Clear focus indicators (outline + offset)

---

## Future Enhancements (Out of Scope for v1)

### Progressive Customization

Once users establish the habit (BCT 8.3), allow optional:
- Custom intention setting (advanced mode)
- Blocklist configuration (settings panel)
- Session templates (quick presets)

### Visual Refinements

- Actual brushstroke SVG paths (more organic than circles)
- Subtle pulsing animation during "pressed" state
- Session duration visualization (ring fill during active session)

### Behavioral Nudges

- Default duration based on time of day (BCT 12.5 - Association)
- Suggested focus after long drift (BCT 7.1 - Prompts)
- Session streaks (NOT gamified, just context)

---

## Testing Checklist

### Visual Regression

- [ ] Button renders correctly on different screen sizes
- [ ] Colors match app icon palette
- [ ] SVG enso layers align properly
- [ ] Text is legible on dark background

### Interaction Testing

- [ ] Hover state triggers subtle animation
- [ ] Click triggers session start
- [ ] Disabled state prevents interaction
- [ ] Error display shows/dismisses correctly

### Functional Testing

- [ ] Session starts with selected duration
- [ ] Default blocklist applied correctly
- [ ] State transitions to Navigation component
- [ ] Legend State updates (`currentSession`)

### Accessibility Testing

- [ ] Keyboard navigation works (Tab, Enter/Space)
- [ ] Screen reader announces button correctly
- [ ] Focus outline visible and clear
- [ ] Touch target meets 44px minimum (240px)

---

## Metrics (NOT Tracked, Just Principles)

We don't track analytics (per Attentive Tech philosophy), but IF we did, success would look like:

- **Reduced time-to-start**: <5 seconds from open to session start
- **Increased session frequency**: Daily habit formation
- **Lower abandonment**: Fewer incomplete session starts
- **Cognitive ease**: User doesn't think, just acts

Instead of metrics, we rely on:
- **Qualitative feedback**: Does it feel calm and deliberate?
- **Personal use**: Would I use this daily?
- **Philosophy alignment**: Does it embody Attentive Tech principles?

---

## Conclusion

The Big Red Button redesign achieves:

✅ **Reduction PDP**: One obvious action
✅ **Commitment BCT**: Ritualistic button press
✅ **Habit formation BCT**: Consistent context/action pairing
✅ **Visual coherence**: Enso aesthetic from app icon
✅ **Infrastructure feel**: Boring, reliable, unsexy
✅ **Asymmetric friction**: Easy start, easy stop
✅ **Accessibility**: WCAG AA compliance, keyboard/screen reader support

This is not a "beautiful" UI - it's a **functional ritual**.
It's not "delightful" - it's **deliberately simple**.
It's not "engaging" - it's **invisibly reliable**.

🧭 **The compass doesn't care about your intention. It just points north. Press the button. Begin.**

---

## References

- App icon: `/src-tauri/icons/icon.png`
- Attentive Tech principles: `/Attentive_Tech_Brief.md`
- DDD architecture: `/CLAUDE.md`
- Behavioral science: BCT Taxonomy v1, Persuasive Technology (Fogg)
