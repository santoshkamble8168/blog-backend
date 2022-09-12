const AsyncErrorHandler = require("./AsyncErrorHandler");
const {tokens, ErrorHandler} = require("../utils");
const { User } = require("../models");
const {userConfig} = require("../config")

exports.Authentication = AsyncErrorHandler(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }

  const decodedToken = tokens.decodeJwtToken(token);

  if (!decodedToken) {
    return next(
      new ErrorHandler("Your JWT token has expired.Please login again", 401)
    );
  }

  req.user = await User.findById(decodedToken._id);

  //check is admin
  if (req.user.role === userConfig.roles[1]) {
    req.user.isAdmin = true;
  }

  next();
});

exports.Authorization = AsyncErrorHandler(async (req, res, next) => {
  // const { token } = req.cookies;

  // if (!token) {
  //   return next(new ErrorHandler("Please login to access this resource", 401));
  // }

  // const decodedToken = tokens.decodeJwtToken(token);

  // req.user = await User.findById(decodedToken._id);

  // //check is admin
  // if (req.user.role === userConfig.roles[1]) {
  //   req.user.isAdmin = true;
  // }

  // next();
});

exports.publicAuthentication = AsyncErrorHandler(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next();
  }

  const decodedToken = tokens.decodeJwtToken(token);

  if (!decodedToken) {
    return next(
      new ErrorHandler("Your JWT token has expired.Please login again", 401)
    );
  }

  req.user = await User.findById(decodedToken._id);

  //check is admin
  if (req.user.role === userConfig.roles[1]) {
    req.user.isAdmin = true;
  }

  next();
});
