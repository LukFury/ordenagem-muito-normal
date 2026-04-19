import type { CharacterDraft } from '@/pages/CharacterCreatePage'
import type { AttributeKey } from '@/types/character'
import { cn } from '@/lib/utils'
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
  const baseTotal = 5
  const pointsRemaining = 9 - totalSpent

  function setAttr(key: AttributeKey, value: number) {
    update({ attributes: { ...attrs, [key]: value } })
  }

  return (
    <section className="space-y-8">
      <div>
        <h3 className="text-xl font-bold uppercase tracking-widest text-on-surface flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary-container">analytics</span>
          Avaliação de Capacidades
        </h3>
        <p className="text-sm text-on-surface-variant leading-relaxed max-w-md">
          Todos os atributos começam em 1. Tens{' '}
          <span className="bg-on-surface text-background px-1 font-bold">4 pontos</span>{' '}
          para distribuir. Podes reduzir um atributo para 0 e ganhar +1 ponto extra. Máximo inicial: 3.
        </p>
      </div>

      <div className="flex items-center gap-4 p-3 bg-surface-container border-l-2 border-secondary">
        <span className="text-[10px] font-mono text-on-surface/50 uppercase tracking-widest">Pontos Disponíveis:</span>
        <span className={cn(
          'text-2xl font-mono font-bold',
          pointsRemaining < 0 ? 'text-primary-container' : pointsRemaining === 0 ? 'text-tertiary' : 'text-secondary'
        )}>
          {pointsRemaining}
        </span>
        <span className="text-[10px] font-mono text-on-surface/30 uppercase">/ Distribuídos: {totalSpent - baseTotal}</span>
      </div>

      {errors.length > 0 && (
        <div className="bg-error-container/20 border-l-4 border-error-container p-3 space-y-1">
          {errors.map(e => (
            <p key={e} className="text-[10px] font-mono text-primary uppercase tracking-wider">⚠ {e}</p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {(Object.keys(ATTR_LABELS) as AttributeKey[]).map(key => {
          const attrInfo = (attributesData as Array<{ id: string; description: string }>).find(a => a.id === key)
          const val = attrs[key]
          return (
            <div key={key} className="bg-surface-container-highest p-4 flex items-center justify-between gap-4 hover:bg-surface-bright transition-all">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface mb-1">{ATTR_LABELS[key]}</p>
                {attrInfo && <p className="text-[10px] text-on-surface/40 leading-tight line-clamp-2">{attrInfo.description}</p>}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setAttr(key, Math.max(0, val - 1))}
                  className="w-8 h-8 flex items-center justify-center bg-surface-container text-on-surface/60 hover:text-on-surface hover:bg-surface-container-low transition-all font-mono text-lg cursor-crosshair"
                >
                  −
                </button>
                <span className={cn(
                  'w-8 text-center font-mono text-xl font-bold',
                  val === 0 ? 'text-on-surface/30' : val === 3 ? 'text-secondary' : 'text-on-surface'
                )}>
                  {val}
                </span>
                <button
                  onClick={() => setAttr(key, Math.min(3, val + 1))}
                  className="w-8 h-8 flex items-center justify-center bg-surface-container text-on-surface/60 hover:text-on-surface hover:bg-surface-container-low transition-all font-mono text-lg cursor-crosshair"
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
