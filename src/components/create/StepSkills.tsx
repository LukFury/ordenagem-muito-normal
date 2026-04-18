import type { CharacterDraft } from '@/pages/CharacterCreatePage'
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
    <section>
      <h2>Perícias</h2>

      {origin && (
        <p>
          <strong>Perícias da origem ({origin.id}):</strong>{' '}
          {originSkills.length > 0 ? originSkills.join(', ') : '2 à escolha do mestre'}
        </p>
      )}
      {mandatoryClassSkills.length > 0 && (
        <p><strong>Perícias obrigatórias da classe:</strong> {mandatoryClassSkills.join(', ')}</p>
      )}
      {classId && (
        <p>
          Escolha mais <strong>{freeCount}</strong> perícia(s) ({freeSelected.length}/{freeCount} selecionadas)
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
        {skills.map(skill => {
          const isAuto = autoTrained.has(skill.id)
          const isFreeSelected = freeSelected.includes(skill.id)
          const isDisabled = !isAuto && !isFreeSelected && freeSelected.length >= freeCount

          return (
            <button
              key={skill.id}
              onClick={() => toggleFree(skill.id)}
              disabled={isDisabled}
              style={{
                textAlign: 'left',
                padding: '0.5rem',
                border: isAuto
                  ? '2px solid #888'
                  : isFreeSelected
                  ? '2px solid #333'
                  : '1px solid #ccc',
                borderRadius: 4,
                background: isAuto ? '#e8e8e8' : isFreeSelected ? '#f0f0f0' : 'white',
                cursor: isAuto ? 'default' : isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.5 : 1,
              }}
            >
              <strong style={{ fontSize: '0.85rem' }}>{skill.name}</strong>
              <br />
              <small style={{ fontSize: '0.7rem', color: '#666' }}>{skill.attribute}</small>
              {isAuto && <small style={{ fontSize: '0.7rem', color: '#888' }}> (automática)</small>}
            </button>
          )
        })}
      </div>
    </section>
  )
}
