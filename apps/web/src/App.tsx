import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './components/pages/LoginPage'

function CadastroPlaceholder() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-text)]">
      <p>Página de cadastro — em breve</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPlaceholder />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
