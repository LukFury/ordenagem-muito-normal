import type { CharacterDraft } from '@/pages/CharacterCreatePage'
import { cn } from '@/lib/utils'
import skillsData from '@/data/skills.json'
import originsData from '@/data/origins.json'
import { getFreeSkillCount } from '@/lib/rules'

interface Props {
  draft: CharacterDraft
  update: (p: Partial<CharacterDraft>) => void
}

interface Skill { id: string; name: string; attribute: string; trainedOnly: boolean }
interface Origin { id: string; trainedSkills: string[] | { type: string; count: number } }

export default function StepSkills({ draft, update }: Props) {
  const skills = skillsData as Skill[]
  const origins = originsData as Origin[]

  const origin = origins.find(o => o.id === draft.originId)
  const originSkills: string[] = Array.isArray(origin?.trainedSkills)
    ? origin.trainedSkills as string[]
    : []

  const classId = draft.classId || null
  const mandatoryClassSkills: string[] = []
  if (classId === 'ocultista') {
    mandatoryClassSkills.push('ocultismo', 'vontade')
  }

  const freeCount = classId ? getFreeSkillCount(classId, draft.attributes.intelecto) : 0
  const autoTrained = new Set([...originSkills, ...mandatoryClassSkills])

  type SkillEntry = { skillId: string; grade: 'treinado' }

  const freeSelected = (draft.skillTraining as SkillEntry[])
    .filter((s: SkillEntry) => !autoTrained.has(s.skillId))
    .map((s: SkillEntry) => s.skillId)

  function toggleFree(skillId: string) {
    if (autoTrained.has(skillId)) return
    const isSelected = freeSelected.includes(skillId)
    if (isSelected) {
      update({ skillTraining: (draft.skillTraining as SkillEntry[]).filter((s: SkillEntry) => s.skillId !== skillId) })
    } else if (freeSelected.length < freeCount) {
      update({ skillTraining: [...(draft.skillTraining as SkillEntry[]), { skillId, grade: 'treinado' as const }] })
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-semibold text-purple-200 tracking-wide mb-2">
          Perícias
        </h2>
      </div>

      {/* Summary bar */}
      <div className="rounded-lg border border-purple-900/40 bg-purple-950/20 p-3 space-y-1.5 text-xs text-zinc-400">
        {originSkills.length > 0 && (
          <p><span className="text-purple-400 font-medium">Origem:</span> {originSkills.join(', ')}</p>
        )}
        {mandatoryClassSkills.length > 0 && (
          <p><span className="text-purple-400 font-medium">Classe:</span> {mandatoryClassSkills.join(', ')}</p>
        )}
        {classId && (
          <p>
            <span className="text-purple-400 font-medium">Livres:</span>{' '}
            {freeSelected.length}/{freeCount} selecionadas
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {skills.map(skill => {
          const isAuto = autoTrained.has(skill.id)
          const isFreeSelected = freeSelected.includes(skill.id)
          const isDisabled = !isAuto && !isFreeSelected && freeSelected.length >= freeCount

          return (
            <button
              key={skill.id}
              onClick={() => toggleFree(skill.id)}
              disabled={isDisabled && !isAuto}
              className={cn(
                'text-left rounded border p-2.5 transition-all duration-150',
                isAuto
                  ? 'border-purple-600/50 bg-purple-900/30 cursor-default'
                  : isFreeSelected
                  ? 'border-purple-500/70 bg-purple-950/40 shadow-[0_0_8px_rgba(147,51,234,0.2)]'
                  : isDisabled
                  ? 'border-purple-900/20 bg-[#07050f]/40 opacity-40 cursor-not-allowed'
                  : 'border-purple-900/40 bg-[#07050f]/60 hover:border-purple-700/60 hover:bg-purple-950/20 cursor-pointer'
              )}
            >
              <p className={cn(
                'text-xs font-medium',
                isAuto ? 'text-purple-300' : isFreeSelected ? 'text-purple-200' : 'text-zinc-400'
              )}>
                {skill.name}
              </p>
              <p className="text-[10px] text-zinc-600 mt-0.5">{skill.attribute}</p>
              {isAuto && <p className="text-[9px] text-purple-600 mt-0.5">automática</p>}
            </button>
          )
        })}
      </div>
    </section>
  )
}
