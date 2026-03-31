const { getDB } = require('../../config/db');

/**
 * ✈️ Airline Schema Structure (Native MongoDB)
 * 
 * {
 *   _id: ObjectId,
 *   name: string,
 *   code: string
 * }
 */
const getAirlineCollection = () => getDB().collection('airlines');

module.exports = getAirlineCollection;
