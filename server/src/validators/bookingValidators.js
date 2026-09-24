const Joi = require('joi');

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

const createBookingSchema = Joi.object({
  roomId: Joi.string().hex().length(24).required().messages({
    'any.required': 'Room ID is required',
    'string.hex': 'Invalid Room ID format',
  }),
  title: Joi.string().trim().max(200).required().messages({
    'any.required': 'Meeting title is required',
    'string.max': 'Title cannot exceed 200 characters',
  }),
  description: Joi.string().trim().max(1000).optional().allow(''),
  date: Joi.date().iso().required().messages({
    'any.required': 'Date is required',
    'date.base': 'Invalid date format',
  }),
  startTime: Joi.string().pattern(timePattern).required().messages({
    'any.required': 'Start time is required',
    'string.pattern.base': 'Start time must be in HH:MM format',
  }),
  endTime: Joi.string().pattern(timePattern).required().messages({
    'any.required': 'End time is required',
    'string.pattern.base': 'End time must be in HH:MM format',
  }),
  attendees: Joi.number().integer().min(1).optional(),
});

const updateBookingSchema = Joi.object({
  title: Joi.string().trim().max(200).optional(),
  description: Joi.string().trim().max(1000).optional().allow(''),
  date: Joi.date().iso().optional(),
  startTime: Joi.string().pattern(timePattern).optional(),
  endTime: Joi.string().pattern(timePattern).optional(),
  attendees: Joi.number().integer().min(1).optional(),
});

const availabilityQuerySchema = Joi.object({
  roomId: Joi.string().hex().length(24).optional(),
  date: Joi.date().iso().required().messages({
    'any.required': 'Date is required for availability check',
  }),
  startTime: Joi.string().pattern(timePattern).optional(),
  endTime: Joi.string().pattern(timePattern).optional(),
  capacity: Joi.number().integer().min(1).optional(),
  amenities: Joi.alternatives()
    .try(Joi.array().items(Joi.string()), Joi.string())
    .optional(),
});

module.exports = { createBookingSchema, updateBookingSchema, availabilityQuerySchema };
