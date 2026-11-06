import { useMemo, useState } from 'react'
import { useApp } from '../App.jsx'
import { createId } from '../services/storage.js'
import { localDateString } from '../utils/scheduling.js'
import { messages, validateDuration, validateEmail, validateName, validatePrice, validateRequired } from '../utils/validation.js'

const blankService = { name: '', price: '', duration: '' }

export default function AdminPage() {
  const { data, setData } = useApp()
  const [serviceForm, setServiceForm] = useState(blankService)
  const [serviceErrors, setServiceErrors] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [barberForm, setBarberForm] = useState({ name: '', email: '' })
  const [barberErrors, setBarberErrors] = useState({})
  const [notice, setNotice] = useState('')
  const today = localDateString()
  const todaysAttentions = useMemo(() => data.attentions.filter((item) => item.date === today), [data.attentions, today])
  const total = todaysAttentions.reduce((sum, item) => sum + Number(item.price), 0)
  const average = todaysAttentions.length ? total / todaysAttentions.length : 0

  function updateService(key, value) {
    setServiceForm((current) => ({ ...current, [key]: value }))
    const validator = { name: validateName, price: validatePrice, duration: validateDuration }[key]
    setServiceErrors((current) => ({ ...current, [key]: validator(value) }))
  }

  function submitService(event) {
    event.preventDefault()
    const errors = {
      name: validateRequired(serviceForm.name),
      price: validatePrice(serviceForm.price),
      duration: validateDuration(serviceForm.duration),
    }
    if (!errors.name && !/^[\p{L}\s]{3,}$/u.test(serviceForm.name.trim())) errors.name = messages.name
    if (Object.values(errors).some(Boolean)) return setServiceErrors(errors)
    const normalized = { ...serviceForm, name: serviceForm.name.trim(), price: Number(serviceForm.price), duration: Number(serviceForm.duration) }
    if (editingId) {
      setData((current) => ({
        ...current,
        services: current.services.map((service) => service.id === editingId ? { ...service, ...normalized } : service),
      }))
      setNotice('Servicio actualizado correctamente.')
    } else {
      setData((current) => ({ ...current, services: [...current.services, { id: createId('service'), ...normalized }] }))
      setNotice('Servicio agregado correctamente.')
    }
    setServiceForm(blankService)
    setServiceErrors({})
    setEditingId(null)
  }

  function startEdit(service) {
    setEditingId(service.id)
    setServiceForm({ name: service.name, price: service.price, duration: service.duration })
    setServiceErrors({})
  }

  function removeService(service) {
    if (!window.confirm(`¿Eliminar el servicio "${service.name}"?`)) return
    setData((current) => ({ ...current, services: current.services.filter((item) => item.id !== service.id) }))
    if (editingId === service.id) {
      setEditingId(null)
      setServiceForm(blankService)
    }
    setNotice('Servicio eliminado.')
  }

  function submitBarber(event) {
    event.preventDefault()
    const errors = { name: validateName(barberForm.name), email: validateEmail(barberForm.email) }
    if (!errors.email && data.barbers.some((barber) => barber.email.toLowerCase() === barberForm.email.trim().toLowerCase())) errors.email = messages.duplicateEmail
    if (Object.values(errors).some(Boolean)) return setBarberErrors(errors)
    setData((current) => ({ ...current, barbers: [...current.barbers, { id: createId('barber'), name: barberForm.name.trim(), email: barberForm.email.trim() }] }))
    setBarberForm({ name: '', email: '' })
    setBarberErrors({})
    setNotice('Barbero agregado correctamente.')
  }

  function removeBarber(barber) {
    const hasAppointments = data.bookings.some((booking) => booking.barberId === barber.id && booking.status === 'registrada')
    if (hasAppointments) {
      setNotice('No se puede dar de baja: el barbero tiene turnos registrados.')
      return
    }
    if (!window.confirm(`¿Dar de baja a ${barber.name}?`)) return
    setData((current) => ({ ...current, barbers: current.barbers.filter((item) => item.id !== barber.id) }))
    setNotice('Barbero dado de baja.')
  }

  return (
    <section className="page">
      <div className="page-heading">
        <div><p className="eyebrow">CONTROL DEL NEGOCIO</p><h1>Administración</h1><p className="muted">Gestiona el equipo, los servicios y el rendimiento diario.</p></div>
        <div className="today-pill">▦ &nbsp; {today}</div>
      </div>
      {notice && <div className={`notice ${notice.startsWith('No se') ? 'notice-error' : 'notice-success'}`}>{notice}<button className="notice-close" aria-label="Cerrar" onClick={() => setNotice('')}>×</button></div>}
      <section className="stats-grid">
        <article className="card stat-card"><span className="stat-icon">S/</span><span className="stat-label">Total vendido hoy</span><strong>S/ {total.toFixed(2)}</strong><small>Atenciones completadas</small></article>
        <article className="card stat-card"><span className="stat-icon">✓</span><span className="stat-label">Atenciones de hoy</span><strong>{todaysAttentions.length}</strong><small>Servicios realizados</small></article>
        <article className="card stat-card"><span className="stat-icon">↗</span><span className="stat-label">Promedio por atención</span><strong>S/ {average.toFixed(2)}</strong><small>Ticket promedio del día</small></article>
      </section>
      <div className="admin-grid">
        <section className="card admin-section">
          <div className="section-title"><div><p className="eyebrow">CATÁLOGO</p><h2>Servicios</h2></div><span className="count-pill">{data.services.length}</span></div>
          <div className="admin-list">
            {data.services.map((service) => (
              <div className="admin-list-row" key={service.id}>
                <div><strong>{service.name}</strong><span>S/ {Number(service.price).toFixed(2)} · {service.duration} min</span></div>
                <div className="row-actions"><button className="text-button" onClick={() => startEdit(service)}>Editar</button><button className="text-button text-danger" onClick={() => removeService(service)}>Eliminar</button></div>
              </div>
            ))}
            {!data.services.length && <p className="muted">Aún no hay servicios.</p>}
          </div>
          <form className="admin-form" onSubmit={submitService} noValidate>
            <h3>{editingId ? 'Editar servicio' : 'Agregar servicio'}</h3>
            <label className="field"><span>Nombre</span><input value={serviceForm.name} onChange={(event) => updateService('name', event.target.value)} placeholder="Nombre del servicio" />{serviceErrors.name && <small className="field-error">{serviceErrors.name}</small>}</label>
            <div className="form-grid">
              <label className="field"><span>Precio (S/)</span><input type="number" min="0" step="0.5" value={serviceForm.price} onChange={(event) => updateService('price', event.target.value)} placeholder="20" />{serviceErrors.price && <small className="field-error">{serviceErrors.price}</small>}</label>
              <label className="field"><span>Duración (min)</span><input type="number" min="0" step="5" value={serviceForm.duration} onChange={(event) => updateService('duration', event.target.value)} placeholder="30" />{serviceErrors.duration && <small className="field-error">{serviceErrors.duration}</small>}</label>
            </div>
            <button className="button button-primary button-wide" type="submit">{editingId ? 'Guardar cambios' : 'Agregar servicio'}</button>
            {editingId && <button className="button button-light button-wide cancel-edit" type="button" onClick={() => { setEditingId(null); setServiceForm(blankService); setServiceErrors({}) }}>Cancelar edición</button>}
          </form>
        </section>
        <section className="card admin-section">
          <div className="section-title"><div><p className="eyebrow">EQUIPO</p><h2>Barberos</h2></div><span className="count-pill">{data.barbers.length}</span></div>
          <div className="admin-list">
            {data.barbers.map((barber) => (
              <div className="admin-list-row barber-row" key={barber.id}>
                <div className="avatar">{barber.name.charAt(0).toUpperCase()}</div>
                <div className="barber-info"><strong>{barber.name}</strong><span>{barber.email}</span></div>
                <button className="text-button text-danger" onClick={() => removeBarber(barber)}>Dar de baja</button>
              </div>
            ))}
            {!data.barbers.length && <p className="muted">Aún no hay barberos.</p>}
          </div>
          <form className="admin-form" onSubmit={submitBarber} noValidate>
            <h3>Dar de alta barbero</h3>
            <label className="field"><span>Nombre completo</span><input value={barberForm.name} onChange={(event) => { setBarberForm((current) => ({ ...current, name: event.target.value })); setBarberErrors((current) => ({ ...current, name: validateName(event.target.value) })) }} placeholder="Nombre del barbero" />{barberErrors.name && <small className="field-error">{barberErrors.name}</small>}</label>
            <label className="field"><span>Correo electrónico</span><input type="email" value={barberForm.email} onChange={(event) => { const email = event.target.value; setBarberForm((current) => ({ ...current, email })); let error = validateEmail(email); if (!error && data.barbers.some((barber) => barber.email.toLowerCase() === email.trim().toLowerCase())) error = messages.duplicateEmail; setBarberErrors((current) => ({ ...current, email: error })) }} placeholder="barbero@barber.com" />{barberErrors.email && <small className="field-error">{barberErrors.email}</small>}</label>
            <button className="button button-light button-wide" type="submit">Dar de alta barbero</button>
          </form>
        </section>
      </div>
    </section>
  )
}
