import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Sidebar } from './components/layout/Sidebar'
import { Login } from './pages/Login'
import { Overview } from './pages/Overview'
import { DRE } from './pages/DRE'
import { CashFlow } from './pages/CashFlow'
import { Charts } from './pages/Charts'
import { Entries } from './pages/Entries'
import { Diagnostico } from './pages/Diagnostico'
import { Admin } from './pages/Admin'
import { PontoEquilibrio } from './pages/PontoEquilibrio'
import { Landing } from './pages/Landing'

function AppRoutes() {
  const { session, loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl font-black tracking-[0.25em] text-white mb-4">ATLAS</p>
          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  if (!session) return <Login />

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          {isAdmin ? (
            <>
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />

            </>
          ) : (
            <>
              <Route path="/dashboard" element={<Overview />} />
              <Route path="/dre" element={<DRE />} />
              <Route path="/cashflow" element={<CashFlow />} />
              <Route path="/charts" element={<Charts />} />
              <Route path="/entries" element={<Entries />} />
              <Route path="/diagnostico" element={<Diagnostico />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/ponto" element={<PontoEquilibrio />} />
        <Route path="*" element={
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        } />
      </Routes>
    </BrowserRouter>
  )
}
