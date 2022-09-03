const { User } = require("../models");
const { AsyncErrorHandler } = require("../middlewares");
const { ErrorHandler, Check } = require("../utils");
const { userValidation } = require("../validations");
const { messages } = require("../config");

exports.createUser = AsyncErrorHandler(async (req, res, next) => {
  const { error } = userValidation.createUser(req);
  if (error) return next(new ErrorHandler(error.details, 409));

  const isExist = await Check.isExist(User, { email: req.body.email });
  if (isExist) return next(new ErrorHandler("Email already registered", 409));

  await User.create(req.body);
  //send email for verifation email address

  res.status(201).json({
    success: true,
    message: messages.user.create,
  });
});

exports.updateUser = AsyncErrorHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) return next(new ErrorHandler("User Id not provided", 404));

  const user = Check.isExist(User, id);
  if (!user) return next(new ErrorHandler("User not provided", 404));

  //email & password not allowed here to update
  const updateFields = {
    name: req.body.name,
    role: req.body.role,
    avatar: req.body.avatar,
    status: req.body.status
  };

  const updateUser = await User.findOneAndUpdate(
    id,
    {
      $set: updateFields,
    },
    { new: true }
  )

  res.status(200).json({
    success: true,
    messages: messages.user.update,
    item: updateUser,
  });
});

exports.updateUserPassword = AsyncErrorHandler(async (req, res, next) => {
  const id = req.params.id;
  if (!id) return next(new ErrorHandler("User Id not provided", 404));
  
  if(req.body.password !== req.body.confirmPassword) return next(new ErrorHandler("Password not matched", 401))

  const user = await User.findById(id).select("+password")
  if (!user) return next(new ErrorHandler("User not found", 404));

  const isPasswordMatched = await user.verifyPassword(req.body.oldPassword);
  if(!isPasswordMatched) return next(new ErrorHandler("old password is incorrect!", 401))

  user.password = req.body.password

  await user.save()

  res.status(200).json({
    success: true,
    message: messages.user.passwordUpdate,
  });
});

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
  //filters++
  const users = await User.find();
  res.status(200).json({
    success: true,
    item: users,
  });
});

exports.getUser = AsyncErrorHandler(async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id);
  res.status(200).json({
    success: true,
    item: user,
  });
});
