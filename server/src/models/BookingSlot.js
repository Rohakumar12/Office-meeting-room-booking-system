const mongoose = require('mongoose');

// A reservation for each minute of a confirmed booking.  The unique index is
// the database-level guard that makes an overlap impossible even on a
// standalone MongoDB server, where multi-document transactions are unavailable.
const bookingSlotSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    date: { type: Date, required: true },
    minute: { type: Number, required: true, min: 0, max: 1439 },
  },
  { timestamps: true }
);

bookingSlotSchema.index({ roomId: 1, date: 1, minute: 1 }, { unique: true });
bookingSlotSchema.index({ bookingId: 1 });

module.exports = mongoose.model('BookingSlot', bookingSlotSchema);
