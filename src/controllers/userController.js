const {User} = require("../models")
const { AsyncErrorHandler } = require("../middlewares");
const { ErrorHandler } = require("../utils");

exports.createUser = AsyncErrorHandler(async (req, res) => {
  const user = await User.create(req.body);
  res.status(200).json({
    success: true,
    item: user,
  });
});