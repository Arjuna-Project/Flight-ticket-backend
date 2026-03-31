const { getDB } = require('../../config/db');

/**
 * 🛫 Aircraft Schema Structure (Native MongoDB)
 * 
 * {
 *   _id: ObjectId,
 *   airline: ObjectId (ref -> airlines),
 *   model: string,
 *   capacity: number
 * }
 */
const getAircraftCollection = () => getDB().collection('aircrafts');

module.exports = getAircraftCollection;
