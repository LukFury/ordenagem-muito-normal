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
    <section className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-semibold text-purple-200 tracking-wide mb-2">
          Atributos
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Todos os atributos começam em 1. Você tem <span className="text-purple-300 font-medium">4 pontos</span> para distribuir.
          Pode reduzir <em>um</em> atributo para 0 e ganhar +1 ponto extra. Máximo inicial: 3.
        </p>
      </div>

      {/* Points tracker */}
      <div className="flex items-center gap-3 p-3 rounded-lg border border-purple-900/40 bg-purple-950/20">
        <span className="text-xs text-zinc-400 font-medium">Pontos disponíveis:</span>
        <span className={cn(
          'text-lg font-bold font-cinzel',
          pointsRemaining < 0 ? 'text-red-400' : pointsRemaining === 0 ? 'text-green-400' : 'text-purple-300'
        )}>
          {pointsRemaining}
        </span>
        <span className="text-xs text-zinc-600">/ Distribuídos: {totalSpent - baseTotal}</span>
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-red-900/60 bg-red-950/20 p-3 space-y-1">
          {errors.map(e => (
            <p key={e} className="text-xs text-red-400 flex items-center gap-2">
              <span>⚠</span> {e}
            </p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(Object.keys(ATTR_LABELS) as AttributeKey[]).map(key => {
          const attrInfo = (attributesData as Array<{ id: string; description: string }>).find(a => a.id === key)
          const val = attrs[key]
          return (
            <div
              key={key}
              className="rounded-lg border border-purple-900/40 bg-[#07050f]/60 p-4 space-y-2 hover:border-purple-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-cinzel text-sm font-semibold text-purple-200 tracking-wide">
                  {ATTR_LABELS[key]}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAttr(key, Math.max(0, val - 1))}
                    className="w-7 h-7 rounded border border-purple-800/60 bg-purple-950/40 text-purple-300 hover:bg-purple-900/60 hover:text-white transition-all flex items-center justify-center text-sm"
                  >
                    −
                  </button>
                  <span className={cn(
                    'w-8 text-center font-bold text-lg font-cinzel',
                    val === 0 ? 'text-zinc-500' : val === 3 ? 'text-purple-300' : 'text-zinc-200'
                  )}>
                    {val}
                  </span>
                  <button
                    onClick={() => setAttr(key, Math.min(3, val + 1))}
                    className="w-7 h-7 rounded border border-purple-800/60 bg-purple-950/40 text-purple-300 hover:bg-purple-900/60 hover:text-white transition-all flex items-center justify-center text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
              {attrInfo && (
                <p className="text-xs text-zinc-500 leading-relaxed">{attrInfo.description}</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
