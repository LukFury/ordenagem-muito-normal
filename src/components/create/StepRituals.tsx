import type { CharacterDraft } from '@/pages/CharacterCreatePage'
import ritualsData from '@/data/rituals.json'
import { cn } from '@/lib/utils'

interface Props {
  draft: CharacterDraft
  update: (p: Partial<CharacterDraft>) => void
}

interface RitualEntry {
  id: string
  name: string
  element: string
  peCost: number
  summary: string
}

const REQUIRED = 3

export default function StepRituals({ draft, update }: Props) {
  const catalog = (ritualsData as Record<string, unknown>).catalog as Record<string, Record<string, RitualEntry[]>>
  const circle1 = catalog['1'] ?? {}
  const allRituals: RitualEntry[] = Object.values(circle1).flat()

  function toggle(ritualId: string) {
    const current = draft.classRituals
    let next: string[]
    if (current.includes(ritualId)) {
      next = current.filter(r => r !== ritualId)
    } else if (current.length < REQUIRED) {
      next = [...current, ritualId]
    } else {
      return
    }
    update({ classRituals: next, knownRituals: next })
  }

  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-xl font-bold uppercase tracking-widest text-on-surface flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary-container">auto_awesome</span>
          Rituais Iniciais
        </h3>
        <p className="text-sm text-on-surface-variant leading-relaxed max-w-md">
          Como Ocultista, você começa com 3 rituais de 1º círculo. Estes não contam no limite de rituais via poder.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-on-surface/50 uppercase tracking-widest">Selecionados:</span>
        <span className={cn(
          'text-[10px] font-bold font-mono uppercase tracking-widest',
          draft.classRituals.length === REQUIRED ? 'text-secondary' : 'text-primary-container'
        )}>
          {draft.classRituals.length}/{REQUIRED}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {allRituals.map(ritual => {
          const isSelected = draft.classRituals.includes(ritual.id)
          const isFull = draft.classRituals.length >= REQUIRED && !isSelected
          return (
            <button
              key={ritual.id}
              onClick={() => toggle(ritual.id)}
              disabled={isFull}
              className={cn(
                'text-left p-4 transition-all cursor-crosshair border-l-4',
                isSelected
                  ? 'bg-surface-container-highest border-tertiary'
                  : isFull
                  ? 'bg-surface-container/30 border-transparent opacity-40 cursor-not-allowed'
                  : 'bg-surface-container border-transparent hover:bg-surface-container-high hover:border-outline-variant'
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className={cn(
                  'text-[10px] font-bold uppercase tracking-widest',
                  isSelected ? 'text-tertiary' : 'text-on-surface'
                )}>
                  {ritual.name}
                </p>
                <span className="text-[9px] font-mono text-outline uppercase shrink-0">{ritual.element}</span>
              </div>
              <p className="text-[10px] text-on-surface/40 leading-relaxed">{ritual.summary}</p>
            </button>
          )
        })}
      </div>
    </section>
  )
}
