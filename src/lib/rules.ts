import type { Attributes, ClassId, NexTier, DerivedStats, TrainingGrade } from '@/types/character'

import classesData from '@/data/classes.json'
import nexData from '@/data/nex-progression.json'

const NEX_ORDER: NexTier[] = [
  '5%','10%','15%','20%','25%','30%','35%','40%','45%','50%',
  '55%','60%','65%','70%','75%','80%','85%','90%','95%','99%',
]

export function getNexIndex(nex: NexTier): number {
  return NEX_ORDER.indexOf(nex)
}

export function getPELimit(nex: NexTier): number {
  const tier = (nexData.tiers as Array<{ nex: string; peLimit: number }>).find(t => t.nex === nex)
  return tier?.peLimit ?? 1
}

export function calculateDerivedStats(
  classId: ClassId,
  attributes: Attributes,
  nex: NexTier,
  selectedPowers: string[] = [],
  trailId: string = '',
  originId: string = '',
): DerivedStats {
  const classData = (classesData as Array<{
    id: string
    initialStats: { hp: { base: number; attribute: string }; pe: { base: number; attribute: string }; san: { base: number } }
    perNEXGains: { hp: { base: number; attribute: string }; pe: { base: number; attribute: string }; san: { base: number } }
  }>).find(c => c.id === classId)

  if (!classData) throw new Error(`Unknown class: ${classId}`)

  const nexIndex = getNexIndex(nex) // 0 = 5%, 1 = 10%, etc.
  const nexNumeric = parseInt(nex.replace('%', ''))

  const { initialStats, perNEXGains } = classData

  const attrVal = (attrId: string): number =>
    attributes[attrId as keyof Attributes] ?? 0

  const hp =
    initialStats.hp.base +
    attrVal(initialStats.hp.attribute) +
    nexIndex * (perNEXGains.hp.base + attrVal(perNEXGains.hp.attribute))

  const pe =
    initialStats.pe.base +
    attrVal(initialStats.pe.attribute) +
    nexIndex * (perNEXGains.pe.base + attrVal(perNEXGains.pe.attribute))

  const san =
    initialStats.san.base +
    nexIndex * perNEXGains.san.base

  const defense = 10 + attrVal('agilidade')

  const nexPELimit = getPELimit(nex)

  // Passive power bonuses
  let hpBonus = 0
  let peBonus = 0
  let sanBonus = 0
  let defenseBonus = 0
  let nexPELimitBonus = 0

  if (selectedPowers.includes('sangue-de-ferro')) hpBonus += nexIndex * 2
  if (selectedPowers.includes('potencial-aprimorado')) peBonus += nexIndex
  if (selectedPowers.includes('precognicao')) defenseBonus += 2
  if (selectedPowers.includes('encarar-a-morte')) nexPELimitBonus += 1

  // Tropa de Choque trail — Casca Grossa (unlocked at NEX 10%): +1 PV per 5% NEX
  if (trailId === 'tropa-de-choque' && nexIndex >= 1) {
    hpBonus += Math.floor(nexNumeric / 5)
  }

  // Origin passive bonuses
  if (originId === 'desgarrado') hpBonus += Math.floor(nexNumeric / 5)
  if (originId === 'policial') defenseBonus += 2
  if (originId === 'universitario') {
    peBonus += 1 + Math.floor(nexIndex / 2)
    nexPELimitBonus += 1
  }
  if (originId === 'vitima') sanBonus += Math.floor(nexNumeric / 5)

  return {
    hp: hp + hpBonus,
    pe: pe + peBonus,
    san: san + sanBonus,
    defense: defense + defenseBonus,
    nexPELimit: nexPELimit + nexPELimitBonus,
  }
}

export function getSkillBonus(grade: TrainingGrade): number {
  const bonuses: Record<TrainingGrade, number> = {
    destreinado: 0,
    treinado: 5,
    veterano: 10,
    expert: 15,
  }
  return bonuses[grade]
}

export function getFreeSkillCount(classId: ClassId, intelecto: number): number {
  const counts: Record<ClassId, number> = {
    combatente: 1 + intelecto,
    especialista: 7 + intelecto,
    ocultista: 3 + intelecto,
  }
  return counts[classId]
}

export function getTotalAttributePoints(attributes: Attributes): number {
  return (Object.values(attributes) as number[]).reduce((a, b) => a + b, 0)
}

export function validateAttributes(attributes: Attributes): string[] {
  const errors: string[] = []
  const values = Object.values(attributes) as number[]
  const total = values.reduce((a, b) => a + b, 0)
  const zerosCount = values.filter(v => v === 0).length

  if (total > 9) errors.push('Pontos de atributo excedem o limite (base 5 + 4 para distribuir).')
  if (total < 5) errors.push('Pontos de atributo insuficientes.')
  if (zerosCount > 1) errors.push('Apenas um atributo pode ser reduzido a 0.')
  if (values.some(v => v < 0)) errors.push('Atributos não podem ser negativos.')
  if (values.some(v => v > 3)) errors.push('Valor máximo inicial por atributo é 3.')

  return errors
}

export const NEX_ORDER_EXPORTED = NEX_ORDER

export function getPassiveSkillBonuses(
  selectedPowers: string[],
  _originId: string,
): Record<string, number> {
  const bonuses: Record<string, number> = {}
  const add = (id: string, n: number) => { bonuses[id] = (bonuses[id] ?? 0) + n }

  if (selectedPowers.includes('sensitivo')) {
    add('diplomacia', 5); add('intimidacao', 5); add('intuicao', 5)
  }
  if (selectedPowers.includes('visao-do-oculto')) {
    add('percepcao', 5)
  }

  return bonuses
}

function resolveConditions(active: Set<string>): Set<string> {
  const r = new Set(active)
  if (r.has('exausto'))    { r.add('debilitado'); r.add('lento'); r.add('vulneravel') }
  if (r.has('fatigado'))   { r.add('fraco'); r.add('vulneravel') }
  if (r.has('enredado'))   { r.add('lento'); r.add('vulneravel') }
  if (r.has('agarrado'))   { r.add('desprevenido') }
  if (r.has('atordoado'))  { r.add('desprevenido') }
  if (r.has('cego'))       { r.add('desprevenido'); r.add('lento') }
  if (r.has('surpreendido')) { r.add('desprevenido') }
  if (r.has('paralisado')) { r.add('indefeso') }
  if (r.has('petrificado')) { r.add('inconsciente') }
  if (r.has('inconsciente')) { r.add('indefeso') }
  if (r.has('indefeso'))   { r.add('desprevenido') }
  return r
}

export interface ConditionModifiers {
  defenseBonus: number
  globalSkillPenalty: number
  attrPenalty: Record<string, number>
  skillPenalty: Record<string, number>
}

export function getConditionModifiers(activeConditions: Set<string>): ConditionModifiers {
  const r = resolveConditions(activeConditions)
  const has = (id: string) => r.has(id)

  let defenseBonus = 0
  let globalSkillPenalty = 0
  const attrPenalty: Record<string, number> = {}
  const skillPenalty: Record<string, number> = {}

  const addAttr = (a: string, v: number) => { attrPenalty[a] = (attrPenalty[a] ?? 0) + v }
  const addSkill = (s: string, v: number) => { skillPenalty[s] = (skillPenalty[s] ?? 0) + v }

  // Global test penalty (only worst applies — abalado → apavorado escalation)
  if (has('apavorado')) globalSkillPenalty -= 10
  else if (has('abalado')) globalSkillPenalty -= 5

  // Defense — indefeso supersedes desprevenido for defense
  if (has('vulneravel')) defenseBonus -= 2
  if (has('indefeso')) defenseBonus -= 10
  else if (has('desprevenido')) defenseBonus -= 5

  // Agi / Força / Vigor (worst of fraco/debilitado applies, they don't stack)
  if (has('debilitado')) { addAttr('agilidade', -10); addAttr('forca', -10); addAttr('vigor', -10) }
  else if (has('fraco')) { addAttr('agilidade', -5); addAttr('forca', -5); addAttr('vigor', -5) }
  // cego: -10 on Agi/Força-based skills (independent of fraco/debilitado)
  if (has('cego')) { addAttr('agilidade', -10); addAttr('forca', -10) }

  // Intelecto / Presença (worst of frustrado/esmorecido)
  if (has('esmorecido')) { addAttr('intelecto', -10); addAttr('presenca', -10) }
  else if (has('frustrado')) { addAttr('intelecto', -5); addAttr('presenca', -5) }

  // Per-skill
  if (has('fascinado')) addSkill('percepcao', -10)
  else if (has('ofuscado')) addSkill('percepcao', -5)
  if (has('surdo')) addSkill('iniciativa', -10)

  return { defenseBonus, globalSkillPenalty, attrPenalty, skillPenalty }
}
