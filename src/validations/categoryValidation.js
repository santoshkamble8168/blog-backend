const Joi = require("joi");

exports.createCategory = (req) => {
  const createCategorySchema = Joi.object({
    name: Joi.string().required()
  });

  return createCategorySchema.validate(req.body, { abortEarly: false });
};

exports.followCategory = (req) => {
  const followCategorySchema = Joi.object({
    following: Joi.boolean().required(),
  });

  return followCategorySchema.validate(req.body, { abortEarly: false });
};
