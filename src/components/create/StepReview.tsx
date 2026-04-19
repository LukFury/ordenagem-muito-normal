import type { CharacterDraft } from '@/pages/CharacterCreatePage'
import type { DerivedStats } from '@/types/character'

interface Props {
  draft: CharacterDraft
  derivedStats: DerivedStats | null
  onSave: () => void
  saving: boolean
  saveError: string
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-outline-variant/10 last:border-0">
      <span className="text-[9px] font-mono text-on-surface/40 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-mono text-on-surface">{value || '—'}</span>
    </div>
  )
}

export default function StepReview({ draft, derivedStats, onSave, saving, saveError }: Props) {
  return (
    <section className="space-y-8">
      <div>
        <h3 className="text-xl font-bold uppercase tracking-widest text-on-surface flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary-container">fact_check</span>
          Revisão do Dossiê
        </h3>
        <p className="text-sm text-on-surface-variant">Confirma os dados antes de finalizar o registo.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        <div className="bg-surface-container-highest p-5">
          <p className="text-[9px] font-mono text-secondary uppercase tracking-widest mb-4">Identidade</p>
          <Row label="Nome" value={draft.name} />
          <Row label="Conceito" value={draft.concept} />
          <Row label="Origem" value={draft.originId} />
          <Row label="Classe" value={draft.classId} />
          <Row label="Trilha" value={draft.trailId} />
          <Row label="NEX" value={draft.nex} />
        </div>

        <div className="bg-surface-container-highest p-5">
          <p className="text-[9px] font-mono text-secondary uppercase tracking-widest mb-4">Atributos</p>
          {(Object.entries(draft.attributes) as [string, number][]).map(([k, v]) => (
            <Row key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} value={v} />
          ))}
        </div>

        {derivedStats && (
          <div className="bg-surface-container-highest p-5 border-l-4 border-tertiary">
            <p className="text-[9px] font-mono text-tertiary uppercase tracking-widest mb-4">Estatísticas Derivadas</p>
            <Row label="PV" value={derivedStats.hp} />
            <Row label="PE" value={derivedStats.pe} />
            <Row label="Sanidade" value={derivedStats.san} />
            <Row label="Defesa" value={derivedStats.defense} />
            <Row label="Limite PE/turno" value={derivedStats.nexPELimit} />
          </div>
        )}

        {draft.skillTraining.length > 0 && (
          <div className="bg-surface-container-highest p-5">
            <p className="text-[9px] font-mono text-secondary uppercase tracking-widest mb-4">Perícias Treinadas</p>
            <p className="text-xs text-on-surface-variant font-mono">
              {draft.skillTraining.map((s: { skillId: string; grade: string }) => s.skillId).join(', ')}
            </p>
          </div>
        )}
      </div>

      {saveError && (
        <div className="bg-error-container/20 border-l-4 border-error-container p-3">
          <p className="text-[10px] font-mono text-primary uppercase tracking-wider">{saveError}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-8 py-4 bg-primary-container hover:bg-on-primary-fixed-variant disabled:opacity-50 text-on-primary-container font-bold text-sm uppercase tracking-widest transition-all flex items-center gap-4 group cursor-crosshair"
        >
          <span>{saving ? 'A guardar...' : 'Guardar Personagem'}</span>
          <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">save</span>
        </button>
      </div>
    </section>
  )
}
