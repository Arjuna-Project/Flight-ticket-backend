const { getDB } = require('../../config/db');

/**
 * 🛫 Flight Schema Structure (Native MongoDB)
 * 
 * {
 *   _id: ObjectId,
 *   flightNumber: string,
 *   airline: ObjectId (ref -> airlines),
 *   departureAirport: ObjectId (ref -> airports),
 *   arrivalAirport: ObjectId (ref -> airports),
 *   durationMinutes: number
 * }
 */
const getFlightCollection = () => getDB().collection('flights');

module.exports = getFlightCollection;
