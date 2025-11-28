import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export const sendVerificationEmail = async (email: string, code: string) => {
  const mailOptions = {
    from: `"TUKSAQRO" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: '🔐 Código de Verificación - TUKSAQRO',
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Código de Verificación - TUKSAQRO</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            background-color: #f8fafc;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            margin: 20px 0;
          }
          .header {
            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .header p {
            margin: 8px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .code-container {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border: 2px solid #16a34a;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
            display: inline-block;
          }
          .code {
            font-size: 32px;
            font-weight: bold;
            color: #16a34a;
            letter-spacing: 4px;
            font-family: 'Courier New', monospace;
            margin: 0;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .warning strong {
            color: #92400e;
          }
          .footer {
            background-color: #f8fafc;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer p {
            margin: 0;
            font-size: 14px;
            color: #6b7280;
          }
          .footer a {
            color: #16a34a;
            text-decoration: none;
            font-weight: 500;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: white;
            margin-bottom: 10px;
          }
          .icon {
            font-size: 48px;
            margin-bottom: 15px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">🏠</div>
            <div class="logo">TUKSAQRO</div>
            <h1>Verificación de Cuenta</h1>
            <p>Tu código de seguridad ha llegado</p>
          </div>

          <div class="content">
            <h2 style="color: #1f2937; margin-bottom: 20px;">¡Hola!</h2>
            <p style="font-size: 16px; margin-bottom: 30px;">
              Gracias por registrarte en <strong>TUKSAQRO</strong>. Para completar tu verificación y activar tu cuenta, utiliza el siguiente código de 6 dígitos:
            </p>

            <div class="code-container">
              <div class="code">${code}</div>
            </div>

            <div class="warning">
              <strong>⚠️ Importante:</strong> Este código expirará en <strong>10 minutos</strong> por seguridad.
            </div>

            <div class="warning">
              <strong>📧 Si no encuentras este email:</strong> Revisa tu carpeta de <strong>Spam</strong> o <strong>Correo no deseado</strong>. A veces los emails de verificación llegan ahí.
            </div>

            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              Si no solicitaste esta verificación, puedes ignorar este mensaje de forma segura.
            </p>
          </div>

          <div class="footer">
            <p>
              <strong>TUKSAQRO</strong> - Tu plataforma inmobiliaria de confianza<br>
              <a href="http://localhost:3002">Visita nuestro sitio web</a> |
              <a href="mailto:appmovilesmxxx@gmail.com">Contáctanos</a>
            </p>
            <p style="margin-top: 10px; font-size: 12px;">
              © 2025 TUKSAQRO. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  }

  await transporter.sendMail(mailOptions)
}