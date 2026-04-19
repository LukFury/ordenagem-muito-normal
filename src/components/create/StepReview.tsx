import type { CharacterDraft } from '@/pages/CharacterCreatePage'
import type { DerivedStats } from '@/types/character'
import { cn } from '@/lib/utils'

interface Props {
  draft: CharacterDraft
  derivedStats: DerivedStats | null
  onSave: () => void
  saving: boolean
  saveError: string
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-purple-900/30 last:border-0">
      <span className="text-xs text-zinc-500 font-medium">{label}</span>
      <span className={cn('text-sm', value ? 'text-zinc-200' : 'text-zinc-600')}>
        {value || '—'}
      </span>
    </div>
  )
}

export default function StepReview({ draft, derivedStats, onSave, saving, saveError }: Props) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-semibold text-purple-200 tracking-wide mb-2">
          Revisar Personagem
        </h2>
        <p className="text-zinc-400 text-sm">Confirme os detalhes antes de finalizar.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Identity */}
        <div className="rounded-lg border border-purple-900/40 bg-[#07050f]/60 p-4">
          <h3 className="font-cinzel text-xs font-semibold text-purple-400 tracking-widest uppercase mb-3">
            Identidade
          </h3>
          <Row label="Nome" value={draft.name} />
          <Row label="Conceito" value={draft.concept} />
          <Row label="Origem" value={draft.originId} />
          <Row label="Classe" value={draft.classId} />
          <Row label="Trilha" value={draft.trailId} />
          <Row label="NEX" value={draft.nex} />
        </div>

        {/* Attributes */}
        <div className="rounded-lg border border-purple-900/40 bg-[#07050f]/60 p-4">
          <h3 className="font-cinzel text-xs font-semibold text-purple-400 tracking-widest uppercase mb-3">
            Atributos
          </h3>
          {(Object.entries(draft.attributes) as [string, number][]).map(([k, v]) => (
            <Row key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} value={v} />
          ))}
        </div>

        {/* Derived stats */}
        {derivedStats && (
          <div className="rounded-lg border border-purple-700/30 bg-purple-950/20 p-4">
            <h3 className="font-cinzel text-xs font-semibold text-purple-400 tracking-widest uppercase mb-3">
              Estatísticas Derivadas
            </h3>
            <Row label="PV (Pontos de Vida)" value={derivedStats.hp} />
            <Row label="PE (Pontos de Esforço)" value={derivedStats.pe} />
            <Row label="Sanidade" value={derivedStats.san} />
            <Row label="Defesa" value={derivedStats.defense} />
            <Row label="Limite PE/turno" value={derivedStats.nexPELimit} />
          </div>
        )}

        {/* Skills */}
        {draft.skillTraining.length > 0 && (
          <div className="rounded-lg border border-purple-900/40 bg-[#07050f]/60 p-4">
            <h3 className="font-cinzel text-xs font-semibold text-purple-400 tracking-widest uppercase mb-3">
              Perícias Treinadas
            </h3>
            <p className="text-sm text-zinc-300">
              {draft.skillTraining.map((s: { skillId: string; grade: string }) => s.skillId).join(', ')}
            </p>
          </div>
        )}
      </div>

      {saveError && (
        <p className="text-xs text-red-400 border border-red-900/40 bg-red-950/20 rounded px-3 py-2">
          {saveError}
        </p>
      )}

      <div className="flex justify-end pt-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-8 py-3 rounded bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white font-cinzel text-sm tracking-wide shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_28px_rgba(147,51,234,0.6)] transition-all"
        >
          {saving ? 'Salvando...' : 'Salvar Personagem'}
        </button>
      </div>
    </section>
  )
}
