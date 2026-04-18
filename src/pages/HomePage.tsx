import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '2rem' }}>
      <h1>Ordenagem Muito Normal</h1>
      <p>Criador de personagens e fichas para Ordem Paranormal RPG.</p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <Link to="/create">
          <button>Criar Personagem</button>
        </Link>
      </div>
    </main>
  )
}
