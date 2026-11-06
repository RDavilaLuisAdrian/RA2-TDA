import { seedData } from '../data/seed.js'

const STORAGE_KEY = 'barberturnos-data'

export function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return structuredClone(seedData)
    const parsed = JSON.parse(saved)
    return {
      ...structuredClone(seedData),
      ...parsed,
      users: Array.isArray(parsed.users) ? parsed.users : structuredClone(seedData.users),
      barbers: Array.isArray(parsed.barbers) ? parsed.barbers : structuredClone(seedData.barbers),
      services: Array.isArray(parsed.services) ? parsed.services : structuredClone(seedData.services),
      bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
      attentions: Array.isArray(parsed.attentions) ? parsed.attentions : [],
      currentUser: parsed.currentUser ?? null,
    }
  } catch (error) {
    console.error('No se pudieron cargar los datos guardados.', error)
    return structuredClone(seedData)
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('No se pudieron guardar los datos.', error)
    throw new Error('No fue posible guardar los cambios en este navegador.')
  }
}

export function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
