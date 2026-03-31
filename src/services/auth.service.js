const { getDB } = require('../../config/db');
const { ObjectId } = require('mongodb');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');

const getUserCollection = () => getDB().collection('users');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

const registerUser = async (userData) => {
  const { name, email, password } = userData;
  const users = getUserCollection();

  const userExists = await users.findOne({ email });
  if (userExists) {
    const err = new Error('User already exists');
    err.statusCode = 400;
    throw err;
  }

  const hashedPassword = await hashPassword(password);
  const newUser = {
    name,
    email,
    password: hashedPassword,
    role: 'user', // Set default role manually
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await users.insertOne(newUser);

  if (result.acknowledged) {
    return {
      user: { id: result.insertedId, name: newUser.name, email: newUser.email, role: newUser.role },
      token: generateToken(result.insertedId, newUser.role)
    };
  } else {
    throw new Error('Invalid user data');
  }
};

const loginUser = async (userData) => {
  const { email, password } = userData;
  const users = getUserCollection();
  const user = await users.findOne({ email });

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
  const users = getUserCollection();
  const user = await users.findOne(
    { _id: new ObjectId(id) },
    { projection: { password: 0 } }
  );
  
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

module.exports = { registerUser, loginUser, getUserById };
