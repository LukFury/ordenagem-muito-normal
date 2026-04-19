import { useEffect, useRef, useState } from 'react'
import type { RollRequest, RollResult } from '@/hooks/useDiceRoller'
import { cn } from '@/lib/utils'

// @ts-expect-error — no types for dice-box
import DiceBox from '@3d-dice/dice-box'

interface Props {
  isOpen: boolean
  pending: RollRequest | null
  result: RollResult | null
  onRollComplete: (rolls: number[]) => void
  onClose: () => void
}

const BASE_PATH = import.meta.env.BASE_URL

export default function DiceRollModal({ isOpen, pending, result, onRollComplete, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const diceBoxRef = useRef<InstanceType<typeof DiceBox> | null>(null)
  const [rolling, setRolling] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!isOpen || !containerRef.current || initialized) return

    const box = new DiceBox('#dice-canvas-container', {
      assetPath: `${BASE_PATH}assets/`,
      theme: 'default',
      gravity: 1.2,
      mass: 1,
      friction: 0.8,
      restitution: 0.3,
      angularDamping: 0.4,
      linearDamping: 0.5,
      spinForce: 5,
      throwForce: 4,
      startingHeight: 10,
      settleTimeout: 5000,
      offscreen: true,
      delay: 10,
      lightIntensity: 1,
      enableShadows: true,
      shadowTransparency: 0.6,
    })

    box.init().then(() => {
      diceBoxRef.current = box
      setInitialized(true)
    })
  }, [isOpen, initialized])

  useEffect(() => {
    if (!initialized || !pending || !diceBoxRef.current) return
    setRolling(true)
    diceBoxRef.current.roll(pending.notation).then((results: { value: number }[]) => {
      const rolls = results.map((r: { value: number }) => r.value)
      onRollComplete(rolls)
      setRolling(false)
    })
  }, [initialized, pending])

  useEffect(() => {
    if (!isOpen) {
      setInitialized(false)
      diceBoxRef.current = null
    }
  }, [isOpen])

  if (!isOpen || !pending) return null

  return (
    <div className="fixed inset-0 z-[200] flex flex-col" onClick={result ? onClose : undefined}>
      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-sm" />

      {/* Scanlines on modal */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.12) 50%)',
          backgroundSize: '100% 3px',
        }}
      />

      <div className="relative flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-primary-container text-white px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase">
                Teste de Campo
              </span>
              <span className="font-mono text-[10px] text-secondary/50 tracking-widest">
                {pending.notation}
              </span>
            </div>
            <h2 className="font-headline text-4xl font-bold italic text-on-surface tracking-tighter uppercase">
              {pending.label}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface/30 hover:text-on-surface transition-colors cursor-crosshair"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Dice canvas */}
        <div
          id="dice-canvas-container"
          ref={containerRef}
          className="flex-1 relative"
          style={{ minHeight: 320 }}
        />

        {/* Result panel */}
        <div className="px-8 pb-8">
          {rolling && (
            <div className="flex items-center gap-3 py-6">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-secondary animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span className="font-mono text-[10px] text-secondary/50 uppercase tracking-widest">
                A rolar...
              </span>
            </div>
          )}

          {result && (
            <div
              className={cn(
                'border-l-4 p-6 space-y-4',
                result.isCrit ? 'border-secondary bg-secondary/5' :
                result.isFumble ? 'border-primary-container bg-primary-container/5' :
                'border-outline-variant/40 bg-surface-container-low'
              )}
            >
              {result.isCrit && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-secondary text-on-secondary text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest">
                    Sucesso Crítico
                  </span>
                </div>
              )}
              {result.isFumble && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-primary-container text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest">
                    Falha Crítica
                  </span>
                </div>
              )}

              {/* Breakdown */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-mono text-on-surface/30 uppercase">Dado</span>
                  <span className={cn(
                    'font-mono text-2xl font-bold',
                    result.isCrit ? 'text-secondary' :
                    result.isFumble ? 'text-primary-container' :
                    'text-on-surface'
                  )}>
                    [{result.rolls.join('+')}]
                  </span>
                </div>

                {result.modifierBreakdown.map(m => (
                  <div key={m.label} className="flex items-center gap-1">
                    <span className="text-on-surface/30 font-mono">+</span>
                    <div className="text-center">
                      <span className="text-[9px] font-mono text-on-surface/30 block uppercase">{m.label}</span>
                      <span className="font-mono text-lg font-bold text-on-surface">{m.value}</span>
                    </div>
                  </div>
                ))}

                <span className="text-on-surface/30 font-mono text-xl">=</span>

                <div className="text-center">
                  <span className="text-[9px] font-mono text-on-surface/30 block uppercase">Total</span>
                  <span className={cn(
                    'font-mono text-4xl font-bold',
                    result.isCrit ? 'text-secondary' :
                    result.isFumble ? 'text-primary-container' :
                    result.total >= 20 ? 'text-secondary' :
                    result.total >= 10 ? 'text-on-surface' :
                    'text-on-surface/50'
                  )}>
                    {result.total}
                  </span>
                </div>
              </div>

              <p className="text-[10px] font-mono text-on-surface/30 uppercase tracking-widest">
                Clica em qualquer lado para fechar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
