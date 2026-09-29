const Joi = require('joi');
//validate req data means define the rules that is being checked in validate middleware
const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 100 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string()
    .min(8)
    // Must contain a lowercase, an uppercase, a digit and a special character.
    // The digit and special-character checks use (?=.*x) so they match anywhere
    // in the string. The previous (?=\d) only passed when the password began
    // with a digit: the client enforced that strictly while the server did not,
    // so the two validators disagreed and valid passwords were rejected.
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required',
    }),
  department: Joi.string().trim().max(100).optional(),
  employeeId: Joi.string().trim().max(50).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
  rememberMe: Joi.boolean().default(true),
});

module.exports = { registerSchema, loginSchema };
