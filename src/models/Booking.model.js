const { getDB } = require('../../config/db');

/**
 * 🎫 Booking Schema Structure (Native MongoDB)
 * 
 * {
 *   _id: ObjectId,
 *   user: ObjectId (ref -> users),
 *   flightInstance: ObjectId (ref -> flightinstances),
 *   bookingReference: string,
 *   passengers: Array<{ title: string, firstName: string, lastName: string, dob: string, nationality: string, passportInfo: object }>,
 *   totalPrice: number,
 *   status: string ('Confirmed' | 'Cancelled' | 'Completed'),
 *   createdAt: Date,
 *   updatedAt: Date
 * }
 */
const getBookingCollection = () => getDB().collection('bookings');

module.exports = getBookingCollection;
