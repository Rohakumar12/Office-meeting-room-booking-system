/**
 * Joi validation middleware factory
 * @param {Object} schema - Joi schema object
 * @param {string} source - 'body', 'params', or 'query'
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''),
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    req[source] = value;
    next();
  };
};

module.exports = { validate };
