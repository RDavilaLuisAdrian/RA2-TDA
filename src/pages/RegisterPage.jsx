import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Field from '../components/Field.jsx'
import { useApp } from '../App.jsx'
import { createId } from '../services/storage.js'
import { messages, validateEmail, validateName, validatePassword, validatePhone } from '../utils/validation.js'

const initialForm = { name: '', phone: '', email: '', password: '' }

export default function RegisterPage() {
  const { data, setData } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    const validators = { name: validateName, phone: validatePhone, email: validateEmail, password: validatePassword }
    let error = validators[key](value)
    if (key === 'email' && !error && data.users.some((user) => user.email.toLowerCase() === value.trim().toLowerCase())) error = messages.duplicateEmail
    setErrors((current) => ({ ...current, [key]: error }))
  }

  function submit(event) {
    event.preventDefault()
    const nextErrors = {
      name: validateName(form.name),
      phone: validatePhone(form.phone),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    }
    if (!nextErrors.email && data.users.some((user) => user.email.toLowerCase() === form.email.trim().toLowerCase())) nextErrors.email = messages.duplicateEmail
    if (Object.values(nextErrors).some(Boolean)) return setErrors(nextErrors)
    const user = { id: createId('user'), ...form, name: form.name.trim(), email: form.email.trim(), role: 'Cliente' }
    setData((current) => ({ ...current, users: [...current.users, user], currentUser: user }))
    navigate('/reservar')
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/login" className="brand auth-brand"><span className="brand-mark">B</span><span>Barber<span className="gold-text">Turnos</span></span></Link>
        <p className="eyebrow">NUEVA CUENTA</p>
        <h1>Regístrate</h1>
        <p className="muted">Crea tu cuenta de cliente para reservar.</p>
        <form onSubmit={submit} noValidate>
          <Field label="Nombre completo" autoComplete="name" placeholder="Tu nombre" value={form.name} onChange={(event) => update('name', event.target.value)} error={errors.name} />
          <Field label="Teléfono" type="tel" inputMode="numeric" autoComplete="tel" placeholder="987654321" value={form.phone} onChange={(event) => update('phone', event.target.value)} error={errors.phone} />
          <Field label="Correo electrónico" type="email" autoComplete="email" placeholder="tu@correo.com" value={form.email} onChange={(event) => update('email', event.target.value)} error={errors.email} />
          <Field label="Contraseña" type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={(event) => update('password', event.target.value)} error={errors.password} />
          <button className="button button-primary button-wide" type="submit">Registrarme</button>
        </form>
        <p className="auth-switch">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </section>
    </main>
  )
}
