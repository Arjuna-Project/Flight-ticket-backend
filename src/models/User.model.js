const { getDB } = require('../../config/db');

/**
 * 👤 User Schema Structure (Native MongoDB)
 * 
 * {
 *   _id: ObjectId,
 *   name: string,
 *   email: string,
 *   password: string, // hashed
 *   role: string ('user' | 'admin'),
 *   createdAt: Date,
 *   updatedAt: Date
 * }
 */
const getUserCollection = () => getDB().collection('users');

module.exports = getUserCollection;
