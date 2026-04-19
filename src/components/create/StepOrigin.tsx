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
    <section className="space-y-8">
      <div>
        <h3 className="text-xl font-bold uppercase tracking-widest text-on-surface flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary-container">history_edu</span>
          Ficheiro de Origem
        </h3>
        <p className="text-sm text-on-surface-variant leading-relaxed max-w-md">
          O que fazias antes do paranormal? Cada origem concede{' '}
          <span className="bg-on-surface text-background px-1 font-bold">duas perícias treinadas</span>{' '}
          e um poder exclusivo.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {origins.map(origin => {
          const isSelected = draft.originId === origin.id
          return (
            <button
              key={origin.id}
              onClick={() => update({ originId: origin.id })}
              className={cn(
                'text-left p-4 transition-all cursor-crosshair border-l-4',
                isSelected
                  ? 'bg-surface-container-highest border-secondary'
                  : 'bg-surface-container border-transparent hover:bg-surface-container-high hover:border-outline-variant'
              )}
            >
              <p className={cn(
                'text-[10px] font-bold uppercase tracking-widest mb-1',
                isSelected ? 'text-secondary' : 'text-on-surface'
              )}>
                {origin.name}
              </p>
              <p className="text-[10px] text-on-surface/40 uppercase tracking-wide">
                {Array.isArray(origin.trainedSkills)
                  ? origin.trainedSkills.join(' · ')
                  : '2 à escolha do mestre'}
              </p>
            </button>
          )
        })}
      </div>

      {selected && (
        <div className="bg-surface-container-highest p-6 border-l-4 border-tertiary space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest bg-tertiary/10 px-2 py-0.5">Dossiê</span>
            <span className="text-sm font-headline font-bold italic text-on-surface">{selected.name}</span>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">{selected.description}</p>
          <div className="border-t border-outline-variant/20 pt-4 space-y-2">
            <p className="text-[10px] text-on-surface/50 uppercase tracking-widest">
              <span className="text-secondary">Perícias treinadas: </span>
              {Array.isArray(selected.trainedSkills)
                ? selected.trainedSkills.join(' e ')
                : '2 à escolha do mestre'}
            </p>
            <p className="text-[10px] text-on-surface/50 uppercase tracking-widest">
              <span className="text-tertiary">{selected.power.name}: </span>
              {selected.power.description}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
