import type { CharacterDraft } from '@/pages/CharacterCreatePage'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  draft: CharacterDraft
  update: (p: Partial<CharacterDraft>) => void
}

export default function StepConcept({ draft, update }: Props) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-cinzel text-2xl font-semibold text-purple-200 tracking-wide mb-2">
          Conceito
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed">
          Quem é o seu personagem? Pense no que fazia antes de encontrar o paranormal e a Ordem da Realidade.
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do personagem</Label>
          <Input
            id="name"
            value={draft.name}
            onChange={e => update({ name: e.target.value })}
            placeholder="Ex: Maria Silva"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="concept">Conceito</Label>
          <p className="text-xs text-zinc-500">Uma frase que define quem você é</p>
          <Input
            id="concept"
            value={draft.concept}
            onChange={e => update({ concept: e.target.value })}
            placeholder="Ex: Cientista forense cética que não acredita no paranormal — ainda."
          />
        </div>
      </div>
    </section>
  )
}
