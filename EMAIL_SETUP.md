# Configuración de Email para Reset de Contraseña

Para que funcione el sistema de recuperación de contraseña, necesitas configurar las siguientes variables de entorno en tu archivo `.env`:

## Variables de Entorno Requeridas

```env
# Configuración SMTP para envío de emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
SMTP_FROM=noreply@inmobiliaria.com

# URL de la aplicación (ya debería estar configurada)
NEXTAUTH_URL=http://localhost:3000
```

## Configuración de Gmail

Si usas Gmail, necesitas:

1. **Habilitar autenticación de 2 factores** en tu cuenta de Gmail
2. **Generar una contraseña de aplicación**:
   - Ve a [Google Account Settings](https://myaccount.google.com/)
   - Seguridad → Contraseñas de aplicaciones
   - Selecciona "Mail" y "Otro (nombre personalizado)"
   - Usa esa contraseña de 16 caracteres como `SMTP_PASS`

## Configuración Alternativa

Si no quieres usar Gmail, puedes usar otros proveedores SMTP:

### Mailtrap (para desarrollo/testing)
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=tu-usuario-mailtrap
SMTP_PASS=tu-password-mailtrap
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=tu-api-key-sendgrid
```

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=tu-email@outlook.com
SMTP_PASS=tu-password
```

## Plantilla del Email

El sistema envía emails HTML con:
- Enlace de recuperación válido por 1 hora
- Diseño responsive y profesional
- Mensaje de seguridad si no se solicitó el cambio

## Seguridad

- Los tokens expiran en 1 hora
- Los tokens se limpian después del uso exitoso
- No se revela si un email existe o no (protección contra enumeración)
- Las contraseñas se hashean con bcrypt