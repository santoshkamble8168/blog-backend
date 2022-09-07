const Joi = require("joi");

exports.createTag = (req) => {
  const createTagSchema = Joi.object({
    tag: Joi.string().required(),
  });

  return createTagSchema.validate(req.body, { abortEarly: false });
};
