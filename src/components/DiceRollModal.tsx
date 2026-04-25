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
  const diceBoxRef = useRef<InstanceType<typeof DiceBox> | null>(null)
  const [rolling, setRolling] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Initialize once when modal opens
  useEffect(() => {
    if (!isOpen || initialized) return

    const box = new DiceBox('#dice-canvas-container', {
      assetPath: `${BASE_PATH}assets/`,
      theme: 'default',
      scale: 10,
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

  // Roll when initialized and pending
  useEffect(() => {
    if (!initialized || !pending || !diceBoxRef.current) return
    setRolling(true)
    diceBoxRef.current.roll(pending.notation).then((results: { value: number }[]) => {
      const rolls = results.map((r: { value: number }) => r.value)
      onRollComplete(rolls)
      setRolling(false)
    })
  }, [initialized, pending])

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      setInitialized(false)
      diceBoxRef.current = null
    }
  }, [isOpen])

  if (!isOpen || !pending) return null

  return (
    <>
      {/* Force canvas to fill container */}
      <style>{`
        #dice-canvas-container canvas {
          width: 100% !important;
          height: 100% !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
        }
      `}</style>

      {/* Full-screen dice canvas — starts below the header (56px) */}
      <div
        id="dice-canvas-container"
        style={{
          position: 'fixed',
          top: 56,
          left: 0,
          width: '100vw',
          height: 'calc(100vh - 56px)',
          zIndex: 200,
          pointerEvents: result ? 'none' : 'auto',
        }}
      />

      {/* UI overlay on top of canvas — also offset below header */}
      <div
        className="fixed left-0 right-0 bottom-0 z-[201] flex flex-col pointer-events-none"
        style={{ top: 56, pointerEvents: result ? 'auto' : 'none' }}
        onClick={result ? onClose : undefined}
      >
        {/* Scanlines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.1) 50%)',
            backgroundSize: '100% 3px',
          }}
        />

        {/* Header bar */}
        <div className="relative flex items-center justify-between px-8 pt-8 pb-4 bg-background/70 backdrop-blur-sm">
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
            className="text-on-surface/50 hover:text-on-surface transition-colors cursor-crosshair pointer-events-auto"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Spacer — dice roll in middle of screen */}
        <div className="flex-1" />

        {/* Result panel — slides in at bottom */}
        <div className="relative px-8 pb-8 bg-background/80 backdrop-blur-sm">
          {rolling && (
            <div className="flex items-center gap-3 py-6">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
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
                result.isCrit
                  ? 'border-secondary bg-secondary/10'
                  : result.isFumble
                  ? 'border-primary-container bg-primary-container/10'
                  : 'border-outline-variant/40 bg-surface-container-low/90'
              )}
            >
              {result.isCrit && (
                <span className="bg-secondary text-on-secondary text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest inline-block mb-1">
                  Sucesso Crítico
                </span>
              )}
              {result.isFumble && (
                <span className="bg-primary-container text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest inline-block mb-1">
                  Falha Crítica
                </span>
              )}

              <div className="flex items-center gap-4 flex-wrap">
                <div className="text-center">
                  <span className="text-[9px] font-mono text-on-surface/30 block uppercase mb-1">
                    {result.mode === 'highest' ? `Melhor de ${result.rolls.length}` :
                     result.mode === 'lowest'  ? `Pior de ${result.rolls.length}` :
                     'Dado'}
                  </span>
                  <span className={cn(
                    'font-mono text-3xl font-bold',
                    result.isCrit ? 'text-secondary' :
                    result.isFumble ? 'text-primary-container' :
                    'text-on-surface'
                  )}>
                    {(() => {
                      const mode = result.mode ?? 'sum'
                      if (mode === 'sum') return `[${result.rolls.join('+')}]`
                      let marked = false
                      const parts = result.rolls.map(r => {
                        if (!marked && r === result.selectedRoll) { marked = true; return `<${r}>` }
                        return String(r)
                      })
                      return `[${parts.join(', ')}]`
                    })()}
                  </span>
                </div>

                {result.modifierBreakdown.map(m => (
                  <div key={m.label} className="flex items-center gap-2">
                    <span className="text-on-surface/30 font-mono text-xl">+</span>
                    <div className="text-center">
                      <span className="text-[9px] font-mono text-on-surface/30 block uppercase mb-1">{m.label}</span>
                      <span className="font-mono text-2xl font-bold text-on-surface">{m.value}</span>
                    </div>
                  </div>
                ))}

                <span className="text-on-surface/30 font-mono text-2xl">=</span>

                <div className="text-center">
                  <span className="text-[9px] font-mono text-on-surface/30 block uppercase mb-1">Total</span>
                  <span className={cn(
                    'font-mono text-5xl font-bold',
                    result.isCrit ? 'text-secondary' :
                    result.isFumble ? 'text-primary-container' :
                    result.total >= 20 ? 'text-secondary' :
                    result.total >= 10 ? 'text-on-surface' :
                    'text-on-surface/40'
                  )}>
                    {result.total}
                  </span>
                </div>
              </div>

              <p className="text-[10px] font-mono text-on-surface/20 uppercase tracking-widest">
                Clica em qualquer lado para fechar
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
