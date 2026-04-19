import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import AuthGuard from '@/components/AuthGuard'

import AuthPage from '@/pages/AuthPage'
import HomePage from '@/pages/HomePage'
import CharacterCreatePage from '@/pages/CharacterCreatePage'
import CharacterSheetPage from '@/pages/CharacterSheetPage'
import CampaignPage from '@/pages/CampaignPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <div className="noise-overlay" />
        <Routes>
          <Route path="/auth" element={<AuthPage />} />

          <Route path="/" element={<AuthGuard><HomePage /></AuthGuard>} />
          <Route path="/create" element={<AuthGuard><CharacterCreatePage /></AuthGuard>} />
          <Route path="/character/:id" element={<AuthGuard><CharacterSheetPage /></AuthGuard>} />
          <Route path="/campaign/:id" element={<AuthGuard><CampaignPage /></AuthGuard>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  )
}
