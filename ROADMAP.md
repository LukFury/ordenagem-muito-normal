# Ordenagem Muito Normal — Roadmap

**Stack:** React + TypeScript + Vite + Supabase + Tailwind CSS + shadcn/ui

## Vision

A D&D Beyond-style companion app for Ordem Paranormal RPG. Players create characters, access their sheet during sessions, and join a shared party space with a document canvas.

**Philosophy:** App handles math and tracking, not rules enforcement. Players/GM still make rulings — the app just does the addition, tracks resources, and shows everything clearly.

---

## Phase 1 — Character

- [x] Character creation wizard (6 steps: Conceito, Atributos, Origem, Classe, Perícias, Revisar)
- [x] Save character to Supabase
- [x] Character sheet with all skill checks separated by attribute
  - Roll formula auto-calculated from attributes + training grade
  - Clickable checks (shows dice formula + result via 3D dice modal)
- [x] Resources tracked: PV, PE, Sanidade — click up/down during session
- [x] Personal inventory (64 items, spaces tracker, item detail modal, armor auto-applies to defense)
- [ ] Character photo upload (Supabase Storage)

## Phase 2 — Party System

- [x] Auth + player accounts (Supabase Auth)
- [ ] Create/join a party via code or link
- [ ] Party realtime sync (Supabase Realtime)
- [ ] Shared party inventory — visible and editable by all members in real time

## Phase 3 — Document Canvas

- [ ] Party canvas — pin documents (PDFs, images) everyone can see
- [ ] Pan, zoom, drag documents on the canvas
- [ ] Drag items from personal inventory into party inventory
- [ ] Drag documents from party canvas into personal inventory

---

## Key Decisions

- **No hard-coded rules enforcement** — the app tracks and calculates, it doesn't police table rulings
- **Supabase** for auth, database, realtime sync, and file storage
- **dnd-kit** for drag-and-drop interactions
- **react-konva** or **@use-gesture** for the document canvas
