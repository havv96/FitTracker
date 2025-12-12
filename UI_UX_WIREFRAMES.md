# UI/UX Wireframes Description: FitTrack Pro

**Project:** FitTrack Pro
**Version:** 1.0
**Date:** 10.12.2025
**Status:** Design Specification

---

## Table of Contents
1. [Design Philosophy](#1-design-philosophy)
2. [Mobile-First Approach](#2-mobile-first-approach)
3. [Color Scheme & Typography](#3-color-scheme--typography)
4. [Screen Descriptions](#4-screen-descriptions)
5. [Component Library](#5-component-library)
6. [User Flows](#6-user-flows)
7. [Responsive Breakpoints](#7-responsive-breakpoints)

---

## 1. Design Philosophy

### 1.1 Core Principles
- **Mobile-First:** Designed primarily for mobile usage with touch-optimized interactions
- **Minimalist:** Clean, focused interfaces that eliminate distractions during workouts
- **Data-Driven:** Visual feedback through progress bars, charts, and real-time calculations
- **Accessible:** High contrast ratios, minimum 44px touch targets, readable fonts
- **Fast:** Optimistic UI updates, skeleton loaders, minimal animations

### 1.2 Target User Experience
FitTrack Pro aims to provide a seamless experience where users can:
- Log workouts quickly (under 10 seconds per set)
- View progress at a glance
- Work offline without interruption
- Access historical data effortlessly

---

## 2. Mobile-First Approach

### 2.1 Touch Target Sizes
- **Minimum touch target:** 44px × 44px (iOS/Android standard)
- **Primary action buttons:** 56px height (Material Design)
- **Input fields:** 48px minimum height
- **Spacing between interactive elements:** 8px minimum

### 2.2 Thumb Zone Optimization
Critical actions placed in the "thumb zone" (bottom third of screen):
- Quick add buttons (+250ml water, finish workout)
- Bottom navigation bar
- Primary CTAs (Save, Log Set, Next)

---

## 3. Color Scheme & Typography

### 3.1 Color Palette

#### Primary Colors
```
Primary:        #2563EB (Blue 600) - Main brand color
Primary Dark:   #1E40AF (Blue 700) - Hover states
Primary Light:  #3B82F6 (Blue 500) - Accents
```

#### Semantic Colors
```
Success:        #10B981 (Green 500) - Completed actions, progress
Warning:        #F59E0B (Amber 500) - Warnings, RPE 7-8
Danger:         #EF4444 (Red 500) - Errors, RPE 9-10
Info:           #06B6D4 (Cyan 500) - Information messages
```

#### Neutral Colors
```
Background:     #F9FAFB (Gray 50) - Main background
Surface:        #FFFFFF (White) - Cards, modals
Border:         #E5E7EB (Gray 200) - Dividers
Text Primary:   #111827 (Gray 900) - Headings
Text Secondary: #6B7280 (Gray 500) - Labels, meta info
```

### 3.2 Typography

#### Font Family
```
Primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Monospace: 'JetBrains Mono', 'SF Mono', Consolas, monospace (for numbers)
```

#### Font Scales
```
Heading 1:  32px / 2rem - Bold - Page titles
Heading 2:  24px / 1.5rem - Semibold - Section titles
Heading 3:  20px / 1.25rem - Semibold - Card titles
Body:       16px / 1rem - Regular - Main content
Small:      14px / 0.875rem - Regular - Labels, metadata
Tiny:       12px / 0.75rem - Regular - Captions
```

---

## 4. Screen Descriptions

### 4.1 Authentication Screens

#### 4.1.1 Welcome/Splash Screen
**Layout:**
```
┌─────────────────────────┐
│                         │
│    [App Logo/Icon]      │
│                         │
│     FitTrack Pro        │
│  Track. Progress. Win.  │
│                         │
│                         │
│  [Login Button]         │
│  [Register Button]      │
│                         │
│  Or continue as Guest   │
│                         │
└─────────────────────────┘
```

**Elements:**
- Logo: 120px × 120px centered
- Title: H1, Primary color
- Tagline: Body, Gray 600
- Login button: Primary, full width (minus 32px padding)
- Register button: Outlined, full width
- Guest link: Small, underlined text link

**User Story:** US-01, US-02

---

#### 4.1.2 Registration Screen
**Layout:**
```
┌─────────────────────────┐
│ [← Back]  Register      │
│─────────────────────────│
│                         │
│  Create your account    │
│                         │
│  [Email Input]          │
│  [Password Input]       │
│  [Confirm Password]     │
│                         │
│  ℹ️ Password requirements:│
│  • At least 8 characters│
│  • 1 uppercase letter   │
│  • 1 number             │
│                         │
│  [Create Account Btn]   │
│                         │
│  Already have account?  │
│  [Login]                │
│                         │
└─────────────────────────┘
```

**Elements:**
- Back button: 44px, top-left
- Email input: Type="email", autocomplete
- Password inputs: Type="password", show/hide toggle
- Validation messages: Real-time, below inputs
- Requirements checklist: Small text, icon indicators (✓/✗)
- Submit button: Disabled until form valid

**Validation States:**
- Idle: Gray border
- Focus: Blue border (2px)
- Error: Red border, error message below
- Success: Green checkmark icon

**User Story:** US-01
**Acceptance Criteria:** Email validation, password complexity check

---

#### 4.1.3 Login Screen
**Layout:**
```
┌─────────────────────────┐
│ [← Back]  Login         │
│─────────────────────────│
│                         │
│  Welcome back! 👋       │
│                         │
│  [Email Input]          │
│  [Password Input]       │
│                         │
│  ☐ Remember me          │
│  [Forgot password?]     │
│                         │
│  [Login Button]         │
│                         │
│  Don't have account?    │
│  [Sign up]              │
│                         │
└─────────────────────────┘
```

**Elements:**
- Greeting: H2, friendly tone
- Remember me: Checkbox (24px)
- Forgot password: Text link, right-aligned
- Error message area: Red background, appears above button

**User Story:** US-02
**Acceptance Criteria:** JWT token stored on success, redirect to dashboard

---

### 4.2 User Profile Screens

#### 4.2.1 Profile Setup Screen (First-Time)
**Layout:**
```
┌─────────────────────────┐
│ Profile Setup    [1/3]  │
│─────────────────────────│
│                         │
│  Let's personalize!     │
│                         │
│  Basic Info             │
│  ────────────           │
│  [Height (cm)]          │
│  [Weight (kg)]          │
│  [Date of Birth]        │
│                         │
│  Gender                 │
│  ○ Male  ○ Female       │
│  ○ Other ○ Prefer not   │
│                         │
│  [Continue Button]      │
│                         │
│  Progress: ▓▓▓░░░       │
│                         │
└─────────────────────────┘
```

**Page 2/3: Goals**
```
┌─────────────────────────┐
│ Profile Setup    [2/3]  │
│─────────────────────────│
│                         │
│  Activity Level         │
│  ────────────           │
│  [Dropdown]             │
│  • Sedentary            │
│  • Lightly Active       │
│  • Moderately Active    │
│  • Very Active          │
│  • Extra Active         │
│                         │
│  Weight Goal            │
│  ────────────           │
│  ○ Lose Weight          │
│  ○ Maintain             │
│  ○ Gain Muscle          │
│                         │
│  [Target Weight]        │
│  [Rate: 0.5 kg/week]    │
│                         │
│  [Continue]             │
│  Progress: ▓▓▓▓▓▓░░     │
└─────────────────────────┘
```

**Page 3/3: Summary**
```
┌─────────────────────────┐
│ Profile Setup    [3/3]  │
│─────────────────────────│
│                         │
│  Your Targets 🎯        │
│                         │
│  ┌───────────────────┐  │
│  │ BMR: 1,850 kcal   │  │
│  │ TDEE: 2,500 kcal  │  │
│  │ Target: 2,000 kcal│  │
│  └───────────────────┘  │
│                         │
│  Daily Macros           │
│  ────────────           │
│  Protein:  150g (30%)   │
│  Carbs:    200g (40%)   │
│  Fat:       67g (30%)   │
│                         │
│  [Finish Setup]         │
│                         │
│  Progress: ▓▓▓▓▓▓▓▓     │
└─────────────────────────┘
```

**User Story:** US-03, US-04
**Acceptance Criteria:** BMR/TDEE auto-calculated, macro split shown

---

#### 4.2.2 Profile View/Edit Screen
**Layout:**
```
┌─────────────────────────┐
│ [← Back]  Profile       │
│─────────────────────────│
│                         │
│  [Avatar Circle]        │
│  John Doe               │
│  john@example.com       │
│                         │
│  Stats                  │
│  ┌─────┬─────┬─────┐   │
│  │ 28  │ 75  │180  │   │
│  │Years│ kg  │ cm  │   │
│  └─────┴─────┴─────┘   │
│                         │
│  Targets                │
│  ────────────           │
│  Daily Calories: 2000   │
│  Protein: 150g          │
│  Current Weight: 75kg   │
│  Target Weight: 70kg    │
│                         │
│  [Edit Profile]         │
│  [Change Password]      │
│  [Logout]               │
│                         │
└─────────────────────────┘
```

**User Story:** US-03, US-04

---

### 4.3 Dashboard Screen

**Layout:**
```
┌─────────────────────────┐
│  Dashboard    [🔔] [👤] │
│─────────────────────────│
│                         │
│  Good morning, John! ☀️ │
│  Tuesday, Dec 10        │
│                         │
│  Today's Summary        │
│  ┌─────────────────┐   │
│  │ 💧 Water         │   │
│  │ 750ml / 2500ml  │   │
│  │ ▓▓▓░░░░░ 30%   │   │
│  └─────────────────┘   │
│  ┌─────────────────┐   │
│  │ 🍎 Calories      │   │
│  │ 850 / 2000 kcal │   │
│  │ ▓▓▓▓░░░░ 43%   │   │
│  └─────────────────┘   │
│  ┌─────────────────┐   │
│  │ 💪 Workouts      │   │
│  │ 3 this week     │   │
│  │ [Start Workout] │   │
│  └─────────────────┘   │
│                         │
│  Quick Actions          │
│  [+250ml] [Log Food]    │
│                         │
│  Recent Activity        │
│  • Upper Body - 2h ago  │
│  • Chicken Breast - 4h  │
│                         │
└─────────────────────────┘
│ [🏠][💪][🍎][📊][👤]   │ <- Bottom Nav
└─────────────────────────┘
```

**Elements:**
- Greeting: Personalized with time of day
- Progress cards: White background, 8px border radius, shadow
- Progress bars: Animated on load, color-coded
- Quick actions: 56px height, icon + text
- Bottom navigation: Fixed, 5 tabs, icons + labels

**User Story:** Dashboard summary
**Reference:** `/api/v1/metrics/dashboard`

---

### 4.4 Workout Screens

#### 4.4.1 Exercise Library Screen
**Layout:**
```
┌─────────────────────────┐
│ Exercises    [🔍]       │
│─────────────────────────│
│                         │
│  [Search exercises...]  │
│                         │
│  Filters                │
│  [Muscle ▼] [Equip. ▼] │
│                         │
│  Results (127)          │
│  ┌───────────────────┐ │
│  │ 💪 Bench Press    │ │
│  │ Chest • Barbell   │ │
│  └───────────────────┘ │
│  ┌───────────────────┐ │
│  │ 🦵 Squat          │ │
│  │ Legs • Barbell    │ │
│  └───────────────────┘ │
│  ┌───────────────────┐ │
│  │ 🏋️ Deadlift       │ │
│  │ Back • Barbell    │ │
│  └───────────────────┘ │
│                         │
│  [Load More...]         │
│                         │
└─────────────────────────┘
```

**Elements:**
- Search bar: Debounced input (300ms)
- Filter chips: Multi-select dropdown
- Exercise cards: 72px height, tap to add
- Infinite scroll: Load 20 items at a time
- Icons: Muscle group emoji or icon

**User Story:** US-05
**Acceptance Criteria:** Search + filters work together

---

#### 4.4.2 Active Workout Session Screen
**Layout:**
```
┌─────────────────────────┐
│ [✕] Workout  [Finish]   │
│─────────────────────────│
│  ⏱️ 45:23 elapsed        │
│                         │
│  Current Exercise       │
│  ┌───────────────────┐ │
│  │ Bench Press       │ │
│  │ 💪 Chest • Barbell│ │
│  └───────────────────┘ │
│                         │
│  Last time: 3 × 80kg   │
│                         │
│  Set 1 ✓               │
│  [Reps] [Weight] [RPE] │
│   12      80kg     7   │
│                         │
│  Set 2 ← Current       │
│  ┌──┬────────┬───┐    │
│  │12│  82.5  │ 7 │    │
│  └──┴────────┴───┘    │
│  [Log Set Button]      │
│                         │
│  💡 Suggestion:         │
│  Try +2.5kg today!     │
│  Last RPE was 6        │
│                         │
│  ⏲️ Rest: 1:45          │
│  [Skip] [+30s]         │
│                         │
│  [+ Add Exercise]      │
│                         │
└─────────────────────────┘
```

**Elements:**
- Timer: Running clock, top-center
- Close button: Warns before closing
- Exercise card: Swipe to change
- Previous data: Gray text, comparison
- Set inputs: Large number pickers
  - Reps: 1-50
  - Weight: 0-500 kg (0.5 increments)
  - RPE: 1-10 scale
- Log Set button: Large, primary color
- Progressive overload suggestion: Info card, blue background
- Rest timer: Countdown, vibrate on complete
- Audio feedback: Sound when timer ends

**User Story:** US-06, US-07, US-08, US-15
**Acceptance Criteria:**
- Real-time volume tracking
- Previous workout data visible
- Rest timer auto-starts after set
- Progressive overload suggestions when RPE < 7

---

#### 4.4.3 Rest Timer Overlay
**Layout:**
```
┌─────────────────────────┐
│                         │
│        Rest Timer       │
│                         │
│                         │
│         01:45           │
│                         │
│     ┌─────────────┐    │
│     │             │    │
│     │   ◷ 72%     │    │  <- Circular progress
│     │             │    │
│     └─────────────┘    │
│                         │
│  [− 30s]    [Skip Rest]│
│                         │
│  [+ 30s]    [Add 1 min]│
│                         │
└─────────────────────────┘
```

**Behavior:**
- Semi-transparent overlay
- Haptic feedback at 10s, 5s, 0s
- Sound notification at 0s
- Dismissible by tapping outside

**User Story:** US-08

---

#### 4.4.4 Workout History / Calendar Screen
**Layout:**
```
┌─────────────────────────┐
│ History     [📅][📊]    │
│─────────────────────────│
│                         │
│  December 2025          │
│  ┌─ M  T  W  T  F  S  S│
│  │ 2  3  4  5  6  7  8 │
│  │ 9 10 11 12 13 14 15 │
│  │       💪    💪       │ <- Workout indicators
│  │16 17 18 19 20 21 22 │
│  │💪          💪       │
│  └─────────────────────│
│                         │
│  Recent Workouts        │
│  ┌───────────────────┐ │
│  │ Dec 12 • Upper    │ │
│  │ 8 exercises       │ │
│  │ Volume: 5,400kg   │ │
│  │ Duration: 1h 15m  │ │
│  └───────────────────┘ │
│  ┌───────────────────┐ │
│  │ Dec 10 • Lower    │ │
│  │ 6 exercises       │ │
│  │ Volume: 7,200kg   │ │
│  │ Duration: 1h 5m   │ │
│  └───────────────────┘ │
│                         │
└─────────────────────────┘
```

**Elements:**
- Calendar: Dots on workout days
- Date tap: Opens workout detail
- Workout cards: Summary info
- Volume calculation: Σ(reps × weight)
- Chart icon: Opens workout trends

**User Story:** US-09
**Acceptance Criteria:** Calendar shows workout dates, tap for detail

---

#### 4.4.5 Workout Detail Screen (Read-Only)
**Layout:**
```
┌─────────────────────────┐
│ [← Back]  Dec 12, 2025  │
│─────────────────────────│
│  Upper Body Workout     │
│  ⏱️ 1h 15m • 5,400kg    │
│                         │
│  Exercises              │
│  ┌───────────────────┐ │
│  │ Bench Press       │ │
│  │ Set 1: 12 × 80kg  │ │
│  │ Set 2: 10 × 82.5kg│ │
│  │ Set 3: 8 × 85kg   │ │
│  │ Volume: 2,460kg   │ │
│  └───────────────────┘ │
│  ┌───────────────────┐ │
│  │ Incline DB Press  │ │
│  │ Set 1: 12 × 30kg  │ │
│  │ Set 2: 10 × 32kg  │ │
│  │ Volume: 680kg     │ │
│  └───────────────────┘ │
│                         │
│  [Edit Workout]         │
│  [Delete Workout]       │
│                         │
└─────────────────────────┘
```

**User Story:** US-09
**Acceptance Criteria:** View all sets, edit/delete options

---

### 4.5 Nutrition Screens

#### 4.5.1 Food Diary Screen
**Layout:**
```
┌─────────────────────────┐
│ Nutrition   [📅] Today  │
│─────────────────────────│
│                         │
│  Calories               │
│  1,250 / 2,000 kcal     │
│  ▓▓▓▓▓▓▓░░░ 63%        │
│                         │
│  Macros                 │
│  ┌─────────────────┐   │
│  │ Protein 85/150g │   │
│  │ ▓▓▓▓░░░ 57%    │   │
│  └─────────────────┘   │
│  ┌─────────────────┐   │
│  │ Carbs 120/200g  │   │
│  │ ▓▓▓▓▓▓░░ 60%   │   │
│  └─────────────────┘   │
│  ┌─────────────────┐   │
│  │ Fat 45/67g      │   │
│  │ ▓▓▓▓▓░░ 67%    │   │
│  └─────────────────┘   │
│                         │
│  Meals                  │
│  ─────────────────      │
│  🌅 Breakfast (450 kcal)│
│  • Oatmeal - 300 kcal   │
│  • Banana - 100 kcal    │
│  [+ Add Food]           │
│                         │
│  🌞 Lunch (800 kcal)    │
│  • Chicken - 350 kcal   │
│  • Rice - 250 kcal      │
│  • Broccoli - 50 kcal   │
│  [+ Add Food]           │
│                         │
└─────────────────────────┘
```

**Elements:**
- Calorie progress: Large, prominent
- Macro bars: Color-coded (Protein: red, Carbs: blue, Fat: yellow)
- Meal sections: Collapsible
- Add food button: Each meal

**User Story:** US-11
**Acceptance Criteria:** Real-time macro calculation

---

#### 4.5.2 Food Search Screen
**Layout:**
```
┌─────────────────────────┐
│ [← Back]  Add Food      │
│─────────────────────────│
│                         │
│  [🔍 Search foods...]   │
│                         │
│  Meal: [Breakfast ▼]    │
│                         │
│  Recent Foods           │
│  ┌───────────────────┐ │
│  │ Chicken Breast    │ │
│  │ 165 kcal per 100g │ │
│  │ P:31g C:0g F:4g   │ │
│  └───────────────────┘ │
│                         │
│  Search Results         │
│  ┌───────────────────┐ │
│  │ Banana            │ │
│  │ 89 kcal per 100g  │ │
│  │ P:1g C:23g F:0g   │ │
│  └───────────────────┘ │
│  ┌───────────────────┐ │
│  │ Brown Rice        │ │
│  │ 111 kcal per 100g │ │
│  │ P:3g C:23g F:1g   │ │
│  └───────────────────┘ │
│                         │
└─────────────────────────┘
```

**Tap on food → Opens quantity modal:**

```
┌─────────────────────────┐
│  Add Banana             │
│─────────────────────────│
│                         │
│  Quantity (grams)       │
│  ┌───────────────────┐ │
│  │       150         │ │
│  └───────────────────┘ │
│  [-25] [-10] [+10] [+25]│
│                         │
│  Nutrition Info         │
│  ────────────           │
│  Calories: 134 kcal     │
│  Protein: 1.7g          │
│  Carbs: 34.5g           │
│  Fat: 0.5g              │
│                         │
│  [Cancel]  [Add to Meal]│
│                         │
└─────────────────────────┘
```

**User Story:** US-10
**Acceptance Criteria:**
- Search debounced
- Quantity adjustable
- Macros calculated in real-time

---

### 4.6 Metrics & Tracking Screens

#### 4.6.1 Water Tracker Widget (Dashboard)
**Layout:**
```
┌─────────────────────────┐
│  💧 Water Intake        │
│  ────────────           │
│  750ml / 2,500ml        │
│  ▓▓▓░░░░░░░ 30%        │
│                         │
│  Quick Add              │
│  [+250ml] [+500ml]      │
│  [Custom]               │
│                         │
└─────────────────────────┘
```

**Behavior:**
- Tap +250ml: Immediate optimistic update
- Progress bar animates
- Haptic feedback on tap

**User Story:** US-12
**Acceptance Criteria:** Fast increments (250ml, 500ml)

---

#### 4.6.2 Weight Tracking Screen
**Layout:**
```
┌─────────────────────────┐
│ [← Back]  Weight        │
│─────────────────────────│
│                         │
│  Current: 75.2 kg       │
│  Target:  70.0 kg       │
│  To go:   -5.2 kg       │
│                         │
│  [Log Weight]           │
│                         │
│  Weight Trend (3 months)│
│  ┌───────────────────┐ │
│  │                   │ │
│  │     ╱──╲          │ │
│  │    ╱    ╲─        │ │
│  │   ╱              │ │ <- Line chart
│  │                   │ │
│  │ Sep  Oct  Nov Dec │ │
│  └───────────────────┘ │
│                         │
│  Period: [Week▼]        │
│                         │
│  History                │
│  Dec 12: 75.2 kg        │
│  Dec 10: 75.5 kg ↓0.3kg│
│  Dec 8:  75.8 kg ↓0.3kg│
│                         │
└─────────────────────────┘
```

**Elements:**
- Current weight: Large, prominent
- Chart: Line with trend line (7-day moving avg)
- Period selector: Week/Month/Quarter
- History list: Date + weight + delta

**User Story:** US-13
**Acceptance Criteria:** Chart with trend line

---

#### 4.6.3 Progress Photos Gallery
**Layout:**
```
┌─────────────────────────┐
│ [← Back]  Progress Pics │
│─────────────────────────│
│                         │
│  [📷 Add Photo]         │
│                         │
│  Timeline               │
│  ┌─────┬─────┬─────┐   │
│  │ Dec │ Nov │ Oct │   │
│  │ 12  │ 15  │ 1   │   │
│  │ [📷]│ [📷]│ [📷]│   │
│  └─────┴─────┴─────┘   │
│                         │
│  Before & After         │
│  ┌─────────────┐       │
│  │   Oct 1     │       │
│  │   [Photo]   │       │
│  │  Starting:  │       │
│  │   78 kg     │       │
│  └─────────────┘       │
│  ┌─────────────┐       │
│  │   Dec 12    │       │
│  │   [Photo]   │       │
│  │  Current:   │       │
│  │   75.2 kg   │       │
│  └─────────────┘       │
│                         │
└─────────────────────────┘
```

**User Story:** FR-META-04

---

### 4.7 Settings & Notifications

#### 4.7.1 Settings Screen
**Layout:**
```
┌─────────────────────────┐
│ [← Back]  Settings      │
│─────────────────────────│
│                         │
│  Account                │
│  • Edit Profile         │
│  • Change Password      │
│  • Notifications        │
│                         │
│  Preferences            │
│  • Units (kg/lb)        │
│  • Rest Timer Default   │
│  • Theme (Auto/Dark)    │
│                         │
│  Data                   │
│  • Export Data          │
│  • Import Workouts      │
│  • Clear Cache          │
│                         │
│  About                  │
│  • Version 1.0.0        │
│  • Privacy Policy       │
│  • Terms of Service     │
│                         │
│  [Logout]               │
│                         │
└─────────────────────────┘
```

---

## 5. Component Library

### 5.1 Buttons

#### Primary Button
```css
Height: 48px
Background: #2563EB
Text: White, 16px, Semibold
Border Radius: 8px
Shadow: 0 2px 4px rgba(0,0,0,0.1)
Hover: #1E40AF
Active: Scale(0.98)
```

#### Secondary Button (Outlined)
```css
Height: 48px
Background: Transparent
Border: 2px solid #2563EB
Text: #2563EB, 16px, Semibold
```

#### Icon Button
```css
Size: 44px × 44px
Background: Transparent
Icon: 24px
Tap: Ripple effect
```

### 5.2 Input Fields

```css
Height: 48px
Background: White
Border: 1px solid #E5E7EB
Border Radius: 8px
Padding: 12px 16px
Font: 16px Regular

Focus:
  Border: 2px solid #2563EB
  Outline: none

Error:
  Border: 2px solid #EF4444
  + Error message below (12px, red)
```

### 5.3 Cards

```css
Background: White
Border Radius: 12px
Padding: 16px
Shadow: 0 1px 3px rgba(0,0,0,0.1)
Margin: 8px 0
```

### 5.4 Progress Bars

```css
Height: 8px
Background: #E5E7EB (track)
Fill: #2563EB (progress)
Border Radius: 4px
Transition: width 0.3s ease

Variants:
- Success: #10B981
- Warning: #F59E0B
- Danger: #EF4444
```

### 5.5 Bottom Navigation

```css
Height: 64px
Background: White
Border Top: 1px solid #E5E7EB
Shadow: 0 -2px 10px rgba(0,0,0,0.05)
Position: Fixed bottom

Items: 5 tabs
Icon: 24px
Label: 12px
Active: Primary color
Inactive: Gray 500
```

---

## 6. User Flows

### 6.1 First-Time User Onboarding
```
1. Welcome Screen
   ↓ Tap "Register"
2. Registration
   ↓ Submit
3. Profile Setup (Page 1/3)
   ↓ Enter height, weight, DOB
4. Profile Setup (Page 2/3)
   ↓ Select activity level & goals
5. Profile Setup (Page 3/3)
   ↓ View BMR/TDEE calculation
6. Dashboard (First time)
   ↓ Optional tour overlay
```

### 6.2 Logging a Workout
```
1. Dashboard
   ↓ Tap "Start Workout"
2. Exercise Selection
   ↓ Search/Filter → Select exercise
3. Active Workout Session
   ↓ Enter reps, weight, RPE
   ↓ Tap "Log Set"
   ↓ Rest timer starts
   ↓ Repeat for all sets
   ↓ Add more exercises
4. Finish Workout
   ↓ Tap "Finish"
5. Workout Summary
   ↓ View total volume & duration
6. Dashboard (Updated stats)
```

### 6.3 Logging Food
```
1. Dashboard
   ↓ Tap "Log Food" or Nutrition tab
2. Food Diary
   ↓ Select meal (Breakfast/Lunch/etc)
   ↓ Tap "+ Add Food"
3. Food Search
   ↓ Search or select recent
   ↓ Tap on food
4. Quantity Modal
   ↓ Adjust quantity
   ↓ See calculated macros
   ↓ Tap "Add to Meal"
5. Food Diary (Updated)
   ↓ Progress bars update in real-time
```

### 6.4 Viewing Progress
```
1. Dashboard
   ↓ Tap "Stats" or Profile icon
2. Metrics Screen
   ↓ View weight chart
   ↓ See trend line
   ↓ Tap "Progress Photos"
3. Photo Gallery
   ↓ Compare before/after
```

---

## 7. Responsive Breakpoints

### 7.1 Breakpoint Definitions
```css
Mobile (Portrait):  320px - 480px
Mobile (Landscape): 481px - 768px
Tablet (Portrait):  769px - 1024px
Desktop:           1025px+
```

### 7.2 Layout Adaptations

#### Mobile (Primary)
- Single column layout
- Bottom navigation
- Full-width cards
- Collapsible sections

#### Tablet
- Two-column layout where appropriate
- Side navigation option
- Modal dialogs larger
- More content visible

#### Desktop
- Three-column dashboard
- Sidebar navigation
- Charts larger and more detailed
- Multi-panel workout view

---

## 8. Accessibility Features

### 8.1 ARIA Labels
- All interactive elements have descriptive labels
- Icon buttons include aria-label
- Progress bars include aria-valuenow

### 8.2 Keyboard Navigation
- Tab order follows logical flow
- Enter key activates buttons
- Escape key closes modals

### 8.3 Screen Reader Support
- Semantic HTML (nav, main, section)
- Form labels properly associated
- Status updates announced

### 8.4 Color Contrast
- Text contrast ratio ≥ 4.5:1 (WCAG AA)
- Interactive elements ≥ 3:1
- Focus indicators clearly visible

---

## 9. Animation & Transitions

### 9.1 Performance Budget
- Total JS bundle: < 250kb gzipped
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s

### 9.2 Animation Guidelines
```css
/* Fast interactions */
Tap feedback: 100ms
Button hover: 150ms
Progress bars: 300ms

/* Page transitions */
Route change: 200ms ease-out
Modal open: 250ms ease-out
Slide animations: 300ms ease-in-out

/* Avoid animations */
- During form input
- On scroll (use transforms)
- When battery saving mode active
```

---

## 10. Offline UI Indicators

### 10.1 Offline Banner
```
┌─────────────────────────┐
│ ⚠️ You're offline        │
│ Changes will sync later │
└─────────────────────────┘
```

### 10.2 Pending Sync Indicator
- Small badge on items pending sync
- "Syncing..." animation when reconnected
- Success checkmark after sync

---

## Appendix A: Icon Library

### Navigation Icons
- 🏠 Home (Dashboard)
- 💪 Workouts (Dumbbell)
- 🍎 Nutrition (Apple)
- 📊 Stats (Chart)
- 👤 Profile (User)

### Action Icons
- ➕ Add
- ✏️ Edit
- 🗑️ Delete
- 🔍 Search
- ⚙️ Settings
- 🔔 Notifications
- 📷 Camera
- 📅 Calendar

### Status Icons
- ✓ Success (Checkmark)
- ⚠️ Warning
- ✕ Error/Close
- ℹ️ Info
- ⏱️ Timer
- 💧 Water
- 🔥 Calories

---

## Appendix B: Wireframe Prototyping Tools

**Recommended Tools:**
- **Figma** (Primary) - Collaborative design, prototyping
- **Adobe XD** - Interactive prototypes
- **Sketch** - macOS design tool
- **Balsamiq** - Low-fidelity wireframes

**Prototype Deliverables:**
1. Low-fidelity wireframes (all screens)
2. High-fidelity mockups (key screens)
3. Interactive prototype (user flows)
4. Design system documentation
5. Responsive design specs

---

**End of UI/UX Wireframes Description**
