# Graph Report - /home/lukfury/Projects/ordenagem-muito-normal  (2026-04-19)

## Corpus Check
- 27 files · ~138,004 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 106 nodes · 118 edges · 28 communities detected
- Extraction: 75% EXTRACTED · 25% INFERRED · 0% AMBIGUOUS · INFERRED: 30 edges (avg confidence: 0.83)
- Token cost: 12,000 input · 2,800 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Character Creation Wizard|Character Creation Wizard]]
- [[_COMMUNITY_Social & UI Icons|Social & UI Icons]]
- [[_COMMUNITY_RPG Rules Engine|RPG Rules Engine]]
- [[_COMMUNITY_App Routing & Backend|App Routing & Backend]]
- [[_COMMUNITY_Creation Page Logic|Creation Page Logic]]
- [[_COMMUNITY_Vite Build Assets|Vite Build Assets]]
- [[_COMMUNITY_Brand Visual Identity|Brand Visual Identity]]
- [[_COMMUNITY_Ordem Paranormal Rulebook|Ordem Paranormal Rulebook]]
- [[_COMMUNITY_Hero Image Design|Hero Image Design]]
- [[_COMMUNITY_React Framework Assets|React Framework Assets]]
- [[_COMMUNITY_App Entry Point|App Entry Point]]
- [[_COMMUNITY_Derived Stats Calculation|Derived Stats Calculation]]
- [[_COMMUNITY_Vite Config|Vite Config]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Campaign Page|Campaign Page]]
- [[_COMMUNITY_Home Page|Home Page]]
- [[_COMMUNITY_Not Found Page|Not Found Page]]
- [[_COMMUNITY_Character Sheet Page|Character Sheet Page]]
- [[_COMMUNITY_Supabase Client|Supabase Client]]
- [[_COMMUNITY_Character Types|Character Types]]
- [[_COMMUNITY_Step Origin|Step Origin]]
- [[_COMMUNITY_Step Concept|Step Concept]]
- [[_COMMUNITY_Step Review|Step Review]]
- [[_COMMUNITY_Vite Config AST|Vite Config AST]]
- [[_COMMUNITY_ESLint Config AST|ESLint Config AST]]
- [[_COMMUNITY_Skill Bonus Rule|Skill Bonus Rule]]
- [[_COMMUNITY_Character Type AST|Character Type AST]]
- [[_COMMUNITY_README|README]]

## God Nodes (most connected - your core abstractions)
1. `CharacterCreatePage` - 11 edges
2. `CharacterDraft interface` - 11 edges
3. `App (HashRouter + Routes)` - 6 edges
4. `rules.ts (game mechanics functions)` - 6 edges
5. `Character interface` - 6 edges
6. `Vite Logo SVG` - 6 edges
7. `icons.svg (SVG Icon Sprite Sheet)` - 6 edges
8. `ClassId type` - 5 edges
9. `Attributes interface` - 4 edges
10. `Hero Image` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Ordem Paranormal RPG Rulebook v1.3 (text)` --semantically_similar_to--> `Ordem Paranormal RPG v1.3 PDF`  [INFERRED] [semantically similar]
  rulebook.txt → ordem-paranormal-rpg-v1-3.pdf
- `rules.ts (game mechanics functions)` --implements--> `NEX progression system (game concept)`  [INFERRED]
  src/lib/rules.ts → rulebook.txt
- `rules.ts (game mechanics functions)` --implements--> `Ordem Paranormal RPG (game system)`  [INFERRED]
  src/lib/rules.ts → rulebook.txt
- `validateAttributes()` --references--> `Ordem Paranormal RPG (game system)`  [INFERRED]
  src/lib/rules.ts → rulebook.txt
- `Ordem Paranormal RPG v1.3 PDF` --references--> `NEX progression system (game concept)`  [INFERRED]
  ordem-paranormal-rpg-v1-3.pdf → rulebook.txt

## Hyperedges (group relationships)
- **Multi-step character creation flow: wizard page orchestrates step components using shared CharacterDraft** — pages_charactercreatepage, charactercreatepage_characterdraft, create_stepconcept, create_stepattributes, create_steporigin, create_stepclass, create_stepskills, create_stepreview [EXTRACTED 0.95]
- **Rules engine: game mechanics functions operate on core character types to derive stats** — lib_rules_calculatederivedstats, types_character_attributes, types_character_nextier, types_character_derivedstats [EXTRACTED 0.90]
- **SPA routing: App router maps URL paths to page components via HashRouter** — app_router, pages_homepage, pages_charactercreatepage, pages_charactersheetpage, pages_campaignpage [EXTRACTED 0.95]

## Communities

### Community 0 - "Character Creation Wizard"
Cohesion: 0.25
Nodes (16): CharacterDraft interface, Multi-step character creation wizard, StepAttributes component, StepClass component, StepConcept component, StepOrigin component, StepReview component, StepSkills component (+8 more)

### Community 1 - "Social & UI Icons"
Cohesion: 0.33
Nodes (11): Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, Social/User Icon, icons.svg (SVG Icon Sprite Sheet), X (Twitter) Icon, Filled Dark Style (#08060d) (+3 more)

### Community 2 - "RPG Rules Engine"
Cohesion: 0.24
Nodes (5): calculateDerivedStats(), getFreeSkillCount(), getNexIndex(), getPELimit(), StepSkills()

### Community 3 - "App Routing & Backend"
Cohesion: 0.2
Nodes (10): App (HashRouter + Routes), index.html (HTML entry), supabase client (lib/supabase.ts), main.tsx (App entry point), CampaignPage, CharacterSheetPage, HomePage, NotFoundPage (+2 more)

### Community 4 - "Creation Page Logic"
Cohesion: 0.22
Nodes (3): update(), setAttr(), selectClass()

### Community 5 - "Vite Build Assets"
Cohesion: 0.33
Nodes (7): Project Static Assets, Vite Build Tool, Dark Mode Support (prefers-color-scheme), Lightning Bolt / Chevron Shape Icon, Parenthesis Framing Elements, Purple/Violet Gradient Visual Style, Vite Logo SVG

### Community 6 - "Brand Visual Identity"
Cohesion: 0.53
Nodes (6): Brand Identity — Power/Speed/Energy Theme, Cyan Accent Color (#47bfff), Glow / Blur Visual Effect, Lightning Bolt Icon, Purple Color Scheme (#863bff / #7e14ff), Favicon SVG

### Community 7 - "Ordem Paranormal Rulebook"
Cohesion: 0.5
Nodes (5): NEX progression system (game concept), Ordem Paranormal RPG (game system), validateAttributes(), Ordem Paranormal RPG v1.3 PDF, Ordem Paranormal RPG Rulebook v1.3 (text)

### Community 8 - "Hero Image Design"
Cohesion: 0.6
Nodes (5): Hero Image, Isometric Layered Blocks, Minimalist Illustration Style, Purple/Violet Color Accent, Sorting/Ordering Visual Metaphor

### Community 9 - "React Framework Assets"
Cohesion: 0.5
Nodes (5): Atomic/Orbital Symbol Visual Motif, Iconify Logos Icon Set, React Brand Color #00D8FF (Cyan), React JavaScript Framework, React Logo SVG Icon

### Community 10 - "App Entry Point"
Cohesion: 0.67
Nodes (0): 

### Community 11 - "Derived Stats Calculation"
Cohesion: 0.67
Nodes (1): calculateDerivedStats()

### Community 12 - "Vite Config"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "ESLint Config"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Campaign Page"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Home Page"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Not Found Page"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Character Sheet Page"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Supabase Client"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Character Types"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Step Origin"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Step Concept"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Step Review"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Vite Config AST"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "ESLint Config AST"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Skill Bonus Rule"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Character Type AST"
Cohesion: 1.0
Nodes (1): character.ts (type definitions)

### Community 27 - "README"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **12 isolated node(s):** `HomePage`, `NotFoundPage`, `character.ts (type definitions)`, `InventoryItem interface`, `index.html (HTML entry)` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Vite Config`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ESLint Config`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Campaign Page`** (1 nodes): `CampaignPage.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Home Page`** (1 nodes): `HomePage.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Not Found Page`** (1 nodes): `NotFoundPage.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Character Sheet Page`** (1 nodes): `CharacterSheetPage.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Supabase Client`** (1 nodes): `supabase.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Character Types`** (1 nodes): `character.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Step Origin`** (1 nodes): `StepOrigin.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Step Concept`** (1 nodes): `StepConcept.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Step Review`** (1 nodes): `StepReview.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vite Config AST`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ESLint Config AST`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Skill Bonus Rule`** (1 nodes): `getSkillBonus()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Character Type AST`** (1 nodes): `character.ts (type definitions)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `README`** (1 nodes): `README.md`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CharacterCreatePage` connect `Character Creation Wizard` to `Derived Stats Calculation`, `App Routing & Backend`, `Ordem Paranormal Rulebook`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `App (HashRouter + Routes)` connect `App Routing & Backend` to `Character Creation Wizard`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `rules.ts (game mechanics functions)` (e.g. with `NEX progression system (game concept)` and `Ordem Paranormal RPG (game system)`) actually correct?**
  _`rules.ts (game mechanics functions)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `Character interface` (e.g. with `CharacterDraft interface` and `CharacterSheetPage`) actually correct?**
  _`Character interface` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `HomePage`, `NotFoundPage`, `character.ts (type definitions)` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._