import { useState, useRef, useCallback } from 'react'

export interface RollRequest {
  label: string
  notation: string
  modifier: number
  modifierBreakdown: { label: string; value: number }[]
  /** 'highest' = roll Xd20 take max, 'lowest' = take min, 'sum' = sum all dice (default) */
  mode?: 'highest' | 'lowest' | 'sum'
  /**
   * When set, the LAST bonusDiceCount rolls are treated as a separate bonus pool
   * (always summed and added to the total). The remaining rolls form the main pool
   * processed with `mode`. Used for Perito bonus dice on skill rolls.
   */
  bonusDiceCount?: number
  bonusDiceLabel?: string
}

export interface RollResult extends RollRequest {
  rolls: number[]
  mainRolls: number[]
  bonusRolls: number[]
  selectedRoll: number
  bonusTotal: number
  total: number
  isCrit: boolean
  isFumble: boolean
}

export function useDiceRoller() {
  const [isOpen, setIsOpen] = useState(false)
  const [pending, setPending] = useState<RollRequest | null>(null)
  const [result, setResult] = useState<RollResult | null>(null)
  const resolveRef = useRef<((r: RollResult) => void) | null>(null)

  const roll = useCallback((request: RollRequest) => {
    setResult(null)
    setPending(request)
    setIsOpen(true)
    return new Promise<RollResult>(resolve => {
      resolveRef.current = resolve
    })
  }, [])

  const onRollComplete = useCallback((rolls: number[]) => {
    if (!pending) return
    const bc = pending.bonusDiceCount ?? 0
    const mainRolls = bc > 0 ? rolls.slice(0, -bc) : rolls
    const bonusRolls = bc > 0 ? rolls.slice(-bc) : []
    const mode = pending.mode ?? 'sum'
    const selectedRoll =
      mode === 'highest' ? Math.max(...mainRolls) :
      mode === 'lowest'  ? Math.min(...mainRolls) :
      mainRolls.reduce((a, b) => a + b, 0)
    const bonusTotal = bonusRolls.reduce((a, b) => a + b, 0)
    const total = selectedRoll + bonusTotal + pending.modifier
    const isD20 = pending.notation.includes('d20')
    const isCrit = isD20 && selectedRoll === 20
    const isFumble = isD20 && selectedRoll === 1
    const r: RollResult = { ...pending, rolls, mainRolls, bonusRolls, selectedRoll, bonusTotal, total, isCrit, isFumble }
    setResult(r)
    resolveRef.current?.(r)
  }, [pending])

  const close = useCallback(() => {
    setIsOpen(false)
    setPending(null)
    setResult(null)
  }, [])

  return { isOpen, pending, result, roll, onRollComplete, close }
}
