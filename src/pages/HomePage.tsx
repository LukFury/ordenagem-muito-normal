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
    <div className="min-h-screen bg-background text-on-background">
      <header className="bg-background flex justify-between items-center w-full px-6 py-3 z-50 sticky top-0 border-b border-outline-variant/10">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-headline font-bold italic text-primary-container tracking-tighter uppercase">
            ORDEM PARANORMAL
          </h1>
          <nav className="hidden md:flex items-center gap-6">
            <span className="text-secondary border-b-2 border-secondary pb-1 font-bold tracking-widest text-[10px] uppercase">DOSSIÊS</span>
            <Link to="/create" className="text-on-surface/60 hover:text-on-surface transition-opacity text-[10px] tracking-widest uppercase">+ NOVO AGENTE</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-on-surface/40 tracking-widest hidden sm:block">{username}</span>
          <button onClick={handleSignOut} className="material-symbols-outlined text-on-surface/40 hover:text-on-surface transition-all cursor-crosshair text-sm">
            logout
          </button>
        </div>
      </header>

      <main className="min-h-screen pt-12 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-primary-container text-white px-2 py-0.5 text-[10px] font-bold tracking-tighter uppercase">Nível de Acesso: VERMELHO</span>
              <span className="font-mono text-[10px] text-secondary/70 tracking-widest">TS-882-PROTO</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-headline font-bold text-on-surface tracking-tighter uppercase italic leading-none">
              Dossiês de <br/><span className="text-primary-container">Agentes</span>
            </h2>
          </div>
          <div className="flex flex-col items-end opacity-40">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold tracking-[0.3em] uppercase">C.O.P.E.</span>
              <span className="material-symbols-outlined text-sm">shield</span>
            </div>
            <div className="h-px w-32 bg-outline-variant" />
            <span className="text-[8px] font-mono mt-1">CENTRO DE OCORRÊNCIAS PARANORMAIS E EXORCISMO</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-8">
            {loading ? (
              <div className="space-y-1">
                {[1,2,3].map(i => <div key={i} className="h-24 bg-surface-container-low animate-pulse" />)}
              </div>
            ) : characters.length === 0 ? (
              <div className="bg-surface-container-low border-l-4 border-outline-variant/30 p-12 text-center">
                <p className="text-sm font-mono text-on-surface/30 uppercase tracking-widest">Nenhum dossiê ativo</p>
                <p className="text-[10px] text-on-surface/20 mt-2 uppercase tracking-widest">Recrute o seu primeiro agente para começar</p>
                <Link to="/create">
                  <button className="mt-6 px-6 py-3 bg-primary-container text-on-primary-container font-bold text-[10px] uppercase tracking-widest hover:bg-on-primary-fixed-variant transition-all cursor-crosshair">
                    Criar Dossiê de Agente
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {characters.map(c => (
                  <Link key={c.id} to={`/character/${c.id}`}>
                    <div className="group block p-5 bg-surface-container-low hover:bg-surface-container-highest transition-all relative border-l-4 border-transparent hover:border-primary-container cursor-crosshair">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-mono text-tertiary">{c.nex}</span>
                        <span className="text-[9px] uppercase tracking-tighter text-on-surface/30">
                          {new Date(c.created_at).toLocaleDateString('pt-PT')}
                        </span>
                      </div>
                      <h4 className="font-headline font-bold text-xl group-hover:text-secondary transition-colors italic">
                        {c.name || 'Agente Sem Nome'}
                      </h4>
                      {c.concept && <p className="text-xs text-on-surface-variant mt-1 line-clamp-1">{c.concept}</p>}
                      <div className="flex items-center gap-3 mt-3">
                        {c.class_id && <span className="text-[10px] font-bold text-primary-container uppercase">{c.class_id}</span>}
                        {c.origin_id && <span className="text-[10px] text-on-surface/40 uppercase">{c.origin_id}</span>}
                      </div>
                      <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-secondary text-sm">open_in_new</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <aside className="lg:col-span-4 space-y-1">
            <Link to="/create">
              <button className="w-full py-4 bg-primary-container hover:bg-on-primary-fixed-variant transition-all flex items-center justify-center gap-4 group cursor-crosshair">
                <span className="text-sm font-bold uppercase tracking-widest">Novo Dossiê de Agente</span>
                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward_ios</span>
              </button>
            </Link>
            <div className="bg-surface-container-high p-6 border-b border-primary-container/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary-container animate-pulse inline-block" />
                  Estado de Campo
                </h3>
                <span className="text-[10px] font-mono text-on-surface/30">A SINCRONIZAR...</span>
              </div>
              <div className="space-y-3 text-[10px] font-mono text-on-surface/50 uppercase tracking-widest">
                <div className="flex justify-between">
                  <span>Agentes Ativos</span>
                  <span className="text-secondary">{characters.length}</span>
                </div>
                <div className="h-px bg-outline-variant/20" />
                <div className="flex justify-between">
                  <span>Protocolo</span>
                  <span className="text-tertiary">Exorcismo Digital</span>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-4">
              <p className="text-[9px] font-mono text-on-surface/20 uppercase tracking-widest leading-relaxed">
                Aviso: Acesso não autorizado resultará em imediata{' '}
                <span className="bg-primary-container text-white px-1">REDAÇÃO DE DADOS</span>
              </p>
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-surface-container-lowest flex flex-col md:flex-row justify-between items-center px-10 py-8 gap-4 border-t border-outline-variant/10">
        <div>
          <span className="font-bold text-primary-container uppercase text-xs">ORDEM PARANORMAL</span>
          <p className="text-[9px] font-mono text-on-surface/30 uppercase tracking-widest mt-1">
            C.O.P.E. DADOS CLASSIFICADOS - PROTOCOLO: EXORCISMO DIGITAL
          </p>
        </div>
        <div className="flex gap-8">
          <span className="text-on-surface/20 text-[10px] tracking-widest uppercase">ESTADO DO SISTEMA</span>
          <span className="text-on-surface/20 text-[10px] tracking-widest uppercase underline decoration-dotted">FICHEIROS REDIGIDOS</span>
        </div>
      </footer>
    </div>
  )
}
