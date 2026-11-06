import { useMemo, useState } from 'react'
import { useApp } from '../App.jsx'
import { findConflict, getNearestAvailableTime, getTimeOptions, isWithinHours, localDateString, minutesToLabel } from '../utils/scheduling.js'
import { messages } from '../utils/validation.js'

export default function MyTurnsPage() {
  const { data, setData } = useApp()
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ date: '', time: '' })
  const [editError, setEditError] = useState('')
  const [notice, setNotice] = useState('')
  const ownBookings = useMemo(() => data.bookings
    .filter((booking) => booking.clientId === data.currentUser.id)
    .filter((booking) => data.currentUser.name.toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)), [data.bookings, data.currentUser, search])

  function cancel(booking) {
    if (booking.status === 'atendida') {
      setNotice('No se puede cancelar un turno ya atendido')
      return
    }
    if (!window.confirm('¿Seguro que desea cancelar este turno?')) return
    setData((current) => ({
      ...current,
      bookings: current.bookings.map((item) => item.id === booking.id ? { ...item, status: 'cancelada', cancelledAt: new Date().toISOString() } : item),
    }))
    setNotice('Turno cancelado. El horario quedó disponible.')
  }

  function beginEdit(booking) {
    setEditingId(booking.id)
    setEditForm({ date: booking.date, time: booking.time })
    setEditError('')
  }

  function validateReschedule(booking, values = editForm) {
    const today = localDateString()
    if (!values.date || !values.time) return messages.required
    if (values.date < today) return messages.pastDate
    if (!isWithinHours(values.time, booking.duration)) return messages.hours
    if (findConflict(data.bookings, booking.barberId, values.date, values.time, booking.duration, booking.id)) {
      const suggestion = getNearestAvailableTime(data.bookings, booking.barberId, values.date, values.time, booking.duration, booking.id)
      return `Horario ocupado. Le sugerimos: ${suggestion ?? 'ninguna hora disponible'}`
    }
    return ''
  }

  function saveReschedule(booking) {
    const error = validateReschedule(booking)
    if (error) return setEditError(error)
    setData((current) => ({
      ...current,
      bookings: current.bookings.map((item) => item.id === booking.id ? { ...item, date: editForm.date, time: editForm.time } : item),
    }))
    setEditingId(null)
    setEditError('')
    setNotice('Turno reprogramado correctamente.')
  }

  return (
    <section className="page">
      <div className="page-heading">
        <div><p className="eyebrow">TU AGENDA PERSONAL</p><h1>Mis turnos</h1><p className="muted">Consulta tus reservas, estado y tiempo de espera.</p></div>
        <label className="search-field"><span>⌕</span><input aria-label="Buscar por nombre" placeholder="Buscar por nombre" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
      </div>
      {notice && <div className={`notice ${notice.startsWith('No se') ? 'notice-error' : 'notice-success'}`}>{notice}<button className="notice-close" aria-label="Cerrar" onClick={() => setNotice('')}>×</button></div>}
      <div className="turn-list">
        {!ownBookings.length ? (
          <div className="card empty-state"><span className="empty-icon">◷</span><h2>No tienes turnos todavía</h2><p className="muted">Cuando reserves una cita, la verás aquí.</p></div>
        ) : ownBookings.map((booking) => {
          const barber = data.barbers.find((item) => item.id === booking.barberId)
          const queue = data.bookings
            .filter((item) => item.barberId === booking.barberId && item.date === booking.date && item.status === 'registrada')
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          const index = queue.findIndex((item) => item.id === booking.id)
          const position = booking.status === 'registrada' ? index + 1 : null
          const waiting = position ? queue.slice(0, index).reduce((sum, item) => sum + Number(item.duration), 0) : 0
          const canEdit = booking.status === 'registrada'
          return (
            <article className="card turn-card" key={booking.id}>
              <div className="turn-main">
                <div className="turn-date"><strong>{booking.time}</strong><span>{booking.date}</span></div>
                <div className="turn-details">
                  <div className="turn-title-row"><h2>{booking.serviceName}</h2><span className={`status-badge status-${booking.status}`}>{booking.status}</span></div>
                  <p>Con {barber?.name ?? 'Barbero'} · {booking.duration} min · S/ {Number(booking.price).toFixed(2)}</p>
                  {canEdit && <div className="queue-info"><span>Posición en cola <strong>#{position}</strong></span><span>{Math.max(0, position - 1)} antes que tú</span><span>Espera aprox. <strong>{minutesToLabel(waiting)}</strong></span></div>}
                </div>
                <div className="turn-actions">
                  {canEdit && <button className="button button-light button-small" onClick={() => beginEdit(booking)}>Reprogramar</button>}
                  <button className="button button-danger-outline button-small" onClick={() => cancel(booking)}>Cancelar</button>
                </div>
              </div>
              {editingId === booking.id && (
                <div className="reschedule-panel">
                  <label className="field"><span>Nueva fecha</span><input type="date" min={localDateString()} value={editForm.date} onChange={(event) => { const next = { ...editForm, date: event.target.value }; setEditForm(next); setEditError(validateReschedule(booking, next)) }} /></label>
                  <label className="field"><span>Nueva hora</span><select value={editForm.time} onChange={(event) => { const next = { ...editForm, time: event.target.value }; setEditForm(next); setEditError(validateReschedule(booking, next)) }}>{getTimeOptions(booking.duration).map((time) => <option key={time}>{time}</option>)}</select></label>
                  {editError && <small className="field-error reschedule-error">{editError}</small>}
                  <button className="button button-primary button-small" onClick={() => saveReschedule(booking)}>Guardar cambio</button>
                  <button className="button button-light button-small" onClick={() => setEditingId(null)}>Volver</button>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
