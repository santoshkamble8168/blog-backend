const { AsyncErrorHandler } = require("../middlewares");
const { User } = require("../models");
const { Check, ErrorHandler, setCookies, tokens, time } = require("../utils");
const { userValidation } = require("../validations");
const {userConfig, config, messages} = require("../config");

exports.login = AsyncErrorHandler(async (req, res, next) => {
  const { error } = userValidation.userLogin(req);
  if (error) return next(new ErrorHandler(error.de, 400));

  const isExist = await Check.isExist(User, { email: req.body.email, status: userConfig.status[1]});
  if (!isExist) return next(new ErrorHandler(messages.auth.emailPasswordIncorrect, 400));

  const user = await User.findOne({ email: req.body.email }).select("+password")

  const isPassword = await user.verifyPassword(req.body.password);
  if (!isPassword) return next(new ErrorHandler(messages.auth.emailPasswordIncorrect, 400));

  setCookies(user, res, 200, undefined);
});

exports.emailVerification = AsyncErrorHandler(async (req, res, next) => {
  const token = req.params.token;

  if (!token) return next(new ErrorHandler("Email verification token required", 400));

  const user = await User.findOne({
    "verifyEmail.token": token,
    "verifyEmail.expire": {
      $gte: new Date(),
    },
    status: userConfig.status[0],
  });

  if (!user) return next(new ErrorHandler("Token is expired or invalid", 400));

  user.status = userConfig.status[1]; //activate user
  await user.save();

  res.status(200).json({
    status: true,
    message: "email verified sucessfully",
    item: user,
  });
});

//logout user
exports.logout = AsyncErrorHandler(async(req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
      success: true,
      message: messages.auth.logout,
    });
})

//forgot password
exports.forgotPassword = AsyncErrorHandler(async(req, res, next) => {
    const user = await Check.isExist(User, {email: req.body.email})

    if (!user) return next(new ErrorHandler(messages.auth.provideValidEmail, 404))

    //generate reset-password token & expire time
    const resetPassword = {
      token: tokens.generateCryptoToken(),
      tokenExpire: time.getTime(1), //1day
    };

    user.resetPassword = resetPassword;

    //save resset token on db
    await user.save({validateBeforeSave: false})

    //const resetPasswordUrl = `${config.resetPasswordURL}/${resetPassword.token}`;
    //const message = `${messages.auth.forgotPassword} ${resetPasswordUrl}`; 
    //send email

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
})

//reset password
exports.resetPassword = AsyncErrorHandler(async(req, res, next) => {
    const token = req.params.token;

    const user = await User.findOne({
      "resetPassword.token": token,
      "resetPassword.tokenExpire": { $gte: Date.now() },
    }).select("+password")

    if (!user) return next(new ErrorHandler(messages.auth.resetPasswordErr, 401));
    

    if (req.body.password !== req.body.confirmPassword) return next(new ErrorHandler(messages.auth.passwordNotMatched, 401));

    user.password = req.body.password;
    user.resetPassword.token = undefined;
    user.resetPassword.tokenExpire = undefined;
    await user.save({ validateBeforeSave: false });
    
    setCookies(user, res, 200, messages.auth.passwordUpdated);
})