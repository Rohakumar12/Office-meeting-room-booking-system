const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid start time format (HH:MM)'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid end time format (HH:MM)'],
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
    attendees: {
      type: Number,
      min: [1, 'At least 1 attendee required'],
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// PRIMARY: Availability query index — used for overlap detection
bookingSchema.index({ roomId: 1, date: 1, status: 1 });

// User booking history
bookingSchema.index({ userId: 1, date: -1 });

// Admin analytics
bookingSchema.index({ date: -1, status: 1 });
bookingSchema.index({ status: 1 });

// Combined for admin filtering
bookingSchema.index({ roomId: 1, date: -1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
