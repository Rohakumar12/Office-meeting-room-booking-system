const { OFFICE_HOURS } = require('../config/constants');

/**
 * Convert HH:MM string to minutes since midnight
 */
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Check if two time ranges overlap.
 * Overlap condition: existingStart < requestedEnd && existingEnd > requestedStart
 */
const doTimesOverlap = (existingStart, existingEnd, requestedStart, requestedEnd) => {
  return existingStart < requestedEnd && existingEnd > requestedStart;
};

/**
 * Validate that time is within office hours
 */
const isWithinOfficeHours = (startTime, endTime) => {
  const officeStart = timeToMinutes(OFFICE_HOURS.start);
  const officeEnd = timeToMinutes(OFFICE_HOURS.end);
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  return start >= officeStart && end <= officeEnd;
};

/**
 * Validate that startTime < endTime
 */
const isValidTimeRange = (startTime, endTime) => {
  return timeToMinutes(startTime) < timeToMinutes(endTime);
};

/**
 * Get normalized date (midnight UTC) from a date string or Date object
 */
const normalizeDate = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/**
 * Check if a date is in the past
 */
const isPastDate = (date, startTime) => {
  const now = new Date();
  const bookingDate = new Date(date);
  const [hours, minutes] = startTime.split(':').map(Number);
  bookingDate.setHours(hours, minutes, 0, 0);
  return bookingDate < now;
};

/**
 * Format time to 12-hour format (e.g. "10:30 AM")
 */
const formatTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`;
};

module.exports = {
  timeToMinutes,
  doTimesOverlap,
  isWithinOfficeHours,
  isValidTimeRange,
  normalizeDate,
  isPastDate,
  formatTime,
};
