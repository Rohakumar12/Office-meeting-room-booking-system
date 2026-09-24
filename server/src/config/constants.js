// Office hours configuration (24h format)
const OFFICE_HOURS = {
  start: '08:00',
  end: '20:00',
  workDays: [1, 2, 3, 4, 5], // Monday = 1, Friday = 5
};

// JWT configuration
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  expire: process.env.JWT_EXPIRE || '7d',
};

// Cookie configuration
const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Booking status enum
const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

// User roles
const USER_ROLES = {
  EMPLOYEE: 'employee',
  ADMIN: 'admin',
};

// Pagination defaults
const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 10,
  maxLimit: 100,
};

// Available time slots (30-minute intervals)
const TIME_SLOTS = [];
for (let hour = 8; hour < 20; hour++) {
  TIME_SLOTS.push(`${String(hour).padStart(2, '0')}:00`);
  TIME_SLOTS.push(`${String(hour).padStart(2, '0')}:30`);
}
TIME_SLOTS.push('20:00');

// Common amenities
const AMENITIES = [
  'Projector',
  'Whiteboard',
  'TV',
  'Video Conferencing',
  'WiFi',
  'Air Conditioning',
  'Conference Phone',
  'Flip Chart',
  'Laser Pointer',
  'Coffee Machine',
];

module.exports = {
  OFFICE_HOURS,
  JWT_CONFIG,
  COOKIE_CONFIG,
  BOOKING_STATUS,
  USER_ROLES,
  PAGINATION,
  TIME_SLOTS,
  AMENITIES,
};
