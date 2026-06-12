import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './components/pages/LoginPage'
import { CadastroPage } from './components/pages/CadastroPage'
import { FeedPage } from './components/pages/FeedPage'
import { PostDetailPage } from './components/pages/PostDetailPage'
import { PublicarPage } from './components/pages/PublicarPage'
import { ProtectedRoute } from './components/organisms/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/feed" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/publicar" element={<PublicarPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
