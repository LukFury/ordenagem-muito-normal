import type { CharacterDraft } from '@/pages/CharacterCreatePage'
import type { ClassId } from '@/types/character'
import { cn } from '@/lib/utils'
import classesData from '@/data/classes.json'

interface Props {
  draft: CharacterDraft
  update: (p: Partial<CharacterDraft>) => void
}

interface Trail { id: string; name: string; description: string }
interface ClassEntry { id: string; name: string; description: string; trails: Trail[] }

export default function StepClass({ draft, update }: Props) {
  const classes = classesData as ClassEntry[]
  const selectedClass = classes.find(c => c.id === draft.classId)

  function selectClass(id: ClassId) {
    update({ classId: id, trailId: '', knownRituals: [], classRituals: [] })
  }

  return (
    <section className="space-y-8">
      <div>
        <h3 className="text-xl font-bold uppercase tracking-widest text-on-surface flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary-container">military_tech</span>
          Classificação Operacional
        </h3>
        <p className="text-sm text-on-surface-variant leading-relaxed max-w-md">
          A tua classe define o treino recebido na Ordem para enfrentar os perigos do Outro Lado.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
        {classes.map(cls => {
          const isSelected = draft.classId === cls.id
          return (
            <button
              key={cls.id}
              onClick={() => selectClass(cls.id as ClassId)}
              className={cn(
                'text-left p-5 transition-all cursor-crosshair border-l-4',
                isSelected
                  ? 'bg-surface-container-highest border-secondary'
                  : 'bg-surface-container border-transparent hover:bg-surface-container-high hover:border-outline-variant'
              )}
            >
              <p className={cn(
                'text-[10px] font-bold uppercase tracking-widest mb-2',
                isSelected ? 'text-secondary' : 'text-on-surface'
              )}>
                {cls.name}
              </p>
              <p className="text-[10px] text-on-surface/40 leading-relaxed">{cls.description}</p>
            </button>
          )
        })}
      </div>

      {selectedClass && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-on-surface/40 uppercase tracking-widest">Especialização de Trilha</span>
            <div className="flex-1 h-px bg-outline-variant/20" />
            <span className="text-[9px] font-mono text-on-surface/20 uppercase">Disponível no NEX 10%</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {selectedClass.trails.map(trail => {
              const isSelected = draft.trailId === trail.id
              return (
                <button
                  key={trail.id}
                  onClick={() => update({ trailId: trail.id })}
                  className={cn(
                    'text-left p-4 transition-all cursor-crosshair border-l-4',
                    isSelected
                      ? 'bg-surface-container-highest border-tertiary'
                      : 'bg-surface-container border-transparent hover:bg-surface-container-high hover:border-outline-variant'
                  )}
                >
                  <p className={cn(
                    'text-[10px] font-bold uppercase tracking-widest mb-1',
                    isSelected ? 'text-tertiary' : 'text-on-surface'
                  )}>
                    {trail.name}
                  </p>
                  <p className="text-[10px] text-on-surface/40 leading-relaxed">{trail.description}</p>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
