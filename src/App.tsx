import { HashRouter, Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import CharacterCreatePage from '@/pages/CharacterCreatePage'
import CharacterSheetPage from '@/pages/CharacterSheetPage'
import CampaignPage from '@/pages/CampaignPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CharacterCreatePage />} />
        <Route path="/character/:id" element={<CharacterSheetPage />} />
        <Route path="/campaign/:id" element={<CampaignPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HashRouter>
  )
}
