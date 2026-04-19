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
  const originSkills: string[] = Array.isArray(origin?.trainedSkills) ? origin.trainedSkills as string[] : []

  const classId = draft.classId || null
  const mandatoryClassSkills: string[] = []
  if (classId === 'ocultista') mandatoryClassSkills.push('ocultismo', 'vontade')

  const freeCount = classId ? getFreeSkillCount(classId, draft.attributes.intelecto) : 0
  const autoTrained = new Set([...originSkills, ...mandatoryClassSkills])

  type SkillEntry = { skillId: string; grade: 'treinado' }
  const freeSelected = (draft.skillTraining as SkillEntry[])
    .filter(s => !autoTrained.has(s.skillId))
    .map(s => s.skillId)

  function toggleFree(skillId: string) {
    if (autoTrained.has(skillId)) return
    const isSelected = freeSelected.includes(skillId)
    if (isSelected) {
      update({ skillTraining: (draft.skillTraining as SkillEntry[]).filter(s => s.skillId !== skillId) })
    } else if (freeSelected.length < freeCount) {
      update({ skillTraining: [...(draft.skillTraining as SkillEntry[]), { skillId, grade: 'treinado' as const }] })
    }
  }

  return (
    <section className="space-y-8">
      <div>
        <h3 className="text-xl font-bold uppercase tracking-widest text-on-surface flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary-container">school</span>
          Perícias
        </h3>
      </div>

      <div className="flex items-center gap-4 p-3 bg-surface-container border-l-2 border-secondary">
        <div className="space-y-1 text-[10px] font-mono uppercase tracking-widest">
          {originSkills.length > 0 && (
            <p><span className="text-secondary">Origem: </span><span className="text-on-surface/50">{originSkills.join(' · ')}</span></p>
          )}
          {mandatoryClassSkills.length > 0 && (
            <p><span className="text-secondary">Classe: </span><span className="text-on-surface/50">{mandatoryClassSkills.join(' · ')}</span></p>
          )}
          {classId && (
            <p><span className="text-secondary">Livres: </span>
              <span className={freeSelected.length >= freeCount ? 'text-tertiary' : 'text-on-surface/50'}>
                {freeSelected.length}/{freeCount} selecionadas
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
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
                'text-left p-3 transition-all border-l-4',
                isAuto
                  ? 'bg-surface-container-highest border-secondary cursor-default'
                  : isFreeSelected
                  ? 'bg-surface-container-highest border-tertiary cursor-crosshair'
                  : isDisabled
                  ? 'bg-surface-container border-transparent opacity-30 cursor-not-allowed'
                  : 'bg-surface-container border-transparent hover:bg-surface-container-high hover:border-outline-variant cursor-crosshair'
              )}
            >
              <p className={cn(
                'text-[10px] font-bold uppercase tracking-wide',
                isAuto ? 'text-secondary' : isFreeSelected ? 'text-tertiary' : 'text-on-surface/70'
              )}>
                {skill.name}
              </p>
              <p className="text-[9px] text-on-surface/30 mt-0.5 uppercase">{skill.attribute}</p>
              {isAuto && <p className="text-[9px] text-secondary/50 mt-0.5 uppercase">automática</p>}
            </button>
          )
        })}
      </div>
    </section>
  )
}
