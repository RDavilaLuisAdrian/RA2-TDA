import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../App.jsx'

const linksByRole = {
  Cliente: [
    { to: '/reservar', label: 'Reservar turno' },
    { to: '/mis-turnos', label: 'Mis turnos' },
  ],
  Barbero: [{ to: '/barbero', label: 'Panel del barbero' }],
  Administrador: [{ to: '/admin', label: 'Administración' }],
}

export default function Layout({ children }) {
  const { data, setData } = useApp()
  const navigate = useNavigate()
  const user = data.currentUser

  function logout() {
    setData((current) => ({ ...current, currentUser: null }))
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark">B</span>
          <span>Barber<span className="gold-text">Turnos</span></span>
        </Link>
        <div className="topbar-user">
          <span className="user-name">{user?.name}</span>
          <span className="role-tag">{user?.role}</span>
          <button className="button button-outline button-small" onClick={logout}>Cerrar sesión</button>
        </div>
      </header>
      <div className="app-body">
        <aside className="sidebar">
          <p className="nav-caption">MENÚ</p>
          <nav>
            {(linksByRole[user?.role] ?? []).map((link) => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                <span className="nav-dot" />
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-note">
            <span className="gold-line" />
            <p>Tu estilo, a tu tiempo.</p>
            <small>BarberTurnos · Prototipo</small>
          </div>
        </aside>
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
