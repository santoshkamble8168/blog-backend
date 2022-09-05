const Joi = require("joi");

exports.createCategory = (req) => {
  const createCategorySchema = Joi.object({
    name: Joi.string().required()
  });

  return createCategorySchema.validate(req.body, { abortEarly: false });
};
