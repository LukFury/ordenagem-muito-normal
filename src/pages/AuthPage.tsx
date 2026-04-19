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
      if (error) {
        setError(error.message)
      } else {
        setDone(true)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        navigate('/')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#07050f] flex flex-col items-center justify-center px-6">
      {/* Logo / title */}
      <div className="text-center mb-10 space-y-1">
        <p className="font-cinzel text-xs tracking-[0.3em] text-purple-600 uppercase">
          Ordem da Realidade
        </p>
        <h1 className="font-cinzel text-3xl font-semibold text-purple-100 tracking-wide">
          Ordenagem Muito Normal
        </h1>
      </div>

      <div className="w-full max-w-sm">
        {/* Tab toggle */}
        <div className="flex rounded-lg border border-purple-900/40 overflow-hidden mb-6">
          {(['signin', 'signup'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError('') }}
              className={cn(
                'flex-1 py-2.5 text-sm font-cinzel tracking-wide transition-all',
                mode === m
                  ? 'bg-purple-900/50 text-purple-200'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-purple-950/30'
              )}
            >
              {m === 'signin' ? 'Entrar' : 'Criar conta'}
            </button>
          ))}
        </div>

        {done ? (
          <div className="rounded-lg border border-purple-700/40 bg-purple-950/20 p-6 text-center space-y-2">
            <p className="font-cinzel text-purple-200 text-sm">Verifique seu e-mail</p>
            <p className="text-zinc-400 text-xs">
              Enviamos um link de confirmação para <span className="text-zinc-300">{email}</span>.
              Após confirmar, faça login.
            </p>
            <button
              onClick={() => { setMode('signin'); setDone(false) }}
              className="mt-2 text-xs text-purple-400 hover:text-purple-300 underline"
            >
              Ir para login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="username">Nome de jogador</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Como te chamam na mesa"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 border border-red-900/40 bg-red-950/20 rounded px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white font-cinzel text-sm tracking-wide shadow-[0_0_14px_rgba(147,51,234,0.35)] hover:shadow-[0_0_20px_rgba(147,51,234,0.55)] transition-all"
            >
              {loading ? '...' : mode === 'signin' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
