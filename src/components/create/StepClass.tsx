import type { CharacterDraft } from '@/pages/CharacterCreatePage'
import type { ClassId } from '@/types/character'
import classesData from '@/data/classes.json'

interface Props {
  draft: CharacterDraft
  update: (p: Partial<CharacterDraft>) => void
}

interface Trail { id: string; name: string; description: string }
interface ClassEntry {
  id: string
  name: string
  description: string
  trails: Trail[]
}

export default function StepClass({ draft, update }: Props) {
  const classes = classesData as ClassEntry[]
  const selectedClass = classes.find(c => c.id === draft.classId)

  function selectClass(id: ClassId) {
    update({ classId: id, trailId: '' })
  }

  return (
    <section>
      <h2>Classe</h2>
      <p>Sua classe indica o treinamento que você recebeu na Ordem para enfrentar os perigos do Outro Lado.</p>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        {classes.map(cls => (
          <button
            key={cls.id}
            onClick={() => selectClass(cls.id as ClassId)}
            style={{
              padding: '1rem',
              border: draft.classId === cls.id ? '2px solid #333' : '1px solid #ccc',
              borderRadius: 8,
              background: draft.classId === cls.id ? '#f0f0f0' : 'white',
              cursor: 'pointer',
              flex: '1 1 180px',
              textAlign: 'left',
            }}
          >
            <strong>{cls.name}</strong>
            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>{cls.description}</p>
          </button>
        ))}
      </div>

      {selectedClass && (
        <>
          <h3 style={{ marginTop: '1.5rem' }}>Escolha sua Trilha</h3>
          <p>Você escolhe sua trilha ao atingir NEX 10%. Pode selecionar agora para planejar seu personagem.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
            {selectedClass.trails.map(trail => (
              <button
                key={trail.id}
                onClick={() => update({ trailId: trail.id })}
                style={{
                  textAlign: 'left',
                  padding: '0.75rem',
                  border: draft.trailId === trail.id ? '2px solid #333' : '1px solid #ccc',
                  borderRadius: 6,
                  background: draft.trailId === trail.id ? '#f0f0f0' : 'white',
                  cursor: 'pointer',
                }}
              >
                <strong>{trail.name}</strong>
                <p style={{ fontSize: '0.8rem', margin: '0.25rem 0 0' }}>{trail.description}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
