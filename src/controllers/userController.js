const {User} = require("../models")
const { AsyncErrorHandler } = require("../middlewares");
const { ErrorHandler, Check } = require("../utils");
const {userValidation} = require("../validations")
const {messages} = require("../config")

exports.createUser = AsyncErrorHandler(async (req, res, next) => {
  const { error } = userValidation.createUser(req)
  if (error) return next(new ErrorHandler(error.details, 409));

  const isExist = await Check.isExist(User, {email: req.body.email})
  if(isExist) return next(new ErrorHandler("Email already registered", 409));

  await User.create(req.body);
  //send email for verifation email address
  
  res.status(201).json({
    success: true,
    message: messages.user.create,
  });
});

exports.updateUser = AsyncErrorHandler(async (req, res) => {
  const user = await User.create(req.body);
  res.status(204).json({
    success: true,
    item: user,
  });
});

exports.updateUserPassword = AsyncErrorHandler(async(req, res, next) => {
  const user = await User.create(req.body);
  res.status(204).json({
    success: true,
    item: user,
  });
})

exports.deleteUser = AsyncErrorHandler(async (req, res) => {
  const user = await User.create(req.body);
  res.status(204).json({
    success: true,
    item: user,
  });
});

exports.getAllUsers = AsyncErrorHandler(async (req, res) => {
  //pagination
  //searching
  //filters
  console.log("token", req.cookies);
  const users = await User.find();
  res.status(200).json({
    success: true,
    item: users,
  });
});

exports.getUser = AsyncErrorHandler(async (req, res) => {
  const id = req.params.id
  const user = await User.findById(id);
  res.status(200).json({
    success: true,
    item: user,
  });
});