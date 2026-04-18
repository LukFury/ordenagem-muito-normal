import { useParams } from 'react-router-dom'

export default function CharacterSheetPage() {
  const { id } = useParams()
  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '2rem' }}>
      <h1>Ficha do Personagem</h1>
      <p>ID: {id}</p>
      <p>Em construção.</p>
    </main>
  )
}
