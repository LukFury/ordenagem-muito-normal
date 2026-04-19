import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/auth')
  }

  const username = user?.user_metadata?.username ?? user?.email

  return (
    <div className="min-h-screen bg-[#07050f] text-[#c4b5d4]">
      <header className="border-b border-purple-900/30 px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
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
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
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

        {/* Character list — will be populated after save is wired up */}
        <div className="rounded-xl border border-purple-900/30 bg-[#0f0b1a]/60 p-10 text-center">
          <p className="text-zinc-500 text-sm">Nenhum personagem ainda.</p>
          <p className="text-zinc-600 text-xs mt-1">Crie seu primeiro personagem para começar.</p>
        </div>
      </main>
    </div>
  )
}
