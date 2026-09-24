const Joi = require('joi');

const createRoomSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  location: Joi.string().trim().max(200).required(),
  floor: Joi.string().trim().required(),
  capacity: Joi.number().integer().min(1).max(1000).required(),
  amenities: Joi.array().items(Joi.string().trim()).default([]),
  description: Joi.string().trim().max(1000).optional().allow(''),
  image: Joi.string().uri().optional().allow('', null),
  isActive: Joi.boolean().default(true),
});

const updateRoomSchema = Joi.object({
  name: Joi.string().trim().max(100).optional(),
  location: Joi.string().trim().max(200).optional(),
  floor: Joi.string().trim().optional(),
  capacity: Joi.number().integer().min(1).max(1000).optional(),
  amenities: Joi.array().items(Joi.string().trim()).optional(),
  description: Joi.string().trim().max(1000).optional().allow(''),
  image: Joi.string().uri().optional().allow('', null),
  isActive: Joi.boolean().optional(),
});

const roomFilterSchema = Joi.object({
  capacity: Joi.number().integer().min(1).optional(),
  floor: Joi.string().trim().optional(),
  amenities: Joi.alternatives()
    .try(Joi.array().items(Joi.string()), Joi.string())
    .optional(),
  isActive: Joi.boolean().optional(),
  search: Joi.string().trim().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

module.exports = { createRoomSchema, updateRoomSchema, roomFilterSchema };
