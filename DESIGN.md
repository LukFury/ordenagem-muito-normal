# Design System Document: The Occult Tactical Protocol
 
## 1. Overview & Creative North Star: "The Digital Exorcism"
The Creative North Star for this system is **The Digital Exorcism**. This is not a standard "dark mode" interface; it is a high-stakes digital environment where the sterile precision of modern tactical hardware meets the decaying, chaotic energy of the paranormal. 
 
The design rejects the "friendly" web. We move beyond templates by embracing **Aggressive Brutalism** and **Redacted Editorial** layouts. Expect intentional asymmetry, where "information overflow" is balanced by "redacted" empty spaces. Elements should feel like they are being rendered by a high-end field terminal struggling to process data that shouldn't exist.
 
## 2. Colors: Tonal Oppression & Ritual Light
We utilize a palette of "dead" neutrals punctuated by "living" ritualistic accents.
 
### Color Strategy
- **Base Oppression:** The background is anchored in `surface` (#131313). This is a mandatory dark-mode-only system.
- **The "No-Line" Rule:** Standard 1px borders are strictly prohibited for layout containment. Sectioning is achieved via **Tonal Carving**. Use `surface-container-lowest` (#0E0E0E) to "sink" a section into the background, or `surface-container-high` (#2A2A2A) to make it emerge.
- **Ritual Accents:** 
    - **Blood Red (`primary_container` #8E1616):** Use for high-stakes alerts, critical failures, or "Active Investigation" states.
    - **Paranormal Cyan (`secondary` #46EAED):** Use for technical data, scanning effects, and tactical readouts.
    - **Ritual Gold (`tertiary` #EAC249):** Reserved for "Lore" discoveries, ancient artifacts, or successful ritual completions.
 
### Signature Textures
Apply a subtle noise grain overlay (2-3% opacity) across the entire UI to simulate a sensor-strained field monitor. For CTAs, use a linear gradient from `primary_container` (#8E1616) to `on_primary_fixed_variant` (#8D1515) to give a "viscous" depth to interactive elements.
 
## 3. Typography: The Analyst vs. The Oracle
The typography scale creates a tension between modern military precision and ancient, weathered history.
 
- **The Analyst (Manrope):** Used for UI, tactical data, and field reports. It is sharp, geometric, and authoritative. 
    - **Label-MD/SM:** Use for technical metadata. Often uppercase with 0.1em letter spacing.
    - **Body-LG/MD:** For the "Dossier" narrative.
- **The Oracle (Newsreader):** A ritualistic, weathered serif. Used for lore, ancient inscriptions, and high-level narrative titles.
    - **Display-LG/MD:** These should be treated as "found objects." Use asymmetrical alignments—far left or far right—to break the grid.
- **Visual Hierarchy:** Headlines (`headline-lg`) should often be paired with a small `label-sm` technical timestamp or "Classification Level" to reinforce the tactical theme.
 
## 4. Elevation & Depth: Tonal Layering
Traditional shadows have no place here. Depth is a matter of "Data Density" and "Layered Glass."
 
- **The Layering Principle:** Stack `surface-container` tiers. 
    - *Example:* A tactical map (on `surface-container-low`) has a data overlay card (on `surface-container-highest`). This creates a "Tactical Stack" look without artificial shadows.
- **Glassmorphism & Depth:** For floating modals or "Interception" windows, use `surface` at 70% opacity with a `backdrop-blur` of 12px. This simulates a glass terminal UI overlaid on a physical document.
- **The Ghost Border Fallback:** If a container needs an edge (e.g., an input field), use `outline_variant` (#59413E) at **15% opacity**. It should be barely perceptible, like a faint light reflecting off the edge of a monitor.
 
## 5. Components: Tactical Hardware & Ancient Lore
 
### Buttons (Tactical Trigger)
- **Primary:** Sharp corners (`0px`). Background: `primary_container`. Text: `on_primary_container`. On hover, add a 1px inner glow using `primary`.
- **Secondary (The Scanner):** Background: Transparent. Border: `outline_variant` at 20%. Text: `secondary` (#46EAED).
- **Tertiary:** Text only, uppercase `label-md` with an icon.
 
### Cards & Dossiers
- **Forbidden:** No divider lines.
- **Guidance:** Use `surface-container-low` for the card body. Separate the "Header" of the card from the "Body" using a background shift to `surface-container-highest`. 
- **The "Redacted" Card:** For locked content, use a solid block of `surface-container-lowest` with a centered `label-md` reading "CLASSIFIED."
 
### Input Fields
- Underline-only style. Use `outline` (#A88A86) for the resting state. When active, the line glows `secondary` (Cyan) with a faint 4px outer blur to simulate a monitor "lit" state.
 
### Tactical Components (Custom)
- **The Ritual Gauge:** A progress bar using a `tertiary` (Gold) gradient that "flickers" (opacity animation) as it fills.
- **The Dossier Tab:** Tabs that look like physical folder tabs, using `0px` rounding and `surface-container-high`.
 
## 6. Do's and Don'ts
 
### Do
- **Embrace Sharp Edges:** Use `0px` border-radius for everything. Roundness is for "consumer" apps; this is a survival tool.
- **Use Monospacing for Numbers:** Ensure tactical data (coordinates, timestamps) uses a monospaced variant of Manrope to feel like a computer readout.
- **Asymmetric Margins:** Give lore text (`Newsreader`) more breathing room than tactical text (`Manrope`) to emphasize its "otherworldly" nature.
 
### Don't
- **Don't use 100% white:** Use `on_surface` (#E5E2E1). Pure white is too clean; we want the "dirty" feel of an old display.
- **Don't use standard shadows:** If you must use a shadow for a floating "Ritual Object," use a tint of `primary` at 5% opacity with a 40px blur—never black.
- **No Circular UI:** Even radio buttons should be square or diamond-shaped to maintain the sharp, tactical aesthetic.
