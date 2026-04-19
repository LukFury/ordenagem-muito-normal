import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Attributes, ClassId, NexTier } from '@/types/character'
import { calculateDerivedStats, validateAttributes } from '@/lib/rules'
import { cn } from '@/lib/utils'

import StepConcept from '@/components/create/StepConcept'
import StepAttributes from '@/components/create/StepAttributes'
import StepOrigin from '@/components/create/StepOrigin'
import StepClass from '@/components/create/StepClass'
import StepSkills from '@/components/create/StepSkills'
import StepReview from '@/components/create/StepReview'

export interface CharacterDraft {
  name: string
  concept: string
  originId: string
  classId: ClassId | ''
  trailId: string
  nex: NexTier
  attributes: Attributes
  skillTraining: { skillId: string; grade: 'treinado' }[]
  knownRituals: string[]
  selectedPowers: string[]
}

const INITIAL_DRAFT: CharacterDraft = {
  name: '',
  concept: '',
  originId: '',
  classId: '',
  trailId: '',
  nex: '5%',
  attributes: { agilidade: 1, forca: 1, intelecto: 1, presenca: 1, vigor: 1 },
  skillTraining: [],
  knownRituals: [],
  selectedPowers: [],
}

const STEPS = ['Conceito', 'Atributos', 'Origem', 'Classe', 'Perícias', 'Revisar']

export default function CharacterCreatePage() {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<CharacterDraft>(INITIAL_DRAFT)
  const navigate = useNavigate()

  const update = (partial: Partial<CharacterDraft>) =>
    setDraft(prev => ({ ...prev, ...partial }))

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep(s => Math.max(s - 1, 0))

  const derivedStats =
    draft.classId
      ? calculateDerivedStats(draft.classId, draft.attributes, draft.nex)
      : null

  const attrErrors = validateAttributes(draft.attributes)

  async function handleSave() {
    console.log('Saving character draft:', draft)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#07050f] text-[#c4b5d4]">
      {/* Atmospheric header */}
      <header className="border-b border-purple-900/30 bg-[#07050f]/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-purple-400/60 hover:text-purple-300 text-sm transition-colors flex items-center gap-2"
          >
            ← Voltar ao início
          </button>
          <h1 className="font-cinzel text-lg font-semibold text-purple-200 tracking-widest uppercase">
            Criar Personagem
          </h1>
          <div className="w-24" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Step indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            {/* connector line */}
            <div className="absolute top-4 left-0 right-0 h-px bg-purple-900/40" />
            <div
              className="absolute top-4 left-0 h-px bg-purple-600/70 transition-all duration-500"
              style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
            />
            {STEPS.map((label, i) => {
              const done = i < step
              const active = i === step
              return (
                <button
                  key={label}
                  onClick={() => setStep(i)}
                  className="relative flex flex-col items-center gap-2 group"
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold z-10 transition-all duration-300',
                      done
                        ? 'border-purple-500 bg-purple-900 text-purple-300'
                        : active
                        ? 'border-purple-400 bg-purple-950 text-purple-200 shadow-[0_0_12px_rgba(147,51,234,0.6)]'
                        : 'border-purple-900/60 bg-[#07050f] text-purple-700'
                    )}
                  >
                    {done ? '✓' : i + 1}
                  </div>
                  <span
                    className={cn(
                      'text-xs font-cinzel tracking-wide transition-colors hidden sm:block',
                      active ? 'text-purple-300' : done ? 'text-purple-500' : 'text-purple-800'
                    )}
                  >
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="rounded-xl border border-purple-900/40 bg-[#0f0b1a]/80 shadow-[0_0_40px_rgba(88,28,135,0.12)] p-6 md:p-8 min-h-[420px]">
          {step === 0 && <StepConcept draft={draft} update={update} />}
          {step === 1 && <StepAttributes draft={draft} update={update} errors={attrErrors} />}
          {step === 2 && <StepOrigin draft={draft} update={update} />}
          {step === 3 && <StepClass draft={draft} update={update} />}
          {step === 4 && <StepSkills draft={draft} update={update} />}
          {step === 5 && (
            <StepReview draft={draft} derivedStats={derivedStats} onSave={handleSave} />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <div>
            {step > 0 && (
              <button
                onClick={back}
                className="px-5 py-2 rounded border border-purple-800/60 text-purple-400 text-sm hover:bg-purple-950/50 hover:text-purple-200 transition-all"
              >
                ← Voltar
              </button>
            )}
          </div>
          <div>
            {step < STEPS.length - 1 && (
              <button
                onClick={next}
                className="px-6 py-2 rounded bg-purple-700 hover:bg-purple-600 text-white text-sm font-medium shadow-[0_0_14px_rgba(147,51,234,0.35)] hover:shadow-[0_0_20px_rgba(147,51,234,0.55)] transition-all"
              >
                Próximo →
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
