import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './components/pages/LoginPage'
import { CadastroPage } from './components/pages/CadastroPage'
import { HomePage } from './components/pages/HomePage'
import { ProtectedRoute } from './components/organisms/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
