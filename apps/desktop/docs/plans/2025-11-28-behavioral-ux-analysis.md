# Behavioral UX Analysis: Monotask Onboarding & Session Start

**Date:** 2025-11-28
**Analysis Type:** BCT & PDP Review + Redesign
**Focus:** Onboarding flow and session initiation friction

---

## Context

Current Monotask usage requires users to:
1. Enter a task name ("intention") that feels meaningless
2. Manually type comma-separated blocklist apps
3. Start session with high cognitive friction

**User problems identified:**
- "Forced to define an intention that doesn't really do anything"
- "Need to define the blocklist through an input"

**Desired outcome:** Seamless onboarding and low-friction session starts aligned with calm technology principles.

---

## Current State Analysis

### SetNorth Component (Session Start)

#### BCTs Present (Problematic Implementation)

**1. Goal setting (behavior) - BCT 1.1**
- **Definition:** Set or agree on a goal defined in terms of the behavior to be achieved
- **Present because:** "What are you focusing on?" input field
- **Mechanism of Action:** Behavioral Regulation
- **Problem:** The goal is decorative - it displays during session but doesn't influence drift detection or behavior monitoring. The user correctly perceives it as meaningless friction.
- **Related PDP:** None - missing Tunneling/Reduction support

**2. Action planning - BCT 1.4**
- **Definition:** Prompt detailed planning of performance of the behavior
- **Present because:** Blocklist input asks user to plan barriers
- **Mechanism of Action:** Behavioral Regulation
- **Problem:** High cognitive load - manual comma-separated input, no visual feedback, requires remembering app names exactly
- **Related PDP:** Violates Reduction principle (should simplify, but complicates instead)

#### PDPs Violated

**Reduction (Primary Task) - MISSING**
- **Definition:** Break complex behavior into simple, small steps
- **Why it's missing:** Session start requires too much work - typing, remembering app names, formatting correctly
- **Impact:** Users face friction at the exact moment they want to focus

**Tunneling (Primary Task) - MISSING**
- **Definition:** Guide users through a process step-by-step with predefined order
- **Why it's missing:** No first-run onboarding experience
- **Impact:** Users don't understand permissions, privacy model, or how to configure defaults

**Trustworthiness (System Credibility) - MISSING**
- **Definition:** Provide truthful, fair, and unbiased information
- **Why it's missing:** No explanation of local-only storage, privacy, or open source nature
- **Impact:** Users may be suspicious about window tracking and data collection

**Personalization/Tailoring (Primary Task) - MISSING**
- **Definition:** Adapt content to individual users or user groups
- **Why it's missing:** Doesn't leverage user's actual app usage patterns or save preferences
- **Impact:** Repetitive manual configuration every session

---

## Proposed Improvement: 3-Screen Onboarding

### Screen 1: Welcome + Messaging

**Purpose:** Create positive first impression and set expectations

#### BCTs Implemented

**Information about consequences - BCT 5.1/5.6**
- **Definition:** Provide information about consequences of performing the behavior
- **Implementation:** Brief messaging about what Monotask does (attention compass, drift detection)
- **Mechanism of Action:** Beliefs about Consequences, Attitude
- **Why it works:** Users understand the value proposition before commitment

#### PDPs Implemented

**Surface credibility (System Credibility)**
- **Implementation:** Clean, professional design with compass metaphor
- **Benefit:** Good first impression builds trust

**Affect (Dialogue)**
- **Implementation:** Visually attractive, calm aesthetic (no gamification)
- **Benefit:** Users feel comfortable with the tool

**Real-world feel (System Credibility)**
- **Implementation:** Highlight open source nature, local-first philosophy
- **Benefit:** Transparency about who's behind the system

---

### Screen 2: Permissions + Privacy

**Purpose:** Build trust through transparency and guide permission setup

#### BCTs Implemented

**Instruction on how to perform behavior - BCT 4.1**
- **Definition:** Advise or agree on how to perform the behavior
- **Implementation:** Clear explanation of why accessibility permissions are needed
- **Mechanism of Action:** Knowledge, Skills
- **Why it works:** Users understand the "how" before being asked

**Information about consequences - BCT 5.1**
- **Definition:** Provide information about consequences
- **Implementation:** Explain what happens with/without permissions
- **Mechanism of Action:** Beliefs about Consequences
- **Why it works:** Users make informed decisions

#### PDPs Implemented

**Trustworthiness (System Credibility)**
- **Implementation:** Explicit messaging: "Local-only • Private • Open source"
- **Benefit:** Addresses privacy concerns proactively
- **Why calm tech:** No hidden data collection, transparent operation

**Tunneling (Primary Task)**
- **Implementation:** Step 2 of 3 - guided progression
- **Benefit:** Users know where they are in setup process
- **BCT relationship:** Implements Action planning through step-by-step guidance

**Reduction (Primary Task)**
- **Implementation:** One clear task per screen (just permissions)
- **Benefit:** Low cognitive load
- **BCT relationship:** Supports Instruction by breaking into simple steps

**Verifiability (System Credibility)**
- **Implementation:** "Open source" allows users to verify claims
- **Benefit:** Trust through verification capability

---

### Screen 3: Select Apps & Domains

**Purpose:** Configure personalized blocklist with low friction

#### BCTs Implemented

**Action planning - BCT 1.4**
- **Definition:** Prompt detailed planning of performance of the behavior
- **Implementation:** Visual app selection interface (not text input)
- **Mechanism of Action:** Behavioral Regulation
- **Why it works:** Users identify barriers (distracting apps) in low-friction way
- **Related PDP:** Reduction makes this actionable

**Self-monitoring of behavior - BCT 2.3 (preparation)**
- **Definition:** Establish a method for the person to monitor and record their behavior
- **Implementation:** User selects which apps they want to monitor for drift
- **Mechanism of Action:** Behavioral Regulation
- **Why it works:** Users prime themselves for monitoring by choosing targets
- **Related PDP:** Self-monitoring (PDP) implements this BCT

**Restructuring the physical environment - BCT 12.1**
- **Definition:** Advise to change the environment to facilitate wanted behavior
- **Implementation:** By selecting apps to avoid, users create environmental cues
- **Mechanism of Action:** Environmental Context and Resources, Behavioral Cueing
- **Why it works:** Pre-planning barriers reduces in-moment decision fatigue

#### PDPs Implemented

**Reduction (Primary Task)**
- **Implementation:** Visual app grid/list with checkboxes vs comma-separated text input
- **Benefit:** Drastically reduces cognitive load
- **BCT relationship:** Implements Action planning, Restructuring environment
- **Linked BCTs:** Action planning, Prompts/cues, Restructuring physical environment

**Tailoring (Primary Task)**
- **Implementation:** Pre-populate common apps but allow customization
- **Benefit:** Adapts to user group needs (knowledge workers, students, etc.)

**Personalization (Primary Task)**
- **Implementation:** Saved as user's default blocklist for future sessions
- **Benefit:** One-time setup, repeated benefit
- **Why calm tech:** Fades into background after initial configuration

**Self-monitoring (Primary Task)**
- **Implementation:** User consciously selects monitoring targets
- **Benefit:** Awareness of what they'll track
- **BCT relationship:** Directly implements Self-monitoring of behavior (BCT 2.3)

**Suggestion (Dialogue)**
- **Implementation:** Smart defaults based on common distractions
- **Benefit:** Provides fitting recommendations
- **Why it works:** Users can accept defaults or customize

---

## Post-Onboarding: The BIG RED BUTTON Pattern

### Concept: Asymmetric Friction

**Core insight:** Easy to turn ON (deliberate), effortless to turn OFF (calm)

This inverts typical app patterns (easy start, hard stop) and aligns with calm technology:
- **Starting a session:** Requires intentional action (the big button press)
- **Ending a session:** Effortless, guilt-free, no nagging

### Why This Works: Behavioral Science

#### BCTs Implemented

**1. Commitment - BCT 1.9**
- **Definition:** Ask the person to affirm or reaffirm statements indicating commitment to change the behavior
- **Implementation:** Pressing the BIG RED BUTTON is a physical commitment ritual
- **Mechanism of Action:** Values
- **Why it works:** The deliberate action creates psychological buy-in
- **Evidence:** Physical actions strengthen mental commitments (embodied cognition)

**2. Behavioral contract - BCT 1.8** (implicit)
- **Definition:** Create a specification of behavior to be performed, agreed on by the person
- **Implementation:** Button press = agreeing to enter focus mode with configured settings
- **Mechanism of Action:** Goals
- **Why it works:** Self-made contracts increase follow-through

**3. Habit formation - BCT 8.3**
- **Definition:** Prompt rehearsal and repetition of behavior in same context
- **Implementation:** The button press becomes a ritual - same action, same context
- **Mechanism of Action:** Behavioral Cueing, Behavioral Regulation
- **Why it works:** Ritualistic actions create context-dependent automaticity
- **Related PDP:** Reduction (big obvious button = no decision fatigue)

**4. Prompts/cues - BCT 7.1**
- **Definition:** Introduce environmental or social stimulus with purpose of prompting behavior
- **Implementation:** The button itself is a visual/physical cue
- **Mechanism of Action:** Behavioral Cueing, Environmental Context
- **Why it works:** Salient cue reduces cognitive load ("just press the button")

#### PDPs Implemented

**Reduction (Primary Task)**
- **Implementation:** One big obvious action instead of multi-step form
- **Benefit:** Eliminates decision fatigue - "Should I start? What settings? What task name?"
- **BCT relationship:** Implements Habit formation through simplified trigger
- **Linked BCTs:** Prompts/cues, Habit formation, Commitment

**Tunneling (Primary Task)** (entry point)
- **Implementation:** Button is the gateway to focus mode
- **Benefit:** Clear transition between states (pre-focus → focus)
- **Why calm tech:** Makes the mode shift explicit and intentional

**Affect (Dialogue)** (if designed well)
- **Implementation:** Big, satisfying button (visual + perhaps haptic feedback)
- **Benefit:** The action feels significant, not trivial
- **Why it works:** Emotional engagement strengthens commitment

### The Asymmetry is Key

**High Intentionality to START:**
- ✅ Deliberate button press
- ✅ Physical/visual ritual
- ✅ Psychological commitment
- ✅ Clear transition marker

**Low Friction to STOP:**
- ✅ No guilt messaging ("You've only focused for 12 minutes...")
- ✅ No "Are you sure?" dialogs
- ✅ Simple "Complete Navigation" button
- ✅ Session data saved automatically (no fear of loss)

**Why this asymmetry?**
- Most apps: Easy start (passive drift into usage) → Hard stop (dark patterns)
- Monotask: Intentional start (commitment) → Effortless stop (calm)

This honors user agency and prevents learned helplessness.

### Design Implications

#### Visual Design

**The Button:**
- Large, central, unmissable
- High contrast (not decorative - functional)
- Single action: "BEGIN FOCUS" or "START NAVIGATION"
- Color: Consider red (alert/action) or compass-themed

**Not like:**
- Small "Start session" button buried in form
- Gentle "maybe begin when you're ready" suggestion

**Like:**
- Emergency stop button (but positive version)
- Staples "Easy Button" (ritualistic action)
- Launch sequence button (intentional, consequential)

#### Interaction

**On press:**
1. Immediate session start (no loading states)
2. Optional: Brief haptic feedback (on supported devices)
3. Transition to Navigation view
4. Window tracking begins

**No required inputs:**
- Uses saved defaults from onboarding
- No "What are you focusing on?" field
- No blocklist configuration (already set)

#### Alternative: Keyboard Shortcut

The BIG RED BUTTON can coexist with keyboard shortcut:
- **Button:** Visual, ritualistic, for intentional sessions
- **Shortcut (Cmd+Shift+J):** Muscle memory, for frequent users

Both implement the same BCTs (Commitment, Habit formation) through different modalities.

### Comparison to "Intention Field" Approach

| Aspect | Current (Intention Field) | BIG RED BUTTON |
|--------|---------------------------|----------------|
| **Cognitive load** | High (typing, deciding) | Minimal (one click) |
| **BCT** | Goal setting (decorative) | Commitment (functional) |
| **Friction type** | Passive (form filling) | Active (ritual) |
| **Commitment strength** | Weak (just typing) | Strong (physical action) |
| **Habit formation** | Poor (varies by task name) | Excellent (same ritual) |
| **Calm tech alignment** | Poor (unnecessary friction) | Excellent (intentional but simple) |

### Implementation Notes

**Component structure:**
```
SetNorth.tsx (simplified)
├─ BIG RED BUTTON (primary CTA)
├─ Saved defaults indicator (subtle)
│   "Focus mode: Default blocklist (8 apps)"
└─ Optional: Edit defaults link (non-primary)
```

**State machine:**
- Idle → Button press → Committed (session starts)
- Committed → "Complete Navigation" → Idle (no friction)

**Accessibility:**
- Button must be keyboard accessible
- Clear focus states
- Screen reader: "Begin focus session with default settings"

### MoAs Activated by BIG RED BUTTON

**1. Behavioral Cueing**
- Visual salience creates environmental trigger
- Physical action strengthens cue-behavior association

**2. Values**
- Button press affirms commitment to focused work
- Aligns action with stated priorities

**3. Behavioral Regulation**
- Deliberate action regulates transition between states
- Creates clear boundary (pre-focus ↔ focus)

**4. Environmental Context**
- Button becomes part of focus ritual
- Context (seeing button) → behavior (starting session)

### Why NOT require intention field?

The BIG RED BUTTON provides the **psychological function** of intention-setting without the **cognitive cost**:

- **Intention field:** "What are you focusing on?" → thinking, typing, decision
- **BIG RED BUTTON:** Physical commitment → immediate action, no deliberation

The commitment comes from **the action** (button press), not **the content** (task name).

### Calm Technology Alignment

✅ **Infrastructure that fades**
- Button appears when needed (idle state)
- Disappears during session (focus mode)

✅ **Peripheral awareness**
- Button is available but not nagging
- No timers, countdowns, or pressure

✅ **User agency**
- Deliberate to start, effortless to stop
- No dark patterns, no guilt

✅ **Functional simplicity**
- One clear action, one clear outcome
- No feature creep, no decorative elements

---

## Revised Design Recommendation

### Session Start Flow (Post-Onboarding)

**Recommended approach: BIG RED BUTTON + Saved Defaults**

**UI Layout:**
```
┌─────────────────────────────────────┐
│                                     │
│         🧭 Ready to focus           │
│                                     │
│     Default drift watch: 8 apps     │
│     (Slack, Twitter, Reddit...)     │
│                                     │
│    ┌───────────────────────────┐   │
│    │                           │   │
│    │     BEGIN NAVIGATION      │   │ ← BIG RED BUTTON
│    │                           │   │
│    └───────────────────────────┘   │
│                                     │
│         [Edit defaults]             │ ← Non-primary action
│                                     │
│    Cmd+Shift+J for quick start      │ ← Keyboard shortcut hint
│                                     │
└─────────────────────────────────────┘
```

**Behavior:**
1. User presses BIG RED BUTTON (or Cmd+Shift+J)
2. Session starts immediately with saved defaults
3. Transition to Navigation view
4. Window tracking begins
5. Zero additional input required

**BCTs activated:** Commitment, Habit formation, Prompts/cues
**PDPs activated:** Reduction, Tunneling
**MoAs activated:** Behavioral Cueing, Values, Behavioral Regulation

---

## BCT-PDP Relationships in Proposed Design

### Tunneling → Action planning + Goal setting
**How:** 3-screen onboarding guides users through setup steps
**Why:** Step-by-step process implements behavioral planning through interaction design

### Reduction → Multiple BCTs
**How:** Visual app selection breaks down action planning into simple clicks
**Why:** Reducing cognitive friction makes multiple BCTs actionable
**Linked BCTs:**
- Action planning (easier to plan barriers)
- Instruction (simple steps = clearer instructions)
- Restructuring environment (visual selection = lower barrier to planning)

### Self-monitoring (PDP) → Self-monitoring (BCT 2.3)
**How:** App selection interface prepares user for behavior tracking
**Why:** Conscious choice of monitoring targets primes self-awareness

### Trustworthiness → Information about consequences
**How:** Privacy messaging provides information about system behavior
**Why:** Builds belief about consequences (your data stays local)

---

## Mechanisms of Action Summary

### Primary MoAs Activated

**1. Behavioral Regulation**
- Onboarding establishes method for ongoing behavior monitoring
- Low-friction session start enables habit formation
- Pre-configured blocklist reduces decision fatigue

**2. Environmental Context and Resources**
- App selection restructures digital environment
- Reduces exposure to distraction cues
- Leverages environmental barriers

**3. Beliefs about Consequences**
- Privacy messaging shapes beliefs about data handling
- Permission explanation clarifies consequences of setup choices

**4. Behavioral Cueing**
- Visual app selection creates mental associations
- Quick session start leverages contextual triggers
- Keyboard shortcuts become habit cues

**5. Goals (only if intention kept)**
- Optional session naming supports goal representation
- But **not required** for core functionality

---

## Recommendations

### 1. Implement 3-Screen Onboarding Flow

**Priority: CRITICAL**
- Screen 1: Welcome (Surface credibility, Affect, Real-world feel)
- Screen 2: Permissions (Trustworthiness, Tunneling, Instruction)
- Screen 3: App Selection (Reduction, Tailoring, Self-monitoring)

**Why:** Addresses trust, reduces friction, enables personalization
**Outcome:** User has configured defaults, understands privacy model, granted permissions

### 2. Replace SetNorth with BIG RED BUTTON

**Priority: CRITICAL**

**Recommended approach: BIG RED BUTTON + Saved Defaults**
- Large, prominent "BEGIN NAVIGATION" button
- Uses defaults from onboarding (no form fields)
- Optional keyboard shortcut (Cmd+Shift+J) for power users
- Shows which defaults are active ("Drift watch: 8 apps")

**BCTs activated:**
- Commitment (1.9): Physical button press = psychological buy-in
- Habit formation (8.3): Same ritual action builds automaticity
- Prompts/cues (7.1): Visual trigger reduces decision fatigue

**PDPs activated:**
- Reduction: One click vs multi-field form
- Tunneling: Clear entry point to focus mode
- Affect: Satisfying, significant action

**Why this works:**
- **Asymmetric friction:** Intentional to start (commitment), effortless to stop (calm)
- **Ritualistic:** Same action every time strengthens habit
- **Psychological:** Action creates commitment, not content (task name)
- **Calm tech:** Infrastructure that requires deliberate activation but no ongoing attention

**NOT recommended:**
- ❌ Forcing intention/task name input
- ❌ Manual blocklist entry per session
- ❌ Multi-step form before starting

### 3. Ensure Low-Friction Session End

**Priority: HIGH**
- Simple "Complete Navigation" button (no confirmation dialogs)
- No guilt messaging ("You've only focused for X minutes...")
- Auto-save all session data
- No loss of captures/waypoints

**Why:** Completes the asymmetric friction pattern - easy out prevents learned helplessness

**BCT:** Behavioral Regulation (MoA) - user controls state transitions
**Calm tech:** No dark patterns, respects user agency

### 4. Leverage Saved Defaults Throughout

**Priority: MEDIUM**
- Onboarding choices → `~/.monotask/config.json`
- Session start uses defaults automatically
- Settings UI to edit defaults (separate from session start)
- "Edit defaults" link on idle screen (non-primary action)

**BCT:** Habit formation (8.3) - repetition in same context
**PDP:** Reduction - minimal steps for repeated behavior
**Why:** Configuration happens once, behavior repeats effortlessly

### 5. Progressive Disclosure (Future)

**Priority: LOW**
- Advanced options (custom domains, per-session overrides) hidden initially
- Expert users access via settings
- Keeps primary flow simple (just the BIG RED BUTTON)

**BCT:** Graded tasks (8.4) - start simple, add complexity
**PDP:** Reduction - don't overwhelm beginners
**When:** After core flow is validated with users

---

## Calm Technology Alignment

### Principles Honored

✅ **Infrastructure that fades**
- Onboarding: one-time, then invisible
- Session start: keyboard shortcut, no UI required

✅ **Peripheral awareness**
- Self-monitoring of drift, not constant engagement

✅ **User owns data**
- Trustworthiness messaging makes this explicit

✅ **No gamification**
- No praise, rewards, or social comparison (all excluded)

✅ **Functional purity**
- BCTs chosen for behavior change efficacy, not engagement metrics

### PDPs Intentionally Excluded

❌ **Praise (Dialogue)** - Too performative
❌ **Rewards (Dialogue)** - Creates dependency
❌ **Competition (Social Support)** - Stressful, attention-grabbing
❌ **Social comparison (Social Support)** - Judgmental
❌ **Recognition (Social Support)** - Performative
❌ **Normative influence (Social Support)** - Peer pressure conflicts with calm values

**Why excluded:** These PDPs create engagement through psychological pressure or extrinsic motivation. Monotask uses intrinsic motivation (self-selected goals) and environmental restructuring (barrier planning) instead.

---

## Implementation Notes

### Technical Requirements

1. **Onboarding state management**
   - Detect first run vs returning user
   - Store onboarding completion flag
   - Skip onboarding for returning users

2. **Config persistence**
   - Save selected apps to `~/.monotask/config.json`
   - Load defaults on session start
   - Settings UI to edit later

3. **UI Components**
   - OnboardingWelcome.tsx
   - OnboardingPermissions.tsx
   - OnboardingAppSelection.tsx
   - Simplified SetNorth.tsx (or remove entirely)

4. **Keyboard shortcuts**
   - Cmd+Shift+J to quick-start session with defaults
   - No modal if defaults already configured

### Design Inspiration

Reference screenshots show:
- **Permissions screen:** Clear list of permissions with explanations
- **Welcome screen:** Bold branding, simple "Get Started" CTA

Apply to Monotask:
- Use compass metaphor visually (simple, not decorative)
- Calm color palette (grays, subtle accents)
- Clear typography (non-judgmental, infrastructure-like)

---

## Next Steps

1. Design onboarding screens (wireframes/mockups)
2. Build onboarding component flow
3. Refactor session start to use saved defaults
4. User testing with 3-5 target users
5. Iterate based on friction points

---

## References

**BCT Groupings Used:**
- Goals and Planning (GP)
- Feedback & Monitoring (FM)
- Antecedents (AN)
- Repetition & Substitution (RS)

**PDP Categories Used:**
- Primary Task (PT) - most significant
- Dialogue (DI) - minimal, strategic
- System Credibility (SC) - foundational
- Social Support (SS) - intentionally excluded

**MoAs Activated:**
- Behavioral Regulation
- Environmental Context and Resources
- Beliefs about Consequences
- Behavioral Cueing
- Knowledge/Skills

---

**Analysis conclusion:** The proposed 3-screen onboarding flow implements research-grounded BCTs and PDPs while honoring calm technology principles. By frontloading setup (Tunneling, Reduction, Trustworthiness) and simplifying ongoing use (Habit formation, Behavioral cueing), Monotask becomes true infrastructure - invisible until needed.
