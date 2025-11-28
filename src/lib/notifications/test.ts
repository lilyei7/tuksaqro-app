/**
 * SCRIPT DE PRUEBA: Sistema de Notificaciones
 * 
 * Este archivo contiene ejemplos para probar el sistema de notificaciones
 * sin necesidad de esperar eventos reales.
 * 
 * Ejecutar con: npx ts-node src/lib/notifications/test.ts
 * O copiar/pegar funciones en la consola del navegador después de importar
 */

import { notifyPasswordChanged, notifyNewProperty, notifyNewOffer, notifyNewAppointment, getNotificationCounts, markAllNotificationsAsRead } from "./notificationService"

/**
 * TEST 1: Crear notificación de cambio de contraseña
 */
export async function testPasswordNotification(userId: string) {
  console.log("📝 TEST 1: Creando notificación de cambio de contraseña...")
  try {
    const result = await notifyPasswordChanged(userId)
    console.log("✅ Notificación creada:", result)
    return result
  } catch (error) {
    console.error("❌ Error:", error)
  }
}

/**
 * TEST 2: Crear notificación de nueva propiedad
 */
export async function testNewPropertyNotification(adminId: string) {
  console.log("📝 TEST 2: Creando notificación de nueva propiedad...")
  try {
    const result = await notifyNewProperty(
      adminId,
      "Casa acogedora en Ñuñoa con vista al parque",
      "prop-123"
    )
    console.log("✅ Notificación creada:", result)
    return result
  } catch (error) {
    console.error("❌ Error:", error)
  }
}

/**
 * TEST 3: Crear notificación de nueva oferta
 */
export async function testNewOfferNotification(ownerId: string) {
  console.log("📝 TEST 3: Creando notificación de nueva oferta...")
  try {
    const result = await notifyNewOffer(
      ownerId,
      420000000,
      "Departamento en La Florida",
      "offer-456"
    )
    console.log("✅ Notificación creada:", result)
    return result
  } catch (error) {
    console.error("❌ Error:", error)
  }
}

/**
 * TEST 4: Crear notificación de nueva cita
 */
export async function testNewAppointmentNotification(userId: string) {
  console.log("📝 TEST 4: Creando notificación de nueva cita...")
  try {
    const appointmentDate = new Date()
    appointmentDate.setDate(appointmentDate.getDate() + 3) // 3 días después
    appointmentDate.setHours(14, 30, 0) // 14:30

    const result = await notifyNewAppointment(
      userId,
      appointmentDate,
      "Casa de 3 pisos en Providencia",
      "appt-789"
    )
    console.log("✅ Notificación creada:", result)
    return result
  } catch (error) {
    console.error("❌ Error:", error)
  }
}

/**
 * TEST 5: Obtener conteos de notificaciones
 */
export async function testGetNotificationCounts(userId: string) {
  console.log("📝 TEST 5: Obteniendo conteos de notificaciones...")
  try {
    const counts = await getNotificationCounts(userId)
    console.log("✅ Conteos obtenidos:")
    console.log(`   - Sin leer: ${counts.unread}`)
    console.log(`   - Leídas: ${counts.read}`)
    console.log(`   - Total: ${counts.total}`)
    return counts
  } catch (error) {
    console.error("❌ Error:", error)
  }
}

/**
 * TEST 6: Marcar todas como leídas
 */
export async function testMarkAllAsRead(userId: string) {
  console.log("📝 TEST 6: Marcando todas las notificaciones como leídas...")
  try {
    const result = await markAllNotificationsAsRead(userId)
    console.log("✅ Notificaciones marcadas como leídas")
    console.log(`   - ${result.count} notificaciones actualizadas`)
    return result
  } catch (error) {
    console.error("❌ Error:", error)
  }
}

/**
 * SUITE DE PRUEBAS COMPLETA
 * Ejecutar todas las pruebas en secuencia
 */
export async function runAllTests(userId: string, adminId: string, ownerId: string) {
  console.log("🚀 Iniciando suite de pruebas...")
  console.log("═".repeat(50))

  // Test 1
  await testPasswordNotification(userId)
  console.log("─".repeat(50))

  // Test 2
  await testNewPropertyNotification(adminId)
  console.log("─".repeat(50))

  // Test 3
  await testNewOfferNotification(ownerId)
  console.log("─".repeat(50))

  // Test 4
  await testNewAppointmentNotification(userId)
  console.log("─".repeat(50))

  // Test 5
  const counts = await testGetNotificationCounts(userId)
  console.log("─".repeat(50))

  console.log("═".repeat(50))
  console.log("✅ Suite de pruebas completada!")
  console.log("\n📊 Resumen:")
  console.log(`   - Total de notificaciones creadas: ${counts?.total || 0}`)
  console.log(`   - Sin leer: ${counts?.unread || 0}`)
  console.log(`   - Leídas: ${counts?.read || 0}`)
  console.log("\n💡 Próximo paso:")
  console.log(`   - Visita: http://localhost:3000/sistema-control/notificaciones`)
  console.log(`   - Deberías ver todas las notificaciones creadas`)
}

/*
 * ============================================================================
 * CÓMO EJECUTAR LAS PRUEBAS
 * ============================================================================
 * 
 * OPCIÓN 1: Desde la consola del navegador (recomendado)
 * ─────────────────────────────────────────────────────
 * 1. Ve a http://localhost:3000/sistema-control (requiere estar logueado como admin)
 * 2. Abre la consola (F12 o Ctrl+Shift+I)
 * 3. Pega uno de estos comandos:
 * 
 *    // Obtener el ID del usuario actual
 *    const userId = localStorage.getItem("userId") // O desde sesión
 *    
 *    // Crear una notificación de prueba
 *    fetch("/api/admin/notifications", {
 *      method: "POST",
 *      headers: { "Content-Type": "application/json" },
 *      body: JSON.stringify({
 *        type: "PASSWORD_CHANGED",
 *        title: "Test: Contraseña Actualizada",
 *        message: "Esta es una notificación de prueba"
 *      })
 *    }).then(r => r.json()).then(console.log)
 * 
 * OPCIÓN 2: Mediante API REST (curl)
 * ────────────────────────────────────
 * 1. Abre terminal
 * 2. Ejecuta:
 * 
 *    curl -X GET http://localhost:3000/api/admin/notifications \
 *      -H "Cookie: __Secure-next-auth.session-token=TU_TOKEN_AQUI"
 * 
 * OPCIÓN 3: Desde archivo TypeScript
 * ────────────────────────────────────
 * 1. Crea archivo test-notifications.ts en src/scripts/
 * 2. Copia el código de runAllTests()
 * 3. Ejecuta: npx ts-node src/scripts/test-notifications.ts
 * 
 * ============================================================================
 * CASOS DE PRUEBA MANUALES
 * ============================================================================
 * 
 * ✅ CASO 1: Cambiar contraseña
 *    1. Ve a /auth/forgot-password
 *    2. Ingresa tu email
 *    3. Revisa el correo (simulado en consola)
 *    4. Haz clic en el enlace de reset
 *    5. Cambia tu contraseña
 *    6. Verifica que aparezca notificación en /sistema-control/notificaciones
 * 
 * ✅ CASO 2: Registrar nuevo usuario (como admin)
 *    1. Ve a /sistema-control/usuarios
 *    2. Haz clic en "Agregar usuario"
 *    3. Completa el formulario
 *    4. Haz clic en crear
 *    5. Verifica notificación en panel admin
 * 
 * ✅ CASO 3: Crear nueva propiedad (como admin)
 *    1. Ve a /sistema-control/propiedades
 *    2. Haz clic en "Nueva propiedad"
 *    3. Completa el formulario
 *    4. Haz clic en crear
 *    5. Verifica notificación "Nueva Propiedad"
 * 
 * ✅ CASO 4: Filtrar notificaciones
 *    1. Ve a /sistema-control/notificaciones
 *    2. Haz clic en "Sin leer" para ver solo sin leer
 *    3. Haz clic en "Leídas" para ver solo leídas
 *    4. Haz clic en "Todas" para ver todas
 * 
 * ✅ CASO 5: Marcar como leída
 *    1. En /sistema-control/notificaciones
 *    2. Haz clic en "Marcar como leída" en una notificación
 *    3. Verifica que el badge azul "Nuevo" desaparezca
 * 
 * ✅ CASO 6: Eliminar notificación
 *    1. En /sistema-control/notificaciones
 *    2. Haz clic en el icono de papelera
 *    3. Verifica que se elimine de la lista
 * 
 * ✅ CASO 7: Widget en dashboard
 *    1. Ve a /sistema-control (dashboard)
 *    2. Verifica que el widget muestre las 5 últimas sin leer
 *    3. Haz clic en "Ver todas las notificaciones →"
 *    4. Verifica que navegue a /sistema-control/notificaciones
 * 
 * ============================================================================
 * VARIABLES DE PRUEBA (ACTUALIZAR CON VALORES REALES)
 * ============================================================================
 * 
 * userId = "user-id-del-usuario-actual"  // Admin que está logueado
 * adminId = "admin-id"                    // ID del admin
 * ownerId = "propietario-id"              // ID de un propietario
 * 
 * Encuentra estos IDs en:
 * - Consola del navegador: check localStorage
 * - BD: SELECT id FROM User WHERE role = 'ADMIN'
 * - API response: GET /api/admin/users
 * 
 * ============================================================================
 */

export {}
