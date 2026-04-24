import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { calculateDerivedStats, getSkillBonus, NEX_ORDER_EXPORTED } from '@/lib/rules'
import type { Attributes, ClassId, NexTier, TrainingGrade, DerivedStats } from '@/types/character'
import skillsData from '@/data/skills.json'
import originsData from '@/data/origins.json'
import classesData from '@/data/classes.json'
import powersData from '@/data/powers.json'
import ritualsData from '@/data/rituals.json'
import conditionsData from '@/data/conditions.json'
import { cn } from '@/lib/utils'
import { useDiceRoller } from '@/hooks/useDiceRoller'
import DiceRollModal from '@/components/DiceRollModal'
import AddItemModal, { type FlatItem } from '@/components/inventory/AddItemModal'
import ItemDetailModal from '@/components/inventory/ItemDetailModal'
import LevelUpModal, { type LevelUpChanges } from '@/components/LevelUpModal'

interface Skill { id: string; name: string; attribute: string; trainedOnly: boolean }
interface SkillTraining { skillId: string; grade: TrainingGrade }

export interface InventoryItem {
  id: string
  item_id: string
  item_type: string
  item_subtype: string
  name: string
  quantity: number
  spaces: number
  notes: string
  item_data: Record<string, unknown>
}

interface Character {
  id: string
  name: string
  concept: string
  origin_id: string
  class_id: ClassId
  trail_id: string
  nex: NexTier
  attributes: Attributes
  skill_training: SkillTraining[]
  known_rituals: string[]
  selected_powers: string[]
  photo_url: string | null
  notes: string
}

const ATTR_LABELS: Record<string, string> = {
  agilidade: 'Agilidade',
  forca: 'Força',
  intelecto: 'Intelecto',
  presenca: 'Presença',
  vigor: 'Vigor',
}

const TRAINING_LABELS: Record<TrainingGrade, string> = {
  destreinado: 'Sem treino',
  treinado: 'Treinado',
  veterano: 'Veterano',
  expert: 'Expert',
}

function gradeToFill(grade: TrainingGrade): number {
  return { destreinado: 0, treinado: 2, veterano: 3, expert: 4 }[grade]
}

function gradeColor(grade: TrainingGrade): string {
  if (grade === 'expert' || grade === 'veterano') return 'bg-tertiary'
  if (grade === 'treinado') return 'bg-secondary'
  return 'bg-surface-container-highest'
}

const ATTR_ORDER = ['agilidade', 'forca', 'intelecto', 'presenca', 'vigor']

export default function CharacterSheetPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [derived, setDerived] = useState<DerivedStats | null>(null)

  // Resource tracking (session state)
  const [currentHp, setCurrentHp] = useState(0)
  const [currentPe, setCurrentPe] = useState(0)
  const [currentSan, setCurrentSan] = useState(0)

  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [levelUpNex, setLevelUpNex] = useState<NexTier | null>(null)
  const [activeConditions, setActiveConditions] = useState<Set<string>>(new Set())

  const [inventoryTab, setInventoryTab] = useState<'pessoal' | 'partido'>('pessoal')
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [showAddItem, setShowAddItem] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const { isOpen: diceOpen, pending: dicePending, result: diceResult, roll, onRollComplete, close: closeDice } = useDiceRoller()

  useEffect(() => {
    if (!id) return
    Promise.all([
      supabase.from('characters').select('*').eq('id', id).single(),
      supabase.from('inventory_items').select('*').eq('character_id', id).order('created_at'),
    ]).then(([{ data, error }, { data: inv }]) => {
      if (error || !data) { navigate('/'); return }
      setCharacter(data as Character)
      setInventory((inv ?? []) as InventoryItem[])
      const stats = calculateDerivedStats(data.class_id, data.attributes, data.nex)
      setDerived(stats)
      setCurrentHp(stats.hp)
      setCurrentPe(stats.pe)
      setCurrentSan(stats.san)
      setLoading(false)
    })
  }, [id, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-[10px] font-mono text-secondary/50 uppercase tracking-widest animate-pulse">
          A carregar dossiê...
        </div>
      </div>
    )
  }

  if (!character || !derived) return null

  const skills = skillsData as Skill[]
  const trainingMap = new Map(character.skill_training.map(s => [s.skillId, s.grade]))

  const skillsByAttr = ATTR_ORDER.map(attr => ({
    attr,
    label: ATTR_LABELS[attr],
    attrValue: character.attributes[attr as keyof Attributes],
    skills: skills.filter(s => s.attribute === attr),
  }))

  function rollSkill(skillName: string, attrKey: string, attrValue: number, grade: TrainingGrade) {
    const bonus = getSkillBonus(grade)
    roll({
      label: skillName,
      notation: '1d20',
      modifier: attrValue + bonus,
      modifierBreakdown: [
        { label: ATTR_LABELS[attrKey], value: attrValue },
        ...(bonus > 0 ? [{ label: 'Treino', value: bonus }] : []),
      ],
    })
  }

  async function handleAddItem(item: FlatItem, quantity: number) {
    const { data, error } = await supabase.from('inventory_items').insert({
      character_id: id,
      item_id: item.id,
      item_type: item.itemType,
      item_subtype: item.itemSubtype,
      name: item.name,
      quantity,
      spaces: item.spaces,
      notes: item.notes ?? '',
      item_data: item.itemData,
    }).select().single()
    if (!error && data) setInventory(prev => [...prev, data as InventoryItem])
  }

  function handleNexUp() {
    if (!character) return
    const currentIndex = NEX_ORDER_EXPORTED.indexOf(character.nex)
    if (currentIndex === -1 || currentIndex >= NEX_ORDER_EXPORTED.length - 1) return
    setLevelUpNex(NEX_ORDER_EXPORTED[currentIndex + 1])
  }

  async function handleLevelUpConfirm(changes: LevelUpChanges) {
    if (!character || !id || !levelUpNex) return
    const nextNex = levelUpNex

    const newAttributes = changes.newAttributes ?? character.attributes
    const newSkillTraining = changes.upgradedTraining ?? character.skill_training
    const newPowers = changes.addedPowers?.length
      ? [...character.selected_powers, ...changes.addedPowers]
      : character.selected_powers
    const newRituals = changes.addedRituals?.length
      ? [...character.known_rituals, ...changes.addedRituals]
      : character.known_rituals

    const oldDerived = calculateDerivedStats(character.class_id, character.attributes, character.nex)
    const newDerived = calculateDerivedStats(character.class_id, newAttributes, nextNex)

    await supabase.from('characters').update({
      nex: nextNex,
      attributes: newAttributes,
      skill_training: newSkillTraining,
      selected_powers: newPowers,
      known_rituals: newRituals,
    }).eq('id', id)

    setCharacter(prev => prev ? {
      ...prev,
      nex: nextNex,
      attributes: newAttributes,
      skill_training: newSkillTraining,
      selected_powers: newPowers,
      known_rituals: newRituals,
    } : prev)
    setDerived(newDerived)
    setCurrentHp(h => h + (newDerived.hp - oldDerived.hp))
    setCurrentPe(p => p + (newDerived.pe - oldDerived.pe))
    setCurrentSan(s => s + (newDerived.san - oldDerived.san))
    setLevelUpNex(null)
  }

  async function handlePhotoUpload(file: File) {
    if (!user || !id) return
    setUploadingPhoto(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/${id}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('character-photos')
      .upload(path, file, { upsert: true })
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('character-photos').getPublicUrl(path)
      await supabase.from('characters').update({ photo_url: publicUrl }).eq('id', id)
      setCharacter(prev => prev ? { ...prev, photo_url: publicUrl } : prev)
    }
    setUploadingPhoto(false)
  }

  async function handleRemoveItem(itemId: string) {
    await supabase.from('inventory_items').delete().eq('id', itemId)
    setInventory(prev => prev.filter(i => i.id !== itemId))
  }

  const totalSpaces = inventory.reduce((sum, i) => sum + (i.spaces * i.quantity), 0)
  const MAX_SPACES = 30
  const armorBonus = inventory
    .filter(i => i.item_type === 'armor')
    .reduce((sum, i) => sum + (Number((i.item_data as Record<string, unknown>).defenseBonus) || 0), 0)
  const effectiveDefense = derived.defense + armorBonus

  const hpPct = Math.max(0, Math.min(100, (currentHp / derived.hp) * 100))
  const pePct = Math.max(0, Math.min(100, (currentPe / derived.pe) * 100))
  const sanPct = Math.max(0, Math.min(100, (currentSan / derived.san) * 100))

  // Fix 3: Origin power lookup
  const originData = (originsData as { id: string; name: string; power: { name: string; description: string } }[])
    .find(o => o.id === character.origin_id)

  // Fix 4: Power & ritual name/description lookup maps
  type PowerInfo = { id: string; name: string; description: string }
  const powerLookup = new Map<string, PowerInfo>()
  for (const cls of classesData as { id: string; classPowers?: PowerInfo[] }[]) {
    for (const p of cls.classPowers ?? []) powerLookup.set(p.id, p)
    // trail-first-X entries
    for (const trail of (cls as { trails?: { id: string; name: string; abilities: Record<string, PowerInfo> }[] }).trails ?? []) {
      const first = trail.abilities['10%']
      if (first) powerLookup.set(`trail-first-${trail.id}`, { id: `trail-first-${trail.id}`, name: `[Trilha ${trail.name}] ${first.name}`, description: first.description })
    }
  }
  const pd = powersData as Record<string, unknown>
  for (const key of ['ocultistaPowers', 'general', 'conhecimento', 'energia', 'morte', 'sangue']) {
    for (const p of (pd[key] as (PowerInfo & { id: string })[] | undefined) ?? []) powerLookup.set(p.id, p)
  }

  type RitualInfo = { name: string; summary: string; element: string; circle: number }
  const ritualLookup = new Map<string, RitualInfo>()
  const catalog = (ritualsData as { catalog: Record<string, Record<string, { id: string; name: string; summary: string }[]>> }).catalog
  for (const [circle, elements] of Object.entries(catalog)) {
    for (const [element, rituals] of Object.entries(elements)) {
      for (const r of rituals) ritualLookup.set(r.id, { name: r.name, summary: r.summary, element, circle: parseInt(circle) })
    }
  }

  // Fix 1: Conditions list
  const allConditions = (conditionsData as { conditions: { id: string; name: string; category: string; description: string }[] }).conditions

  return (
    <div className="min-h-screen bg-background text-on-surface overflow-x-hidden">
      {/* Scanline overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          background: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.08) 50%), linear-gradient(90deg, rgba(255,0,0,0.015), rgba(0,255,0,0.008), rgba(0,0,255,0.015))',
          backgroundSize: '100% 3px, 3px 100%',
        }}
      />

      {/* Header */}
      <header className="bg-background text-primary-container flex justify-between items-center w-full px-6 py-3 sticky top-0 border-b border-outline-variant/10" style={{ zIndex: 500 }}>
        <div className="flex items-center gap-4">
          <Link to="/">
            <span className="text-2xl font-headline font-bold italic text-primary-container tracking-tighter uppercase cursor-crosshair">
              ORDEM PARANORMAL
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 ml-8">
            <Link to="/" className="text-on-surface/60 hover:text-on-surface transition-opacity uppercase text-[10px] tracking-[0.1em] font-bold">DOSSIÊS</Link>
            <span className="text-secondary border-b-2 border-secondary pb-1 font-bold tracking-widest uppercase text-[10px]">FICHA</span>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button className="hover:bg-surface-container-high hover:text-secondary transition-all p-1 cursor-crosshair">
            <span className="material-symbols-outlined text-on-surface/50">settings</span>
          </button>
          <button className="hover:bg-surface-container-high hover:text-secondary transition-all p-1 cursor-crosshair">
            <span className="material-symbols-outlined text-on-surface/50">security</span>
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── LEFT PANEL: IDENTIDADE + VITAIS ── */}
        <aside className="lg:col-span-3 space-y-4">
          {/* Portrait */}
          <div className="bg-surface-container-lowest p-1">
            <div
              className="aspect-[3/4] bg-surface-container relative overflow-hidden group cursor-crosshair"
              onClick={() => photoInputRef.current?.click()}
            >
              {character.photo_url ? (
                <img
                  src={character.photo_url}
                  alt="Retrato do agente"
                  className="w-full h-full object-cover transition-all duration-500"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-surface-container-low">
                  <span className="material-symbols-outlined text-5xl text-on-surface/20">person</span>
                  <span className="text-[9px] font-mono text-on-surface/20 uppercase tracking-widest">Sem fotografia</span>
                </div>
              )}
              <div className="absolute inset-0 border-2 border-primary-container opacity-20 pointer-events-none" />
              {/* Upload overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 pointer-events-none">
                {uploadingPhoto ? (
                  <span className="text-[10px] font-mono text-white uppercase tracking-widest animate-pulse">A carregar...</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-white text-2xl">upload</span>
                    <span className="text-[9px] font-mono text-white uppercase tracking-widest">Alterar foto</span>
                  </>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-primary-container/80 backdrop-blur-sm p-2">
                <p className="text-[10px] font-mono tracking-tighter text-white uppercase leading-none">
                  Estado: Operacional
                </p>
              </div>
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f) }}
            />
          </div>

          {/* Identity */}
          <div className="bg-surface-container-low p-4 space-y-4">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-secondary">Nome do Agente</label>
              <h2 className="font-headline text-3xl italic font-bold">{character.name || 'Sem nome'}</h2>
            </div>
            {character.concept && (
              <p className="text-xs text-on-surface-variant italic leading-relaxed">{character.concept}</p>
            )}
            {/* Fix 3: Origin power */}
            {originData?.power && (
              <div className="bg-surface-container p-3 border-l-2 border-secondary/30">
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-secondary mb-1">Poder de Origem</p>
                <p className="text-[10px] font-bold text-on-surface uppercase tracking-wide mb-1">{originData.power.name}</p>
                <p className="text-[10px] text-on-surface-variant leading-relaxed">{originData.power.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-outline mb-1">NEX</label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-tertiary">{character.nex}</span>
                  {character.nex !== '99%' && (
                    <button
                      onClick={handleNexUp}
                      title="Subir NEX"
                      className="bg-primary-container text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 hover:bg-on-primary-fixed-variant transition-colors cursor-crosshair"
                    >
                      + NEX
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-outline">Origem</label>
                <p className="font-mono text-sm uppercase">{character.origin_id || '—'}</p>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-outline">Classe</label>
                <p className="font-mono text-sm uppercase">{character.class_id || '—'}</p>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] text-outline">Trilha</label>
                <p className="font-mono text-sm uppercase">{character.trail_id || '—'}</p>
              </div>
            </div>
          </div>

          {/* Derived stats */}
          <div className="bg-surface-container-low p-4 grid grid-cols-2 gap-3">
            {[
              { label: armorBonus > 0 ? `Defesa (+${armorBonus} armadura)` : 'Defesa', value: effectiveDefense },
              { label: 'Lim. PE/turno', value: derived.nexPELimit },
            ].map(s => (
              <div key={s.label}>
                <label className="block text-[9px] uppercase tracking-widest text-outline mb-1">{s.label}</label>
                <span className="font-mono text-xl font-bold text-on-surface">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Vitais */}
          <div className="bg-surface-container-high p-4 space-y-5">
            {/* PV */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Pontos de Vida</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentHp(h => Math.max(0, h - 1))} className="w-6 h-6 bg-surface-container text-on-surface/60 hover:text-on-surface text-sm font-mono cursor-crosshair">−</button>
                  <span className="font-mono text-lg text-primary min-w-[64px] text-center">{currentHp}/{derived.hp}</span>
                  <button onClick={() => setCurrentHp(h => Math.min(derived.hp, h + 1))} className="w-6 h-6 bg-surface-container text-on-surface/60 hover:text-on-surface text-sm font-mono cursor-crosshair">+</button>
                </div>
              </div>
              <div className="h-3 bg-surface-container-lowest overflow-hidden">
                <div
                  className="h-full bg-primary-container transition-all duration-300 relative"
                  style={{ width: `${hpPct}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/20" />
                </div>
              </div>
            </div>

            {/* Sanidade */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-secondary">Sanidade</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentSan(s => Math.max(0, s - 1))} className="w-6 h-6 bg-surface-container text-on-surface/60 hover:text-on-surface text-sm font-mono cursor-crosshair">−</button>
                  <span className="font-mono text-lg text-secondary min-w-[64px] text-center">{currentSan}/{derived.san}</span>
                  <button onClick={() => setCurrentSan(s => Math.min(derived.san, s + 1))} className="w-6 h-6 bg-surface-container text-on-surface/60 hover:text-on-surface text-sm font-mono cursor-crosshair">+</button>
                </div>
              </div>
              <div className="h-3 bg-surface-container-lowest overflow-hidden">
                <div
                  className="h-full bg-secondary transition-all duration-300"
                  style={{ width: `${sanPct}%` }}
                />
              </div>
            </div>

            {/* PE */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-tertiary">Pontos de Esforço</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPe(p => Math.max(0, p - 1))} className="w-6 h-6 bg-surface-container text-on-surface/60 hover:text-on-surface text-sm font-mono cursor-crosshair">−</button>
                  <span className="font-mono text-lg text-tertiary min-w-[64px] text-center">{currentPe}/{derived.pe}</span>
                  <button onClick={() => setCurrentPe(p => Math.min(derived.pe, p + 1))} className="w-6 h-6 bg-surface-container text-on-surface/60 hover:text-on-surface text-sm font-mono cursor-crosshair">+</button>
                </div>
              </div>
              <div className="h-3 bg-surface-container-lowest overflow-hidden">
                <div
                  className="h-full bg-tertiary transition-all duration-300"
                  style={{ width: `${pePct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Fix 1: Conditions tracker */}
          <div className="bg-surface-container-low p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[9px] font-mono uppercase tracking-[0.25em] text-outline">Condições</h4>
              {activeConditions.size > 0 && (
                <button
                  onClick={() => setActiveConditions(new Set())}
                  className="text-[9px] font-mono text-primary-container hover:text-on-surface transition-colors cursor-crosshair uppercase tracking-widest"
                >
                  Limpar
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {allConditions.map(cond => {
                const active = activeConditions.has(cond.id)
                return (
                  <button
                    key={cond.id}
                    title={cond.description}
                    onClick={() => setActiveConditions(prev => {
                      const next = new Set(prev)
                      next.has(cond.id) ? next.delete(cond.id) : next.add(cond.id)
                      return next
                    })}
                    className={cn(
                      'px-2 py-1 text-[9px] font-mono uppercase tracking-widest transition-all cursor-crosshair',
                      active
                        ? 'bg-primary-container text-white'
                        : 'bg-surface-container text-on-surface/40 hover:text-on-surface/70'
                    )}
                  >
                    {cond.name}
                  </button>
                )
              })}
            </div>
            {activeConditions.size > 0 && (
              <div className="mt-3 space-y-1">
                {allConditions.filter(c => activeConditions.has(c.id)).map(cond => (
                  <p key={cond.id} className="text-[9px] text-on-surface-variant leading-relaxed">
                    <span className="text-primary-container font-bold uppercase">{cond.name}:</span> {cond.description}
                  </p>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* ── CENTER PANEL: PERÍCIAS ── */}
        <section className="lg:col-span-6 space-y-4">
          <div className="bg-surface-container-low p-6">
            <div className="flex justify-between items-center mb-8 border-b border-outline-variant/20 pb-4">
              <h3 className="font-headline text-4xl italic text-on-surface">Dossiê de Perícias</h3>
              <div className="flex gap-2">
                <span className="bg-surface-container-highest px-3 py-1 text-[10px] font-mono text-secondary border border-secondary/20">
                  1d20 + ATRIB + BÓNUS
                </span>
              </div>
            </div>

            <div className="space-y-8">
              {skillsByAttr.map(({ attr, label, attrValue, skills: attrSkills }) => (
                <div key={attr}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-outline">{label}</span>
                    <span className="font-mono text-xs text-secondary">{attrValue}</span>
                    <div className="flex-1 h-px bg-outline-variant/15" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5">
                    {attrSkills.map(skill => {
                      const grade = trainingMap.get(skill.id) ?? 'destreinado'
                      const bonus = getSkillBonus(grade)
                      const total = attrValue + bonus
                      const fill = gradeToFill(grade)
                      const color = gradeColor(grade)
                      const isTrained = grade !== 'destreinado'

                      return (
                        <div
                          key={skill.id}
                          className="group cursor-crosshair"
                          title={`${TRAINING_LABELS[grade]} — clica para rolar 1d20+${total}`}
                          onClick={() => rollSkill(skill.name, skill.attribute, attrValue, grade)}
                        >
                          <div className={cn(
                            'flex justify-between items-end border-b pb-1 mb-1.5 transition-colors',
                            isTrained ? 'border-secondary/30 group-hover:border-secondary' : 'border-outline-variant/20 group-hover:border-outline-variant/50'
                          )}>
                            <span className={cn(
                              'text-[10px] uppercase tracking-wider transition-colors',
                              isTrained ? 'text-on-surface group-hover:text-secondary' : 'text-outline/60 group-hover:text-outline'
                            )}>
                              {skill.name}
                              {skill.trainedOnly && !isTrained && (
                                <span className="ml-1 text-primary-container opacity-60">*</span>
                              )}
                            </span>
                            <span className={cn(
                              'font-mono text-base font-bold',
                              grade === 'expert' || grade === 'veterano' ? 'text-tertiary' :
                              isTrained ? 'text-secondary' : 'text-on-surface/40'
                            )}>
                              +{total.toString().padStart(2, '0')}
                            </span>
                          </div>
                          <div className="flex gap-0.5">
                            {[0,1,2,3].map(i => (
                              <div
                                key={i}
                                className={cn('h-0.5 flex-1', i < fill ? color : 'bg-surface-container-highest')}
                              />
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 bg-surface-container-lowest p-4 relative border-l-4 border-primary-container">
              <span className="absolute -top-3 left-4 bg-primary-container text-[8px] px-2 font-bold tracking-widest uppercase text-white">
                Aviso: Instabilidade Paranormal
              </span>
              <p className="font-headline italic text-sm text-on-surface-variant leading-relaxed">
                "O sujeito exibe sensibilidade elevada ao Outro Lado. Exposição prolongada a artefactos ocultistas pode ter alterado permanentemente a perceção da realidade. Recomenda-se avaliação psicológica pós-missão."
              </p>
              <div className="mt-4 flex justify-between items-center opacity-40">
                <span className="font-mono text-[10px] tracking-tighter uppercase">ARQUIVO_ID: VER-{character.id.slice(0, 6).toUpperCase()}</span>
                <span className="font-mono text-[10px] tracking-tighter uppercase">PROTOCOLO: EXORCISMO DIGITAL</span>
              </div>
            </div>
          </div>

          {/* Atributos brutos */}
          <div className="bg-surface-container-low p-6">
            <h4 className="text-[10px] uppercase tracking-widest text-outline mb-4">Atributos Base</h4>
            <div className="grid grid-cols-5 gap-2">
              {ATTR_ORDER.map(attr => (
                <div key={attr} className="bg-surface-container-highest p-3 text-center">
                  <p className="text-[8px] uppercase tracking-widest text-outline mb-1">{ATTR_LABELS[attr].slice(0, 4)}</p>
                  <p className="font-mono text-2xl font-bold text-on-surface">
                    {character.attributes[attr as keyof Attributes]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── RIGHT PANEL: INVENTÁRIO ── */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-surface-container-high flex flex-col">
            {/* Tabs */}
            <div className="flex">
              {(['pessoal', 'partido'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setInventoryTab(t)}
                  className={cn(
                    'flex-1 py-3 text-[10px] font-bold tracking-widest uppercase transition-colors cursor-crosshair',
                    inventoryTab === t
                      ? 'bg-surface-container-highest border-b-2 border-secondary text-secondary'
                      : 'text-outline bg-surface-container-low hover:bg-surface-container hover:text-on-surface'
                  )}
                >
                  {t === 'pessoal' ? 'Dossiê Pessoal' : 'Arquivo do Grupo'}
                </button>
              ))}
            </div>

            <div className="p-5 flex-1 space-y-4">
              {inventoryTab === 'pessoal' ? (
                <>
                  {/* Spaces tracker */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-on-surface/40 uppercase tracking-widest">Espaços Usados</span>
                      <span className={cn(
                        'font-mono text-sm font-bold',
                        totalSpaces > MAX_SPACES ? 'text-primary-container' : totalSpaces > MAX_SPACES * 0.8 ? 'text-tertiary' : 'text-secondary'
                      )}>
                        {totalSpaces}/{MAX_SPACES}
                      </span>
                    </div>
                    <div className="h-1.5 bg-surface-container-lowest">
                      <div
                        className={cn(
                          'h-full transition-all',
                          totalSpaces > MAX_SPACES ? 'bg-primary-container' : totalSpaces > MAX_SPACES * 0.8 ? 'bg-tertiary' : 'bg-secondary'
                        )}
                        style={{ width: `${Math.min(100, (totalSpaces / MAX_SPACES) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-1 max-h-[420px] overflow-y-auto">
                    {inventory.length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-[10px] font-mono text-on-surface/20 uppercase tracking-widest">Inventário vazio</p>
                      </div>
                    ) : (
                      inventory.map(item => {
                        const isWeapon = item.item_type === 'weapon'
                        const data = item.item_data as Record<string, unknown>
                        return (
                          <div
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className={cn(
                              'bg-surface-container-lowest p-3 border-l-2 group cursor-crosshair',
                              isWeapon ? 'border-primary-container/40 hover:border-primary-container' :
                              item.item_type === 'armor' ? 'border-secondary/30 hover:border-secondary' :
                              item.item_type === 'ammo' ? 'border-tertiary/30 hover:border-tertiary' :
                              'border-outline-variant/20 hover:border-outline-variant'
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-on-surface uppercase tracking-wide truncate">
                                  {item.quantity > 1 && <span className="text-secondary mr-1">{item.quantity}×</span>}
                                  {item.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {isWeapon && data.damage != null && (
                                    <span className="text-[10px] font-mono text-tertiary">{String(data.damage)}</span>
                                  )}
                                  {isWeapon && data.range != null && (
                                    <span className="text-[10px] font-mono text-on-surface/30 uppercase">{String(data.range)}</span>
                                  )}
                                  <span className="text-[9px] font-mono text-on-surface/25">
                                    {item.spaces * item.quantity} esp.
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-on-surface/30 hover:text-primary-container cursor-crosshair shrink-0"
                              >
                                <span className="material-symbols-outlined text-sm">remove_circle</span>
                              </button>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Fix 4: Powers & Rituals with full details */}
                  {character.selected_powers.length > 0 && (
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest text-secondary mb-2">Poderes</h4>
                      <div className="space-y-1">
                        {character.selected_powers.map(pid => {
                          const info = powerLookup.get(pid)
                          return (
                            <details key={pid} className="bg-surface-container-lowest border-l-2 border-secondary/30 group">
                              <summary className="p-2 cursor-crosshair list-none flex justify-between items-center">
                                <span className="text-[10px] font-bold text-on-surface uppercase tracking-wide">
                                  {info?.name ?? pid}
                                </span>
                                <span className="material-symbols-outlined text-sm text-outline group-open:rotate-180 transition-transform">expand_more</span>
                              </summary>
                              {info?.description && (
                                <p className="px-2 pb-2 text-[10px] text-on-surface-variant leading-relaxed">{info.description}</p>
                              )}
                            </details>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {character.known_rituals.length > 0 && (
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest text-tertiary mb-2">Rituais</h4>
                      <div className="space-y-1">
                        {character.known_rituals.map(rid => {
                          const info = ritualLookup.get(rid)
                          return (
                            <details key={rid} className="bg-surface-container-lowest border-l-2 border-tertiary/30 group">
                              <summary className="p-2 cursor-crosshair list-none flex justify-between items-center">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-[10px] font-bold text-on-surface uppercase tracking-wide truncate">
                                    {info?.name ?? rid}
                                  </span>
                                  {info && (
                                    <span className="text-[9px] font-mono text-tertiary shrink-0">{info.circle}º · {info.element}</span>
                                  )}
                                </div>
                                <span className="material-symbols-outlined text-sm text-outline group-open:rotate-180 transition-transform shrink-0">expand_more</span>
                              </summary>
                              {info?.summary && (
                                <p className="px-2 pb-2 text-[10px] text-on-surface-variant leading-relaxed">{info.summary}</p>
                              )}
                            </details>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <span className="material-symbols-outlined text-3xl text-on-surface/20">group</span>
                  <p className="text-[10px] font-mono text-on-surface/30 uppercase tracking-widest text-center">Arquivo do grupo em breve</p>
                  <p className="text-[9px] text-on-surface/20 text-center">Entra numa campanha para aceder ao inventário partilhado</p>
                </div>
              )}

              <button
                onClick={() => setShowAddItem(true)}
                className="w-full bg-primary-container text-white py-3 font-bold uppercase tracking-[0.2em] text-xs hover:bg-on-primary-fixed-variant transition-all cursor-crosshair flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Adicionar Item
              </button>
            </div>
          </div>

          {/* Notas */}
          {character.notes && (
            <div className="bg-surface-container-low p-4 border-l-4 border-outline-variant/30">
              <h4 className="text-[9px] font-mono uppercase tracking-widest text-outline mb-2">Notas de Campo</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed italic">{character.notes}</p>
            </div>
          )}
        </aside>
      </main>

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          attributes={character.attributes}
          onRoll={(label, notation, modifier, breakdown) => {
            setSelectedItem(null)
            roll({ label, notation, modifier, modifierBreakdown: breakdown })
          }}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <AddItemModal
          onAdd={(item, qty) => { handleAddItem(item, qty) }}
          onClose={() => setShowAddItem(false)}
        />
      )}

      {/* Level Up Modal */}
      {levelUpNex && character && (
        <LevelUpModal
          character={character}
          newNex={levelUpNex}
          onConfirm={handleLevelUpConfirm}
          onClose={() => setLevelUpNex(null)}
        />
      )}

      {/* Dice Roll Modal */}
      <DiceRollModal
        isOpen={diceOpen}
        pending={dicePending}
        result={diceResult}
        onRollComplete={onRollComplete}
        onClose={closeDice}
      />

      {/* Footer */}
      <footer className="bg-surface-container-lowest flex flex-col md:flex-row justify-between items-center px-10 py-8 gap-4 mt-auto border-t border-outline-variant/10">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-primary-container uppercase text-xs">ORDEM PARANORMAL</span>
          <p className="text-[9px] font-mono text-on-surface/30 uppercase tracking-widest">
            C.O.P.E. DADOS CLASSIFICADOS - PROTOCOLO: EXORCISMO DIGITAL
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-secondary animate-pulse" />
          <span className="font-mono text-[10px] text-secondary">CONECTADO // UPLINK C.O.P.E.</span>
        </div>
      </footer>
    </div>
  )
}
