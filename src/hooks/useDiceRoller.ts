import { useState, useRef, useCallback } from 'react'

export interface RollRequest {
  label: string
  notation: string
  modifier: number
  modifierBreakdown: { label: string; value: number }[]
  /** 'highest' = roll Xd20 take max, 'lowest' = take min, 'sum' = sum all dice (default) */
  mode?: 'highest' | 'lowest' | 'sum'
}

export interface RollResult extends RollRequest {
  rolls: number[]
  selectedRoll: number
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
    const mode = pending.mode ?? 'sum'
    const selectedRoll =
      mode === 'highest' ? Math.max(...rolls) :
      mode === 'lowest'  ? Math.min(...rolls) :
      rolls.reduce((a, b) => a + b, 0)
    const total = selectedRoll + pending.modifier
    const isD20 = pending.notation.includes('d20')
    const isCrit = isD20 && selectedRoll === 20
    const isFumble = isD20 && selectedRoll === 1
    const r: RollResult = { ...pending, rolls, selectedRoll, total, isCrit, isFumble }
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
