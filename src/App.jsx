import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import { loadData, saveData } from './services/storage.js'
import AdminPage from './pages/AdminPage.jsx'
import BarberPage from './pages/BarberPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import MyTurnsPage from './pages/MyTurnsPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ReservePage from './pages/ReservePage.jsx'

const AppContext = createContext(null)

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp debe utilizarse dentro de AppContext.')
  return context
}

function homeForRole(role) {
  if (role === 'Cliente') return '/reservar'
  if (role === 'Barbero') return '/barbero'
  if (role === 'Administrador') return '/admin'
  return '/login'
}

function PrivatePage({ role, children }) {
  const { data } = useApp()
  const location = useLocation()
  if (!data.currentUser) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (data.currentUser.role !== role) {
    return <Navigate to={homeForRole(data.currentUser.role)} replace state={{ denied: true }} />
  }
  return <Layout>{children}</Layout>
}

function PermissionMessage() {
  const location = useLocation()
  return location.state?.denied
    ? <div className="notice notice-error permission-notice">No tiene permiso para acceder a esta sección</div>
    : null
}

function RoleHome() {
  const { data } = useApp()
  return <Navigate to={homeForRole(data.currentUser?.role)} replace />
}

export default function App() {
  const [data, setData] = useState(loadData)
  const value = useMemo(() => ({ data, setData }), [data])

  useEffect(() => {
    saveData(data)
  }, [data])

  return (
    <AppContext.Provider value={value}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/reservar" element={<PrivatePage role="Cliente"><PermissionMessage /><ReservePage /></PrivatePage>} />
        <Route path="/mis-turnos" element={<PrivatePage role="Cliente"><PermissionMessage /><MyTurnsPage /></PrivatePage>} />
        <Route path="/barbero" element={<PrivatePage role="Barbero"><PermissionMessage /><BarberPage /></PrivatePage>} />
        <Route path="/admin" element={<PrivatePage role="Administrador"><PermissionMessage /><AdminPage /></PrivatePage>} />
        <Route path="/" element={data.currentUser ? <RoleHome /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppContext.Provider>
  )
}
