# BarberTurnos

Prototipo web responsivo para gestionar reservas, cola de atención y administración de una barbería. Está construido con React, Vite, JavaScript y React Router; todos los datos se guardan en `localStorage`, sin backend.

## Requisitos

- Node.js 20.19 o superior
- npm

## Instalar y ejecutar

```bash
npm install
npm run dev
```

Abre la URL que Vite muestra en la terminal (normalmente `http://localhost:5173`). Para generar una compilación de producción: `npm run build`.

## Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@barber.com` | `Admin1234` |
| Barbero | `barbero@barber.com` | `Barbero1234` |
| Cliente | `cliente@barber.com` | `Cliente1234` |

La primera visita inicializa esos usuarios, tres barberos y los cinco servicios de ejemplo. El registro crea únicamente usuarios de tipo Cliente. Los cambios permanecen en el navegador; para volver a los datos iniciales borra la clave `barberturnos-data` del almacenamiento local del sitio.

## Recorrido de prueba

1. Registra un cliente con nombre, teléfono peruano de 9 dígitos, correo y contraseña de al menos 8 caracteres. Al terminar, inicia sesión automáticamente.
2. En **Reservar turno**, selecciona servicio, barbero, fecha y hora. El resumen muestra precio, duración y hora de término. Confirma la reserva.
3. Crea otro turno para el mismo barbero, fecha y hora (o elige una opción marcada «Ocupado»). El sistema bloquea el cruce y sugiere la hora libre más cercana.
4. En **Mis turnos**, revisa la posición FIFO y espera estimada. Usa **Reprogramar** para mover una cita; **Cancelar** solicita confirmación y libera su horario.
5. Para atender el turno, elige una cita de hoy para Carlos Ramirez (el barbero de prueba), cierra la sesión e ingresa como `barbero@barber.com`. En **Panel del barbero**, marca el siguiente cliente como atendido y consulta el historial LIFO.
6. Ingresa como administrador para editar o eliminar servicios, dar de alta o baja barberos y revisar el resumen de ventas y atenciones del día.

## Estructura principal

- `src/App.jsx`: rutas React Router, contexto de datos y control de acceso por rol.
- `src/components/`: campos de formulario y navegación compartida.
- `src/pages/`: login, registro, reserva, turnos del cliente, panel del barbero y administración.
- `src/services/storage.js`: carga, persistencia y creación de identificadores en `localStorage`.
- `src/utils/`: validaciones de formularios y reglas de disponibilidad/cola.
- `src/data/seed.js`: datos iniciales para la primera ejecución.
- `src/styles.css`: estilos y diseño adaptable.
"# RA2-TDA" 
