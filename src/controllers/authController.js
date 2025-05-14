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
      username,
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
        id: user._id,
        username: user.username,
        email: user.email,
        role: role.name,
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

const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const resetPasswordService = require("../services/auth/reset-password.service");
    const result = await resetPasswordService(email);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { register, login, logout, refreshToken, resetPassword };
