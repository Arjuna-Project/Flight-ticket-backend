const User = require('../models/User.model');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

const registerUser = async (userData) => {
  const { name, email, password } = userData;

  const userExists = await User.findOne({ email });
  if (userExists) {
    const err = new Error('User already exists');
    err.statusCode = 400;
    throw err;
  }

  const hashedPassword = await hashPassword(password);
  const user = await User.create({ name, email, password: hashedPassword });

  if (user) {
    return {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token: generateToken(user._id, user.role)
    };
  } else {
    throw new Error('Invalid user data');
  }
};

const loginUser = async (userData) => {
  const { email, password } = userData;
  const user = await User.findOne({ email });

  if (user && (await comparePassword(password, user.password))) {
    return {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token: generateToken(user._id, user.role)
    };
  } else {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }
};

const getUserById = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

module.exports = { registerUser, loginUser, getUserById };
