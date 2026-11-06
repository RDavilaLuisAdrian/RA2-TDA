import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Field from '../components/Field.jsx'
import { useApp } from '../App.jsx'
import { messages, validateEmail, validatePassword } from '../utils/validation.js'

export default function LoginPage() {
  const { data, setData } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: key === 'email' ? validateEmail(value) : validatePassword(value), form: '' }))
  }

  function submit(event) {
    event.preventDefault()
    const nextErrors = { email: validateEmail(form.email), password: validatePassword(form.password) }
    if (Object.values(nextErrors).some(Boolean)) return setErrors(nextErrors)
    const user = data.users.find((item) => item.email.toLowerCase() === form.email.trim().toLowerCase() && item.password === form.password)
    if (!user) return setErrors({ form: messages.login })
    setData((current) => ({ ...current, currentUser: user }))
    navigate(user.role === 'Cliente' ? '/reservar' : user.role === 'Barbero' ? '/barbero' : '/admin')
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/login" className="brand auth-brand"><span className="brand-mark">B</span><span>Barber<span className="gold-text">Turnos</span></span></Link>
        <p className="eyebrow">BIENVENIDO DE NUEVO</p>
        <h1>Inicia sesión</h1>
        <p className="muted">Ingresa para gestionar tus turnos.</p>
        <form onSubmit={submit} noValidate>
          <Field label="Correo electrónico" type="email" autoComplete="email" placeholder="tu@correo.com" value={form.email} onChange={(event) => update('email', event.target.value)} error={errors.email} />
          <Field label="Contraseña" type="password" autoComplete="current-password" placeholder="Tu contraseña" value={form.password} onChange={(event) => update('password', event.target.value)} error={errors.password} />
          {errors.form && <p className="field-error form-error">{errors.form}</p>}
          <button className="button button-primary button-wide" type="submit">Ingresar</button>
        </form>
        <p className="auth-switch">¿Aún no tienes cuenta? <Link to="/registro">Regístrate</Link></p>
        <div className="demo-box">
          <strong>Accesos de prueba</strong>
          <span>admin@barber.com / Admin1234</span>
          <span>barbero@barber.com / Barbero1234</span>
          <span>cliente@barber.com / Cliente1234</span>
        </div>
      </section>
    </main>
  )
}
