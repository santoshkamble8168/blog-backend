const Joi = require("joi");

exports.createPost = (req) => {
  const createPostSchema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    categoryId: Joi.array().items(Joi.string().required()),
    tagId: Joi.array().items(Joi.string())
  });

  return createPostSchema.validate(req.body, { abortEarly: false });
};
