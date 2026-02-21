# Twentify Design System

> The 20% of fitness that generates 80% of the results.
> This is the single source of truth for all UI decisions in the Twentify app.

---

## Brand Identity

- **Name:** Twentify
- **Tagline:** The 20% that actually works.
- **Tone:** Straight-forward. Science-based. No BS. Confident authority without being aggressive. Think Apple product page meets research paper abstract.
- **Icon:** Bold "20" in white on accent gradient, rounded rectangle (14px radius at 1024px)
- **App Store Subtitle:** Science-based fitness. Gym. Running. Nutrition.

---

## Design Philosophy

### Core Principles

1. **Radical Simplicity** — If it doesn't serve the user's next action, remove it. Every screen should have one clear purpose and one primary action.
2. **Confident Guidance** — The app tells you what to do. It doesn't ask you to figure it out. Decisions are made by the science, not the user.
3. **Breathing Room** — Generous whitespace. Content should feel like it has room to exist. Never pack a screen.
4. **Evidence as Trust** — Every recommendation can be tapped to reveal its research source. This builds trust without cluttering the UI.
5. **Time-Aware Design** — Everything respects the user's time. 2 taps to start a workout. No onboarding carousels. No loading screens disguised as "tips."

### Design References (Inspiration)
- Apple.com product pages (typography, whitespace, confidence)
- Anthropic.com (warm minimalism, editorial feel)
- Things 3 (task simplicity, satisfying interactions)
- Arc Browser (modern software aesthetic)
- Linear (developer tool precision)

### What We Are NOT
- Not a social fitness app (no feeds, no likes, no challenges)
- Not a content platform (no articles, no video library)
- Not a gamified experience (no streaks with guilt, no badges)
- Not a dashboard-heavy analytics tool

---

## Color System

### Primary Palette

```
Background         #F5F5F7    rgb(245, 245, 247)    — App background, screen base
Card               #FFFFFF    rgb(255, 255, 255)    — Cards, sheets, elevated surfaces
Card Border        #D2D2D7    rgb(210, 210, 215)    — Card borders, dividers, separators
Accent             #0071E3    rgb(0, 113, 227)      — Primary actions, links, active states
Accent Dark        #0058B0    rgb(0, 88, 176)       — Pressed states, accent hover
Accent Light       #EBF5FF    rgb(235, 245, 255)    — Accent backgrounds, selected states
Text Primary       #1D1D1F    rgb(29, 29, 31)       — Headlines, primary content
Text Secondary     #6E6E73    rgb(110, 110, 115)    — Body text, descriptions
Text Muted         #AEAEB2    rgb(174, 174, 178)    — Captions, placeholders, inactive
```

### Semantic Colors

```
Success            #30D158    rgb(48, 209, 88)      — Completed sets, positive trends, "Active"
Warning            #FF9500    rgb(255, 149, 0)       — Approaching limits, caution states
Error              #FF3B30    rgb(255, 59, 48)       — Errors, "Deleted" status, negative trends
```

### Gradient (Icon & Marketing Only)

```
Accent Gradient    linear-gradient(145deg, #0071E3, #0058B0)   — App icon, marketing hero elements ONLY
```

> ⚠️ **Rule:** Never use gradients inside the app UI. Gradients are reserved for the app icon and marketing materials only. In-app accent color is always flat `#0071E3`.

### Dark Mode (Phase 2)

Dark mode is NOT in MVP scope. Design everything for light mode only. Dark mode will be added in Phase 2 with these planned values:

```
Background         #000000
Card               #1C1C1E
Card Border        #38383A
Text Primary       #F5F5F7
Text Secondary     #98989D
Text Muted         #636366
```

---

## Typography

### Font Stack

| Role        | Font Family     | Weights Used       | Fallback                  |
|-------------|-----------------|--------------------|-----------------------------|
| Display     | DM Sans         | 700, 800           | System (SF Pro Display)    |
| Body        | DM Sans         | 400, 500, 600      | System (SF Pro Text)       |
| Data/Timer  | IBM Plex Mono   | 400, 500, 600      | SF Mono, Menlo, monospace  |

### Installation (React Native)

```bash
npx expo install @expo-google-fonts/dm-sans @expo-google-fonts/ibm-plex-mono expo-font
```

```tsx
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  DMSans_800ExtraBold,
} from '@expo-google-fonts/dm-sans';

import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
  IBMPlexMono_600SemiBold,
} from '@expo-google-fonts/ibm-plex-mono';
```

### Type Scale

| Token              | Size | Weight | Letter Spacing | Line Height | Usage                          |
|--------------------|------|--------|----------------|-------------|--------------------------------|
| `heading.xl`       | 32px | 800    | -1.0px         | 1.1         | Screen titles ("Today's 20%")  |
| `heading.lg`       | 24px | 700    | -0.5px         | 1.15        | Card titles ("Lower Body")     |
| `heading.md`       | 20px | 700    | -0.3px         | 1.2         | Section headers                |
| `heading.sm`       | 17px | 600    | -0.2px         | 1.25        | Sub-headers, exercise names    |
| `body.lg`          | 16px | 400    | 0              | 1.55        | Primary body text              |
| `body.md`          | 14px | 400    | 0              | 1.5         | Secondary body, descriptions   |
| `body.sm`          | 13px | 500    | 0              | 1.45        | Metadata, small content        |
| `caption`          | 12px | 500    | 0              | 1.4         | Timestamps, labels             |
| `overline`         | 10px | 600    | 2.0px          | 1.0         | Badges, tags (UPPERCASE)       |
| `data.xl`          | 48px | 600    | -2.0px         | 1.0         | Timer display (IBM Plex Mono)  |
| `data.lg`          | 36px | 700    | -1.0px         | 1.0         | Weight/rep numbers             |
| `data.md`          | 14px | 500    | 0              | 1.0         | Set counts (3×8)               |
| `data.sm`          | 11px | 400    | 0              | 1.0         | Small data labels              |

> **Rule:** Anything that displays a number, time, weight, or set count uses `IBM Plex Mono`. Everything else uses `DM Sans`.

---

## Spacing System

Uses a 4px base grid. Standard spacing tokens:

```
xs       4px      — Tight internal padding
sm       8px      — Between related elements
md       12px     — Default gap
lg       16px     — Section internal spacing
xl       20px     — Between components
2xl      24px     — Section padding
3xl      32px     — Between sections
4xl      48px     — Major section breaks
```

### Screen Padding
- Horizontal padding: `20px` (all screens)
- Top padding: `16px` below safe area
- Bottom padding: `16px` above tab bar

---

## Border Radius

```
xs       8px      — Small elements (tags, badges, inline buttons)
sm       12px     — Buttons, input fields, small cards
md       16px     — Standard cards, sheets
lg       18px     — Large cards (workout card, main content areas)
xl       24px     — Bottom sheets, modals
full     9999px   — Pills, circular buttons, toggles
```

---

## Shadows & Elevation

```
none         — Default state. Most elements sit flat.
sm           0 1px 3px rgba(0,0,0,0.04)                — Subtle lift (cards at rest)
md           0 4px 12px rgba(0,0,0,0.06)                — Active cards, floating elements
lg           0 12px 40px rgba(0,0,0,0.08)               — Modals, bottom sheets
```

> **Rule:** Use shadows sparingly. Most elevation comes from card backgrounds (#FFFFFF) against the screen background (#F5F5F7) plus the card border. Only use shadows for truly floating elements (bottom sheets, modals, toasts).

---

## Component Specifications

### Buttons

**Primary Button (CTA)**
- Background: `#0071E3` (accent)
- Text: `#FFFFFF`, DM Sans 600, 16px
- Padding: `16px 32px`
- Border Radius: `14px`
- Pressed: `#0058B0`
- Height: `52px` (standard), `48px` (compact)

**Secondary Button**
- Background: `transparent`
- Text: `#1D1D1F`, DM Sans 600, 16px
- Border: `1.5px solid #D2D2D7`
- Pressed: background `#F5F5F7`

**Text Button**
- No background, no border
- Text: `#0071E3`, DM Sans 600, 14px
- Pressed: `#0058B0`

### Cards

**Workout Card (Primary — dominates 60% of Today screen)**
- Background: `#FFFFFF`
- Border: `1px solid #D2D2D7`
- Border Radius: `18px`
- Padding: `22px`
- Shadow: `sm` (subtle)
- Contains: badge, title, meta, exercise list, CTA

**Info Card (Secondary)**
- Background: `#FFFFFF`
- Border: `1px solid #D2D2D7`
- Border Radius: `14px`
- Padding: `16px`
- Shadow: `none`

### Exercise Row
- Layout: flex row, space-between
- Name: `body.sm` (13px, 500 weight), text primary
- Sets: `data.md` (IBM Plex Mono, 14px), text secondary
- Divider: `1px solid rgba(29,29,31, 0.06)` between rows
- Minimum touch target: `44px` height
- Tap action: expand to show research source

### Tab Bar
- Height: `83px` (including safe area)
- Background: `#FFFFFF` with `0.5px` top border `#D2D2D7`
- 3 tabs only: **Today**, **Progress**, **Profile**
- Active: accent color `#0071E3`
- Inactive: `#AEAEB2`
- Icon size: `22px`
- Label: `10px`, 500 weight
- Active indicator: `4px` dot, accent color, above label

### Navigation Bar
- Background: transparent (scrolled: blur backdrop like Apple nav)
- Title: `heading.md` (20px, 700), centered or left-aligned
- Back button: chevron left `#0071E3`, no text
- Height: `44px` below safe area

### Bottom Sheet
- Background: `#FFFFFF`
- Border Radius: `24px 24px 0 0`
- Handle: `36px × 4px`, centered, `#D2D2D7`, radius full
- Shadow: `lg`
- Backdrop: `rgba(0,0,0,0.3)`

### Toast / Snackbar
- Background: `#1D1D1F`
- Text: `#FFFFFF`, 14px, 500 weight
- Border Radius: `12px`
- Position: bottom center, 24px above tab bar
- Duration: 2 seconds
- Animation: slide up + fade

---

## Iconography

- Style: **SF Symbols** (iOS) / line-weight equivalents
- Weight: Regular (400)
- Size: `22px` in tab bar, `18px` inline, `24px` in headers
- Color: follows text color of context (primary, secondary, muted, or accent)
- No filled icons except in active tab bar state
- No custom icon library — use SF Symbols for consistency with iOS

---

## Motion & Animation

### Principles
- Every transition should feel like **200-300ms ease-out**
- Never use bounce or spring animations — this isn't a playful app
- Prefer opacity + translateY for enter/exit
- Haptic feedback on: set completion, timer end, workout complete

### Specific Animations

| Action                | Animation                        | Duration | Easing         |
|----------------------|-----------------------------------|----------|----------------|
| Screen transition     | Fade + slide right (iOS default)  | 300ms    | ease-out       |
| Card appear           | Fade in + translateY(8px → 0)     | 250ms    | ease-out       |
| Set completion        | Scale(1 → 1.05 → 1) + checkmark  | 200ms    | ease-out       |
| Timer tick            | None (number change only)         | –        | –              |
| Timer complete        | Pulse accent color + haptic       | 300ms    | ease-in-out    |
| Bottom sheet open     | Slide up from bottom              | 350ms    | ease-out       |
| Toast appear          | Slide up + fade in                | 250ms    | ease-out       |
| Workout complete      | Confetti-free celebration card    | 400ms    | ease-out       |

> **Rule:** No confetti, no fireworks, no "streak flame" animations. Celebration is a clean summary card with stats. Calm authority, not cheerleading.

---

## Screen Architecture

### Tab Structure (3 tabs only)

```
Today       — Single workout/run/nutrition card for today. One tap to start.
Progress    — Consistency grid + strength/running trends. Simple.
Profile     — Settings, subscription, domains, account.
```

### Total Screens in MVP (v1)

```
1.  Onboarding - Domain Selection (Gym / Running / Nutrition)
2.  Onboarding - Quick Assessment (5 questions)
3.  Onboarding - Plan Preview
4.  Today (main screen)
5.  Active Workout (full-screen takeover)
6.  Active Run (full-screen with timer/distance)
7.  Workout Complete Summary
8.  Run Complete Summary
9.  Progress Dashboard
10. Exercise Detail (research source + form notes)
11. Profile / Settings
12. Paywall
```

> **Rule:** 12 screens max in v1. If a feature requires a new screen, it's not in v1.

---

## AI Coach Personality

The AI doesn't have a name, avatar, or personality brand. It's the app itself speaking.

- **Voice:** Calm, factual, direct. "Your squat went up 5kg this month. Overload is working." Not: "Amazing job! 🎉 You're crushing it!"
- **Never guilts:** If user misses sessions: "You missed 2 sessions. No big deal. Here's your adjusted plan." Not: "You broke your streak! 😢"
- **Always cites:** "3 sets is enough for hypertrophy (Wernbom, 2007)" — not "trust us, this works"
- **Zero fluff:** No motivational quotes. No "you got this." The science IS the motivation.

---

## File Structure (Recommended)

```
src/
├── theme/
│   ├── colors.ts          ← Color tokens
│   ├── typography.ts       ← Font families, sizes, weights
│   ├── spacing.ts          ← Spacing scale
│   ├── radius.ts           ← Border radius tokens
│   ├── shadows.ts          ← Shadow presets
│   └── index.ts            ← Re-exports all tokens
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Text.tsx        ← Typed text component (heading.xl, body.md, etc.)
│   │   ├── Badge.tsx
│   │   ├── ExerciseRow.tsx
│   │   ├── TabBar.tsx
│   │   ├── BottomSheet.tsx
│   │   └── Toast.tsx
│   └── workout/
│       ├── WorkoutCard.tsx
│       ├── ActiveWorkout.tsx
│       ├── SetCircle.tsx
│       ├── RestTimer.tsx
│       └── WorkoutSummary.tsx
```

---

## Quick Reference Card

| Element          | Value                                       |
|------------------|---------------------------------------------|
| Background       | `#F5F5F7`                                   |
| Card             | `#FFFFFF` + `1px #D2D2D7` border            |
| Accent           | `#0071E3`                                   |
| Text             | `#1D1D1F` / `#6E6E73` / `#AEAEB2`          |
| Display Font     | DM Sans 700-800                             |
| Body Font        | DM Sans 400-600                             |
| Data Font        | IBM Plex Mono 400-600                       |
| Border Radius    | 8 / 12 / 16 / 18 / 24                      |
| Screen Padding   | 20px horizontal                             |
| Transitions      | 200-300ms ease-out                          |
| Max Screens (v1) | 12                                          |
| Tabs             | 3 (Today, Progress, Profile)                |
| Vibe             | Apple clean. Science confident. No BS.      |