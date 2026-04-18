import type { CharacterDraft } from '@/pages/CharacterCreatePage'

interface Props {
  draft: CharacterDraft
  update: (p: Partial<CharacterDraft>) => void
}

export default function StepConcept({ draft, update }: Props) {
  return (
    <section>
      <h2>Conceito</h2>
      <p>Quem é o seu personagem? Pense no que fazia antes de encontrar o paranormal.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        <label>
          <strong>Nome do personagem</strong>
          <input
            type="text"
            value={draft.name}
            onChange={e => update({ name: e.target.value })}
            placeholder="Ex: Maria Silva"
            style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
          />
        </label>
        <label>
          <strong>Conceito (uma frase)</strong>
          <input
            type="text"
            value={draft.concept}
            onChange={e => update({ concept: e.target.value })}
            placeholder="Ex: Cientista forense cética que não acredita no paranormal — ainda."
            style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
          />
        </label>
      </div>
    </section>
  )
}
