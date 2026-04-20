import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Sidebar } from './components/layout/Sidebar'
import { Login } from './pages/Login'
import { Cadastro } from './pages/Cadastro'
import { CadastroEnviado } from './pages/CadastroEnviado'
import { AcessoPendente } from './pages/AcessoPendente'
import { AcessoBloqueado } from './pages/AcessoBloqueado'
import { Overview } from './pages/Overview'
import { DRE } from './pages/DRE'
import { CashFlow } from './pages/CashFlow'
import { Charts } from './pages/Charts'
import { Entries } from './pages/Entries'
import { Diagnostico } from './pages/Diagnostico'
import { Admin } from './pages/Admin'
import { PontoEquilibrio } from './pages/PontoEquilibrio'
import { Landing } from './pages/Landing'
import { PrecificacaoProduto } from './pages/ferramentas/PrecificacaoProduto'
import { PrecificacaoServico } from './pages/ferramentas/PrecificacaoServico'
import { PontoEquilibrioDash } from './pages/ferramentas/PontoEquilibrioDash'
import { SimuladorCenarios } from './pages/ferramentas/SimuladorCenarios'

function AppRoutes() {
  const { session, loading, isAdmin, profileStatus } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl font-black tracking-[0.25em] text-white mb-4">ATLAS</p>
          <div className="w-5 h-5 border-2 border-white/35 border-t-white rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  if (!session) return <Login />

  if (profileStatus === 'pending') return <AcessoPendente />
  if (profileStatus === 'blocked') return <AcessoBloqueado />

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/dashboard" element={<Overview />} />
          <Route path="/dre" element={<DRE />} />
          <Route path="/cashflow" element={<CashFlow />} />
          <Route path="/charts" element={<Charts />} />
          <Route path="/entries" element={<Entries />} />
          <Route path="/diagnostico" element={<Diagnostico />} />
          <Route path="/ferramentas/precificacao-produto" element={<PrecificacaoProduto />} />
          <Route path="/ferramentas/precificacao-servico" element={<PrecificacaoServico />} />
          <Route path="/ferramentas/ponto-equilibrio" element={<PontoEquilibrioDash />} />
          <Route path="/ferramentas/simulador-cenarios" element={<SimuladorCenarios />} />
          {isAdmin && <Route path="/admin" element={<Admin />} />}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/cadastro-enviado" element={<CadastroEnviado />} />
        <Route path="*" element={
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        } />
      </Routes>
    </BrowserRouter>
  )
}
