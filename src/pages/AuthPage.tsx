import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type Mode = 'signin' | 'signup'

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      })
      if (error) setError(error.message)
      else setDone(true)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else navigate('/')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      <header className="flex justify-between items-center px-6 py-3 border-b border-outline-variant/10 sticky top-0 bg-background z-50">
        <h1 className="text-2xl font-headline font-bold italic text-primary-container tracking-tighter uppercase">
          ORDEM PARANORMAL
        </h1>
        <span className="text-[10px] font-mono text-secondary/50 tracking-widest">C.O.P.E. PORTAL</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          <div className="mb-12 space-y-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-primary-container text-white px-2 py-0.5 text-[10px] font-bold tracking-tighter uppercase">
                {mode === 'signin' ? 'Agente Registado' : 'Novo Recruta'}
              </span>
              <span className="font-mono text-[10px] text-secondary/50 tracking-widest">PROTOCOLO-AUTH</span>
            </div>
            <h2 className="text-5xl font-headline font-bold italic text-on-surface tracking-tighter uppercase leading-none">
              {mode === 'signin' ? (
                <>Acesso ao <span className="text-primary-container">Sistema</span></>
              ) : (
                <>Registo de <span className="text-primary-container">Agente</span></>
              )}
            </h2>
          </div>

          <div className="flex mb-10 border-b border-outline-variant/10">
            {(['signin', 'signup'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={cn(
                  'flex-1 py-3 text-[10px] font-bold tracking-widest uppercase transition-all border-b-2 -mb-px cursor-crosshair',
                  mode === m
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-on-surface/40 hover:text-on-surface/70'
                )}
              >
                {m === 'signin' ? 'Entrar' : 'Criar Conta'}
              </button>
            ))}
          </div>

          {done ? (
            <div className="bg-surface-container-low border-l-4 border-tertiary p-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary text-sm">mark_email_read</span>
                <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest">Transmissão Enviada</span>
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Confirmação enviada para <span className="text-on-surface font-mono">{email}</span>.
                Verifique o seu e-mail antes de aceder ao sistema.
              </p>
              <button
                onClick={() => { setMode('signin'); setDone(false) }}
                className="text-[10px] text-secondary uppercase tracking-widest hover:text-secondary/70 transition-colors mt-2 cursor-crosshair"
              >
                → Voltar ao Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {mode === 'signup' && (
                <div>
                  <Label htmlFor="username">Nome de Agente</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="O SEU CODINOME"
                    required
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email">Sinal de Identificação // E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="AGENTE@COPE.ORG"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Chave Neural // Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="bg-error-container/20 border-l-4 border-error-container p-3">
                  <p className="text-[10px] font-mono text-primary uppercase tracking-wider">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary-container hover:bg-on-primary-fixed-variant disabled:opacity-50 text-on-primary-container font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-4 group cursor-crosshair"
              >
                <span>{loading ? 'A estabelecer ligação...' : mode === 'signin' ? 'Estabelecer Ligação' : 'Submeter Registo'}</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-2 transition-transform">arrow_forward_ios</span>
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="bg-surface-container-lowest px-6 py-4 border-t border-outline-variant/10 text-center">
        <p className="text-[9px] font-mono text-on-surface/30 uppercase tracking-widest">
          ORDEM PARANORMAL // C.O.P.E. DADOS CLASSIFICADOS - PROTOCOLO: EXORCISMO DIGITAL
        </p>
      </footer>
    </div>
  )
}
