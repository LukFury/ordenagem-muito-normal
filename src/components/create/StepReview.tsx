import type { CharacterDraft } from '@/pages/CharacterCreatePage'
import type { DerivedStats } from '@/types/character'

interface Props {
  draft: CharacterDraft
  derivedStats: DerivedStats | null
  onSave: () => void
}

export default function StepReview({ draft, derivedStats, onSave }: Props) {
  return (
    <section>
      <h2>Revisar Personagem</h2>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
        <tbody>
          <tr><td><strong>Nome</strong></td><td>{draft.name || '—'}</td></tr>
          <tr><td><strong>Conceito</strong></td><td>{draft.concept || '—'}</td></tr>
          <tr><td><strong>Origem</strong></td><td>{draft.originId || '—'}</td></tr>
          <tr><td><strong>Classe</strong></td><td>{draft.classId || '—'}</td></tr>
          <tr><td><strong>Trilha</strong></td><td>{draft.trailId || '—'}</td></tr>
          <tr><td><strong>NEX</strong></td><td>{draft.nex}</td></tr>
        </tbody>
      </table>

      <h3>Atributos</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
        <tbody>
          {(Object.entries(draft.attributes) as [string, number][]).map(([k, v]) => (
            <tr key={k}><td><strong>{k}</strong></td><td>{v}</td></tr>
          ))}
        </tbody>
      </table>

      {derivedStats && (
        <>
          <h3>Estatísticas Derivadas</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
            <tbody>
              <tr><td><strong>PV (Pontos de Vida)</strong></td><td>{derivedStats.hp}</td></tr>
              <tr><td><strong>PE (Pontos de Esforço)</strong></td><td>{derivedStats.pe}</td></tr>
              <tr><td><strong>Sanidade</strong></td><td>{derivedStats.san}</td></tr>
              <tr><td><strong>Defesa</strong></td><td>{derivedStats.defense}</td></tr>
              <tr><td><strong>Limite de PE por turno</strong></td><td>{derivedStats.nexPELimit}</td></tr>
            </tbody>
          </table>
        </>
      )}

      {draft.skillTraining.length > 0 && (
        <>
          <h3>Perícias Treinadas</h3>
          <p>{draft.skillTraining.map((s: { skillId: string; grade: string }) => s.skillId).join(', ')}</p>
        </>
      )}

      <button
        onClick={onSave}
        style={{ marginTop: '1.5rem', padding: '0.75rem 2rem', fontSize: '1rem', cursor: 'pointer' }}
      >
        Salvar Personagem
      </button>
    </section>
  )
}
