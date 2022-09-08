const Joi = require("joi");

exports.createTag = (req) => {
  const createTagSchema = Joi.object({
    tag: Joi.string().required(),
  });

  return createTagSchema.validate(req.body, { abortEarly: false });
};

exports.followTag = (req) => {
  const followTagSchema = Joi.object({
    following: Joi.boolean().required(),
  });

  return followTagSchema.validate(req.body, { abortEarly: false });
};