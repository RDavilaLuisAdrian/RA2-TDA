export const messages = {
  required: 'Campo obligatorio',
  name: 'Formato incorrecto: ingrese solo letras',
  phone: 'Formato incorrecto: ingrese 9 números',
  email: 'Correo no válido',
  duplicateEmail: 'Este correo ya está registrado',
  password: 'La contraseña debe tener al menos 8 caracteres',
  login: 'Correo o contraseña incorrectos',
  pastDate: 'La fecha no puede ser anterior a hoy',
  hours: 'Elija una hora dentro del horario de atención',
  price: 'Ingrese un precio válido',
  duration: 'Ingrese una duración válida',
}

export function validateRequired(value) {
  return String(value ?? '').trim() ? '' : messages.required
}

export function validateName(value) {
  if (!String(value ?? '').trim()) return messages.required
  return /^[\p{L}\s]{3,}$/u.test(value.trim()) ? '' : messages.name
}

export function validatePhone(value) {
  if (!String(value ?? '').trim()) return messages.required
  return /^9\d{8}$/.test(value.trim()) ? '' : messages.phone
}

export function validateEmail(value) {
  if (!String(value ?? '').trim()) return messages.required
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : messages.email
}

export function validatePassword(value) {
  if (!String(value ?? '')) return messages.required
  return value.length >= 8 ? '' : messages.password
}

export function validatePrice(value) {
  if (value === '' || value === null || value === undefined) return messages.required
  return Number(value) > 0 ? '' : messages.price
}

export function validateDuration(value) {
  if (value === '' || value === null || value === undefined) return messages.required
  return Number(value) > 0 ? '' : messages.duration
}
