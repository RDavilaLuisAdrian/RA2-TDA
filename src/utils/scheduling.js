export const OPEN_MINUTES = 9 * 60
export const CLOSE_MINUTES = 20 * 60

export function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function toTime(minutes) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

export function overlaps(start1, duration1, start2, duration2) {
  const end1 = start1 + duration1
  const end2 = start2 + duration2
  return start1 < end2 && start2 < end1
}

export function isWithinHours(time, duration) {
  const start = toMinutes(time)
  return start >= OPEN_MINUTES && start < CLOSE_MINUTES && start + duration <= CLOSE_MINUTES
}

export function getActiveBookings(bookings, barberId, date, exceptId = null) {
  return bookings.filter((booking) =>
    booking.id !== exceptId
    && booking.barberId === barberId
    && booking.date === date
    && booking.status === 'registrada',
  )
}

export function findConflict(bookings, barberId, date, time, duration, exceptId = null) {
  const start = toMinutes(time)
  return getActiveBookings(bookings, barberId, date, exceptId).find((booking) => {
    const existing = toMinutes(booking.time)
    return overlaps(start, duration, existing, booking.duration)
  })
}

export function getNearestAvailableTime(bookings, barberId, date, time, duration, exceptId = null) {
  const requested = toMinutes(time)
  const candidates = []
  for (let minute = OPEN_MINUTES; minute + duration <= CLOSE_MINUTES; minute += 15) {
    const candidate = toTime(minute)
    if (!findConflict(bookings, barberId, date, candidate, duration, exceptId)) candidates.push(candidate)
  }
  return candidates.sort((a, b) => Math.abs(toMinutes(a) - requested) - Math.abs(toMinutes(b) - requested))[0] ?? null
}

export function getTimeOptions(duration) {
  const options = []
  for (let minute = OPEN_MINUTES; minute + duration <= CLOSE_MINUTES; minute += 15) {
    options.push(toTime(minute))
  }
  return options
}

export function localDateString(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

export function minutesToLabel(minutes) {
  if (minutes === 0) return '0 min'
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return [hours ? `${hours} h` : '', rest ? `${rest} min` : ''].filter(Boolean).join(' ')
}
