const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Room name cannot exceed 100 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    floor: {
      type: String,
      required: [true, 'Floor is required'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [1000, 'Capacity cannot exceed 1000'],
    },
    amenities: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    image: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for room filtering and availability queries
roomSchema.index({ isActive: 1 });
roomSchema.index({ capacity: 1 });
roomSchema.index({ floor: 1 });
roomSchema.index({ location: 1 });
roomSchema.index({ isActive: 1, capacity: 1 }); // Compound for filtering
roomSchema.index({ amenities: 1 }); // For amenity-based filtering

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
