const User = require("../../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

module.exports = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("No existe un usuario con ese correo electrónico");
  }

  // Generar token único para reset de contraseña
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = Date.now() + 3600000; // 1 hora

  // Guardar token en el usuario
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetTokenExpiry;
  await user.save();

  // Configurar el transporter de nodemailer
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Crear el enlace de reset
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;

  // Enviar email
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: user.email,
    subject: "Restablecimiento de contraseña",
    html: `
      <p>Has solicitado restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Este enlace expirará en 1 hora.</p>
      <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
    `,
  });

  return { message: "Se ha enviado un correo con las instrucciones para restablecer tu contraseña" };
}; 