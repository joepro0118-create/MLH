# 🏆 Vibe Coding — 36 Advanced UI Interactions Cheatsheet
> **Hackathon & Vibe Coding Edition · "Winning State" Playbook**  
> *One file. Pick 1 Hero + 2 Micro-Interactions. Feed the Prompt Formula to your AI. Ship an unforgettable demo.*

---

## ⚡ The Hackathon "Winning State" Playbook

In a hackathon or vibe coding sprint, **judges evaluate perceived product maturity within the first 30 seconds**. 
Raw backend logic with a default Bootstrap/shadcn table feels like a school project. The exact same API wrapped in **3 well-chosen interactions** feels like a Series A startup product.

### The Rule of 3 (Demo Sweet Spot)
Do **not** implement all 36 interactions. Over-animation creates lag and kills your pitch. Use the **1 + 2 Formula**:
1. **1 Hero Interaction** (The "Wow" factor): Morphing Dialog, Dynamic Island, or 3D Tilt / Border Beam.
2. **1 Fluid Micro-Interaction** (The "Smoothness" factor): Segmented Control, Magnetic Button, or Inline Edit.
3. **1 Real-Time / Delight Signal** (The "Alive" factor): Skeleton Loading, Toast Stack, or Confetti Burst on completion.

---

## 🧠 Universal Vibe Coding Prompt Formula

When prompting AI (Cursor, Claude 3.7 / 3.5 Sonnet, v0, ChatGPT, Antigravity), use this 5-part formula to get production-grade output on the first try without iteration loops:

```
[Component Name] + [Trigger & Event] + [Behavior & State Changes] + [Motion Specs] + [Fallback & A11y]
```

### 📋 Copy-Paste Prompt Template
> *"Build a `<Component Name>` using Next.js (App Router), TypeScript, Tailwind CSS, and Framer Motion / Motion.  
> **Trigger:** On `<click / hover / scroll / drag / keypress>`, `<describe user action>`.  
> **Behavior:** Update `<state / layout / DOM changes>`. Keep layout shifts zero-CLS.  
> **Motion:** Use `<spring / tween>` motion with `<duration ms>` and easing `<ease-out / spring(damping: 25, stiffness: 300)>`. Respect `prefers-reduced-motion`.  
> **A11y & Edge Cases:** Include full keyboard navigation (`Tab`, `Esc`, arrow keys), proper ARIA tags (`aria-expanded`, `aria-live`, etc.), and mobile touch responsiveness."*

### 🛠️ The 60-Second Hackathon Stack Bootstrap
```bash
# Core modern motion & UI primitives
pnpm add framer-motion lucide-react clsx tailwind-merge canvas-confetti sonner @radix-ui/react-dialog @radix-ui/react-popover @radix-ui/react-slot
pnpm add -D @types/canvas-confetti
```

---

## 🧭 Interaction Index (36 Patterns)

| Category | Patterns | Best For |
| :--- | :--- | :--- |
| [**1–4 · Buttons & Navigation**](#14--buttons--navigation) | Magnification Dock, Segmented Control, Magnetic Button, Floating Nav | Primary UX flow & page navigation |
| [**5–8 · Containers & Surfaces**](#58--containers--surfaces) | Morphing Dialog, Expandable Card, Spotlight Card, 3D Tilt Card | High-impact hero cards & modalless detail |
| [**9–12 · Menus & Overlays**](#912--menus--overlays) | Command Palette (⌘K), Expandable Toolbar, Context Menu, Smart Popover | Power-user tools & deep functionality |
| [**13–16 · Media & Content**](#1316--media--content) | Before/After Slider, Hover Preview, Shared Element Morph, Drag Gallery | Showcasing images, AI outputs & comparisons |
| [**17–20 · Data & Feedback**](#1720--data--feedback) | Animated Metric, Progress Bar, Skeleton Shimmer, Toast Stack | Real-time dashboards, SaaS metrics & latency hiding |
| [**21–24 · Workspace & Canvas**](#2124--workspace--canvas) | Resizable Panels, Sortable Grid (dnd), Inline Edit, Multi-Select Marquee | B2B tools, Kanban boards & productivity apps |
| [**25–28 · Dynamic Feedback**](#2528--dynamic-feedback--live-state) | Dynamic Island, Live Presence Pulse, Confetti Burst, Pull-to-Refresh | Collaborative apps, mobile web & gamification |
| [**29–32 · Layout & Gestures**](#2932--layout--gesture-navigation) | Sticky Header Shrink, Swipe Row Actions, Collapsible Drawer, Infinite Ticker | Mobile-first lists & social proof banners |
| [**33–36 · Visual Magic & Inputs**](#3336--advanced-inputs--visual-magic) | Border Beam, OTP Pin Grid, Range Slider + Tooltip, Scratch-Off Reveal | Auth screens, pricing calculators & viral reveals |

---

## 1–4 · Buttons & Navigation

### 1. Magnification Dock
- **Description:** Icons scale smoothly based on cursor proximity, replicating the classic macOS dock.
- **Trigger:** `hover` / cursor proximity tracking (`onMouseMove`).
- **Motion:** `scale: 1 → 1.25`, spring curve (`stiffness: 300, damping: 20`), ~150ms.
- **A11y & Fallback:** `focus-visible:ring-2`, individual `aria-label`, static size on touch screens.
- **Vibe Prompt:**  
  `"Create a macOS-style magnification dock using Framer Motion useMotionValue and useTransform. Icons dynamically scale up to 1.35x based on cursor distance (120px radius). Snap smoothly back with spring physics."`

### 2. Segmented Control (Sliding Pill)
- **Description:** Single active pill indicator slides smoothly beneath selected tabs without abrupt color popping.
- **Trigger:** `click` / arrow keys (`Tab` + `Space`/`Enter`).
- **Motion:** Framer Motion `layoutId="active-pill"`, duration `200ms ease-out` or soft spring.
- **A11y & Fallback:** `role="tablist"`, `role="tab"`, `aria-selected="true/false"`, keyboard roving focus.
- **Vibe Prompt:**  
  `"Build a segmented pill tab switcher. Use layoutId on an absolute background element so the active pill smoothly glides between tabs. Include keyboard arrow navigation."`

### 3. Magnetic Button
- **Description:** Button gently pulls toward the user's cursor when hovered within a magnetic threshold, snapping back on exit.
- **Trigger:** `mousemove` within container radius (40–60px).
- **Motion:** `translate(x, y)` 0→8px proportional to offset; spring release (`stiffness: 150, damping: 15`).
- **A11y & Fallback:** Disabled if `prefers-reduced-motion: reduce`. Standard button focus ring.
- **Vibe Prompt:**  
  `"Create a magnetic CTA button in React. Track cursor offset relative to button center and translate button up to 10px toward mouse with a smooth spring return."`

### 4. Floating Navigation (Glass Pill Nav)
- **Description:** Detached floating bottom or top nav bar with frosted-glass backdrop blur and auto-hide/reveal on scroll.
- **Trigger:** Scroll direction change (`scrollY.onChange`).
- **Motion:** `translateY(0)` to `translateY(100%)`, `200ms ease-out` + `backdrop-blur-md bg-background/80`.
- **A11y & Fallback:** `env(safe-area-inset-bottom)` mobile padding, `aria-label="Floating Navigation"`.
- **Vibe Prompt:**  
  `"Implement a floating frosted-glass bottom nav bar that slides down out of view when scrolling down and immediately reveals on scroll up."`

---

## 5–8 · Containers & Surfaces

### 5. Morphing Dialog (Shared Layout Modal)
- **Description:** A preview card expands seamlessly into a full modal dialog in-place, giving native app fluidity.
- **Trigger:** `click` on preview trigger card.
- **Motion:** Framer Motion `layoutId="dialog-card"`, `250ms spring(stiffness: 260, damping: 25)`.
- **A11y & Fallback:** Radix Dialog primitive, focus trap inside modal, `Esc` to close, `aria-modal="true"`.
- **Vibe Prompt:**  
  `"Build a shared layout morphing dialog with Framer Motion. Clicking a card smoothly expands its geometry into a full-sized detail modal with matching layoutId."`

### 6. Expandable Card (Accordion Surface)
- **Description:** Compact card smoothly expands vertical height to reveal hidden configuration or breakdown.
- **Trigger:** `click` / keyboard toggle.
- **Motion:** `height: auto` with Framer Motion `AnimatePresence` and `layout`, `200ms ease-out`.
- **A11y & Fallback:** `aria-expanded="true/false"`, semantic `<button>` trigger, clean layout reflow.
- **Vibe Prompt:**  
  `"Create an expandable card component that smoothly animates between collapsed preview and expanded full state using AnimatePresence and layout."`

### 7. Spotlight Card (Radial Glow)
- **Description:** A sleek radial gradient light follows the mouse cursor across card borders and background.
- **Trigger:** `mousemove` across card surface.
- **Motion:** Dynamic CSS variables `--mouse-x` and `--mouse-y` updated via requestAnimationFrame; `0ms` lag.
- **A11y & Fallback:** Purely decorative layer with `pointer-events-none`. Turn off with reduced motion.
- **Vibe Prompt:**  
  `"Create a dark-mode spotlight card. Track mouse position to update a radial-gradient mask on an absolute border/overlay div for a glowing flashlight effect."`

### 8. 3D Parallax Tilt Card
- **Description:** Card tilts dynamically in 3D perspective based on pointer position with inner elements lifting on the Z-axis.
- **Trigger:** `mousemove` inside card boundaries.
- **Motion:** `rotateX` / `rotateY` (±10deg), `transform-style: preserve-3d`, spring easing on mouse leave.
- **A11y & Fallback:** Disabled on mobile touch devices and when `prefers-reduced-motion` is active.
- **Vibe Prompt:**  
  `"Build a 3D tilt card with Framer Motion. Compute cursor position from card center to rotateX and rotateY up to 8 degrees, with a subtle floating inner badge."`

---

## 9–12 · Menus & Overlays

### 9. Command Palette (⌘K)
- **Description:** Global fuzzy-search launcher for keyboard-first navigation, action execution, and filtering.
- **Trigger:** Shortcut `Cmd+K` / `Ctrl+K` or search bar click.
- **Motion:** Overlay fade `opacity: 0 → 1`, dialog `scale: 0.96 → 1`, `150ms ease-out`.
- **A11y & Fallback:** Radix / `cmdk` library, `role="combobox"`, arrow-key roving tabindex, screen reader friendly.
- **Vibe Prompt:**  
  `"Implement a ⌘K command palette using cmdk and Tailwind CSS. Support search filtering, action execution, recent history, and smooth scale-in modal animation."`

### 10. Expandable Dynamic Toolbar
- **Description:** Compact floating toolbar that unfolds additional action buttons or sub-menus on hover or click.
- **Trigger:** `hover` or toggle button click.
- **Motion:** Width/height interpolate smoothly with `layout`, button stagger fade-in `150ms ease-out`.
- **A11y & Fallback:** `aria-expanded`, overflow collapse into a three-dots menu on small mobile screens.
- **Vibe Prompt:**  
  `"Build a floating icon toolbar that expands from 3 primary icons to a full editing suite when clicked, with staggered icon animations."`

### 11. Smart Context Menu
- **Description:** Custom right-click / long-press menu with auto-flip positioning to always stay inside viewport bounds.
- **Trigger:** `contextmenu` event or mobile `long-press`.
- **Motion:** Scale `0.95 → 1` with opacity fade `120ms ease-out`.
- **A11y & Fallback:** Radix ContextMenu, keyboard roving tabindex, dismissal on `Esc` or outside click.
- **Vibe Prompt:**  
  `"Create a custom right-click context menu using Radix UI ContextMenu. Include icon items, sub-menus, keyboard shortcuts badges, and boundary flipping."`

### 12. Smart Popover (Collision-Aware)
- **Description:** Floating utility card anchored to a button that repositions itself dynamically to avoid screen edges.
- **Trigger:** `click` or hover focus.
- **Motion:** Translate `4px → 0px` with fade `150ms ease-out`.
- **A11y & Fallback:** Focus return to trigger button on close, Radix Popover primitive with collision padding.
- **Vibe Prompt:**  
  `"Build an anchored popover using @radix-ui/react-popover with collision detection, arrow pointer, and smooth entry animation."`

---

## 13–16 · Media & Content Transitions

### 13. Before/After Split Slider
- **Description:** Draggable vertical divider that clips between two layered images or designs in real-time.
- **Trigger:** Pointer `drag` or keyboard arrow keys.
- **Motion:** `clip-path: inset(0 0 0 X%)`, instant 0ms tracking during drag, soft spring snap on quick drag.
- **A11y & Fallback:** `role="slider"`, `aria-valuenow`, `aria-label="Image comparison slider"`, step arrow keys.
- **Vibe Prompt:**  
  `"Build a before/after image slider with a draggable center handle. Use CSS clip-path to reveal the after image as the user drags horizontally."`

### 14. Hover Image Preview / Card Float
- **Description:** Hovering over a link or list item triggers a floating, cursor-following image/video thumbnail.
- **Trigger:** `mouseenter` on table row / link.
- **Motion:** Floating badge interpolates toward cursor with `100ms` spring smoothing; fade & scale in.
- **A11y & Fallback:** Static thumbnail visible on touch or mobile; keyboard focus displays inline tooltip.
- **Vibe Prompt:**  
  `"Create a list of links where hovering any item pops up a floating thumbnail preview that tracks cursor movement with a slight spring delay."`

### 15. Shared Element Transition (List → Detail)
- **Description:** An image or title smoothly flies and expands from its thumbnail position into the hero banner of a detail page.
- **Trigger:** Item `click` navigation.
- **Motion:** `layoutId="item-image-{id}"`, duration `300ms spring(stiffness: 220, damping: 24)`.
- **A11y & Fallback:** Immediate page change fallback if browser prefers reduced motion.
- **Vibe Prompt:**  
  `"Build a gallery-to-detail view using Framer Motion layoutId. Clicking a thumbnail smoothly expands it into the full-width hero image of the view modal."`

### 16. Momentum Drag-to-Scroll Gallery
- **Description:** Horizontally scrollable row with inertial momentum flick, edge bounce, and scroll-snap.
- **Trigger:** Mouse drag or touch swipe.
- **Motion:** Framer Motion `drag="x"`, `dragConstraints`, elastic boundaries, momentum velocity physics.
- **A11y & Fallback:** Left/right keyboard button controls for accessible navigation.
- **Vibe Prompt:**  
  `"Create a horizontal carousel with drag-to-scroll momentum using Framer Motion drag='x'. Enforce constraints with a soft rubber-band bounce at edges."`

---

## 17–20 · Data & Feedback

### 17. Animated Rolling Metric / Number Counter
- **Description:** KPI and balance numbers rapidly roll up to their target value on mount or data refresh.
- **Trigger:** Component mount or value state update.
- **Motion:** Tween count interpolation over `600ms ease-out`, digit stagger `50ms`.
- **A11y & Fallback:** Wrap in `aria-live="polite"` so screen readers announce finalized number once.
- **Vibe Prompt:**  
  `"Build an animated counter component in React. When the target number changes, roll digits smoothly from the previous value to the new value over 600ms."`

### 18. Staged Progress Bar with Live Step Indicators
- **Description:** Multi-step progress bar showing current status with smooth width interpolation and pulsing active dot.
- **Trigger:** Workflow step advance.
- **Motion:** Width transition `400ms cubic-bezier(0.4, 0, 0.2, 1)`, step indicator checkmark scale pulse.
- **A11y & Fallback:** `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`.
- **Vibe Prompt:**  
  `"Create a multi-step onboarding progress bar. As step state increments, animate the progress bar fill width and pop step icon badges with a scale spring."`

### 19. Shimmer Skeleton Loading
- **Description:** Exact layout-shaped skeleton placeholders with a continuous angled light shimmer while waiting for API data.
- **Trigger:** Component `isLoading === true`.
- **Motion:** Infinite linear background-position gradient sweep (`1.5s loop`).
- **A11y & Fallback:** `aria-busy="true"`, `aria-live="polite"`. Static neutral gray box if reduced motion is requested.
- **Vibe Prompt:**  
  `"Create a shimmer skeleton loader matching my card layout using Tailwind CSS animate-pulse or an angled linear-gradient keyframe shimmer."`

### 20. Toast Notification Stack
- **Description:** Action feedback toasts that stack with perspective depth, slide in smoothly, and expand on hover.
- **Trigger:** Mutation success / error event.
- **Motion:** `translateY: 10px → 0`, `scale: 0.94 → 1`, auto-dismiss after 4s; stack hover expands cards.
- **A11y & Fallback:** Sonner library, `role="status"`, pause timer on mouse hover.
- **Vibe Prompt:**  
  `"Set up Sonner toast notifications with custom Tailwind styling. Show stacked toasts with smooth slide-up, auto-dismiss countdown, and action button."`

---

## 21–24 · Workspace & Canvas

### 21. Split-Pane Resizable Panels
- **Description:** Draggable splitter handle between code, preview, or sidebar panes with snap-to-collapse thresholds.
- **Trigger:** Pointer `drag` on separator line.
- **Motion:** Real-time CSS flex-basis resize (`0ms`), soft spring snap when near minimum collapse width.
- **A11y & Fallback:** `role="separator"`, `aria-valuenow`, keyboard arrow step adjustments.
- **Vibe Prompt:**  
  `"Build a 2-column resizable layout using react-resizable-panels or raw pointer drag, featuring a collapse snap threshold and keyboard support."`

### 22. Drag-and-Drop Sortable Grid / Kanban
- **Description:** Reorderable card list or Kanban board with live layout reflow and elevated drop shadows.
- **Trigger:** Pointer drag on item handle.
- **Motion:** dnd-kit or Framer Motion `layout`, `200ms spring` reflow, dragged item elevated with `shadow-2xl scale-105`.
- **A11y & Fallback:** `@dnd-kit/core` keyboard sensors (`Space` to lift, arrows to move, `Space` to drop).
- **Vibe Prompt:**  
  `"Implement a sortable list using @dnd-kit/sortable and Tailwind CSS. Cards smoothly reorder with layout animations and lift up with a drop shadow on drag."`

### 23. Click-to-Edit Inline Typography
- **Description:** Double-click or single-click header text transforms seamlessly into an inline text input, saving on blur.
- **Trigger:** `click` / `Enter` on typography element.
- **Motion:** Text opacity fade to input field `120ms ease-out`, instant focus & selection of text.
- **A11y & Fallback:** `Esc` cancels edit reverting to old value; `Enter` commits; announces update via `aria-live`.
- **Vibe Prompt:**  
  `"Create an inline editable title component. Clicking the text replaces it with an input without shifting layout. Pressing Enter or clicking outside saves it."`

### 24. Canvas Marquee / Multi-Item Bounding Box
- **Description:** Click and drag on canvas background creates a dynamic selection marquee box highlighting enclosed items.
- **Trigger:** `mousedown` + `mousemove` on empty canvas area.
- **Motion:** Bounding rectangle coordinates update in real-time (`0ms`), items trigger highlight within `100ms`.
- **A11y & Fallback:** Standard multi-select checkboxes or `Shift+Click` keyboard navigation.
- **Vibe Prompt:**  
  `"Build a drag-to-select marquee box in React. Dragging on the background draws a dashed selection rectangle that selects any card intersecting its coordinates."`

---

## 25–28 · Dynamic Feedback & Live State

### 25. Dynamic Island / Expanding Pill
- **Description:** Compact status pill (e.g. running timer, active API call, audio player) that morphs into a rich card when tapped.
- **Trigger:** System event state change or user `click`.
- **Motion:** Framer Motion `layoutId="dynamic-island"`, spring morph (`stiffness: 350, damping: 28`).
- **A11y & Fallback:** `aria-live="polite"`, keyboard toggleable, returns focus back to trigger button upon close.
- **Vibe Prompt:**  
  `"Create an Apple Dynamic Island widget in Next.js with Framer Motion. A compact pill showing upload progress expands smoothly on click into a full status card."`

### 26. Live Presence Pulse & Typing Indicator
- **Description:** Real-time avatar stack with active status rings, typing dot bounce, and collaborator cursor tags.
- **Trigger:** Real-time WebSocket or mock state event.
- **Motion:** Dot stagger `translateY: 0 → -4px → 0` in an infinite `400ms` wave; cursor tags ease smoothly to new coordinates.
- **A11y & Fallback:** Tooltips displaying collaborator names, `aria-label="User is typing"`.
- **Vibe Prompt:**  
  `"Build a live presence header showing overlapping user avatars with glowing online status dots and a 3-dot bouncing typing indicator animation."`

### 27. Confetti & Particle Burst Celebration
- **Description:** Physics-driven canvas particle burst firing across the screen upon key milestone completion (e.g., payment, submit).
- **Trigger:** Primary CTA success / form completion.
- **Motion:** Canvas 2D particle physics: initial velocity, gravity decay, rotation spin over 2.5s.
- **A11y & Fallback:** `aria-live="polite"` announcing "Action completed successfully". Can be disabled in settings.
- **Vibe Prompt:**  
  `"Integrate canvas-confetti upon clicking the submit button. Trigger a high-velocity 2-cannon burst from bottom corners with custom brand colors."`

### 28. Elastic Haptic Pull-to-Refresh
- **Description:** Pulling content down past a vertical threshold reveals a spinning indicator with rubber-band resistance.
- **Trigger:** Vertical touch drag on top boundary.
- **Motion:** Rubber-band math (`y = dragDistance * 0.4`), spring release back to header height `250ms`.
- **A11y & Fallback:** Manual "Refresh" button visible on desktop / non-touch environments.
- **Vibe Prompt:**  
  `"Implement a mobile pull-to-refresh container. Pulling down past 70px triggers a loading spinner and snaps back smoothly with spring physics upon release."`

---

## 29–32 · Layout & Gesture Navigation

### 29. Sticky Header Shrink & Frosted Glass Blur
- **Description:** Tall banner header condenses into a compact floating frosted-glass bar as the user scrolls down.
- **Trigger:** Window scroll offset (`scrollY > 60px`).
- **Motion:** Height animates `80px → 54px`, `backdrop-blur-md`, subtle border shadow fade-in, `150ms ease-out`.
- **A11y & Fallback:** Semantic `<header>` landmark with proper heading hierarchies preserved.
- **Vibe Prompt:**  
  `"Create a sticky navigation header that smoothly shrinks in height and gains a frosted glass background (backdrop-blur) when page scroll exceeds 50px."`

### 30. Swipe-to-Reveal Table / List Row Actions
- **Description:** Swiping a list row horizontally uncovers hidden action buttons (Delete, Archive, Flag) with tactile snap points.
- **Trigger:** Touch swipe or horizontal drag.
- **Motion:** `translateX` tracking with snap thresholds at `80px` and `160px`; spring bounce on snap.
- **A11y & Fallback:** Always provide an explicit "..." three-dot action dropdown menu for keyboard and mouse users.
- **Vibe Prompt:**  
  `"Build an iOS-style swipeable list item with Framer Motion drag='x'. Dragging left reveals red delete and blue archive action buttons underneath."`

### 31. Collapsible Sidebar Drawer
- **Description:** Sidebar collapses smoothly between full width with text labels and an icon-only rail, reflowing main content.
- **Trigger:** Toggle button click or `Cmd+B` shortcut.
- **Motion:** Width transition `260px → 68px` using spring (`stiffness: 280, damping: 30`), labels fade out cleanly.
- **A11y & Fallback:** `aria-expanded`, tooltips automatically appear on hover when sidebar is in collapsed icon-only state.
- **Vibe Prompt:**  
  `"Build a collapsible sidebar with Next.js and Tailwind. Animate width from 240px to 64px while fading text labels and showing tooltips on icon hover."`

### 32. Infinite Pause-on-Hover Marquee Ticker
- **Description:** Continuous horizontal ticker for logos, testimonials, or stock prices that pauses cleanly on cursor hover.
- **Trigger:** Automatic continuous loop; pauses on `hover` / `focus-within`.
- **Motion:** CSS `translateX(-50%)` infinite linear keyframe animation (30–45s).
- **A11y & Fallback:** `aria-hidden="true"` on duplicate track items; stop animation if `prefers-reduced-motion` is active.
- **Vibe Prompt:**  
  `"Create an infinite scrolling logo marquee in Tailwind CSS. Duplicate the items list for seamless looping and pause the animation when hovered."`

---

## 33–36 · Advanced Inputs & Visual Magic

### 33. Glowing Border Beam (Conic Gradient)
- **Description:** A luminous light beam travels smoothly around the perimeter of a card or CTA container.
- **Trigger:** Always-on ambient loop or `hover` / `focus` activation.
- **Motion:** Conic-gradient rotation angle (`0deg → 360deg`) animated via CSS `@property --angle` or SVG stroke offset.
- **A11y & Fallback:** Static 1px border fallback for browsers without CSS `@property` support.
- **Vibe Prompt:**  
  `"Create a glowing border beam effect around a card using Tailwind and CSS conic-gradient. Animate the light beam rotating smoothly around the perimeter."`

### 34. OTP / PIN Code Auto-Advancing Input Grid
- **Description:** Multi-box 4 or 6-digit input with instant auto-focus advance, backspace regression, and full clipboard paste handling.
- **Trigger:** Numeric keystroke or paste event (`onPaste`).
- **Motion:** Input box scale pulse `1 → 1.08 → 1` (`120ms`) and glow ring on digit fill.
- **A11y & Fallback:** Single hidden input handling mobile autocomplete (`inputMode="numeric"`, `autoComplete="one-time-code"`).
- **Vibe Prompt:**  
  `"Build a 6-digit OTP verification input in React. Support auto-focus jump to next slot, backspace navigation, full string paste, and digit fill pulse."`

### 35. Range Slider with Floating Dynamic Tooltip
- **Description:** Custom slider thumb accompanied by a floating numerical badge that tracks the exact thumb position live.
- **Trigger:** Slider `drag` or cursor `hover`.
- **Motion:** Floating badge `translateX` tracks thumb position with 0ms delay; scale in on drag (`150ms spring`).
- **A11y & Fallback:** Standard `<input type="range">` semantic base, `role="slider"`, `aria-valuenow`, arrow key navigation.
- **Vibe Prompt:**  
  `"Build an interactive pricing range slider. Attach a floating price bubble directly above the slider thumb that follows it smoothly across the track."`

### 36. Interactive Scratch-Off Reveal Card
- **Description:** User drags or scratches across a frosted silver canvas overlay to uncover an exclusive coupon or hidden easter egg.
- **Trigger:** Pointer / touch drag across HTML5 `<canvas>`.
- **Motion:** Real-time pixel erasure using `globalCompositeOperation = 'destination-out'`; particle puff when 60% cleared.
- **A11y & Fallback:** An accessible "Click to reveal immediately" button for screen readers and touch-disabled users.
- **Vibe Prompt:**  
  `"Create an interactive scratch-off card using an HTML5 canvas overlay. Dragging clears the silver mask. Once 50% is cleared, fade out the remaining mask."`

---

## 🚀 Hackathon Pre-Flight Checklist (T-Minus 1 Hour)

Before pitching to judges, run this **10-minute audit**:

- [ ] **The 30-Second Hook:** Is your Hero interaction (e.g. Morphing Card or Dynamic Island) visible within the first screen without scrolling?
- [ ] **Motion Speed Check:** Are all micro-animations $\le 300\text{ms}$? (Any animation $> 400\text{ms}$ makes apps feel sluggish during a timed demo).
- [ ] **Zero-Jank Loading:** Do all async button clicks have immediate feedback (spinner or disabled state)? Never leave judges wondering if a button clicked.
- [ ] **No Content Flashes:** Are empty states and skeleton loaders in place for API responses?
- [ ] **Mobile Touch Sanity:** If the judge grabs your phone to test, does the nav bar respect `safe-area-inset-bottom`?
- [ ] **Keyboard Cleanliness:** Pressing `Esc` closes your active dialog or command palette without breaking page state.
