import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Attributes, ClassId, NexTier } from '@/types/character'
import { calculateDerivedStats, validateAttributes } from '@/lib/rules'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

import StepConcept from '@/components/create/StepConcept'
import StepAttributes from '@/components/create/StepAttributes'
import StepOrigin from '@/components/create/StepOrigin'
import StepClass from '@/components/create/StepClass'
import StepSkills from '@/components/create/StepSkills'
import StepRituals from '@/components/create/StepRituals'
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
  classRituals: string[]
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
  classRituals: [],
  selectedPowers: [],
}

export default function CharacterCreatePage() {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<CharacterDraft>(INITIAL_DRAFT)

  const isOcultista = draft.classId === 'ocultista'
  const STEPS = isOcultista
    ? ['Conceito', 'Atributos', 'Origem', 'Classe', 'Perícias', 'Rituais', 'Revisar']
    : ['Conceito', 'Atributos', 'Origem', 'Classe', 'Perícias', 'Revisar']
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  const update = (partial: Partial<CharacterDraft>) =>
    setDraft(prev => ({ ...prev, ...partial }))

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep(s => Math.max(s - 1, 0))

  const derivedStats = draft.classId
    ? calculateDerivedStats(draft.classId, draft.attributes, draft.nex)
    : null

  const attrErrors = validateAttributes(draft.attributes)

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setSaveError('')

    const { error } = await supabase.from('characters').insert({
      user_id: user.id,
      name: draft.name,
      concept: draft.concept,
      origin_id: draft.originId,
      class_id: draft.classId,
      trail_id: draft.trailId,
      nex: draft.nex,
      attributes: draft.attributes,
      skill_training: draft.skillTraining,
      known_rituals: draft.knownRituals,
      class_rituals: draft.classRituals,
      selected_powers: draft.selectedPowers,
    })

    setSaving(false)
    if (error) setSaveError(error.message)
    else navigate('/')
  }

  return (
    <div className="min-h-screen bg-background text-on-background">
      <header className="bg-background flex justify-between items-center px-6 py-3 sticky top-0 z-50 border-b border-outline-variant/10">
        <h1 className="text-2xl font-headline font-bold italic text-primary-container tracking-tighter uppercase">
          ORDEM PARANORMAL
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-secondary/50 tracking-widest hidden sm:block">
            PROTOCOLO DE RECRUTAMENTO
          </span>
          <button
            onClick={() => navigate('/')}
            className="text-on-surface/40 hover:text-on-surface transition-colors text-[10px] uppercase tracking-widest cursor-crosshair"
          >
            ← Abortar
          </button>
        </div>
      </header>

      <main className="pt-10 pb-24 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="mb-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-primary-container text-white px-2 py-0.5 text-[10px] font-bold tracking-tighter uppercase">
              Novo Recrutamento
            </span>
            <span className="font-mono text-[10px] text-secondary/50 tracking-widest">
              PASSO {step + 1}/{STEPS.length}
            </span>
          </div>
          <h2 className="text-5xl font-headline font-bold italic text-on-surface tracking-tighter uppercase leading-none">
            Dossiê de <span className="text-primary-container">Agente</span>
          </h2>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-10 overflow-x-auto">
          {STEPS.map((label, i) => {
            const done = i < step
            const active = i === step
            return (
              <button
                key={label}
                onClick={() => setStep(i)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all cursor-crosshair whitespace-nowrap border-b-2',
                  active
                    ? 'border-secondary text-secondary bg-surface-container-low'
                    : done
                    ? 'border-primary-container/50 text-primary-container/70 hover:text-primary-container'
                    : 'border-transparent text-on-surface/30 hover:text-on-surface/50'
                )}
              >
                <span className={cn(
                  'w-5 h-5 flex items-center justify-center text-[9px] font-mono border',
                  active ? 'border-secondary text-secondary' : done ? 'border-primary-container/50 text-primary-container/50' : 'border-on-surface/20 text-on-surface/30'
                )}>
                  {done ? '✓' : i + 1}
                </span>
                <span className="hidden sm:block">{label}</span>
              </button>
            )
          })}
        </div>

        {/* Step content */}
        <div className="bg-surface-container-low border-l-4 border-primary-container p-8 relative overflow-hidden min-h-96">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-9xl">fingerprint</span>
          </div>
          {step === 0 && <StepConcept draft={draft} update={update} />}
          {step === 1 && <StepAttributes draft={draft} update={update} errors={attrErrors} />}
          {step === 2 && <StepOrigin draft={draft} update={update} />}
          {step === 3 && <StepClass draft={draft} update={update} />}
          {step === 4 && <StepSkills draft={draft} update={update} />}
          {step === 5 && isOcultista && <StepRituals draft={draft} update={update} />}
          {step === 5 && !isOcultista && (
            <StepReview draft={draft} derivedStats={derivedStats} onSave={handleSave} saving={saving} saveError={saveError} />
          )}
          {step === 6 && (
            <StepReview draft={draft} derivedStats={derivedStats} onSave={handleSave} saving={saving} saveError={saveError} />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <div>
            {step > 0 && (
              <button
                onClick={back}
                className="px-5 py-2 border border-outline-variant/20 text-on-surface/50 text-[10px] font-bold uppercase tracking-widest hover:text-on-surface hover:border-outline-variant transition-all cursor-crosshair"
              >
                ← Voltar
              </button>
            )}
          </div>
          <div>
            {step < STEPS.length - 1 && (
              <button
                onClick={next}
                disabled={isOcultista && step === 5 && draft.classRituals.length < 3}
                className="px-6 py-3 bg-primary-container hover:bg-on-primary-fixed-variant text-on-primary-container font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 group cursor-crosshair disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Próximo: {STEPS[step + 1]}</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward_ios</span>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
