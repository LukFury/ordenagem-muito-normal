import type { CharacterDraft } from '@/pages/CharacterCreatePage'
import type { AttributeKey } from '@/types/character'
import attributesData from '@/data/attributes.json'

interface Props {
  draft: CharacterDraft
  update: (p: Partial<CharacterDraft>) => void
  errors: string[]
}

const ATTR_LABELS: Record<AttributeKey, string> = {
  agilidade: 'Agilidade',
  forca: 'Força',
  intelecto: 'Intelecto',
  presenca: 'Presença',
  vigor: 'Vigor',
}

export default function StepAttributes({ draft, update, errors }: Props) {
  const attrs = draft.attributes
  const totalSpent = (Object.values(attrs) as number[]).reduce((a, b) => a + b, 0)
  const baseTotal = 5 // all start at 1
  const pointsRemaining = 9 - totalSpent // 5 base + 4 to distribute (or +5 if one is 0)

  function setAttr(key: AttributeKey, value: number) {
    update({ attributes: { ...attrs, [key]: value } })
  }

  return (
    <section>
      <h2>Atributos</h2>
      <p>
        Todos os atributos começam em 1. Você tem <strong>4 pontos</strong> para distribuir.
        Pode reduzir <em>um</em> atributo para 0 e ganhar +1 ponto extra. Máximo inicial: 3.
      </p>
      <p>Pontos disponíveis: <strong>{pointsRemaining}</strong> / Distribuídos além da base: <strong>{totalSpent - baseTotal}</strong></p>

      {errors.length > 0 && (
        <ul style={{ color: 'red' }}>
          {errors.map(e => <li key={e}>{e}</li>)}
        </ul>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        {(Object.keys(ATTR_LABELS) as AttributeKey[]).map(key => {
          const attrInfo = (attributesData as Array<{ id: string; description: string }>).find(a => a.id === key)
          return (
            <div key={key} style={{ border: '1px solid #ccc', borderRadius: 6, padding: '0.75rem' }}>
              <strong>{ATTR_LABELS[key]}</strong>
              <p style={{ fontSize: '0.8rem', margin: '0.25rem 0 0.5rem' }}>{attrInfo?.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={() => setAttr(key, Math.max(0, attrs[key] - 1))}>–</button>
                <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 'bold' }}>{attrs[key]}</span>
                <button onClick={() => setAttr(key, Math.min(3, attrs[key] + 1))}>+</button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
