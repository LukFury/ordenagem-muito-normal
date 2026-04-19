import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface CharacterRow {
  id: string
  name: string
  concept: string
  class_id: string
  origin_id: string
  nex: string
  created_at: string
}

export default function HomePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [characters, setCharacters] = useState<CharacterRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('characters')
      .select('id, name, concept, class_id, origin_id, nex, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setCharacters(data ?? [])
        setLoading(false)
      })
  }, [])

  async function handleSignOut() {
    await signOut()
    navigate('/auth')
  }

  const username = user?.user_metadata?.username ?? user?.email

  return (
    <div className="min-h-screen bg-[#07050f] text-[#c4b5d4]">
      <header className="border-b border-purple-900/30 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="font-cinzel text-xs tracking-[0.25em] text-purple-600 uppercase">Ordem da Realidade</p>
            <h1 className="font-cinzel text-xl font-semibold text-purple-100 tracking-wide">
              Ordenagem Muito Normal
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-500">{username}</span>
            <button
              onClick={handleSignOut}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-cinzel text-lg font-semibold text-purple-200 tracking-wide">
            Seus Personagens
          </h2>
          <Link to="/create">
            <button className="px-5 py-2 rounded bg-purple-700 hover:bg-purple-600 text-white font-cinzel text-xs tracking-wide shadow-[0_0_14px_rgba(147,51,234,0.3)] hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-all">
              + Criar Personagem
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-purple-700 border-t-purple-300 animate-spin" />
          </div>
        ) : characters.length === 0 ? (
          <div className="rounded-xl border border-purple-900/30 bg-[#0f0b1a]/60 p-12 text-center space-y-2">
            <p className="text-zinc-500 text-sm">Nenhum personagem ainda.</p>
            <p className="text-zinc-600 text-xs">Crie seu primeiro personagem para começar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {characters.map(c => (
              <Link key={c.id} to={`/character/${c.id}`}>
                <div className="rounded-xl border border-purple-900/40 bg-[#0f0b1a]/80 p-5 hover:border-purple-700/60 hover:shadow-[0_0_16px_rgba(147,51,234,0.15)] transition-all cursor-pointer space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-cinzel text-base font-semibold text-purple-100 tracking-wide">
                      {c.name || 'Sem nome'}
                    </h3>
                    <span className="text-xs text-purple-500 font-cinzel border border-purple-800/50 rounded px-2 py-0.5">
                      {c.nex}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                    {c.concept || '—'}
                  </p>
                  <div className="flex gap-2 pt-1">
                    {c.class_id && (
                      <span className="text-[10px] text-purple-600 border border-purple-900/50 rounded px-1.5 py-0.5 capitalize">
                        {c.class_id}
                      </span>
                    )}
                    {c.origin_id && (
                      <span className="text-[10px] text-zinc-600 border border-zinc-800/50 rounded px-1.5 py-0.5 capitalize">
                        {c.origin_id}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
