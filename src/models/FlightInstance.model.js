const { getDB } = require('../../config/db');

/**
 * 📅 FlightInstance Schema Structure (Native MongoDB)
 * 
 * {
 *   _id: ObjectId,
 *   flight: ObjectId (ref -> flights),
 *   aircraft: ObjectId (ref -> aircrafts),
 *   departureTime: Date,
 *   arrivalTime: Date,
 *   status: string ('Scheduled' | 'Delayed' | 'Cancelled' | 'Completed'),
 *   classes: {
 *     economy: { price: number, availableSeats: number },
 *     premium: { price: number, availableSeats: number },
 *     business: { price: number, availableSeats: number },
 *     firstClass: { price: number, availableSeats: number }
 *   }
 * }
 */
const getFlightInstanceCollection = () => getDB().collection('flightinstances');

module.exports = getFlightInstanceCollection;
