import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppShell } from './components/layout/AppShell'
import { Login } from './pages/Login'
import { Cadastro } from './pages/Cadastro'
import { CadastroEnviado } from './pages/CadastroEnviado'
import { BemVindo } from './pages/BemVindo'
import { AcessoPendente } from './pages/AcessoPendente'
import { AcessoBloqueado } from './pages/AcessoBloqueado'
import { AssinaturaCancelada } from './pages/AssinaturaCancelada'
import { Overview } from './pages/Overview'
import { DRE } from './pages/DRE'
import { CashFlow } from './pages/CashFlow'
import { Charts } from './pages/Charts'
import { Entries } from './pages/Entries'
import { Diagnostico } from './pages/Diagnostico'
import { Admin } from './pages/Admin'
import { PontoEquilibrio } from './pages/PontoEquilibrio'
import { Landing } from './pages/Landing'
import { LandingSoftware } from './pages/LandingSoftware'
import { LandingMentoria } from './pages/LandingMentoria'
import { AssinaturaConfirmada } from './pages/AssinaturaConfirmada'
import { PrecificacaoProduto } from './pages/ferramentas/PrecificacaoProduto'
import { PrecificacaoServico } from './pages/ferramentas/PrecificacaoServico'
import { PontoEquilibrioDash } from './pages/ferramentas/PontoEquilibrioDash'
import { SimuladorCenarios } from './pages/ferramentas/SimuladorCenarios'

function AppRoutes() {
  const { session, loading, isAdmin, isSuperAdmin, profileStatus } = useAuth()

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
  if (profileStatus === 'canceled') return <AssinaturaCancelada />
  if (profileStatus === 'blocked') return <AcessoBloqueado />

  // blacksheep vê apenas o painel admin
  if (isSuperAdmin) {
    return (
      <AppShell>
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AppShell>
    )
  }

  return (
    <AppShell>
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
    </AppShell>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingSoftware />} />
        <Route path="/mentoria" element={<LandingMentoria />} />
        <Route path="/mentoria1" element={<Landing />} />
        <Route path="/ponto" element={<PontoEquilibrio />} />
        <Route path="/assinatura-confirmada" element={<AssinaturaConfirmada />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/cadastro-enviado" element={<CadastroEnviado />} />
        <Route path="/bem-vindo" element={<BemVindo />} />
        <Route path="*" element={
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        } />
      </Routes>
    </BrowserRouter>
  )
}
