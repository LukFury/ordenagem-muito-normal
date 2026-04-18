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
  nex: NexTier
): DerivedStats {
  const classData = (classesData as Array<{
    id: string
    initialStats: { hp: { base: number; attribute: string }; pe: { base: number; attribute: string }; san: { base: number } }
    perNEXGains: { hp: { base: number; attribute: string }; pe: { base: number; attribute: string }; san: { base: number } }
  }>).find(c => c.id === classId)

  if (!classData) throw new Error(`Unknown class: ${classId}`)

  const nexIndex = getNexIndex(nex) // 0 = 5%, 1 = 10%, etc. — number of advances = nexIndex

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

  return { hp, pe, san, defense, nexPELimit }
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
