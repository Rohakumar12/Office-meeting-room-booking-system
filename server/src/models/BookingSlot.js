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





// Exactly — an index is mainly used for fast searching, but a unique index has an additional job: enforcing uniqueness during writes.

// Normal index
// bookingSlotSchema.index({ roomId: 1 });

// This means:

// "Keep an index so MongoDB can find documents by roomId faster."

// It doesn't prevent duplicates:

// Room A ✅
// Room A ✅
// Room A ✅
// Unique index

// When you add:

// bookingSlotSchema.index(
//   { roomId: 1, date: 1, minute: 1 },
//   { unique: true }
// );

// MongoDB maintains an index structure something like:

// INDEX
// ----------------------------------
// (RoomA, Sep27, 600) → document #1
// (RoomA, Sep27, 601) → document #2
// (RoomA, Sep27, 602) → document #3

// Now you try to insert:

// (RoomA, Sep27, 600)

// MongoDB doesn't just insert the document blindly.

// It first has to add its key to the unique index.

// It checks:

// Does (RoomA, Sep27, 600) already exist in this unique index?
// If NO
// Index:
// (RoomA, Sep27, 600) → document #1

// The key is new.

// INSERT ✅
// If YES

// MongoDB finds:

// (RoomA, Sep27, 600) → document #1

// That key already exists.

// Because the index is declared:

// { unique: true }

// MongoDB says:

// ❌ Duplicate key

// and rejects the insert.