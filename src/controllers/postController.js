const {Post} = require("../models")
const {AsyncErrorHandler} = require("../middlewares")
const {ErrorHandler} = require("../utils")

exports.createPost = AsyncErrorHandler(async (req, res) => {
  const post = await Post.create(req.body);
  res.status(200).json({
    success: true,
    item: post,
  });
});