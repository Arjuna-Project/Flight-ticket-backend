const generateBookingRef = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let ref = 'SKB-';
  for (let i = 0; i < 6; i++) {
    ref += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return ref;
};

module.exports = generateBookingRef;
