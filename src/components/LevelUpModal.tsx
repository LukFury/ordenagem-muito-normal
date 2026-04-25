import { useState } from 'react'
import type { NexTier, Attributes, TrainingGrade, ClassId } from '@/types/character'
import classesData from '@/data/classes.json'
import powersData from '@/data/powers.json'
import skillsData from '@/data/skills.json'
import ritualsData from '@/data/rituals.json'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────

interface SkillTraining { skillId: string; grade: TrainingGrade }
interface SkillEntry { id: string; name: string; attribute: string; trainedOnly: boolean }

interface CharacterSnapshot {
  class_id: ClassId
  trail_id: string
  nex: NexTier
  attributes: Attributes
  skill_training: SkillTraining[]
  selected_powers: string[]
  known_rituals: string[]
}

export interface LevelUpChanges {
  newAttributes?: Attributes
  upgradedTraining?: SkillTraining[]
  addedPowers?: string[]
  addedRituals?: string[]
  addedClassRituals?: string[]
}

interface Props {
  character: CharacterSnapshot
  newNex: NexTier
  onConfirm: (changes: LevelUpChanges) => void
  onClose: () => void
}

// ── Data helpers ───────────────────────────────────────────────────────────────

type ClassData = typeof classesData[number]
type PowerEntry = { id: string; name: string; description: string; element?: string; prerequisites?: string[]; canChooseMultipleTimes?: boolean }
type RitualEntry = { id: string; name: string; summary: string; element: string }

const GRADE_ORDER: TrainingGrade[] = ['destreinado', 'treinado', 'veterano', 'expert']
const GRADE_LABELS: Record<TrainingGrade, string> = { destreinado: 'Sem treino', treinado: 'Treinado', veterano: 'Veterano', expert: 'Expert' }
const ATTR_LABELS: Record<string, string> = { agilidade: 'Agilidade', forca: 'Força', intelecto: 'Intelecto', presenca: 'Presença', vigor: 'Vigor' }
const ATTR_ORDER = ['agilidade', 'forca', 'intelecto', 'presenca', 'vigor']

function nextGrade(grade: TrainingGrade): TrainingGrade | null {
  const idx = GRADE_ORDER.indexOf(grade)
  return idx < GRADE_ORDER.length - 1 ? GRADE_ORDER[idx + 1] : null
}

function getClassData(classId: string): ClassData | undefined {
  return (classesData as ClassData[]).find(c => c.id === classId)
}

function getTrainingCount(cls: ClassData, intelecto: number): number {
  const raw = ((cls.coreAbilities as unknown) as Record<string, { count?: string }>).grauDeTreinamento?.count ?? '2 + intelecto'
  const base = parseInt(raw.split('+')[0].trim(), 10)
  return base + intelecto
}

function getTrailAbility(cls: ClassData, trailId: string, nex: string) {
  const trail = cls.trails.find(t => t.id === trailId)
  return (trail?.abilities as Record<string, { name: string; description: string }>)?.[nex] ?? null
}

function resolveAutoGrant(ability: string, cls: ClassData): { name: string; description: string } | null {
  const ca = cls.coreAbilities as Record<string, unknown>

  if (ability.startsWith('ataque-especial-')) {
    const cost = parseInt(ability.replace('ataque-especial-', '').replace('pe', ''), 10)
    type ScalingEntry = { nex: string; cost: number; bonus: number }
    const scaling = (ca.ataqueEspecial as { scaling: ScalingEntry[] } | undefined)?.scaling ?? []
    const tier = scaling.find(s => s.cost === cost)
    return { name: `Ataque Especial (${cost} PE)`, description: `Gaste ${cost} PE para +${tier?.bonus ?? '?'} no ataque ou na rolagem de dano.` }
  }
  if (ability === 'ecletico') {
    const ec = ca.ecletico as { name: string; description: string } | undefined
    return { name: ec?.name ?? 'Eclético', description: ec?.description ?? '' }
  }
  if (ability.startsWith('perito-')) {
    const parts = ability.split('-')
    const cost = parseInt(parts[1].replace('pe', ''), 10)
    const die = parts[2]
    return { name: `Perito (${cost} PE — ${die})`, description: `Gaste ${cost} PE para adicionar ${die} às perícias escolhidas.` }
  }
  if (ability.startsWith('engenhosidade-')) {
    const grade = ability.split('-')[1]
    return {
      name: `Eclético — ${grade === 'veterano' ? 'Veterano' : 'Expert'}`,
      description: grade === 'veterano'
        ? 'Ao usar Eclético, gaste +2 PE para obter bónus de Veterano.'
        : 'Ao usar Eclético, gaste +4 PE para obter bónus de Expert.',
    }
  }
  return null
}

// Element-count prerequisites (conhecimento_1, sangue_2, etc.) cannot be checked via ID — assume met
function checkPowerPrereq(prereq: string, selectedPowers: string[]): boolean {
  if (/^[a-z]+_\d+$/.test(prereq)) return true
  return selectedPowers.includes(prereq)
}

function buildPowerPool(classId: string, selectedPowers: string[]): PowerEntry[] {
  function passesPrereqs(p: PowerEntry): boolean {
    if (!p.canChooseMultipleTimes && selectedPowers.includes(p.id)) return false
    if (p.prerequisites && p.prerequisites.length > 0) {
      return p.prerequisites.every(prereq => checkPowerPrereq(prereq, selectedPowers))
    }
    return true
  }
  if (classId === 'ocultista') {
    const pd = powersData as Record<string, unknown>
    const all: PowerEntry[] = [
      ...((pd.ocultistaPowers as PowerEntry[]) ?? []),
      ...((pd.general as PowerEntry[]) ?? []),
      ...((pd.conhecimento as PowerEntry[]) ?? []),
      ...((pd.energia as PowerEntry[]) ?? []),
      ...((pd.morte as PowerEntry[]) ?? []),
      ...((pd.sangue as PowerEntry[]) ?? []),
    ]
    return all.filter(passesPrereqs)
  }
  const cls = getClassData(classId)
  const pool = ((cls as unknown as Record<string, PowerEntry[]>)?.classPowers) ?? []
  return pool.filter(passesPrereqs)
}

function getAccessibleCircles(nex: string): number[] {
  const n = parseInt(nex.replace('%', ''))
  if (n >= 85) return [1, 2, 3, 4]
  if (n >= 55) return [1, 2, 3]
  if (n >= 25) return [1, 2]
  return [1]
}

// Trail abilities that auto-grant rituals on level-up
const TRAIL_RITUAL_GRANTS: Record<string, Record<string, string[]>> = {
  'conduíte': { '99%': ['canalizar-o-medo'] },
  'flagelador': { '99%': ['medo-tangivel'] },
  'graduado': { '99%': ['conhecendo-o-medo'] },
  'intuitivo': { '99%': ['presenca-do-medo'] },
  'lamina-paranormal': { '10%': ['amaldicoar-arma-1-sang'], '99%': ['lamina-do-medo'] },
}

// Versatilidade pool: own class powers + first trail ability of other trails
function buildVersatilidadePool(cls: ClassData, trailId: string, selectedPowers: string[]): PowerEntry[] {
  const classPools = buildPowerPool(cls.id, selectedPowers)
  const otherTrailFirstPowers: PowerEntry[] = cls.trails
    .filter(t => t.id !== trailId)
    .flatMap(t => {
      const ability = (t.abilities as Record<string, { name: string; description: string }>)['10%']
      if (!ability) return []
      const entry: PowerEntry = { id: `trail-first-${t.id}`, name: `[Trilha ${t.name}] ${ability.name}`, description: ability.description }
      return selectedPowers.includes(entry.id) ? [] : [entry]
    })
  return [...classPools, ...otherTrailFirstPowers]
}

const ELEMENT_LABELS: Record<string, string> = {
  conhecimento: 'Conhecimento',
  energia: 'Energia',
  morte: 'Morte',
  sangue: 'Sangue',
}
const ELEMENT_IDS = ['conhecimento', 'energia', 'morte', 'sangue'] as const

function buildExpansaoPool(currentClassId: string, selectedPowers: string[]): (PowerEntry & { className: string })[] {
  return (['combatente', 'especialista', 'ocultista'] as const)
    .filter(id => id !== currentClassId)
    .flatMap(id => {
      const cls = getClassData(id)
      const powers = ((cls as unknown as Record<string, PowerEntry[]>)?.classPowers) ?? []
      return powers
        .filter(p => !selectedPowers.includes(p.id))
        .map(p => ({ ...p, className: id }))
    })
}

function getRitualsForCircle(circle: number, knownRituals: string[]): RitualEntry[] {
  const catalog = (ritualsData as Record<string, unknown>).catalog as Record<string, Record<string, RitualEntry[]>>
  const circleData = catalog[String(circle)]
  if (!circleData) return []
  const all: RitualEntry[] = []
  for (const [element, rituals] of Object.entries(circleData)) {
    for (const r of rituals) {
      all.push({ ...r, element })
    }
  }
  return all.filter(r => !knownRituals.includes(r.id))
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function LevelUpModal({ character, newNex, onConfirm, onClose }: Props) {
  const cls = getClassData(character.class_id)
  if (!cls) return null

  const tierAbilities: string[] = (cls.progression as { nex: string; abilities: string[] }[])
    .find(p => p.nex === newNex)?.abilities ?? []

  const AUTO_PREFIXES = ['ataque-especial-', 'ecletico', 'perito-', 'engenhosidade-']
  const isAuto = (a: string) => AUTO_PREFIXES.some(p => a.startsWith(p))
  const isTrail = (a: string) => a === 'habilidade-de-trilha'
  const isAttr = (a: string) => a === 'aumento-de-atributo'
  const isTraining = (a: string) => a === 'grau-de-treinamento'
  const isPower = (a: string) => a.startsWith('poder-de-')
  const isRitual = (a: string) => a.startsWith('escolhido-pelo-outro-lado-')
  const isRitualLivre = (a: string) => a === 'escolhido-pelo-outro-lado-livre'
  const isVersatilidade = (a: string) => a === 'versatilidade'

  const autoGrants = tierAbilities.filter(isAuto).map(a => resolveAutoGrant(a, cls)).filter(Boolean) as { name: string; description: string }[]
  const trailAbility = tierAbilities.some(isTrail) ? getTrailAbility(cls, character.trail_id, newNex) : null
  const needsAttr = tierAbilities.some(isAttr)
  const needsTraining = tierAbilities.some(isTraining)
  const powerAbilities = tierAbilities.filter(isPower)
  const ritualAbilities = tierAbilities.filter(isRitual)
  const needsVersatilidade = tierAbilities.some(isVersatilidade)

  // Saber Ampliado (Graduado 10%): extra ritual pick at each circle-unlock tier
  const hasSaberAmpliado = character.trail_id === 'graduado' && parseInt(character.nex.replace('%', '')) >= 10
  const saberAmpliadoCircle = hasSaberAmpliado
    ? ritualAbilities.reduce((acc: number, ra) => {
        const m = ra.match(/(\d+)o-circulo/)
        return m ? parseInt(m[1]) : acc
      }, 0)
    : 0

  // ── Local state ──────────────────────────────────────────────────────────────

  const [chosenAttr, setChosenAttr] = useState<keyof Attributes | null>(null)
  const trainingCount = getTrainingCount(cls, character.attributes.intelecto)
  const [trainingUpgrades, setTrainingUpgrades] = useState<Record<string, TrainingGrade>>({})
  const [chosenPowers, setChosenPowers] = useState<Record<string, string>>({})
  const [chosenRituals, setChosenRituals] = useState<Record<string, string>>({})
  const [chosenSaberAmpliado, setChosenSaberAmpliado] = useState<string>('')
  const [aprenderRitualChoices, setAprenderRitualChoices] = useState<Record<string, string>>({})
  const [resistirElementoChoices, setResistirElementoChoices] = useState<Record<string, string>>({})
  const [expansaoChoices, setExpansaoChoices] = useState<Record<string, string>>({})

  const upgradeCount = Object.keys(trainingUpgrades).length
  const remainingUpgrades = trainingCount - upgradeCount

  const skills = skillsData as SkillEntry[]
  // Fix 5: only show already-trained skills for grau-de-treinamento
  const trainedSkills = skills.filter(s => {
    const grade = character.skill_training.find(t => t.skillId === s.id)?.grade ?? 'destreinado'
    return grade !== 'destreinado'
  })

  function toggleTrainingUpgrade(skillId: string) {
    const currentGrade = character.skill_training.find(s => s.skillId === skillId)?.grade ?? 'destreinado'
    const next = nextGrade(currentGrade)
    if (!next || next === 'destreinado') return
    setTrainingUpgrades(prev => {
      if (skillId in prev) {
        const updated = { ...prev }
        delete updated[skillId]
        return updated
      }
      if (remainingUpgrades <= 0) return prev
      return { ...prev, [skillId]: next }
    })
  }

  function buildChanges(): LevelUpChanges {
    const changes: LevelUpChanges = {}
    if (needsAttr && chosenAttr) {
      changes.newAttributes = { ...character.attributes, [chosenAttr]: character.attributes[chosenAttr] + 1 }
    }
    if (Object.keys(trainingUpgrades).length > 0) {
      const map = new Map(character.skill_training.map(s => [s.skillId, s.grade]))
      for (const [skillId, newGrade] of Object.entries(trainingUpgrades)) map.set(skillId, newGrade)
      changes.upgradedTraining = Array.from(map.entries()).map(([skillId, grade]) => ({ skillId, grade }))
    }
    const powers = Object.entries(chosenPowers)
      .filter(([, pid]) => Boolean(pid))
      .map(([slot, pid]) => {
        if (pid === 'resistir-elemento') {
          const element = resistirElementoChoices[slot]
          return element ? `resistir-elemento-${element}` : pid
        }
        return pid
      })
    const expansaoExtras = Object.values(expansaoChoices).filter(Boolean)
    if (powers.length > 0 || expansaoExtras.length > 0) changes.addedPowers = [...powers, ...expansaoExtras]
    const classRituals = Object.values(chosenRituals).filter(Boolean)
    const powerRituals = Object.values(aprenderRitualChoices).filter(Boolean)
    if (powerRituals.length > 0) changes.addedRituals = powerRituals
    // Saber Ampliado extra ritual (Graduado 10%+) — added as class ritual
    if (saberAmpliadoCircle > 0 && chosenSaberAmpliado) {
      classRituals.push(chosenSaberAmpliado)
    }
    // Auto-grant rituals from trail abilities (99% unlocks, Lâmina Maldita 10%)
    const trailGrants = TRAIL_RITUAL_GRANTS[character.trail_id]?.[newNex] ?? []
    const autoRituals = trailGrants.filter(r => !character.known_rituals.includes(r))
    if (classRituals.length > 0 || autoRituals.length > 0) {
      changes.addedClassRituals = [...classRituals, ...autoRituals]
    }
    return changes
  }

  const aprenderRitualSlots = powerAbilities.filter(pa => chosenPowers[pa] === 'aprender-ritual')
  const resistirSlots = powerAbilities.filter(pa => chosenPowers[pa] === 'resistir-elemento')
  const expansaoSlots = powerAbilities.filter(pa => chosenPowers[pa] === 'expansao-de-conhecimento')

  const nexNumericForModal = parseInt(newNex.replace('%', ''))
  const highNex = nexNumericForModal >= 45

  const attrReady = !needsAttr || chosenAttr !== null
  const powerReady = powerAbilities.every(pa => chosenPowers[pa] !== undefined)
  const aprenderReady = aprenderRitualSlots.every(pa => aprenderRitualChoices[pa] !== undefined)
  const resistirReady = resistirSlots.every(pa => resistirElementoChoices[pa] !== undefined)
  const expansaoReady = expansaoSlots.every(pa => expansaoChoices[pa] !== undefined)
  const ritualReady = ritualAbilities.every(ra => chosenRituals[ra] !== undefined)
  const saberAmpliadoReady = saberAmpliadoCircle === 0 || chosenSaberAmpliado !== ''
  const versatilReady = !needsVersatilidade || chosenPowers['versatilidade'] !== undefined
  const canConfirm = attrReady && powerReady && aprenderReady && resistirReady && expansaoReady && ritualReady && saberAmpliadoReady && versatilReady

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface-container-lowest flex flex-col">

        {/* Header */}
        <div className="bg-primary-container px-6 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/60">Protocolo de Avanço</p>
            <h2 className="font-headline text-2xl italic font-bold text-white">NEX {character.nex} → {newNex}</h2>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors cursor-crosshair">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-8">

          {/* Auto grants + trail */}
          {(() => {
            const trailAutoRituals = (TRAIL_RITUAL_GRANTS[character.trail_id]?.[newNex] ?? [])
              .filter(r => !character.known_rituals.includes(r))
            const catalog = (ritualsData as Record<string, unknown>).catalog as Record<string, Record<string, RitualEntry[]>>
            const ritualName = (id: string) => {
              for (const elements of Object.values(catalog)) {
                for (const rituals of Object.values(elements)) {
                  const r = rituals.find(r => r.id === id)
                  if (r) return r.name
                }
              }
              return id
            }
            const showSection = autoGrants.length > 0 || trailAbility || trailAutoRituals.length > 0
            if (!showSection) return null
            return (
              <section>
                <h3 className="text-[9px] font-mono uppercase tracking-[0.25em] text-outline mb-3">Ganhos Automáticos</h3>
                <div className="space-y-2">
                  {autoGrants.map(g => (
                    <div key={g.name} className="bg-surface-container-high p-4 border-l-2 border-secondary/30">
                      <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">{g.name}</p>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{g.description}</p>
                    </div>
                  ))}
                  {trailAbility && (
                    <div className="bg-surface-container-high p-4 border-l-2 border-tertiary/50">
                      <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-tertiary mb-1">Habilidade de Trilha</p>
                      <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-1">{trailAbility.name}</p>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{trailAbility.description}</p>
                    </div>
                  )}
                  {trailAutoRituals.map(rid => (
                    <div key={rid} className="bg-surface-container-high p-4 border-l-2 border-tertiary/30">
                      <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-tertiary mb-1">Ritual de Trilha Aprendido</p>
                      <p className="text-xs font-bold text-tertiary uppercase tracking-widest">{ritualName(rid)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )
          })()}

          {/* Ritual picker — circle-unlock and livre */}
          {ritualAbilities.map(ra => {
            const libre = isRitualLivre(ra)
            const circleMatch = ra.match(/(\d+)o-circulo/)
            const circle = circleMatch ? parseInt(circleMatch[1]) : 0
            type RitualWithCircle = RitualEntry & { circle?: number }
            const pool: RitualWithCircle[] = libre
              ? getAccessibleCircles(newNex).flatMap(c =>
                  getRitualsForCircle(c, character.known_rituals).map(r => ({ ...r, circle: c }))
                )
              : getRitualsForCircle(circle, character.known_rituals).map(r => ({ ...r, circle }))
            const chosen = chosenRituals[ra]
            const label = libre
              ? `Ritual Aprendido — Livre (círculos ${getAccessibleCircles(newNex).join(', ')})`
              : `Ritual Aprendido — ${circle}º Círculo Desbloqueado`
            const sublabel = libre
              ? 'Escolha um ritual de qualquer círculo acessível'
              : `Escolha um ritual do ${circle}º círculo para aprender`
            return (
              <section key={ra}>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-[9px] font-mono uppercase tracking-[0.25em] text-outline">
                    {label}
                  </h3>
                  <span className="text-[9px] font-mono text-primary-container">obrigatório</span>
                </div>
                <p className="text-[10px] text-on-surface/50 mb-3 uppercase tracking-wide">{sublabel}</p>
                <div className="space-y-1 max-h-56 overflow-y-auto">
                  {pool.map(ritual => {
                    const isChosen = chosen === ritual.id
                    return (
                      <button
                        key={ritual.id}
                        onClick={() => setChosenRituals(prev => ({ ...prev, [ra]: ritual.id }))}
                        className={cn(
                          'w-full text-left p-3 transition-all cursor-crosshair border-l-2',
                          isChosen
                            ? 'bg-surface-container-highest border-tertiary'
                            : 'bg-surface-container-high border-transparent hover:border-outline-variant/40'
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn('text-xs font-bold uppercase tracking-wide', isChosen ? 'text-tertiary' : 'text-on-surface')}>
                            {ritual.name}
                          </p>
                          <div className="flex items-center gap-1 shrink-0">
                            {libre && ritual.circle && (
                              <span className="text-[9px] font-mono text-outline uppercase">{ritual.circle}º</span>
                            )}
                            <span className="text-[9px] font-mono text-outline uppercase">{ritual.element}</span>
                          </div>
                        </div>
                        {isChosen && (
                          <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">{ritual.summary}</p>
                        )}
                      </button>
                    )
                  })}
                </div>
              </section>
            )
          })}

          {/* Saber Ampliado (Graduado 10%+) — extra ritual at circle-unlock tiers */}
          {saberAmpliadoCircle > 0 && (() => {
            const pool = getRitualsForCircle(saberAmpliadoCircle, [...character.known_rituals, ...(chosenRituals[ritualAbilities.find(ra => ra.includes(`${saberAmpliadoCircle}o-circulo`)) ?? ''] ? [chosenRituals[ritualAbilities.find(ra => ra.includes(`${saberAmpliadoCircle}o-circulo`)) ?? '']] : [])])
            return (
              <section>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-[9px] font-mono uppercase tracking-[0.25em] text-outline">
                    Saber Ampliado — Ritual Extra do {saberAmpliadoCircle}º Círculo
                  </h3>
                  <span className="text-[9px] font-mono text-primary-container">obrigatório</span>
                </div>
                <p className="text-[10px] text-on-surface/50 mb-3 uppercase tracking-wide">
                  Trilha Graduado: aprende um ritual extra a cada novo círculo (não conta no limite)
                </p>
                <div className="space-y-1 max-h-56 overflow-y-auto">
                  {pool.map(ritual => {
                    const isChosen = chosenSaberAmpliado === ritual.id
                    return (
                      <button
                        key={ritual.id}
                        onClick={() => setChosenSaberAmpliado(ritual.id)}
                        className={cn(
                          'w-full text-left p-3 transition-all cursor-crosshair border-l-2',
                          isChosen
                            ? 'bg-surface-container-highest border-tertiary'
                            : 'bg-surface-container-high border-transparent hover:border-outline-variant/40'
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn('text-xs font-bold uppercase tracking-wide', isChosen ? 'text-tertiary' : 'text-on-surface')}>
                            {ritual.name}
                          </p>
                          <span className="text-[9px] font-mono text-outline uppercase shrink-0">{ritual.element}</span>
                        </div>
                        {isChosen && (
                          <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">{ritual.summary}</p>
                        )}
                      </button>
                    )
                  })}
                </div>
              </section>
            )
          })()}

          {/* Aumento de Atributo */}
          {needsAttr && (
            <section>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-[9px] font-mono uppercase tracking-[0.25em] text-outline">Aumento de Atributo</h3>
                <span className="text-[9px] font-mono text-primary-container">obrigatório</span>
              </div>
              <p className="text-[10px] text-on-surface/50 mb-3 uppercase tracking-wide">Escolha um atributo para aumentar em +1 (máx. 5)</p>
              <div className="grid grid-cols-5 gap-2">
                {ATTR_ORDER.map(attr => {
                  const val = character.attributes[attr as keyof Attributes]
                  const isMaxed = val >= 5
                  const selected = chosenAttr === attr
                  return (
                    <button
                      key={attr}
                      disabled={isMaxed}
                      onClick={() => !isMaxed && setChosenAttr(attr as keyof Attributes)}
                      className={cn(
                        'p-3 text-center transition-all border-b-2',
                        isMaxed ? 'opacity-30 cursor-not-allowed border-transparent' :
                        selected ? 'bg-surface-container-highest border-secondary cursor-crosshair' :
                        'bg-surface-container-high border-transparent hover:border-outline-variant/40 cursor-crosshair'
                      )}
                    >
                      <p className="text-[8px] uppercase tracking-widest text-outline mb-1">{ATTR_LABELS[attr].slice(0, 4)}</p>
                      <p className={cn('font-mono text-xl font-bold', selected ? 'text-secondary' : isMaxed ? 'text-outline' : 'text-on-surface')}>
                        {val}{selected && <span className="text-secondary text-sm">+1</span>}
                      </p>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {/* Fix 5: Grau de Treinamento — trained skills only */}
          {needsTraining && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[9px] font-mono uppercase tracking-[0.25em] text-outline">Grau de Treinamento</h3>
                <span className={cn('font-mono text-sm font-bold', remainingUpgrades > 0 ? 'text-secondary' : 'text-outline/40')}>
                  {upgradeCount}/{trainingCount}
                </span>
              </div>
              <p className="text-[10px] text-on-surface/50 mb-3 uppercase tracking-wide">
                Escolha até {trainingCount} perícias já treinadas para subir um grau
              </p>
              {trainedSkills.length === 0 ? (
                <p className="text-[10px] font-mono text-on-surface/30 uppercase tracking-widest">Nenhuma perícia treinada disponível.</p>
              ) : (
                <div className="grid grid-cols-2 gap-1 max-h-64 overflow-y-auto">
                  {trainedSkills.map(skill => {
                    const currentGrade = character.skill_training.find(s => s.skillId === skill.id)?.grade ?? 'destreinado'
                    const next = nextGrade(currentGrade)
                    const isSelected = skill.id in trainingUpgrades
                    const isMaxed = !next
                    return (
                      <button
                        key={skill.id}
                        disabled={isMaxed || (!isSelected && remainingUpgrades <= 0)}
                        onClick={() => toggleTrainingUpgrade(skill.id)}
                        className={cn(
                          'text-left p-2 transition-all cursor-crosshair border-l-2',
                          isMaxed ? 'opacity-30 cursor-not-allowed border-transparent' :
                          isSelected ? 'bg-surface-container-high border-secondary' :
                          remainingUpgrades <= 0 ? 'opacity-40 border-transparent cursor-not-allowed' :
                          'bg-surface-container border-transparent hover:border-outline-variant/40'
                        )}
                      >
                        <p className={cn('text-[10px] font-bold uppercase tracking-wide', isSelected ? 'text-secondary' : 'text-on-surface/70')}>
                          {skill.name}
                        </p>
                        <p className="text-[9px] font-mono text-on-surface/30 mt-0.5">
                          {GRADE_LABELS[currentGrade]}
                          {isSelected && next && <span className="text-secondary"> → {GRADE_LABELS[next]}</span>}
                          {isMaxed && <span className="text-outline"> (max)</span>}
                        </p>
                      </button>
                    )
                  })}
                </div>
              )}
            </section>
          )}

          {/* Powers */}
          {powerAbilities.map(powerAbility => {
            const classId = powerAbility.replace('poder-de-', '')
            const powerPool = buildPowerPool(classId, character.selected_powers)
            const chosen = chosenPowers[powerAbility]
            return (
              <section key={powerAbility}>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-[9px] font-mono uppercase tracking-[0.25em] text-outline">
                    Poder de {classId.charAt(0).toUpperCase() + classId.slice(1)}
                  </h3>
                  <span className="text-[9px] font-mono text-primary-container">obrigatório</span>
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {powerPool.map(power => {
                    const isChosen = chosen === power.id
                    return (
                      <button key={power.id} onClick={() => setChosenPowers(prev => ({ ...prev, [powerAbility]: power.id }))}
                        className={cn('w-full text-left p-3 transition-all cursor-crosshair border-l-2',
                          isChosen ? 'bg-surface-container-highest border-secondary' : 'bg-surface-container-high border-transparent hover:border-outline-variant/40'
                        )}>
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn('text-xs font-bold uppercase tracking-wide', isChosen ? 'text-secondary' : 'text-on-surface')}>{power.name}</p>
                          {power.prerequisites && power.prerequisites.length > 0 && (
                            <span className="text-[9px] font-mono text-outline shrink-0">{power.prerequisites.join(', ')}</span>
                          )}
                        </div>
                        {isChosen && <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">{power.description}</p>}
                      </button>
                    )
                  })}
                </div>
              </section>
            )
          })}

          {/* Aprender Ritual sub-picker — one per power slot where aprender-ritual was chosen */}
          {aprenderRitualSlots.map((pa, i) => {
            const pool = highNex
              ? [1, 2, 3, 4].flatMap(c => getRitualsForCircle(c, character.known_rituals).map(r => ({ ...r, circle: c })))
              : getRitualsForCircle(1, character.known_rituals).map(r => ({ ...r, circle: 1 }))
            const chosen = aprenderRitualChoices[pa]
            return (
              <section key={`aprender-${pa}-${i}`}>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-[9px] font-mono uppercase tracking-[0.25em] text-outline">
                    Aprender Ritual {aprenderRitualSlots.length > 1 ? `(${i + 1})` : ''} — {highNex ? 'Qualquer Círculo' : '1º Círculo'}
                  </h3>
                  <span className="text-[9px] font-mono text-primary-container">obrigatório</span>
                </div>
                <p className="text-[10px] text-on-surface/50 mb-3 uppercase tracking-wide">
                  Escolha um ritual para aprender
                </p>
                <div className="space-y-1 max-h-56 overflow-y-auto">
                  {pool.map(ritual => {
                    const isChosen = chosen === ritual.id
                    return (
                      <button
                        key={ritual.id}
                        onClick={() => setAprenderRitualChoices(prev => ({ ...prev, [pa]: ritual.id }))}
                        className={cn(
                          'w-full text-left p-3 transition-all cursor-crosshair border-l-2',
                          isChosen
                            ? 'bg-surface-container-highest border-tertiary'
                            : 'bg-surface-container-high border-transparent hover:border-outline-variant/40'
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn('text-xs font-bold uppercase tracking-wide', isChosen ? 'text-tertiary' : 'text-on-surface')}>
                            {ritual.name}
                          </p>
                          <span className="text-[9px] font-mono text-outline uppercase shrink-0">
                            {ritual.circle}º · {ritual.element}
                          </span>
                        </div>
                        {isChosen && (
                          <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">{ritual.summary}</p>
                        )}
                      </button>
                    )
                  })}
                </div>
              </section>
            )
          })}

          {/* Resistir a Elemento sub-picker */}
          {resistirSlots.map((pa, i) => {
            const chosen = resistirElementoChoices[pa]
            return (
              <section key={`resistir-${pa}-${i}`}>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-[9px] font-mono uppercase tracking-[0.25em] text-outline">
                    Resistir a — Escolha o Elemento {resistirSlots.length > 1 ? `(${i + 1})` : ''}
                  </h3>
                  <span className="text-[9px] font-mono text-primary-container">obrigatório</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ELEMENT_IDS.map(el => {
                    const isChosen = chosen === el
                    return (
                      <button
                        key={el}
                        onClick={() => setResistirElementoChoices(prev => ({ ...prev, [pa]: el }))}
                        className={cn(
                          'p-3 text-left transition-all cursor-crosshair border-l-2',
                          isChosen
                            ? 'bg-surface-container-highest border-secondary'
                            : 'bg-surface-container-high border-transparent hover:border-outline-variant/40'
                        )}
                      >
                        <p className={cn('text-xs font-bold uppercase tracking-wide', isChosen ? 'text-secondary' : 'text-on-surface')}>
                          {ELEMENT_LABELS[el]}
                        </p>
                        {isChosen && (
                          <p className="text-[10px] text-on-surface-variant mt-0.5">Resistência 10 contra {ELEMENT_LABELS[el]}</p>
                        )}
                      </button>
                    )
                  })}
                </div>
              </section>
            )
          })}

          {/* Expansão de Conhecimento sub-picker */}
          {expansaoSlots.map((pa, i) => {
            const pool = buildExpansaoPool(character.class_id, character.selected_powers)
            const chosen = expansaoChoices[pa]
            return (
              <section key={`expansao-${pa}-${i}`}>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-[9px] font-mono uppercase tracking-[0.25em] text-outline">
                    Expansão de Conhecimento — Poder de Outra Classe {expansaoSlots.length > 1 ? `(${i + 1})` : ''}
                  </h3>
                  <span className="text-[9px] font-mono text-primary-container">obrigatório</span>
                </div>
                <p className="text-[10px] text-on-surface/50 mb-3 uppercase tracking-wide">
                  Pré-requisitos ainda se aplicam
                </p>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {pool.map(power => {
                    const isChosen = chosen === power.id
                    return (
                      <button
                        key={power.id}
                        onClick={() => setExpansaoChoices(prev => ({ ...prev, [pa]: power.id }))}
                        className={cn(
                          'w-full text-left p-3 transition-all cursor-crosshair border-l-2',
                          isChosen
                            ? 'bg-surface-container-highest border-secondary'
                            : 'bg-surface-container-high border-transparent hover:border-outline-variant/40'
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn('text-xs font-bold uppercase tracking-wide', isChosen ? 'text-secondary' : 'text-on-surface')}>
                            {power.name}
                          </p>
                          <span className="text-[9px] font-mono text-outline/60 shrink-0 capitalize">{power.className}</span>
                        </div>
                        {power.prerequisites && power.prerequisites.length > 0 && !isChosen && (
                          <p className="text-[9px] font-mono text-outline/40 mt-0.5">Req: {power.prerequisites.join(', ')}</p>
                        )}
                        {isChosen && <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">{power.description}</p>}
                      </button>
                    )
                  })}
                </div>
              </section>
            )
          })}

          {/* Fix 6: Versatilidade */}
          {needsVersatilidade && (
            <section>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-[9px] font-mono uppercase tracking-[0.25em] text-outline">Versatilidade</h3>
                <span className="text-[9px] font-mono text-primary-container">obrigatório</span>
              </div>
              <p className="text-[10px] text-on-surface/50 mb-3 uppercase tracking-wide">
                {((cls.coreAbilities as unknown) as Record<string, { description?: string }>).versatilidade?.description}
              </p>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {buildVersatilidadePool(cls, character.trail_id, character.selected_powers).map(power => {
                  const isChosen = chosenPowers['versatilidade'] === power.id
                  return (
                    <button key={power.id} onClick={() => setChosenPowers(prev => ({ ...prev, versatilidade: power.id }))}
                      className={cn('w-full text-left p-3 transition-all cursor-crosshair border-l-2',
                        isChosen ? 'bg-surface-container-highest border-secondary' : 'bg-surface-container-high border-transparent hover:border-outline-variant/40'
                      )}>
                      <p className={cn('text-xs font-bold uppercase tracking-wide', isChosen ? 'text-secondary' : 'text-on-surface')}>{power.name}</p>
                      {isChosen && <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">{power.description}</p>}
                    </button>
                  )
                })}
              </div>
            </section>
          )}

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-surface-container-lowest border-t border-outline-variant/10 p-4 flex items-center justify-between gap-4">
          <p className={cn('text-[9px] font-mono uppercase tracking-widest', canConfirm ? 'text-secondary' : 'text-primary-container')}>
            {canConfirm ? 'Pronto para avançar' : 'Escolhas obrigatórias em falta'}
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-on-surface/50 hover:text-on-surface transition-colors cursor-crosshair">
              Cancelar
            </button>
            <button
              onClick={() => canConfirm && onConfirm(buildChanges())}
              disabled={!canConfirm}
              className={cn('px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all cursor-crosshair',
                canConfirm ? 'bg-primary-container text-white hover:bg-on-primary-fixed-variant' : 'bg-surface-container text-on-surface/20 cursor-not-allowed'
              )}
            >
              Confirmar Avanço
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
