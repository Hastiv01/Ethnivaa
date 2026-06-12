function requireFields(fields) {
  return (req, res, next) => {
    const missingFields = fields.filter((field) => req.body?.[field] == null || req.body[field] === '');

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    return next();
  };
}

function positiveInteger(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function nonNegativeInteger(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

module.exports = {
  requireFields,
  positiveInteger,
  nonNegativeInteger,
};