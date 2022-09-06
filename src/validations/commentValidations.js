const Joi = require("joi");

exports.createComment = (req) => {
  const createCommentSchema = Joi.object({
    comment: Joi.string().required(),
    postId: Joi.string().hex().length(24).required()
  });

  return createCommentSchema.validate(req.body, { abortEarly: false });
};
