import { cn } from '@/lib/utils'
import type { InventoryItem } from '@/pages/CharacterSheetPage'
import type { Attributes } from '@/types/character'

interface Props {
  item: InventoryItem
  attributes: Attributes
  meleeDamageBonus?: number
  firearmDamageBonus?: number
  hasTiroCerteiro?: boolean
  hasMiraDeElite?: boolean
  hasGolpePesado?: boolean
  hasTecnicaLetal?: boolean
  isFavorita?: boolean
  isAniquilador?: boolean
  favoritaCategoryReduction?: number
  favoritaMargemBonus?: number
  favoritaExtraDie?: boolean
  onToggleFavorita?: () => void
  onRoll: (label: string, notation: string, modifier: number, breakdown: { label: string; value: number }[]) => void
  onClose: () => void
}

const DAMAGE_TYPE_LABELS: Record<string, string> = {
  C: 'Cortante', P: 'Perfurante', I: 'Impacto', B: 'Balístico', Fogo: 'Fogo',
}

const RANGE_LABELS: Record<string, string> = {
  curto: 'Curto', medio: 'Médio', longo: 'Longo',
}

function addDie(notation: string): string {
  const match = notation.match(/^(\d+)(d\d+.*)$/)
  if (!match) return notation
  return `${parseInt(match[1]) + 1}${match[2]}`
}

function applyMargemAmeaca(critical: string, bonus: number): string {
  const parts = critical.split('/')
  const threshPart = parts.find(p => /^\d+$/.test(p))
  const multPart = parts.find(p => /^x\d+$/.test(p))
  const threshold = threshPart ? parseInt(threshPart) : 20
  const newThreshold = threshold - bonus
  const pieces: string[] = [String(newThreshold)]
  if (multPart) pieces.push(multPart)
  return pieces.join('/')
}

function parseDamageOptions(damage: string): { label: string; notation: string }[] {
  if (!damage || damage === 'varies') return []
  // Strip non-dice suffixes like "+veneno"
  const clean = damage.replace(/\+[^d0-9].*/i, '')
  if (clean.includes('/')) {
    const [oneMao, duasMaos] = clean.split('/')
    return [
      { label: `Uma mão (${oneMao})`, notation: oneMao },
      { label: `Duas mãos (${duasMaos})`, notation: duasMaos },
    ]
  }
  return [{ label: clean, notation: clean }]
}

export default function ItemDetailModal({ item, attributes, meleeDamageBonus = 0, firearmDamageBonus = 0, hasTiroCerteiro = false, hasMiraDeElite = false, hasGolpePesado = false, hasTecnicaLetal = false, isFavorita = false, isAniquilador = false, favoritaCategoryReduction = 0, favoritaMargemBonus = 0, favoritaExtraDie = false, onToggleFavorita, onRoll, onClose }: Props) {
  const d = item.item_data as Record<string, unknown>
  const isWeapon = item.item_type === 'weapon'
  const isArmor = item.item_type === 'armor'

  // Pre-cast all fields to avoid unknown in JSX
  const damage = d.damage != null ? String(d.damage) : null
  const critical = d.critical != null ? String(d.critical) : null
  const range = d.range != null ? String(d.range) : null
  const damageType = d.damageType != null ? String(d.damageType) : null
  const ammo = d.ammo != null ? String(d.ammo) : null
  const defenseBonus = d.defenseBonus != null ? Number(d.defenseBonus) : null
  const spaces = d.spaces != null ? Number(d.spaces) : null
  const special = Array.isArray(d.special) ? (d.special as string[]) : []

  const damageOptions = isWeapon ? parseDamageOptions(damage ?? '') : []

  // Determine attack attribute
  const hasRange = !!(d.range)
  const hasAmmo = !!(d.ammo)
  const isAgil = Array.isArray(d.special) && (d.special as string[]).includes('agil')
  const isRanged = hasRange || hasAmmo
  const isMelee = !isRanged

  // Critical threshold after passive margem de ameaça bonuses
  const totalMargemBonus = (hasTecnicaLetal && isMelee ? 2 : 0) + (isFavorita ? favoritaMargemBonus : 0)
  const displayCritical = totalMargemBonus > 0 && critical ? applyMargemAmeaca(critical, totalMargemBonus) : critical

  // Extra dice from Golpe Pesado and Máquina de Matar (favorita)
  const diceToAdd = (hasGolpePesado && isMelee ? 1 : 0) + (isFavorita && favoritaExtraDie ? 1 : 0)

  let attackAttr: keyof Attributes
  let attackLabel: string
  let skillLabel: string

  if (isRanged && !isAgil) {
    attackAttr = 'agilidade'
    attackLabel = 'Agilidade'
    skillLabel = 'Pontaria'
  } else if (isAgil) {
    attackAttr = 'agilidade'
    attackLabel = 'Agilidade'
    skillLabel = 'Luta / Ágil'
  } else {
    attackAttr = 'forca'
    attackLabel = 'Força'
    skillLabel = 'Luta'
  }

  const attackMod = attributes[attackAttr]

  function handleAttack() {
    onRoll(
      `Ataque — ${item.name}`,
      '1d20',
      attackMod,
      [{ label: attackLabel, value: attackMod }]
    )
  }

  function handleDamage(notation: string, label: string) {
    const isArremessavel = special.includes('arremessavel')
    const isFirearm = hasAmmo && item.item_id !== 'arco-composto'
    const originBonus = isRanged ? firearmDamageBonus : meleeDamageBonus

    let effectiveNotation = notation
    for (let i = 0; i < diceToAdd; i++) effectiveNotation = addDie(effectiveNotation)

    let statVal = 0
    const statEntries: { label: string; value: number }[] = []

    if (isAgil) {
      statVal += attributes.agilidade
      statEntries.push({ label: 'Agilidade', value: attributes.agilidade })
    } else if (!isRanged || isArremessavel || item.item_id === 'arco-composto') {
      statVal += attributes.forca
      statEntries.push({ label: 'Força', value: attributes.forca })
    }

    if (hasTiroCerteiro && isFirearm && !isAgil) {
      statVal += attributes.agilidade
      statEntries.push({ label: 'Agilidade (Tiro Certeiro)', value: attributes.agilidade })
    }

    if (hasMiraDeElite && ammo === 'balas-longas') {
      statVal += attributes.intelecto
      statEntries.push({ label: 'Intelecto (Mira de Elite)', value: attributes.intelecto })
    }

    const mod = statVal + originBonus
    const breakdown = [
      ...statEntries,
      ...(originBonus > 0 ? [{ label: 'Bónus de Origem', value: originBonus }] : []),
      ...(diceToAdd > 0 ? [{ label: diceToAdd === 1 ? '+1 dado extra' : `+${diceToAdd} dados extra`, value: 0 }] : []),
    ]
    onRoll(`Dano — ${item.name} (${label})`, effectiveNotation, mod, breakdown)
  }

  const borderColor = isWeapon ? 'border-primary-container' :
    isArmor ? 'border-secondary' :
    item.item_type === 'ammo' ? 'border-tertiary' : 'border-outline-variant/40'

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" onClick={onClose} />

      <div className={cn('relative w-full max-w-lg bg-surface-container-low border-l-4', borderColor)}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 bg-surface-container-highest">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                'text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 border',
                isWeapon ? 'text-primary-container border-primary-container/40' :
                isArmor ? 'text-secondary border-secondary/40' :
                item.item_type === 'ammo' ? 'text-tertiary border-tertiary/40' :
                'text-on-surface/30 border-outline-variant/30'
              )}>
                {isWeapon ? 'Arma' : isArmor ? 'Armadura' :
                 item.item_type === 'armorMod' ? 'Modificação' :
                 item.item_type === 'ammo' ? 'Munição' : 'Geral'}
              </span>
              {isFavorita && (
                <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 border text-tertiary border-tertiary/60 bg-tertiary/10">
                  Favorita
                </span>
              )}
              {item.quantity > 1 && (
                <span className="text-[9px] font-mono text-secondary">×{item.quantity}</span>
              )}
            </div>
            <h3 className="font-headline text-2xl italic font-bold text-on-surface uppercase tracking-tight">
              {item.name}
            </h3>
          </div>
          <button onClick={onClose} className="text-on-surface/40 hover:text-on-surface cursor-crosshair mt-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Stats grid */}
        <div className="px-6 pt-5 pb-2">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {isWeapon && damage && damage !== 'varies' && (
              <div>
                <p className="text-[9px] font-mono text-on-surface/30 uppercase tracking-widest mb-0.5">Dano</p>
                <p className="font-mono text-lg font-bold text-tertiary">{damage}</p>
              </div>
            )}
            {isWeapon && critical && (
              <div>
                <p className="text-[9px] font-mono text-on-surface/30 uppercase tracking-widest mb-0.5">Crítico</p>
                <p className="font-mono text-lg font-bold text-on-surface">{displayCritical}</p>
                {totalMargemBonus > 0 && (
                  <p className="text-[8px] font-mono text-tertiary/70 line-through">{critical}</p>
                )}
              </div>
            )}
            {isWeapon && range && (
              <div>
                <p className="text-[9px] font-mono text-on-surface/30 uppercase tracking-widest mb-0.5">Alcance</p>
                <p className="font-mono text-sm text-on-surface uppercase">{RANGE_LABELS[range] ?? range}</p>
              </div>
            )}
            {isWeapon && damageType && (
              <div>
                <p className="text-[9px] font-mono text-on-surface/30 uppercase tracking-widest mb-0.5">Tipo</p>
                <p className="font-mono text-sm text-on-surface">{DAMAGE_TYPE_LABELS[damageType] ?? damageType}</p>
              </div>
            )}
            {isWeapon && ammo && (
              <div>
                <p className="text-[9px] font-mono text-on-surface/30 uppercase tracking-widest mb-0.5">Munição</p>
                <p className="font-mono text-sm text-on-surface capitalize">{ammo.replace(/-/g, ' ')}</p>
              </div>
            )}
            {isArmor && defenseBonus !== null && (
              <div>
                <p className="text-[9px] font-mono text-on-surface/30 uppercase tracking-widest mb-0.5">Bónus de Defesa</p>
                <p className="font-mono text-lg font-bold text-secondary">+{defenseBonus}</p>
              </div>
            )}
            {spaces !== null && (
              <div>
                <p className="text-[9px] font-mono text-on-surface/30 uppercase tracking-widest mb-0.5">Espaços</p>
                <p className="font-mono text-sm text-on-surface">{spaces * item.quantity}</p>
              </div>
            )}
          </div>

          {/* Special rules */}
          {(special.length > 0 || (isFavorita && favoritaCategoryReduction > 0)) && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {special.map(s => (
                <span key={s} className="text-[9px] font-bold uppercase tracking-widest text-secondary border border-secondary/30 px-1.5 py-0.5">
                  {s}
                </span>
              ))}
              {isFavorita && favoritaCategoryReduction > 0 && (
                <span className="text-[9px] font-bold uppercase tracking-widest text-tertiary border border-tertiary/40 px-1.5 py-0.5">
                  cat. −{['I', 'II', 'III'][favoritaCategoryReduction - 1] ?? favoritaCategoryReduction}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        {item.notes && (
          <div className="px-6 py-4 border-t border-outline-variant/15">
            <p className="text-[9px] font-mono text-on-surface/30 uppercase tracking-widest mb-2">Descrição</p>
            <p className="text-sm text-on-surface-variant leading-relaxed">{item.notes}</p>
          </div>
        )}

        {/* Armor effect notice */}
        {isArmor && defenseBonus !== null && (
          <div className="px-6 pb-4">
            <div className="bg-secondary/5 border-l-2 border-secondary p-3">
              <p className="text-[10px] font-mono text-secondary uppercase tracking-widest">
                +{defenseBonus} de Defesa aplicados à ficha
              </p>
            </div>
          </div>
        )}

        {/* Roll buttons */}
        {isWeapon && (
          <div className="px-6 pb-6 space-y-2 border-t border-outline-variant/15 pt-4">
            <p className="text-[9px] font-mono text-on-surface/30 uppercase tracking-widest mb-3">
              Ações — {skillLabel} ({attackLabel} {attackMod > 0 ? `+${attackMod}` : attackMod})
            </p>
            <button
              onClick={handleAttack}
              className="w-full py-3 bg-primary-container hover:bg-on-primary-fixed-variant text-white font-bold text-[10px] uppercase tracking-widest transition-all cursor-crosshair flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined text-sm">target</span>
              Rolar Ataque — 1d20+{attackMod}
            </button>

            {damageOptions.length === 1 && (
              <button
                onClick={() => handleDamage(damageOptions[0].notation, damageOptions[0].label)}
                className="w-full py-3 bg-surface-container-highest hover:bg-surface-bright text-tertiary font-bold text-[10px] uppercase tracking-widest border border-tertiary/30 hover:border-tertiary/60 transition-all cursor-crosshair flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined text-sm">casino</span>
                Rolar Dano — {damageOptions[0].notation}
              </button>
            )}

            {damageOptions.length === 2 && (
              <div className="grid grid-cols-2 gap-2">
                {damageOptions.map(opt => (
                  <button
                    key={opt.notation}
                    onClick={() => handleDamage(opt.notation, opt.label)}
                    className="py-3 bg-surface-container-highest hover:bg-surface-bright text-tertiary font-bold text-[10px] uppercase tracking-widest border border-tertiary/30 hover:border-tertiary/60 transition-all cursor-crosshair flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">casino</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {damage === 'varies' && (
              <p className="text-[10px] font-mono text-on-surface/30 text-center uppercase tracking-widest">
                Dano variável — consulta o mestre
              </p>
            )}

            {isAniquilador && onToggleFavorita && (
              <button
                onClick={onToggleFavorita}
                className={cn(
                  'w-full py-2 text-[9px] font-bold uppercase tracking-widest transition-all cursor-crosshair border',
                  isFavorita
                    ? 'text-tertiary border-tertiary/60 bg-tertiary/10 hover:bg-tertiary/20'
                    : 'text-outline/50 border-outline-variant/30 hover:border-outline/50 hover:text-on-surface/70'
                )}
              >
                {isFavorita ? 'Remover Favorita' : 'Marcar como Favorita'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
