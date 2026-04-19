import type { CharacterDraft } from '@/pages/CharacterCreatePage'
import type { ClassId } from '@/types/character'
import { cn } from '@/lib/utils'
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
    <section className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-semibold text-purple-200 tracking-wide mb-2">
          Classe
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Sua classe indica o treinamento recebido na Ordem para enfrentar os perigos do Outro Lado.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {classes.map(cls => {
          const isSelected = draft.classId === cls.id
          return (
            <button
              key={cls.id}
              onClick={() => selectClass(cls.id as ClassId)}
              className={cn(
                'text-left rounded-lg border p-4 transition-all duration-200',
                isSelected
                  ? 'border-purple-500/70 bg-purple-950/40 shadow-[0_0_12px_rgba(147,51,234,0.25)]'
                  : 'border-purple-900/40 bg-[#07050f]/60 hover:border-purple-700/50 hover:bg-purple-950/20'
              )}
            >
              <p className={cn(
                'font-cinzel text-sm font-semibold tracking-wide mb-1.5',
                isSelected ? 'text-purple-200' : 'text-zinc-300'
              )}>
                {cls.name}
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed">{cls.description}</p>
            </button>
          )
        })}
      </div>

      {selectedClass && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="font-cinzel text-base font-semibold text-purple-200 tracking-wide">
              Trilha
            </h3>
            <div className="flex-1 h-px bg-purple-900/40" />
          </div>
          <p className="text-xs text-zinc-500">
            Você escolhe sua trilha ao atingir NEX 10%. Pode selecionar agora para planejar.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedClass.trails.map(trail => {
              const isSelected = draft.trailId === trail.id
              return (
                <button
                  key={trail.id}
                  onClick={() => update({ trailId: trail.id })}
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
                    {trail.name}
                  </p>
                  <p className="text-xs text-zinc-500 leading-relaxed">{trail.description}</p>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
