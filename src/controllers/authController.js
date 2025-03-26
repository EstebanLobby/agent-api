const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Role = require("../models/Role");

// Registrar usuario nuevo
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "El usuario ya existe" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login de usuario (JWT + Refresh Token)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar el usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // Obtener el nombre del rol basado en el ID del rol
    const role = await Role.findById(user.role).lean();

    if (!role) {
      return res.status(400).json({ message: "Rol no encontrado" });
    }

    // Crear JWT de corta duración (15 min)
    const token = jwt.sign(
      { id: user._id, role: role.name }, // Incluir el nombre del rol en el JWT
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Crear Refresh Token más largo (7 días)
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Enviar Refresh Token en cookie HttpOnly segura
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 3600 * 1000, // 7 días
    });

    // Devolver JWT, usuario y nombre del rol al frontend
    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: role.name,
        permissions: role.permissions || [], // 🔥 agregar esto
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Renovar JWT usando Refresh Token
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Refresh token no encontrado" });
    }

    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    // Generar nuevo JWT
    const newToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({ token: newToken });
  } catch (error) {
    res.status(401).json({ message: "Refresh token inválido" });
  }
};

// Logout (eliminar cookie Refresh Token)
const logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logout exitoso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const me = async (req, res) => {
  try {
    // Paso 1: Obtener el token del header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No autorizado, falta token" });
    }

    // Paso 2: Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Paso 3: Buscar el usuario (excluyendo la contraseña)
    const user = await User.findById(decoded.id).select("-password").lean();

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Paso 4: Buscar el rol y sus permisos
    const role = await Role.findById(user.role).lean();

    if (!role) {
      return res.status(400).json({ message: "Rol no encontrado" });
    }

    // Paso 5: Devolver todos los datos del usuario + rol + permisos
    res.status(200).json({
      ...user,
      role: role.name,
      permissions: role.permissions || [], // Asegurate de que Role tenga esto en el esquema
    });
  } catch (err) {
    console.error("Error en /me:", err);
    res.status(401).json({ message: "Token inválido o expirado" });
  }
};


module.exports = { register, login, logout, refreshToken, me };

module.exports = { register, login, logout, refreshToken, me };
