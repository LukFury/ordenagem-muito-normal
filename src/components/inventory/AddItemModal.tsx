import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import equipmentData from '@/data/equipment.json'

interface RawItem {
  id: string
  name: string
  spaces?: number
  damage?: string
  critical?: string
  range?: string
  damageType?: string
  protection?: number
  notes?: string
  ammo?: string
  special?: string[]
}

export interface FlatItem {
  id: string
  name: string
  itemType: 'weapon' | 'armor' | 'ammo' | 'armorMod' | 'general'
  itemSubtype: string
  spaces: number
  damage?: string
  critical?: string
  range?: string
  damageType?: string
  notes?: string
  itemData: Record<string, unknown>
}

function flattenEquipment(): FlatItem[] {
  const items: FlatItem[] = []
  const eq = equipmentData as Record<string, unknown>

  const addWeapons = (cat: string, group: Record<string, RawItem[]>) => {
    Object.entries(group).forEach(([sub, arr]) =>
      arr.forEach(w => items.push({
        id: w.id,
        name: w.name,
        itemType: 'weapon',
        itemSubtype: `${cat}/${sub}`,
        spaces: w.spaces ?? 1,
        damage: w.damage,
        critical: w.critical,
        range: w.range ?? undefined,
        damageType: w.damageType,
        notes: w.notes,
        itemData: w as unknown as Record<string, unknown>,
      }))
    )
  }

  const weapons = eq.weapons as Record<string, Record<string, RawItem[]>>
  addWeapons('simples', weapons.simples)
  addWeapons('taticas', weapons.taticas)
  addWeapons('pesadas', weapons.pesadas)

  ;(eq.ammo as RawItem[]).forEach(a => items.push({
    id: a.id, name: a.name, itemType: 'ammo', itemSubtype: 'ammo',
    spaces: a.spaces ?? 1, notes: a.notes, itemData: a as unknown as Record<string, unknown>,
  }))

  ;(eq.armor as RawItem[]).forEach(a => items.push({
    id: a.id, name: a.name, itemType: 'armor', itemSubtype: 'armor',
    spaces: a.spaces ?? 2, notes: a.notes, itemData: a as unknown as Record<string, unknown>,
  }))

  ;(eq.armorModifications as RawItem[]).forEach(a => items.push({
    id: a.id, name: a.name, itemType: 'armorMod', itemSubtype: 'armorMod',
    spaces: 0, notes: a.notes, itemData: a as unknown as Record<string, unknown>,
  }))

  const general = eq.generalItems as Record<string, RawItem[]>
  Object.entries(general).forEach(([sub, arr]) =>
    arr.forEach(i => items.push({
      id: i.id, name: i.name, itemType: 'general', itemSubtype: sub,
      spaces: i.spaces ?? 1, notes: i.notes, itemData: i as unknown as Record<string, unknown>,
    }))
  )

  return items
}

const ALL_ITEMS = flattenEquipment()

type Tab = 'todas' | 'weapon' | 'armor' | 'ammo' | 'general'

const TAB_LABELS: Record<Tab, string> = {
  todas: 'Todas',
  weapon: 'Armas',
  armor: 'Proteção',
  ammo: 'Munição',
  general: 'Gerais',
}

const RANGE_LABELS: Record<string, string> = {
  curto: 'Curto',
  medio: 'Médio',
  longo: 'Longo',
}

interface Props {
  onAdd: (item: FlatItem, quantity: number) => void
  onClose: () => void
}

export default function AddItemModal({ onAdd, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('todas')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<FlatItem | null>(null)
  const [quantity, setQuantity] = useState(1)

  const filtered = useMemo(() => {
    return ALL_ITEMS.filter(item => {
      const matchTab = tab === 'todas' || item.itemType === tab ||
        (tab === 'armor' && (item.itemType === 'armor' || item.itemType === 'armorMod'))
      const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase())
      return matchTab && matchSearch
    })
  }, [tab, search])

  function handleAdd() {
    if (!selected) return
    onAdd(selected, quantity)
    setSelected(null)
    setQuantity(1)
  }

  return (
    <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-surface-container-low border-l-4 border-primary-container">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-surface-container-highest">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-primary-container text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest">
                Arsenal C.O.P.E.
              </span>
            </div>
            <h3 className="font-headline text-2xl italic font-bold text-on-surface uppercase tracking-tight">
              Adicionar Item
            </h3>
          </div>
          <button onClick={onClose} className="text-on-surface/40 hover:text-on-surface cursor-crosshair">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4 pb-2">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/30 text-sm">search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="PESQUISAR ITEM..."
              className="w-full bg-surface-container-lowest border-b border-outline/30 pl-9 pr-4 py-3 text-sm font-mono text-on-surface placeholder:text-on-surface/20 focus:outline-none focus:border-secondary uppercase tracking-widest"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-outline-variant/10">
          {(Object.keys(TAB_LABELS) as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'py-2 px-3 text-[10px] font-bold uppercase tracking-widest transition-all cursor-crosshair border-b-2 -mb-px',
                tab === t ? 'border-secondary text-secondary' : 'border-transparent text-on-surface/30 hover:text-on-surface/60'
              )}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Item list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-[10px] font-mono text-on-surface/30 uppercase tracking-widest">
              Nenhum item encontrado
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/10">
              {filtered.map(item => {
                const isSelected = selected?.id === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => { setSelected(item); setQuantity(1) }}
                    className={cn(
                      'w-full text-left px-6 py-3 transition-all cursor-crosshair flex items-center justify-between gap-4',
                      isSelected
                        ? 'bg-surface-container-highest border-l-4 border-secondary'
                        : 'hover:bg-surface-container border-l-4 border-transparent'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm font-bold uppercase tracking-wide truncate',
                        isSelected ? 'text-secondary' : 'text-on-surface'
                      )}>
                        {item.name}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {item.damage && (
                          <span className="text-[10px] font-mono text-tertiary">{item.damage}</span>
                        )}
                        {item.range && (
                          <span className="text-[10px] font-mono text-on-surface/30 uppercase">
                            {RANGE_LABELS[item.range] ?? item.range}
                          </span>
                        )}
                        {item.notes && (
                          <span className="text-[10px] text-on-surface/30 truncate max-w-[200px]">{item.notes}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[9px] font-mono text-on-surface/30 uppercase">
                        {item.spaces} esp.
                      </span>
                      <span className={cn(
                        'text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5',
                        item.itemType === 'weapon' ? 'text-primary-container border border-primary-container/30' :
                        item.itemType === 'armor' || item.itemType === 'armorMod' ? 'text-secondary border border-secondary/30' :
                        item.itemType === 'ammo' ? 'text-tertiary border border-tertiary/30' :
                        'text-on-surface/30 border border-outline-variant/20'
                      )}>
                        {item.itemType === 'weapon' ? 'Arma' :
                         item.itemType === 'armor' ? 'Armadura' :
                         item.itemType === 'armorMod' ? 'Mod.' :
                         item.itemType === 'ammo' ? 'Munição' : 'Geral'}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Add panel */}
        {selected && (
          <div className="px-6 py-4 bg-surface-container-highest border-t border-outline-variant/20 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface uppercase tracking-wide truncate">{selected.name}</p>
              <p className="text-[9px] font-mono text-on-surface/30 uppercase mt-0.5">
                {selected.spaces} espaço(s) por unidade
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-7 h-7 bg-surface-container text-on-surface/60 hover:text-on-surface font-mono cursor-crosshair flex items-center justify-center"
                >−</button>
                <span className="w-8 text-center font-mono text-sm text-on-surface font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-7 h-7 bg-surface-container text-on-surface/60 hover:text-on-surface font-mono cursor-crosshair flex items-center justify-center"
                >+</button>
              </div>
              <button
                onClick={handleAdd}
                className="px-5 py-2 bg-primary-container hover:bg-on-primary-fixed-variant text-white text-[10px] font-bold uppercase tracking-widest transition-all cursor-crosshair flex items-center gap-2"
              >
                <span>Adicionar</span>
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
