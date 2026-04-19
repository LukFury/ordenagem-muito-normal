import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07050f] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-purple-700 border-t-purple-300 animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" replace />

  return <>{children}</>
}
