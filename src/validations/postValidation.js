const Joi = require("joi");

exports.createPost = (req) => {
  const createPostSchema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    description: Joi.string(),
    categoryId: Joi.array().items(Joi.string().required()),
    tagId: Joi.array().items(Joi.string()),
  });

  return createPostSchema.validate(req.body, { abortEarly: false });
};

exports.likePost = (req) => {
  const likePostSchema = Joi.object({
    like: Joi.boolean().required()
  });

  return likePostSchema.validate(req.body, { abortEarly: false });
};

exports.bookmarkPost = (req) => {
  const bookmarkPostSchema = Joi.object({
    bookmark: Joi.boolean().required(),
  });

  return bookmarkPostSchema.validate(req.body, { abortEarly: false });
};
