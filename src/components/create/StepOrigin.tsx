import type { CharacterDraft } from '@/pages/CharacterCreatePage'
import { cn } from '@/lib/utils'
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
    <section className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-semibold text-purple-200 tracking-wide mb-2">
          Origem
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          O que você fazia antes de se envolver com o paranormal e entrar na Ordem da Realidade?
          Cada origem fornece <span className="text-purple-300">duas perícias treinadas</span> e um <span className="text-purple-300">poder exclusivo</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {origins.map(origin => {
          const isSelected = draft.originId === origin.id
          return (
            <button
              key={origin.id}
              onClick={() => update({ originId: origin.id })}
              className={cn(
                'text-left rounded-lg border p-4 transition-all duration-200',
                isSelected
                  ? 'border-purple-500/70 bg-purple-950/40 shadow-[0_0_12px_rgba(147,51,234,0.25)]'
                  : 'border-purple-900/40 bg-[#07050f]/60 hover:border-purple-700/50 hover:bg-purple-950/20'
              )}
            >
              <p className={cn(
                'font-cinzel text-sm font-semibold tracking-wide mb-1',
                isSelected ? 'text-purple-200' : 'text-zinc-300'
              )}>
                {origin.name}
              </p>
              <p className="text-xs text-zinc-500">
                {Array.isArray(origin.trainedSkills)
                  ? origin.trainedSkills.join(', ')
                  : '2 à escolha do mestre'}
              </p>
            </button>
          )
        })}
      </div>

      {selected && (
        <div className="rounded-lg border border-purple-700/40 bg-purple-950/20 p-5 space-y-3">
          <h3 className="font-cinzel text-base font-semibold text-purple-200 tracking-wide">
            {selected.name}
          </h3>
          <p className="text-sm text-zinc-300 leading-relaxed">{selected.description}</p>
          <div className="border-t border-purple-900/40 pt-3 space-y-2">
            <p className="text-xs text-zinc-400">
              <span className="text-purple-400 font-medium">Perícias treinadas: </span>
              {Array.isArray(selected.trainedSkills)
                ? selected.trainedSkills.join(' e ')
                : '2 à escolha do mestre'}
            </p>
            <p className="text-xs text-zinc-400">
              <span className="text-purple-400 font-medium">{selected.power.name}. </span>
              {selected.power.description}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
