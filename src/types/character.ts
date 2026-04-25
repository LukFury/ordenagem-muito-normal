export type AttributeKey = 'agilidade' | 'forca' | 'intelecto' | 'presenca' | 'vigor'

export type TrainingGrade = 'destreinado' | 'treinado' | 'veterano' | 'expert'

export interface Attributes {
  agilidade: number
  forca: number
  intelecto: number
  presenca: number
  vigor: number
}

export interface SkillTraining {
  skillId: string
  grade: TrainingGrade
}

export type ClassId = 'combatente' | 'especialista' | 'ocultista'

export type NexTier =
  | '5%' | '10%' | '15%' | '20%' | '25%' | '30%' | '35%' | '40%' | '45%' | '50%'
  | '55%' | '60%' | '65%' | '70%' | '75%' | '80%' | '85%' | '90%' | '95%' | '99%'

export interface DerivedStats {
  hp: number
  pe: number
  san: number
  defense: number
  nexPELimit: number
}

export interface Character {
  id: string
  userId: string
  campaignId?: string
  name: string
  concept: string
  originId: string
  classId: ClassId
  trailId: string
  nex: NexTier
  attributes: Attributes
  skillTraining: SkillTraining[]
  knownRituals: string[]
  classRituals: string[]
  selectedPowers: string[]
  patronage: number
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Campaign {
  id: string
  name: string
  gmUserId: string
  players: string[]
  sharedInventory: InventoryItem[]
  createdAt: string
}

export interface InventoryItem {
  id: string
  name: string
  equipmentId?: string
  description: string
  quantity: number
  category: string
  ownedBy: 'campaign' | string
}
