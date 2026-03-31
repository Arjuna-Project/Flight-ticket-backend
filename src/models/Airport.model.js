const { getDB } = require('../../config/db');

/**
 * 🏙️ Airport Schema Structure (Native MongoDB)
 * 
 * {
 *   _id: ObjectId,
 *   name: string,
 *   code: string,
 *   city: string,
 *   country: string
 * }
 */
const getAirportCollection = () => getDB().collection('airports');

module.exports = getAirportCollection;
