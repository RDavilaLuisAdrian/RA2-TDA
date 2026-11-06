import { useMemo, useState } from 'react'
import { useApp } from '../App.jsx'
import Field from '../components/Field.jsx'
import { createId } from '../services/storage.js'
import { findConflict, getNearestAvailableTime, getTimeOptions, isWithinHours, localDateString } from '../utils/scheduling.js'
import { messages, validateRequired } from '../utils/validation.js'

export default function ReservePage() {
  const { data, setData } = useApp()
  const [form, setForm] = useState({ serviceId: '', barberId: '', date: '', time: '' })
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)
  const service = data.services.find((item) => item.id === form.serviceId)
  const times = useMemo(() => service ? getTimeOptions(service.duration) : [], [service])
  const today = localDateString()

  function timeError(values = form, selectedService = data.services.find((item) => item.id === values.serviceId)) {
    if (!values.time) return messages.required
    if (!selectedService || !isWithinHours(values.time, selectedService.duration)) return messages.hours
    if (values.barberId && values.date) {
      const conflict = findConflict(data.bookings, values.barberId, values.date, values.time, selectedService.duration)
      if (conflict) {
        const suggestion = getNearestAvailableTime(data.bookings, values.barberId, values.date, values.time, selectedService.duration)
        return `Horario ocupado. Le sugerimos: ${suggestion ?? 'ninguna hora disponible'}`
      }
    }
    return ''
  }

  function setField(key, value) {
    const nextForm = { ...form, [key]: value }
    if (key === 'serviceId') nextForm.time = ''
    setForm(nextForm)
    setSaved(false)
    const fieldError = key === 'date' && value && value < today ? messages.pastDate : validateRequired(value)
    setErrors((current) => ({
      ...current,
      [key]: fieldError,
      ...(key === 'serviceId' ? { time: '' } : nextForm.time ? { time: timeError(nextForm) } : key === 'time' ? { time: '' } : {}),
    }))
  }

  function submit(event) {
    event.preventDefault()
    const nextErrors = {
      serviceId: validateRequired(form.serviceId),
      barberId: validateRequired(form.barberId),
      date: validateRequired(form.date),
      time: '',
    }
    if (form.date && form.date < today) nextErrors.date = messages.pastDate
    nextErrors.time = timeError(form, service)
    if (Object.values(nextErrors).some(Boolean)) return setErrors(nextErrors)

    const booking = {
      id: createId('turno'),
      clientId: data.currentUser.id,
      barberId: form.barberId,
      serviceId: service.id,
      serviceName: service.name,
      price: Number(service.price),
      duration: Number(service.duration),
      date: form.date,
      time: form.time,
      status: 'registrada',
      createdAt: new Date().toISOString(),
    }
    setData((current) => ({ ...current, bookings: [...current.bookings, booking] }))
    setSaved(true)
    setErrors({})
    setForm({ serviceId: '', barberId: '', date: '', time: '' })
  }

  const selectedBarber = data.barbers.find((item) => item.id === form.barberId)

  return (
    <section className="page">
      <div className="page-heading">
        <div><p className="eyebrow">AGENDA TU VISITA</p><h1>Reservar turno</h1><p className="muted">Elige tu servicio y encuentra el horario ideal.</p></div>
        <span className="heading-icon">✂</span>
      </div>
      {saved && <div className="notice notice-success">¡Tu turno fue confirmado correctamente!</div>}
      <div className="booking-layout">
        <form className="card booking-form" onSubmit={submit} noValidate>
          <h2>Detalles del turno</h2>
          <label className="field">
            <span>Servicio</span>
            <select value={form.serviceId} onChange={(event) => setField('serviceId', event.target.value)}>
              <option value="">Selecciona un servicio</option>
              {data.services.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            {errors.serviceId && <small className="field-error">{errors.serviceId}</small>}
          </label>
          <label className="field">
            <span>Barbero</span>
            <select value={form.barberId} onChange={(event) => setField('barberId', event.target.value)}>
              <option value="">Selecciona un barbero</option>
              {data.barbers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            {errors.barberId && <small className="field-error">{errors.barberId}</small>}
          </label>
          <div className="form-grid">
            <Field label="Fecha" type="date" min={today} value={form.date} onChange={(event) => setField('date', event.target.value)} error={errors.date} />
            <label className="field">
              <span>Hora disponible</span>
              <select value={form.time} onChange={(event) => setField('time', event.target.value)}>
                <option value="">Selecciona una hora</option>
                {times.map((time) => {
                  const occupied = form.barberId && form.date && service && findConflict(data.bookings, form.barberId, form.date, time, service.duration)
                  return <option key={time} value={time}>{time}{occupied ? ' (Ocupado)' : ''}</option>
                })}
              </select>
              {errors.time && <small className="field-error">{errors.time}</small>}
            </label>
          </div>
          {service && (
            <div className="service-facts">
              <div><span>Precio</span><strong>S/ {Number(service.price).toFixed(2)}</strong></div>
              <div><span>Duración</span><strong>{service.duration} min</strong></div>
              <div><span>Atención</span><strong>09:00 – 20:00</strong></div>
            </div>
          )}
          {service && selectedBarber && form.date && form.time && (
            <div className="summary-box">
              <p className="eyebrow">RESUMEN DE TU RESERVA</p>
              <div className="summary-line"><span>Servicio</span><strong>{service.name}</strong></div>
              <div className="summary-line"><span>Barbero</span><strong>{selectedBarber.name}</strong></div>
              <div className="summary-line"><span>Fecha y hora</span><strong>{form.date} · {form.time}</strong></div>
              <div className="summary-line"><span>Finaliza</span><strong>{formatEnd(form.time, service.duration)}</strong></div>
              <div className="summary-total"><span>Total</span><strong>S/ {Number(service.price).toFixed(2)}</strong></div>
            </div>
          )}
          <button className="button button-primary button-wide" type="submit">Confirmar reserva</button>
        </form>
        <aside className="card booking-aside">
          <div className="aside-icon">✦</div>
          <h3>Tu próxima visita empieza aquí</h3>
          <p>Selecciona un horario libre para reservar. Las citas de cada barbero no se superponen.</p>
          <div className="hours-row"><span className="status-dot" /> Lun – Sáb <strong>09:00 – 20:00</strong></div>
          <div className="aside-foot">Precios en soles peruanos</div>
        </aside>
      </div>
    </section>
  )
}

function formatEnd(time, duration) {
  const [hours, minutes] = time.split(':').map(Number)
  const total = hours * 60 + minutes + Number(duration)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}
