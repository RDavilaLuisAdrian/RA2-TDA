import { useMemo, useState } from 'react'
import { useApp } from '../App.jsx'
import { localDateString } from '../utils/scheduling.js'

export default function BarberPage() {
  const { data, setData } = useApp()
  const [search, setSearch] = useState('')
  const barberId = data.currentUser.barberId
  const barber = data.barbers.find((item) => item.id === barberId)
  const today = localDateString()
  const queue = useMemo(() => data.bookings
    .filter((booking) => booking.barberId === barberId && booking.date === today && booking.status === 'registrada')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt)), [data.bookings, barberId, today])
  const history = useMemo(() => data.attentions
    .filter((attention) => attention.barberId === barberId)
    .sort((a, b) => b.attendedAt.localeCompare(a.attendedAt))
    .filter((attention) => attention.clientName.toLowerCase().includes(search.trim().toLowerCase())), [data.attentions, barberId, search])

  function attend(booking) {
    const attendedAt = new Date().toISOString()
    const client = data.users.find((user) => user.id === booking.clientId)
    const attention = {
      id: `${booking.id}-attention`,
      bookingId: booking.id,
      barberId: booking.barberId,
      clientId: booking.clientId,
      clientName: client?.name ?? 'Cliente',
      serviceName: booking.serviceName,
      price: Number(booking.price),
      duration: Number(booking.duration),
      date: booking.date,
      time: booking.time,
      attendedAt,
    }
    setData((current) => ({
      ...current,
      bookings: current.bookings.map((item) => item.id === booking.id ? { ...item, status: 'atendida', attendedAt } : item),
      attentions: [attention, ...current.attentions],
    }))
  }

  return (
    <section className="page">
      <div className="page-heading">
        <div><p className="eyebrow">PANEL DE TRABAJO</p><h1>Hola, {barber?.name.split(' ')[0] ?? data.currentUser.name.split(' ')[0]}</h1><p className="muted">Atiende a tus clientes en orden de llegada.</p></div>
        <div className="today-pill"><span className="status-dot" /> Hoy · {today}</div>
      </div>
      <section className="section-block">
        <div className="section-title"><div><p className="eyebrow">ATENCIÓN DE HOY</p><h2>Cola de atención <span className="count-pill">{queue.length}</span></h2></div></div>
        {!queue.length ? (
          <div className="card empty-state compact"><span className="empty-icon">✓</span><h3>La cola está vacía</h3><p className="muted">Cuando tengas reservas para hoy, aparecerán aquí.</p></div>
        ) : (
          <div className="queue-list">
            {queue.map((booking, index) => {
              const client = data.users.find((user) => user.id === booking.clientId)
              return (
                <article className={`card queue-card${index === 0 ? ' queue-next' : ''}`} key={booking.id}>
                  <div className="queue-number">{String(index + 1).padStart(2, '0')}</div>
                  <div className="queue-client">
                    <div className="avatar">{(client?.name ?? '?').charAt(0).toUpperCase()}</div>
                    <div><strong>{client?.name ?? 'Cliente'}</strong><span>{booking.serviceName} · {booking.duration} min</span></div>
                  </div>
                  <div className="queue-time"><strong>{booking.time}</strong><span>S/ {Number(booking.price).toFixed(2)}</span></div>
                  {index === 0 ? <button className="button button-primary button-small" onClick={() => attend(booking)}>Marcar como atendido</button> : <span className="waiting-label">En espera</span>}
                </article>
              )
            })}
          </div>
        )}
      </section>
      <section className="section-block history-section">
        <div className="section-title history-heading">
          <div><p className="eyebrow">REGISTROS COMPLETADOS</p><h2>Historial de atenciones</h2></div>
          <label className="search-field"><span>⌕</span><input aria-label="Buscar cliente en historial" placeholder="Buscar cliente" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        </div>
        {!history.length ? (
          <div className="card empty-state compact"><p>{search ? 'Este cliente aún no tiene atenciones previas' : 'Este cliente aún no tiene atenciones previas'}</p></div>
        ) : (
          <div className="card history-table-wrap">
            <table className="data-table">
              <thead><tr><th>Cliente</th><th>Servicio</th><th>Fecha</th><th>Hora de atención</th><th>Importe</th></tr></thead>
              <tbody>{history.map((item) => <tr key={item.id}><td><strong>{item.clientName}</strong></td><td>{item.serviceName}</td><td>{item.date}</td><td>{new Date(item.attendedAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}</td><td>S/ {Number(item.price).toFixed(2)}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}
