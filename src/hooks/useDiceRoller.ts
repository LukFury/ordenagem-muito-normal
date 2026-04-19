import { useState, useRef, useCallback } from 'react'

export interface RollRequest {
  label: string
  notation: string
  modifier: number
  modifierBreakdown: { label: string; value: number }[]
}

export interface RollResult extends RollRequest {
  rolls: number[]
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
    const diceSum = rolls.reduce((a, b) => a + b, 0)
    const total = diceSum + pending.modifier
    const isCrit = pending.notation.includes('d20') && rolls[0] === 20
    const isFumble = pending.notation.includes('d20') && rolls[0] === 1
    const r: RollResult = { ...pending, rolls, total, isCrit, isFumble }
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
