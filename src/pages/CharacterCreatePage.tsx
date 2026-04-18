import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Attributes, ClassId, NexTier } from '@/types/character'
import { calculateDerivedStats, validateAttributes } from '@/lib/rules'

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
    <main style={{ maxWidth: 700, margin: '0 auto', padding: '2rem' }}>
      <h1>Criar Personagem</h1>

      <nav style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {STEPS.map((label, i) => (
          <button
            key={label}
            onClick={() => setStep(i)}
            style={{
              fontWeight: i === step ? 'bold' : 'normal',
              textDecoration: i < step ? 'underline' : 'none',
              cursor: 'pointer',
            }}
          >
            {i + 1}. {label}
          </button>
        ))}
      </nav>

      {step === 0 && <StepConcept draft={draft} update={update} />}
      {step === 1 && <StepAttributes draft={draft} update={update} errors={attrErrors} />}
      {step === 2 && <StepOrigin draft={draft} update={update} />}
      {step === 3 && <StepClass draft={draft} update={update} />}
      {step === 4 && <StepSkills draft={draft} update={update} />}
      {step === 5 && (
        <StepReview draft={draft} derivedStats={derivedStats} onSave={handleSave} />
      )}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        {step > 0 && <button onClick={back}>← Voltar</button>}
        {step < STEPS.length - 1 && <button onClick={next}>Próximo →</button>}
      </div>
    </main>
  )
}
