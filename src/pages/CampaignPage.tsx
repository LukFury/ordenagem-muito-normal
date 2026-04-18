import { useParams } from 'react-router-dom'

export default function CampaignPage() {
  const { id } = useParams()
  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '2rem' }}>
      <h1>Campanha</h1>
      <p>ID: {id}</p>
      <p>Inventário compartilhado — em construção.</p>
    </main>
  )
}
