import type { CharacterDraft } from '@/pages/CharacterCreatePage'
import originsData from '@/data/origins.json'

interface Props {
  draft: CharacterDraft
  update: (p: Partial<CharacterDraft>) => void
}

interface Origin {
  id: string
  name: string
  description: string
  trainedSkills: string[] | { type: string; count: number }
  power: { name: string; description: string }
}

export default function StepOrigin({ draft, update }: Props) {
  const origins = originsData as Origin[]
  const selected = origins.find(o => o.id === draft.originId)

  return (
    <section>
      <h2>Origem</h2>
      <p>O que você fazia antes de se envolver com o paranormal e entrar na Ordem da Realidade?</p>
      <p>Cada origem fornece <strong>duas perícias treinadas</strong> e um <strong>poder exclusivo</strong>.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
        {origins.map(origin => (
          <button
            key={origin.id}
            onClick={() => update({ originId: origin.id })}
            style={{
              textAlign: 'left',
              padding: '0.75rem',
              border: draft.originId === origin.id ? '2px solid #333' : '1px solid #ccc',
              borderRadius: 6,
              background: draft.originId === origin.id ? '#f0f0f0' : 'white',
              cursor: 'pointer',
            }}
          >
            <strong>{origin.name}</strong>
            <br />
            <small>
              {Array.isArray(origin.trainedSkills)
                ? origin.trainedSkills.join(', ')
                : '2 à escolha do mestre'}
            </small>
          </button>
        ))}
      </div>

      {selected && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid #333', borderRadius: 6 }}>
          <h3>{selected.name}</h3>
          <p>{selected.description}</p>
          <p>
            <strong>Perícias treinadas:</strong>{' '}
            {Array.isArray(selected.trainedSkills)
              ? selected.trainedSkills.join(' e ')
              : '2 à escolha do mestre'}
          </p>
          <p>
            <strong>{selected.power.name}.</strong> {selected.power.description}
          </p>
        </div>
      )}
    </section>
  )
}
