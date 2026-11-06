export const seedData = {
  users: [
    { id: 'user-admin', name: 'Administrador', phone: '900000001', email: 'admin@barber.com', password: 'Admin1234', role: 'Administrador' },
    { id: 'user-barber', name: 'Carlos Ramirez', phone: '900000002', email: 'barbero@barber.com', password: 'Barbero1234', role: 'Barbero', barberId: 'barber-1' },
    { id: 'user-client', name: 'Andrea Torres', phone: '900000003', email: 'cliente@barber.com', password: 'Cliente1234', role: 'Cliente' },
  ],
  barbers: [
    { id: 'barber-1', name: 'Carlos Ramirez', email: 'barbero@barber.com' },
    { id: 'barber-2', name: 'Miguel Flores', email: 'miguel@barber.com' },
    { id: 'barber-3', name: 'Luis Mendoza', email: 'luis@barber.com' },
  ],
  services: [
    { id: 'service-1', name: 'Corte clásico', price: 20, duration: 30 },
    { id: 'service-2', name: 'Corte y barba', price: 30, duration: 45 },
    { id: 'service-3', name: 'Barba', price: 15, duration: 20 },
    { id: 'service-4', name: 'Cejas', price: 8, duration: 10 },
    { id: 'service-5', name: 'Corte niño', price: 15, duration: 25 },
  ],
  bookings: [],
  attentions: [],
  currentUser: null,
}
