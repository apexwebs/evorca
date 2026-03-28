# Design System Document

## 1. Overview & Creative North Star: "The Curated Atmosphere"

This design system is built upon the concept of **The Curated Atmosphere**. In the world of high-end Kenyan events—from corporate summits in Westlands to bespoke weddings in Karen—the experience is defined by what is felt rather than what is merely seen. We move away from the "generic SaaS" look of rigid borders and flat grids, opting instead for an editorial, layered approach that feels like a premium physical invitation.

The system breaks the "template" mold through **Intentional Asymmetry** and **Tonal Depth**. By utilizing overlapping surfaces and a sophisticated high-contrast scale, we ensure that while the platform remains a powerhouse of utility for event organizers, it carries the weight and prestige of the events it manages.

---

## 2. Colors: Depth Over Definition

The palette centers on the tension between the grounding **Primary Teal (#00535B)** and the celebratory **Secondary Gold (#735C00)**. 

### The "No-Line" Rule
To achieve a high-end editorial feel, **1px solid borders are prohibited for sectioning.** Structural boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section should sit directly against a `surface` background to define its territory without a "box" look.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine Kenyan stationery.
*   **Base:** `surface` (#f9f9fc)
*   **Sectioning:** `surface-container-low` (#f3f3f6)
*   **Interactive Cards:** `surface-container-lowest` (#ffffff)
*   **Elevated Overlays:** `surface-container-high` (#e8e8ea)

### The Glass & Gradient Rule
For floating elements (like "Add Guest" FABs or Navigation Bars), use **Glassmorphism**. Apply a semi-transparent `surface` color with a `backdrop-blur` of 12px-20px. 
*   **Signature Polish:** Use a subtle linear gradient from `primary` (#00535B) to `primary-container` (#006D77) for hero CTAs to give them a "lit from within" glow rather than a flat plastic appearance.

---

## 3. Typography: Editorial Authority

We use a dual-typeface system to balance the "Human" and the "High-Tech."

*   **Display & Headlines (Manrope):** Our "Voice." Manrope’s geometric yet warm curves provide a modern, premium feel. Use `display-lg` to `headline-sm` for page titles and section headers. 
*   **Body & Labels (Inter):** Our "Utility." Inter is chosen for its mathematical precision and exceptional readability at small scales—crucial for guest lists and gate check-ins.

**Hierarchy Strategy:** 
Use `display-md` (2.75rem) with tight letter-spacing for dashboard summaries to create a "Magazine Header" effect. Pair this with `body-md` (0.875rem) in `on-surface-variant` (#3e494a) for descriptions to create high-contrast, professional clarity.

---

## 4. Elevation & Depth: Tonal Layering

Traditional drop shadows are often messy. We use **Tonal Layering** to create a natural, architectural lift.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft, "ghost" lift that feels expensive and intentional.
*   **Ambient Shadows:** If an element must float (e.g., a guest's QR Pass), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(0, 31, 35, 0.06)`. The shadow color is a tint of our `on-surface` color, mimicking natural Kenyan sunlight.
*   **The Ghost Border Fallback:** If a boundary is strictly required for accessibility, use the `outline-variant` (#bec8ca) at **15% opacity**. Never use 100% opaque borders.

---

## 5. Components: Precision & Prestige

### Buttons
*   **Primary:** Linear gradient (`primary` to `primary-container`), `xl` (0.75rem / 12px) rounding, white text.
*   **Secondary (The Gold Standard):** Use `secondary-fixed` (#ffe088) backgrounds with `on-secondary-fixed` (#241a00) text. This is reserved for "Success" actions like "Check-In Guest."
*   **Tertiary:** No background. Use `primary` text with a subtle `surface-variant` hover state.

### Input Fields
*   Forbid "Box" inputs. Use a "Minimalist Undersline" or a solid `surface-container-highest` background with no border. 
*   **Focus State:** Shift the background to `primary-fixed` (#9ff0fb) with a 2px bottom-accent in `primary`.

### Cards & Guest Lists
*   **The No-Divider Rule:** Never use horizontal lines to separate guests in a list. Instead, use vertical white space (Spacing `4`: 1rem) and alternating `surface` vs `surface-container-low` backgrounds to distinguish rows.

### The "Digital Pass" (Event Gate Mode)
*   **Context:** High-contrast Dark Mode.
*   **Surface:** `inverse-surface` (#2f3133).
*   **Accent:** Use `secondary-container` (#fed65b) for the QR code container to ensure the highest possible scanning reliability against the dark background.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical margins. For example, a page header can have a larger left-hand "breath" than the right to feel like a modern editorial layout.
*   **Do** use the `secondary_fixed_dim` (#e9c349) for small accents like star ratings or "VIP" status tags.
*   **Do** prioritize `surface_container_lowest` (#ffffff) for the main content area in light mode to provide a "Clean Slate" feeling.

### Don’t:
*   **Don’t** use pure black (#000000) for text. Always use `on-surface` (#1a1c1e) to keep the look sophisticated and avoid "ink-bleed" on mobile screens.
*   **Don’t** use standard 4px rounding. Stick strictly to the `xl` (0.75rem / 12px) or `lg` (0.5rem / 8px) scale to maintain the "Subtle Professionalism" vibe.
*   **Don’t** use default blue for links. Every interactive element must be `primary` teal or `secondary` gold.

---

## 7. Spacing Scale: The Rhythm of the Event
Space is a luxury. Use it as such.
*   **Container Padding:** Minimum `8` (2rem) for desktop; `4` (1rem) for mobile.
*   **Component Gap:** Use `4` (1rem) to group related items, and `10` (2.5rem) to separate distinct sections.
*   **The "Editorial Breath":** Use `16` (4rem) of vertical spacing between a page title and the first card to signal importance.