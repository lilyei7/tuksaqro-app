# 🚀 TUKSAQRO - Credenciales de Prueba

## Usuarios de Prueba Creados

### 🔴 ADMINISTRADOR (Acceso Total al Sistema)
- **Email:** `admin@tuksaqro.com`
- **Contraseña:** `TUKSAQRO2025!Admin#Secure`
- **Rol:** ADMIN
- **Acceso:** Panel de administración completo (`/sistema-control`)

### 🔵 CLIENTE (Usuario Final)
- **Email:** `cliente@tuksaqro.com`
- **Contraseña:** `Cliente2025!`
- **Rol:** CLIENT
- **Acceso:** Buscar propiedades, crear ofertas, ver perfil

### 🟡 PROPIETARIO (Dueño de Propiedades)
- **Email:** `propietario@tuksaqro.com`
- **Contraseña:** `Propietario2025!`
- **Rol:** OWNER
- **Acceso:** Gestionar propiedades, ver ofertas, gestionar contratos

### 🟢 AGENTE INMOBILIARIO (Profesional)
- **Email:** `agente@tuksaqro.com`
- **Contraseña:** `Agente2025!`
- **Rol:** AGENT
- **Acceso:** Moderar propiedades, gestionar ofertas, acceso avanzado

## 🔐 Instrucciones de Uso

1. **Iniciar Sesión:**
   - Ve a: `http://localhost:3001/auth/login`
   - Usa cualquiera de los emails y contraseñas arriba

2. **Acceder al Panel Admin:**
   - Solo con usuario ADMIN
   - URL: `http://localhost:3001/sistema-control`
   - O clic en ícono de escudo (🛡️) en el header

3. **Funcionalidades por Rol:**
   - **ADMIN:** Dashboard completo, gestión de usuarios, propiedades y ofertas
   - **CLIENT:** Buscar propiedades, hacer ofertas
   - **OWNER:** Publicar propiedades, gestionar ofertas recibidas
   - **AGENT:** Acceso profesional a todas las funcionalidades

## ⚠️ Notas de Seguridad

- Las contraseñas incluyen mayúsculas, minúsculas, números y símbolos
- Todos los usuarios tienen emails verificados
- Las credenciales son solo para desarrollo/pruebas
- En producción, cambiar todas las contraseñas

## 🎯 Próximos Pasos

1. Probar login con diferentes roles
2. Verificar funcionalidades del panel admin
3. Probar sistema de ofertas
4. Implementar sistema de documentos y contratos