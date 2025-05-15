const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../utils/token");
const {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} = require("../utils/cookies");
const loginService = require("../services/auth/login.service");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Role = require("../models/Role");
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configuración del transporter de nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Función para enviar email de restablecimiento
const sendResetPasswordEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Restablecimiento de contraseña',
    html: `
      <h1>Restablecimiento de contraseña</h1>
      <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
      <a href="${resetUrl}">Restablecer contraseña</a>
      <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
      <p>El enlace expirará en 1 hora.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Solicitar restablecimiento de contraseña
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Generar token de restablecimiento
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hora

    // Guardar token en el usuario
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();


    // En producción, enviamos el email
    await sendResetPasswordEmail(email, resetToken);
    res.status(200).json({ message: "Se ha enviado un correo con las instrucciones" });
  } catch (error) {
    console.error('Error en requestPasswordReset:', error);
    res.status(500).json({ message: "Error al procesar la solicitud" });
  }
};

// Restablecer contraseña
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Buscar usuario con el token válido
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Token inválido o expirado" });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña y limpiar tokens
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({ message: "Error al restablecer la contraseña" });
  }
};

// Función para enviar email de bienvenida
const sendWelcomeEmail = async (email, username, password) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: '¡Bienvenido a nuestra plataforma!',
    html: `
      <h1>¡Bienvenido ${username}!</h1>
      <p>Gracias por registrarte en nuestra plataforma. Aquí están tus datos de acceso:</p>
      <ul>
        <li><strong>Usuario:</strong> ${username}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Contraseña:</strong> ${password}</li>
      </ul>
      <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
      <p>¡Que tengas un excelente día!</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Asignamos el rol "member" por defecto
    const memberRole = await Role.findOne({ name: "member" });
    if (!memberRole) {
      return res.status(500).json({ message: "Rol 'member' no encontrado" });
    }

    // Crear username a partir de firstName y lastName
    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      role: memberRole._id,
    });

    await newUser.save();

    // Generar tokens después del registro exitoso
    const token = generateAccessToken({ id: newUser._id, role: memberRole.name });
    const refreshToken = generateRefreshToken({ id: newUser._id });

    // Establecer la cookie de refresh token
    setRefreshTokenCookie(res, refreshToken);

    // Devolver la misma respuesta que el login
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: memberRole.name,
        permissions: memberRole.permissions || [],
      },
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ message: error.message });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, role } = await loginService(email, password);

    const token = generateAccessToken({ id: user._id, role: role.name });
    const refreshToken = generateRefreshToken({ id: user._id });

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      token,
      user: {
        ...user,
        role: {
          id: role._id,
          name: role.name
        },
        permissions: role.permissions || [],
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No autorizado" });

    const decoded = verifyToken(token, process.env.REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Usuario no encontrado" });

    const newToken = generateAccessToken({ id: user._id, role: user.role });
    res.status(200).json({ token: newToken });
  } catch (error) {
    res.status(401).json({ message: "Token inválido o expirado" });
  }
};

const logout = async (req, res) => {
  try {
    clearRefreshTokenCookie(res);
    res.status(200).json({ message: "Logout exitoso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const resetPasswordService = require("../services/auth/reset-password.service");
    const result = await resetPasswordService(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; */

module.exports = { register, login, logout, refreshToken,sendWelcomeEmail, resetPassword,requestPasswordReset };
