const User = require('../../models/User');
const Role = require('../../models/Role');
const bcrypt = require('bcryptjs');

const createUser = async (userData) => {
  try {
    const { username, email, password, phone, address, role } = userData;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Verificar que el rol existe
    const roleExists = await Role.findById(role);
    if (!roleExists) {
      throw new Error('El rol especificado no existe');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phone,
      address,
      role,
      isActive: true,
      isSuspended: false
    });

    // Guardar el usuario
    await newUser.save();

    // Obtener el usuario sin la contraseña y con el rol poblado
    const userResponse = await User.findById(newUser._id)
      .select('-password')
      .populate('role', 'name')
      .lean();

    // Transformar la respuesta para incluir el rol como objeto
    return {
      ...userResponse,
      role: {
        id: userResponse.role._id,
        name: userResponse.role.name
      }
    };
  } catch (error) {
    throw error;
  }
};

module.exports = createUser; 