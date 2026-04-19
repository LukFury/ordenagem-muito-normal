import type { CharacterDraft } from '@/pages/CharacterCreatePage'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  draft: CharacterDraft
  update: (p: Partial<CharacterDraft>) => void
}

export default function StepConcept({ draft, update }: Props) {
  return (
    <section className="space-y-10 max-w-lg">
      <div>
        <h3 className="text-xl font-bold uppercase tracking-widest text-on-surface flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary-container">badge</span>
          Identidade do Agente
        </h3>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Quem é o seu personagem? O seu{' '}
          <span className="bg-on-surface text-background px-1 font-bold">passado</span>{' '}
          define o seu perfil de resposta ao paranormal.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <Label htmlFor="name">Nome do Personagem</Label>
          <Input
            id="name"
            value={draft.name}
            onChange={e => update({ name: e.target.value })}
            placeholder="NOME COMPLETO"
          />
        </div>

        <div>
          <Label htmlFor="concept">Conceito</Label>
          <p className="text-[10px] text-on-surface/30 font-mono mb-3 uppercase tracking-widest">
            Uma frase. Quem eras antes de tudo isto?
          </p>
          <Input
            id="concept"
            value={draft.concept}
            onChange={e => update({ concept: e.target.value })}
            placeholder="EX: CIENTISTA FORENSE QUE AINDA NÃO ACREDITA"
          />
        </div>
      </div>
    </section>
  )
}
