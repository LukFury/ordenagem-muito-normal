import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '2rem' }}>
      <h1>404 — Página não encontrada</h1>
      <Link to="/">Voltar ao início</Link>
    </main>
  )
}
